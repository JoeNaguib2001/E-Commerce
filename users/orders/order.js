import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getDatabase,
  get,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCDfTghFj89jNnYM3oz0LSGZU_FEi5s3c",
  authDomain: "iti-2025-e-commerce.firebaseapp.com",
  projectId: "iti-2025-e-commerce",
  storageBucket: "iti-2025-e-commerce.appspot.com",
  messagingSenderId: "90149751365",
  appId: "1:90149751365:web:839d4d987cbcafd36b712c",
  databaseURL: "https://iti-2025-e-commerce-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
window.db = db;

console.log("Firebase database ready:", db);

const stepContainer = document.querySelector(".step-container");

// Function to display the latest order
function displayOrder(lastOrder) {
  const itemsContainer = document.getElementById("items");
  const payContainer = document.getElementById("pay");

  // Clear existing content
  itemsContainer.innerHTML = "";
  payContainer.innerHTML = "";

  if (!lastOrder || !lastOrder.order || lastOrder.order.length === 0) {
    itemsContainer.innerHTML = "<p>No items found in this order.</p>";
    return;
  }

  // Loop through each item in the last order
  lastOrder.order.forEach((item) => {
    const itemHTML = `
          <div class="item">
        <img src="${item.image}" alt="${item.title}" />
        <div class="item-details">
          <h4>${item.title}</h4>
          <p>Quantity: ${item.quantity}</p>
          <p>Price: $${item.price}</p>
        </div>
      </div>
    `;
    itemsContainer.insertAdjacentHTML("beforeend", itemHTML);
  });

  // Add payment method and total price for the order
  const paymentHTML = `
    <div class="payment-summary">
      <p><strong>Payment Method:</strong> ${lastOrder.paymentMethod}</p>
      <p><strong>Total Price:</strong> $${lastOrder.totalPrice}</p>
    </div>
  `;
  payContainer.insertAdjacentHTML("beforeend", paymentHTML);
}

// Function to load orders and display the latest one
async function loadOrders() {
  const dbRef = ref(db);
  const currentUsername = localStorage.getItem("username"); // Get the current username from localStorage

  if (!currentUsername) {
    console.error("No username found in localStorage.");
    alert("Please log in to view your orders.");
    return;
  }

  try {
    console.log("Fetching orders from Firebase...");

    // Fetch orders from Firebase
    const snapshot = await get(child(dbRef, "orders/"));
    console.log("Snapshot fetched:", snapshot);

    if (snapshot.exists()) {
      const allOrders = snapshot.val();

      // Filter orders for the current username
      const userOrders = Object.values(allOrders).filter(
        (order) => order.userName === currentUsername
      );

      if (userOrders.length === 0) {
        console.log("No orders found for the current user.");
        document.getElementById("items").innerHTML = "<p>No orders found.</p>";
        return;
      }

      console.log("User Orders:", userOrders);

      // Find the latest order by orderDate
      const latestOrder = userOrders.reduce((latest, current) => {
        return new Date(current.orderDate) > new Date(latest.orderDate)
          ? current
          : latest;
      });

      console.log("Latest Order:", latestOrder);

      // Update the step-container based on the latest order's status
      const stepItems = stepContainer.querySelectorAll(".step-item");
      stepItems.forEach((step) => step.classList.remove("active")); // Remove active class from all steps

      switch (latestOrder.orderStatus) {
        case "Waiting":
          stepItems[0].classList.add("active");
          break;
        case "InProgress":
          stepItems[0].classList.add("active");
          stepItems[1].classList.add("active");
          break;
        case "Delivered":
          stepItems[0].classList.add("active");
          stepItems[1].classList.add("active");
          stepItems[2].classList.add("active");
          break;
        default:
          console.log("Unknown order status:", latestOrder.orderStatus);
      }

      // Display the latest order
      displayOrder(latestOrder);
    } else {
      console.log("No orders found.");
      document.getElementById("items").innerHTML = "<p>No orders found.</p>";
    }
  } catch (error) {
    console.error("Failed to load orders:", error);
    alert("There was an error loading the orders. Please try again later.");
  }
}

// Call the function to load and display the latest order
async function loadOrdersForCurrentUser() {
  const dbRef = ref(db);
  const currentUsername = localStorage.getItem("username"); // Get the current username from localStorage

  if (!currentUsername) {
    console.error("No username found in localStorage.");
    return null;
  }

  try {
    console.log("Fetching orders for the current user from Firebase...");

    // Fetch orders from Firebase
    const snapshot = await get(child(dbRef, "orders/"));
    console.log("Snapshot fetched:", snapshot);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log("All Orders Data:", userData);

      // Filter orders for the current username
      const userOrders = Object.values(userData).filter(
        (order) => order.userName === currentUsername
      );

      if (userOrders.length === 0) {
        console.log("No orders found for the current user.");
        return null;
      }

      // Find the latest order by orderDate
      const latestOrder = userOrders.reduce((latest, current) => {
        return new Date(current.orderDate) > new Date(latest.orderDate)
          ? current
          : latest;
      });

      console.log("Latest Order for Current User:", latestOrder);
      return latestOrder;
    } else {
      console.log("No orders found in the database.");
      return null;
    }
  } catch (error) {
    console.error("Failed to load orders:", error);
    alert("There was an error loading the orders. Please try again later.");
    return null;
  }
}
async function displayLatestOrder() {
  const latestOrder = await loadOrdersForCurrentUser();

  if (latestOrder) {
    console.log("Displaying the latest order:", latestOrder);
    // Call a function to display the order details
    displayOrder(latestOrder);
  } else {
    console.log("No latest order to display.");
  }
}

displayLatestOrder();
loadOrders();
