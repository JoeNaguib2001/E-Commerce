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

/**
 * Creates a tracking bar for an individual order
 * @param {Object} order - Order object with status information
 * @param {Number} orderIndex - Index of the order for identification
 * @returns {String} HTML string of the tracking bar
 */
function createOrderTrackingBar(order, orderIndex) {
  // Determine which steps should be active based on order status
  const status = (order.orderStatus || order.status || "").toLowerCase();
  
  let step1Active = false, step2Active = false, step3Active = false;
  
  switch (status) {
    case "waiting":
      step1Active = true;
      break;
    case "inprogress":
    case "inprogress":
      step1Active = step2Active = true;
      break;
    case "delivered":
      step1Active = step2Active = step3Active = true;
      break;
  }
  
  return `
    <div class="step-container" id="tracking-${orderIndex}">
      <div class="step-item ${step1Active ? 'active' : ''}">
        <div class="step-icon"><i class="fa-solid fa-list-check"></i></div>
        <div class="step-label">Order Submitted</div>
      </div>
      <div class="step-item ${step2Active ? 'active' : ''}">
        <div class="step-icon"><i class="fa-solid fa-bag-shopping"></i></div>
        <div class="step-label">Preparing Order</div>
      </div>
      <div class="step-item ${step3Active ? 'active' : ''}">
        <div class="step-icon"><i class="fa-solid fa-check"></i></div>
        <div class="step-label">Ready for Pickup</div>
      </div>
    </div>
  `;
}

/**
 * Displays multiple orders on the page with individual tracking bars
 * @param {Array} orders - Array of order objects to display
 */
function displayOrders(orders) {
  const itemsContainer = document.getElementById("items");
  const payContainer = document.getElementById("pay");

  // Clear existing content
  itemsContainer.innerHTML = "";
  payContainer.innerHTML = "";

  if (!orders || orders.length === 0) {
    itemsContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  // Loop through each order in the array
  orders.forEach((order, index) => {
    // Format the order date
    const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A";
    const orderTime = order.orderDate ? new Date(order.orderDate).toLocaleTimeString() : "";
    
    // Create order section with header and tracking bar
    const orderHeaderHTML = `
      <div class="order-section" id="order-${index}">
        <div class="order-header">
          <h3>Order #${index + 1}</h3>
          <p class="order-date">Date: ${orderDate} ${orderTime}</p>
          <p class="order-status">Status: ${order.orderStatus || order.status || "Unknown"}</p>
        </div>
        ${createOrderTrackingBar(order, index)}
        <div class="order-items" id="order-items-${index}"></div>
      </div>
    `;
    
    itemsContainer.insertAdjacentHTML("beforeend", orderHeaderHTML);
    
    const orderItemsContainer = document.getElementById(`order-items-${index}`);
    
    // Loop through each item in the current order
    if (Array.isArray(order.order)) {
      order.order.forEach((item) => {
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
        orderItemsContainer.insertAdjacentHTML("beforeend", itemHTML);
      });
    } else {
      console.error("Order items not found or not in expected format:", order);
      orderItemsContainer.innerHTML = "<p>No items found for this order.</p>";
    }

    // Add payment method and total price for the current order
    const paymentHTML = `
      <div class="payment-summary" id="payment-${index}">
        <p><strong>Payment Method:</strong> ${order.paymentMethod || "N/A"}</p>
        <p><strong>Total Price:</strong> $${order.totalPrice || "0.00"}</p>
        <hr class="order-divider">
      </div>
    `;
    payContainer.insertAdjacentHTML("beforeend", paymentHTML);
  });
}

/**
 * Shows a toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 */
function showToast(title, message) {
  const toastEl = document.getElementById('bootstrapToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

/**
 * Loads all orders for the current user
 * @returns {Array|null} Array of order objects or null if no orders found
 */
async function loadUserOrders() {
  const dbRef = ref(db);
  const currentUsername = localStorage.getItem("username");

  if (!currentUsername) {
    console.error("No username found in localStorage.");
    document.getElementById("items").innerHTML = "<p>Please log in to view your orders.</p>";
    showToast("Error", "Please log in to view your orders");
    return null;
  }

  try {
    console.log("Fetching orders from Firebase...");
    const snapshot = await get(child(dbRef, "orders/"));
    
    if (!snapshot.exists()) {
      console.log("No orders found in database.");
      document.getElementById("items").innerHTML = "<p>No orders found.</p>";
      showToast("Information", "No orders found in the database");
      return null;
    }
    
    const allOrders = snapshot.val();
    
    // Filter orders for the current username
    const userOrders = Object.values(allOrders).filter(
      (order) => order.userName === currentUsername
    );

    if (userOrders.length === 0) {
      console.log("No orders found for the current user.");
      document.getElementById("items").innerHTML = "<p>No orders found for your account.</p>";
      showToast("Information", "No orders found for your account");
      return null;
    }

    console.log("User Orders:", userOrders);
    return userOrders;
  } catch (error) {
    console.error("Failed to load orders:", error);
    document.getElementById("items").innerHTML = "<p>Error loading orders. Please try again later.</p>";
    showToast("Error", "Failed to load orders. Please try again later.");
    return null;
  }
}

/**
 * Add filter options for orders
 * @param {Array} orders - All user orders
 */
function addOrderFilterOptions(orders) {
  // Create filter container
  const filterContainer = document.createElement("div");
  filterContainer.className = "order-filter mb-3";
  filterContainer.innerHTML = `
    <label for="order-filter" class="me-2">Filter Orders: </label>
    <select id="order-filter" class="form-select form-select-sm d-inline-block" style="width: auto">
      <option value="all">All Orders</option>
      <option value="waiting">Waiting</option>
      <option value="inprogress">In Progress</option>
      <option value="delivered">Delivered</option>
    </select>
  `;
  
  // Insert filter before the items heading
  const itemsHeading = document.querySelector("h2");
  if (itemsHeading) {
    itemsHeading.insertAdjacentElement("beforebegin", filterContainer);
  } else {
    document.getElementById("items").insertAdjacentElement("beforebegin", filterContainer);
  }
  
  // Add event listener for filter changes
  document.getElementById("order-filter").addEventListener("change", (e) => {
    const filterValue = e.target.value;
    let filteredOrders;
    
    if (filterValue === "all") {
      filteredOrders = orders;
    } else {
      filteredOrders = orders.filter(order => {
        const status = (order.orderStatus || order.status || "").toLowerCase();
        return status === filterValue;
      });
    }
    
    displayOrders(filteredOrders);
    
    if (filteredOrders.length === 0) {
      document.getElementById("items").innerHTML = `<p>No ${filterValue} orders found.</p>`;
    }
  });
}

/**
 * Main function to initialize order display
 */
async function initializeOrderHistory() {
  // Set page title
  
  // Display loading message
  document.getElementById("items").innerHTML = "<p>Loading orders...</p>";
  
  const userOrders = await loadUserOrders();
  
  if (!userOrders) return;
  
  // Sort orders by date (newest first)
  const sortedOrders = [...userOrders].sort((a, b) => 
    new Date(b.orderDate || 0) - new Date(a.orderDate || 0)
  );
  
  // Display all orders
  displayOrders(sortedOrders);
  
  // Update order date element
  const orderDateElement = document.getElementById("order-date");
  if (orderDateElement) {
    orderDateElement.textContent = "";
  }
  
  // Add filter options
  addOrderFilterOptions(sortedOrders);
  
  // Show success toast
  showToast("Success", `Loaded ${sortedOrders.length} orders`);
}

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeOrderHistory();
});