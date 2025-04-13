import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getDatabase,
  set,
  get,
  update,
  remove,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCDfTghFj89jNnYM3oz0LSGZU_FEi5s3c",
  authDomain: "iti-2025-e-commerce.firebaseapp.com",
  projectId: "iti-2025-e-commerce",
  storageBucket: "iti-2025-e-commerce.appspot.com", // لاحظ: دي لازم تكون بدون https
  messagingSenderId: "90149751365",
  appId: "1:90149751365:web:839d4d987cbcafd36b712c",
  databaseURL: "https://iti-2025-e-commerce-default-rtdb.firebaseio.com/", // دي مهمة
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
window.db = db;

console.log("Firebase database ready:", db);
// ayah
const stepContainer = document.querySelector(".step-container");
function x(lastorder) {
  const itemsContainer = document.getElementById("items");
  const payContainer = document.getElementById("pay");

  // Clear existing content
  itemsContainer.innerHTML = "";
  payContainer.innerHTML = "";

  lastorder.forEach((order) => {
    // Loop through each item in the order
    order.order.forEach((item) => {
      const itemHTML = `
        <div class="item">
          <img src="${item.image}" alt="${item.title}">
          <div class="item-details">
            <h4>${item.title}</h4>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: $${item.price}</p>
          </div>
        </div>
      `;
      itemsContainer.insertAdjacentHTML("beforeend", itemHTML);
    });
  });
} // ahmed
async function loadOrders() {
  const dbRef = ref(db);
  try {
    console.log("Fetching orders from Firebase...");

    // Fetch orders from Firebase
    const snapshot = await get(
      child(dbRef, "orders/" + localStorage.getItem("username"))
    );
    console.log("Snapshot fetched:", snapshot);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log("User Data:", userData);

      // Process the orders into an array
      const orders = Object.values(userData).map((order) => ({
        id: order.orderId,
        userName: order.userName,
        orderDate: new Date(order.orderDate), // Convert to Date object for comparison
        estimatedDelivery: order.estimatedDelivery,
        paymentMethod: order.paymentMethod,
        totalPrice: order.totalPrice,
        orderStatus: order.orderStatus,
        order: order.order,
      }));

      // Filter the latest order by date
      const latestOrder = orders.reduce((latest, current) => {
        return current.orderDate > latest.orderDate ? current : latest;
      });

      console.log("Latest Order:", latestOrder);

      // Update the step-container based on the latest order's status
      const stepItems = stepContainer.querySelectorAll(".step-item");
      stepItems.forEach((step) => step.classList.remove("active")); // Remove active class from all steps

      if (latestOrder.orderStatus === "Waiting") {
        stepItems[0].classList.add("active");
      } else if (latestOrder.orderStatus === "InProgress") {
        stepItems[1].classList.add("active");
      } else if (latestOrder.orderStatus === "Delivered") {
        stepItems[2].classList.add("active");
      }

      // Display the latest order
      x([latestOrder]); // Pass the latest order as an array to the display function
    } else {
      console.log("No orders found.");
    }
  } catch (error) {
    console.error("Failed to load orders:", error);
    alert("There was an error loading the orders. Please try again later.");
  }
}
loadOrders();
