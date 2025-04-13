//load navbar
//update cart count
//update sign button
//update Hello span
//setup search functionality
//toggle sign in
//go to cart if signed in


// import { searchProducts } from "../js/shop.js";
import { ref, child, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";


// Access the globally initialized database
const db = window.db;
export async function loadNavbar() {
    try {
        //this is the navbar element in the html page that wants to load the navbar
        //if the navbar element is not found, create a new div element and add it to the body
        let navbarElement = document.getElementById("navbar");

        if (!navbarElement) {
            navbarElement = document.createElement("div");
            navbarElement.id = "navbar";
            document.body.prepend(navbarElement);
        }

        const response = await fetch("navbar/navbar.html");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.text();
        navbarElement.innerHTML = data;

        updateCartCount();
        updateSignButton();
        if (localStorage.getItem("isSignedIn") == "true") {
            const name = localStorage.getItem("firstName");
            updateHelloCustomerName(name);
        }
        else {
            updateHelloCustomerName("User");
        }

        setupSearchFunctionality();
        showCorrectDropDown();



        let shoppingCart = document.querySelector(".shopping-cart-link");
        if (shoppingCart) {
            shoppingCart.addEventListener("click", goToCartIfSignedIn);
        }

    } catch (error) {
        ShowBootstrapToast("Error Loading Navbar", "error");
    }


}
loadNavbar();


export function updateCartCount() {
    if (localStorage.getItem("isSignedIn") == "false") {
        return;
    }
    let productsCount = document.querySelector(".products-count");
    if (productsCount) {
        let username = localStorage.getItem("username");
        let carts = JSON.parse(localStorage.getItem("carts")) || [];
        let userCart = carts.find(cart => cart.username === username);

        if (userCart && userCart.order) {
            let totalItems = Object.values(userCart.order).reduce((sum, item) => sum + item.quantity, 0);
            productsCount.innerHTML = totalItems;
        } else {
            productsCount.innerHTML = 0;
        }
    }
}

function setupSearchFunctionality() {
    let searchBar = document.getElementById("search-box");

    if (!searchBar) {
        console.warn("⚠️ لم يتم العثور على شريط البحث.");
        return;
    }


    searchBar.addEventListener("input", function () {

        let query = searchBar.value.trim().toLowerCase();

        searchProducts(query);
    });
}

function updateSignButton() {
    let signButton = document.querySelectorAll(".login-btn");
    signButton.forEach(button => {
        if (localStorage.getItem("isSignedIn") == "true") {
            button.innerHTML = "Sign Out";
            button.addEventListener("click", toggleSingedIn);
        } else {
            button.innerHTML = "Sign In";
            button.addEventListener("click", () => window.location.href = "login.html");
        }
    });
    if (signButton) {
        signButton.innerHTML = localStorage.getItem("isSignedIn") == "true" ? "Sign Out" : "Sign In";
    }
}

function updateHelloCustomerName(name) {
    if (name == null) {
        name = "User";
    }
    let span = document.querySelector("span.hello-span");
    if (span) span.innerHTML = `Hello, ${name}`;
}

// After Sign Out => username = "Default User" , isSignedIn = "false" , rememberMe = "false"
function toggleSingedIn() {
    if (localStorage.getItem("isSignedIn") == "true") {
        localStorage.setItem("isSignedIn", "false");
        localStorage.setItem("username", "Default User");
        localStorage.setItem("rememberMe", "false");
    }
    window.location.href = "login.html";
}

function goToCartIfSignedIn() {
    if (localStorage.getItem("isSignedIn") == "true") {
        window.location.href = "shopping-cart.html";
    }
    else {
        ShowBootstrapToast("You have To Sign In First To Show Your Shopping Cart", "error");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 3000);
    }
}




// Choose the right dropdown menu based on the user role

// Retrieve the current username from localStorage
const username = localStorage.getItem("username");




function showCorrectDropDown() {
    let userRole = localStorage.getItem("userRole");
    if (userRole === "admin") {
        document.querySelector(".admin-dropdown").style.display = "block";
        document.querySelector(".user-dropdown").remove();
    } else if (userRole === "user") {
        document.querySelector(".admin-dropdown").remove();
        document.querySelector(".user-dropdown").style.display = "block";
    } else {
        document.querySelector(".admin-dropdown").remove();
        document.querySelector(".user-dropdown").style.display = "block";
    }
}


// fetch("./Data/Accounts.json")
//     .then(response => {
//         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//         return response.json();
//     })
//     .then(accounts => {
//         const currentUser = localStorage.getItem("username");
//         const user = accounts.find(account => account.userName === currentUser);
//         if (user) {
//             currentUserRole = user.userType;
//             if (currentUserRole === "admin") {
//                 document.querySelector(".admin-dropdown").style.display = "block";
//                 document.querySelector(".user-dropdown").remove();

//             } else {
//                 document.querySelector(".admin-dropdown").remove();
//                 document.querySelector(".user-dropdown").style.display = "block";
//             }
//         }
//         else {
//             document.querySelector(".admin-dropdown").remove();
//             document.querySelector(".user-dropdown").style.display = "block";
//         }
//     })
//     .catch(error => {
//         console.error("❌ Error fetching Accounts.json:", error);
//     }); {
// }


function showOrder() {
    if (localStorage.getItem("isSignedIn") == "true") {
        window.location.href = "orders.html";
    }
    else {
        ShowBootstrapToast("You have To Sign In First To Show Your Orders", "error");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 3000);
        window.location.href = "login.html";
    }
}






