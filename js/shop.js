import * as navbar from "../navbar/navbar.js";

window.addEventListener("load", function () {
    let welcomeMessage = localStorage.getItem("welcomeMessage");
    if (welcomeMessage) {
        ShowBootstrapToast(`${welcomeMessage}`, "success");
        localStorage.removeItem("welcomeMessage"); // علشان متتكررش التوست كل مرة يدخل الصفحة
    }
});

let currentPage = 1;
const itemsPerPage = 12;
let productsList = [];
let mode = "random";



let sortByDropDown = document.querySelector("#sort-by");
sortByDropDown.addEventListener("change", function () {
    let selectedValue = sortByDropDown.value;
    localStorage.setItem("sortBy", selectedValue); // Save the selected value to localStorage
});


function renderProducts(products) {
    const row = document.querySelector(".row");

    products.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.addEventListener("click", function () {
            productDiv.classList.toggle("flipped");
        });


        // col     = extra small = <= 576px
        // col-sm  = small       =   576:768
        // col-md  = medium      =   769:992
        // col-lg  = large       =   993:1200
        // col-xl  = extra large = > 1201
        productDiv.classList.add("product-container", "col-12", "col-sm-12", "col-md-6", "col-lg-4", "col-xl-3", "p-4", "text-center", "shadow-sm");

        productDiv.innerHTML = `
                <div class="product">
                    <div class="front-card">
                        <a href="#" class="add-to-fav"><i class="fa-solid fa-plus"> </i> </a>
                        <img src="${product.image}" alt="${product.title}">
                        <br>
                        <span class="product-name">${product.title}</span>
                        <br>
                        <span class="product-price">$${product.price}</span>
                        <br>
                        <span class="rating-text">(${product.rating.rate} ⭐ from ${product.rating.count} reviews)</span>
                        <br>
                        <button class="add-to-cart add-to-cart-btn"> Add to Cart</button>
                    </div>
                    <div>
                    <div class="back-card">
                        <span> ${product.description}</span>
                    </div>
                </div>
            `;

        row.appendChild(productDiv);
        setupRating(productDiv, product.rating.rate);
        setupAddToFavorites(productDiv, product);
        setupAddToCart(productDiv, product);
    });
}

// Render Pagination Pages
function renderPagination(totalItems) {
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = ""; // Clear existing pagination items

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Previous Page
    const prevPageItem = document.createElement("li");
    prevPageItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevPageItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    prevPageItem.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderProductsPaginated();
            renderPagination(totalItems);
        }
    });
    paginationContainer.appendChild(prevPageItem);

    // Pages Numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener("click", () => {
            currentPage = i;
            renderProductsPaginated();
            renderPagination(totalItems);
        });
        paginationContainer.appendChild(pageItem);
    }

    // Next Page
    const nextPageItem = document.createElement("li");
    nextPageItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextPageItem.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    nextPageItem.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProductsPaginated();
            renderPagination(totalItems);
        }
    });
    paginationContainer.appendChild(nextPageItem);
}


// Render Current Paginatated Pages
function renderPaginatedProducts() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    // Filter products based on the selected category
    let dataSource;
    if (mode != "random") {
        // If mode is category, use the filteredProducts array
        dataSource = filteredProducts;
    }
    else {
        // dataSource = productsList // If mode is random, use the original productsList
        dataSource = productsList;
    }

    const sortBy = localStorage.getItem("sortBy");



    if (sortBy == "Default") {
        dataSource.sort((a, b) => a.id - b.id); // Sort by default (ID)
    }

    else if (sortBy == "price-high-to-low") {
        dataSource.sort((a, b) => b.price - a.price); // Sort by price high to low
    }
    else if (sortBy == "price-low-to-high") {
        dataSource.sort((a, b) => a.price - b.price); // Sort by price low to high
    }
    else if (sortBy == "rating-high-to-low") {
        dataSource.sort((a, b) => b.rating.rate - a.rating.rate); // Sort by rating high to low
    }
    else if (sortBy == "rating-low-to-high") {
        dataSource.sort((a, b) => a.rating.rate - b.rating.rate); // Sort by rating low to high
    }


    const paginatedProducts = dataSource.slice(start, end);

    const productContainer = document.getElementById("product-container");
    productContainer.innerHTML = ""; // Clear existing products
    renderProducts(paginatedProducts);
}

