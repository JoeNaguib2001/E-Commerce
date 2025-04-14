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

async function loadOrdersForCurrentUser() {
  const dbRef = ref(db);
  const currentUsername = localStorage.getItem("username"); // Get the current username from localStorage

  if (!currentUsername) {
    console.error("No username found in localStorage.");
    return [];
  }

  try {
    console.log("Fetching orders for the current user from Firebase...");

    // Fetch orders from Firebase
    const snapshot = await get(child(dbRef, "orders/"));
    console.log("Snapshot fetched:", snapshot);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log("All Orders Data:", userData);

      // Filter orders for the current username and process them into an array
      const processedOrders = Object.values(userData)
        .filter((order) => order.userName === currentUsername) // Filter by username
        .map((order) => ({
          id: order.orderId,
          userName: order.userName,
          orderDate: order.orderDate,
          estimatedDelivery: order.estimatedDelivery,
          paymentMethod: order.paymentMethod,
          totalPrice: order.totalPrice,
          orderStatus: order.orderStatus,
          order: order.order,
        }));

      console.log("Processed Orders for Current User:", processedOrders);
      const parent = document.getElementById("parent");

      processedOrders.forEach((order) => {
        const fieldset = document.createElement("fieldset");
        fieldset.classList.add("order-box"); // Add a class for styling

        // Populate the fieldset with order details
        fieldset.innerHTML = `
            <img src="${
              order.order[0]?.image || "placeholder.jpg"
            }" style="width: 100px" alt="Product Image" />
            <div>
              <h3>Order #${order.id}</h3>
              <p>Status: ${order.orderStatus}</p>
              <hr />
              <p>Items: ${order.order.length} | Total: $${order.totalPrice}</p>
              <hr />
              <p>${new Date(order.orderDate).toDateString()}</p>
           <div class="review-actions">
  <select class="rating-select" data-order-id="${order.id}">
    <option value="">Rate your order</option>
    <option value="1">⭐</option>
    <option value="2">⭐⭐</option>
    <option value="3">⭐⭐⭐</option>
    <option value="4">⭐⭐⭐⭐</option>
    <option value="5">⭐⭐⭐⭐⭐</option>
  </select>
  <button class="reviewButton" data-order-id="${order.id}">Write Review</button>
</div>
              
              <div class="reviewContainer" hidden>
                <textarea
                  class="review-text"
                  placeholder="Write your review here..."
                  rows="4"
                  cols="50"
                ></textarea><br />
                <button class="submit-review" data-order-id="${
                  order.id
                }" hidden>Submit Review</button>
              </div>
              
            </div>
          `;

        // Append the fieldset to the container
        parent.appendChild(fieldset);
      });

      // Attach event listeners to all rating dropdowns
      document.querySelectorAll(".rating-select").forEach((ratingSelect) => {
        ratingSelect.addEventListener("change", (event) => {
          const orderId = event.target.getAttribute("data-order-id"); // Get the order ID
          const ratingValue = event.target.value;

          if (ratingValue) {
            // Save the rating to localStorage
            localStorage.setItem(`orderRating_${orderId}`, ratingValue);
            alert(
              `Thanks for rating Order #${orderId} with ${ratingValue} stars!`
            );
            event.target.value = ""; // Reset the dropdown
          }
        });
      });

      // Attach event listeners to all review buttons
      document.querySelectorAll(".reviewButton").forEach((reviewButton) => {
        reviewButton.addEventListener("click", (event) => {
          const orderId = event.target.getAttribute("data-order-id"); // Get the order ID
          const fieldset = event.target.closest("fieldset");
          const reviewContainer = fieldset.querySelector(".reviewContainer");
          const submitReviewButton = fieldset.querySelector(".submit-review");

          // Show the review container and submit button
          reviewContainer.style.display = "block";
          submitReviewButton.style.display = "inline-block";
          event.target.style.display = "none"; // Hide the "Write Review" button
        });
      });

      // Attach event listeners to all submit review buttons
      document.querySelectorAll(".submit-review").forEach((submitButton) => {
        submitButton.addEventListener("click", (event) => {
          const orderId = event.target.getAttribute("data-order-id"); // Get the order ID
          const fieldset = event.target.closest("fieldset");
          const reviewText = fieldset.querySelector(".review-text").value;

          if (reviewText) {
            // Save the review to localStorage
            localStorage.setItem(`orderReview_${orderId}`, reviewText);

            // Hide the review container and submit button
            const reviewContainer = fieldset.querySelector(".reviewContainer");
            reviewContainer.style.display = "none";
            event.target.style.display = "none"; // Hide the submit button

            alert(`Your review for Order #${orderId} has been submitted!`);
            const reviewButton = fieldset.querySelector(".reviewButton");
            reviewButton.style.display = "inline-block"; // Show the "Write Review" button again
          } else {
            alert("Please write a review before submitting.");
          }
        });
      });

      return processedOrders;
    } else {
      console.log("No orders found in the database.");
      return [];
    }
  } catch (error) {
    console.error("Failed to load orders:", error);
    alert("There was an error loading the orders. Please try again later.");
    return [];
  }
}

// Call the function to load and display all orders
loadOrdersForCurrentUser();
// Example usage
