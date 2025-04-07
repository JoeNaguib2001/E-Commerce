//load navbar
//update cart count
//update sign button
//update Hello span
//setup search functionality
//toggle sign in
//go to cart if signed in

import { ref, child, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";


// Access the globally initialized database
const db = window.db;
async function loadNavbar() {
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
        getStoredName().then(name => updateHelloCustomerName(name));

        setupSearchFunctionality();
        goToCartIfSignedIn();



    } catch (error) {
        ShowBootstrapToast("Error Loading Navbar", "error");
    }


}

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

async function getStoredName() {
    const dbRef = ref(db);

    try {
        const snapshot = await get(child(dbRef, `users/${localStorage.getItem("username")}`));
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const fullName = userData.fullName;

            if (fullName) {
                const nameParts = fullName.split(" ");
                const firstName = nameParts[0];
                return firstName;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data from Firebase:", error);
        return null;
    }
}


function updateHelloCustomerName(name) {
    if (name == null) {
        name = "User";
    }
    let span = document.querySelector("span.hello-span");
    if (span) span.innerHTML = `Hello, ${name}`;
}

loadNavbar();


function toggleSingedIn() {
    if (localStorage.getItem("isSignedIn") == "true") {
        localStorage.setItem("isSignedIn", "false");
        localStorage.setItem("username", "Default User");
        localStorage.setItem("rememberMe", "false");
    }
    window.location.href = "login.html";
}

function goToCartIfSignedIn() {
    let link = document.querySelector(".shopping-cart-link");
    if (!link) return;
    link.addEventListener("click", function (event) {
        if (localStorage.getItem("isSignedIn") == "true") {
            window.location.href = "shopping-cart.html";
        }
        else {
            ShowBootstrapToast("You have To Sign In First To Show Your Shopping Cart", "error");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);
        }
    });
}




// Choose the right dropdown menu based on the user role
fetch("./Data/Accounts.json")
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(accounts => {
        const currentUser = localStorage.getItem("username");
        const user = accounts.find(account => account.userName === currentUser);
        if (user) {
            currentUserRole = user.userType;
            if (currentUserRole === "admin") {
                document.querySelector(".admin-dropdown").style.display = "block";
                document.querySelector(".user-dropdown").remove();

            } else {
                document.querySelector(".admin-dropdown").remove();
                document.querySelector(".user-dropdown").style.display = "block";
            }
        }
        else {
            console.log("User not found in Accounts.json");
            document.querySelector(".admin-dropdown").remove();
            document.querySelector(".user-dropdown").style.display = "block";
        }
    })
    .catch(error => {
        console.error("❌ Error fetching Accounts.json:", error);
    }); {
}


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