// Fetchs All Products From The Json File And Renders The First Page Of Products And Pagination
async function fetchProducts() {
    try {
        // Fetch All Products From Json
        let response = await fetch('./Data/products.json');
        productsList = await response.json();
        // Render First Page Of Products Based On Page Size, Current Page = 1
        renderPaginatedProducts();

        //create pagination after fetching the whole products from the Json file
        renderPagination(productsList.length);


    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// fetchProducts will load Initial Page and Initial Pagination
fetchProducts();




async function fetchCategories() {
    try {
        let response = await fetch('./Data/categories.json');
        let categories = await response.json();
        renderCategories(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

let filteredProducts = [];
function renderCategories(categories) {
    const categoriesContainer = document.getElementById("categories-container");
    const categoriesContainer2 = document.getElementById("categories-container-nav-id");
    const shoppingRow = document.querySelector(".shopping-row");
    categoriesContainer.innerHTML = "";

    categories.forEach(category => {
        const categoryDiv = document.createElement("a");
        const li = document.createElement("li");
        li.innerText = category.name;
        categoriesContainer2.appendChild(li);
        categoryDiv.style.textDecoration = "none";
        categoryDiv.href = "#";
        categoryDiv.classList.add("card", "m-2", "text-center", "shadow-sm");

        categoryDiv.innerHTML = `
            <h5 class="card-title">${category.name}</h5>
        `;
        // Filter By Category
        li.addEventListener("click", function () {

            currentPage = 1;
            if (category.name == "All Categories") {
                mode = "random";
            }
            else {
                filteredProducts = productsList.filter(product => product.category === category.name);
                mode = "category";
            }

            renderProductsPaginated();
            renderPagination(filteredProducts.length);
            shoppingRow.scrollIntoView({ behavior: "smooth" });
        });


        categoryDiv.addEventListener("click", function () {
            currentPage = 1;
            if (category.name == "All Categories") {
                mode = "random";
            }
            else {
                filteredProducts = productsList.filter(product => product.category === category.name);
                mode = "category";
            }

            renderProductsPaginated();
            renderPagination(filteredProducts.length);
            shoppingRow.scrollIntoView({ behavior: "smooth" });
        });

        categoriesContainer.appendChild(categoryDiv);
    });
}
fetchCategories();




function setupRating(productDiv, rating) {
    const stars = productDiv.querySelectorAll('.star');
    let fixedRating = Math.round(rating);

    stars.forEach(star => {
        if (star.dataset.index <= fixedRating) {
            star.classList.add('filled');
        }
    });
}

function setupAddToCart(productDiv, product) {
    const addToCartBtn = productDiv.querySelector(".add-to-cart");
    addToCartBtn.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent the click event from propagating to the product
        addToCart(product);
        navbar.updateCartCount();
        ShowBootstrapToast("Product Added To Shopping Cart Successfully !", "success");
    });
}

function addToCart(product) {
    if (localStorage.getItem("isSignedIn") !== "true") {
        alert("يجب تسجيل الدخول أولاً لإضافة المنتج إلى السلة.");
        return;
    }

    let username = localStorage.getItem("username"); // Assuming the username is stored in localStorage
    if (!username) {
        alert("User not found. Please log in again.");
        return;
    }

    let carts = JSON.parse(localStorage.getItem("carts")) || [];
    let userCart = carts.find(cart => cart.username === username);

    if (!userCart) {
        userCart = { username: username, order: [] };
        carts.push(userCart);
    }

    let existingProduct = userCart.order.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        userCart.order.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("carts", JSON.stringify(carts));
}

function setupAddToFavorites(productDiv, product) {
    const addToFavoritesBtn = productDiv.querySelector(".add-to-fav");
    addToFavoritesBtn.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent the click event from propagating to the product
        addToFavorites(product);
    });
}
function addToFavorites(product) {
    if (localStorage.getItem("isSignedIn") !== "true") {
        alert("يجب تسجيل الدخول أولاً لإضافة المنتج إلى المفضلة.");
        return;
    }

    let username = localStorage.getItem("username"); // Assuming the username is stored in localStorage
    if (!username) {
        alert("User not found. Please log in again.");
        return;
    }

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    let userFavorites = favorites.find(fav => fav.username === username);

    if (!userFavorites) {
        userFavorites = { username: username, favorites: [] };
        favorites.push(userFavorites);
    }

    let existingProduct = userFavorites.favorites.find(item => item.id === product.id);
    if (!existingProduct) {
        userFavorites.favorites.push(product);
        ShowBootstrapToast("Product Added To Wish List !", "success");
    }

    else {
        ShowBootstrapToast("Product Already In Wish List !", "danger");
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
}


function sortProducts(criteria) {
    let sortedProducts = [...productsList];

    if (criteria === "high-to-low") {
        sortedProducts.sort((a, b) => b.price - a.price);
    } else if (criteria === "low-to-high") {
        sortedProducts.sort((a, b) => a.price - b.price);
    } else if (criteria === "highest-rating") {
        sortedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
    }

    renderProducts(sortedProducts);
}


document.addEventListener("DOMContentLoaded", function () {
    let searchInput = document.querySelector("#search-box");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            let query = searchInput.value.trim().toLowerCase();
            searchProducts(query);
        });
    }

    let sortBy = localStorage.getItem("sortBy") || "Default";
    if (sortBy) {
        sortByDropDown.value = sortBy;
    }
});

function searchProducts(query) {
    console.log(query);
    let products = document.querySelectorAll(".product");
    let productContainer = document.getElementById("product-container");

    products.forEach(product => {
        let name = product.querySelector(".product-name").innerText.toLowerCase();

        if (name.includes(query.toLowerCase())) {
            product.parentElement.classList.remove("d-none"); // Show the product
        } else {
            product.parentElement.classList.add("d-none"); // Hide the product
        }
    });
}


if (localStorage.getItem("searchQuery") != null) {
    setTimeout(() => {
        let searchBar = document.getElementById("search-box");
        if (!searchBar) {
            return;
        }
        let storedQuery = localStorage.getItem("searchQuery") || "";
        searchBar.value = storedQuery;
        if (storedQuery) {
            searchProducts(storedQuery);
        }
        localStorage.setItem("searchQuery", "");
    }, 300);

}

//Bootstrap Toast Function
ShowBootstrapToast = function (message, type) {
    let toastEl = document.getElementById("bootstrapToast");
    let toastBody = document.getElementById("toastMessage");
    let toastHeader = document.getElementById("toastTitle");

    // تغيير لون العنوان حسب نوع الرسالة
    let bgColor = type === "success" ? "text-success" : "text-danger";
    toastHeader.className = `me-auto ${bgColor}`;

    // تعيين الرسالة
    toastBody.innerText = message;

    // عرض التوست
    let toast = new bootstrap.Toast(toastEl);
    toast.show();
};






