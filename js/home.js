// CTRL + K + , || CTRL + K + C
// CTRL + M + O || CTRL + M + L
// CTRL + K + (1,2,3)
import { updateCartCount } from "../navbar/navbar.js";
import { addToFavorites, isProductInFavorites } from "./shop.js";

function ShopNow() {
    window.location.href = "./shop.html";
}

function SignIn() {
    if (isSignedIn()) {
        localStorage.setItem("isSignedIn", "false");
        window.location.href = "./login.html";
    } else {
        window.location.href = "./login.html";
    }
}

function setSignInText() {
    if (isSignedIn()) {
        document.querySelector('.nav-link-sign-in').innerText = "Sign Out";
    }
    else {
        document.querySelector('.nav-link-sign-in').innerText = "Sign In";
    }
}
setSignInText();


// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBCDfTghFj89jNnYM3oz0LSGZU_FEi5s3c",
    authDomain: "iti-2025-e-commerce.firebaseapp.com",
    projectId: "iti-2025-e-commerce",
    storageBucket: "https://iti-2025-e-commerce-default-rtdb.firebaseio.com",
    messagingSenderId: "90149751365",
    appId: "1:90149751365:web:839d4d987cbcafd36b712c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import { getDatabase, set, get, update, remove, ref, child } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
const db = getDatabase();

function loadThirdCarousel() {
    const firstCarouselToFill = document.querySelector(".first-carousel-to-fill");
    const firstCarouselIndicators = document.querySelector(".first-carousel-indicators");
    const dbRef = ref(db, 'products');

    get(dbRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const data = Object.values(snapshot.val()).filter(product => product.title.includes("carousel_3"));
                data.forEach((item, index) => {
                    const carouselItem = createThirdCarouselItem(item, index === 0);
                    const carouselIndicator = createThirdCarouselIndicator(index, index === 0);

                    firstCarouselIndicators.appendChild(carouselIndicator);
                    firstCarouselToFill.appendChild(carouselItem);
                });
            } else {
                console.error("No data available in Firebase.");
            }
        })
        .catch(error => console.error('Error fetching carousel data from Firebase:', error));
}

function createThirdCarouselItem(item, isActive) {
    const carouselItem = document.createElement('div');
    carouselItem.className = `carousel-item${isActive ? ' active' : ''}`;

    const carouselContent = document.createElement("div");
    carouselContent.className = "d-flex flex-column gap-3 align-items-center position-relative";

    const favoriteIcon = createFavoriteIcon(item);
    carouselContent.appendChild(favoriteIcon);

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.alt;
    // img.className = "d-block w-100";
    carouselContent.appendChild(img);

    const carouselText = document.createElement("div");
    const modifiedTitle = item.title.substring(item.title.indexOf(" ") + 1);
    carouselText.appendChild(createTextSpan(modifiedTitle));
    carouselText.appendChild(createTextSpan(`${item.price}.00 EGP`));
    carouselContent.appendChild(carouselText);

    const addToCartBtn = createAddToCartBtn(item);
    carouselContent.appendChild(addToCartBtn);

    carouselItem.appendChild(carouselContent);

    return carouselItem;
}

function createThirdCarouselIndicator(index, isActive) {
    const carouselIndicator = document.createElement('button');
    carouselIndicator.type = "button";
    carouselIndicator.setAttribute("data-bs-target", "#carouselExample");
    carouselIndicator.setAttribute("data-bs-slide-to", index);
    carouselIndicator.setAttribute("aria-label", `Slide ${index + 1}`);
    if (isActive) {
        carouselIndicator.className = "active";
        carouselIndicator.setAttribute("aria-current", "true");
    }
    return carouselIndicator;
}

function createFavoriteIcon(item) {
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-heart position-absolute translate-middle p-2 border border-light rounded-circle add-to-favorites-icon";
    if (isProductInFavorites(item)) {
        icon.classList.add("favorite");
    }

    Object.assign(icon.style, {
        right: "5%",
        top: "5%",
        zIndex: "1",
        backgroundColor: "white",
        fontSize: "20px",
        padding: "5px",
        borderRadius: "50%",
        border: "1px solid orange",
        opacity: "0.8",
        cursor: "pointer",
        transition: "all 0.3s ease-in-out"
    });

    icon.addEventListener("click", () => {
        icon.classList.toggle("favorite");
        addToFavorites(item);
    });

    return icon;
}

function createTextSpan(text) {
    const span = document.createElement("span");
    span.innerHTML = text;
    Object.assign(span.style, {
        fontWeight: "100",
        fontSize: "25px",
        marginBottom: "20px",
        textAlign: "center",
        color: "white"
    });
    return span;
}

function createAddToCartBtn(item) {
    const button = document.createElement("button");
    button.innerHTML = "Add To Cart";
    button.className = "col-3";
    Object.assign(button.style, {
        marginBottom: "50px",
        padding: "20px",
        backgroundColor: "orange",
        minWidth: "300px",
        fontWeight: "100",
        borderRadius: "25px",
        fontSize: "20px"
    });
    setupAddToCartBtn(button, item);
    return button;
}

// Call the function
loadThirdCarousel();

function loadFourthCarousel() {
    const secondCarouselToFill = document.querySelector(".second-carousel-to-fill");
    const secondCarouselIndicators = document.querySelector(".second-carousel-indicators");
    const dbRef = ref(db, 'products');

    get(dbRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const allProducts = Object.values(snapshot.val());
                const data = allProducts.filter(product => product.title.includes("carousel_4"));

                for (let i = 0; i < data.length; i += 2) {
                    const product1 = data[i];
                    const product2 = data[i + 1];

                    const carouselItem = document.createElement('div');
                    const carouselIndicator = document.createElement('button');

                    // Indicator setup
                    carouselIndicator.type = "button";
                    carouselIndicator.setAttribute("data-bs-target", "#productSlider2");
                    carouselIndicator.setAttribute("data-bs-slide-to", i / 2);
                    carouselIndicator.setAttribute("aria-label", `Slide ${i / 2 + 1}`);
                    if (i === 0) {
                        carouselIndicator.className = "active";
                        carouselIndicator.setAttribute("aria-current", "true");
                    }
                    secondCarouselIndicators.appendChild(carouselIndicator);

                    // Carousel item
                    carouselItem.className = `carousel-item${i === 0 ? ' active' : ''}`;
                    carouselItem.innerHTML = `
                        <div class="d-flex flex-wrap">
                            ${createProductColumnForFourthCarousel(product1)}
                            ${product2 ? createProductColumnForFourthCarousel(product2) : ''}
                        </div>
                    `;

                    // Favorite icons
                    const favoriteIcons = carouselItem.querySelectorAll('.add-to-favorites-icon');
                    favoriteIcons.forEach((icon, index) => {
                        const product = index === 0 ? product1 : product2;
                        if (isProductInFavorites(product)) {
                            icon.classList.add('favorite');
                        }
                        icon.addEventListener('click', () => {
                            icon.classList.toggle('favorite');
                            addToFavorites(product);
                        });
                    });

                    // Add to cart buttons
                    const buttons = carouselItem.querySelectorAll('.add-to-cart-btn');
                    buttons.forEach(button => {
                        const product = JSON.parse(button.getAttribute('data-product'));
                        button.addEventListener('click', () => {
                            if (isSignedIn()) {
                                addToCart(product);
                                ShowBootstrapToast("Added to cart", "success");
                            } else {
                                ShowBootstrapToast("Please log in to continue shopping.", "danger");
                                setTimeout(() => {
                                    window.location.href = "./login.html";
                                }, 2000);
                            }
                        });
                    });

                    secondCarouselToFill.appendChild(carouselItem);
                }
            } else {
                console.error("No data available in Firebase.");
            }
        })
        .catch(error => console.error('Error fetching carousel data from Firebase:', error));
}

function createProductColumnForFourthCarousel(product) {
    return `
        <div class="col-lg-6 col-12 d-flex justify-content-center">
            <div class="product-card position-relative">
                <i class="fa-solid fa-heart position-absolute translate-middle p-2 border border-light rounded-circle add-to-favorites-icon ${isProductInFavorites(product) ? 'favorite' : ''}"
                   style="right:20px; top:45px; z-index:1; font-size:20px; padding:5px;
                          border-radius:50%; border:1px solid orange; opacity:0.8; cursor:pointer; transition: all 0.3s ease-in-out;">
                </i>
                <img src="${product.image}" alt="${product.alt}" style="margin-bottom:20px !important">
                <div class="product-info d-flex flex-column align-items-center" style="margin-bottom:20px !important">
                    <div>
                        <span style="font-weight:100; font-size:20px !important">${product.title.substring(product.title.indexOf(" ") + 1)}</span>
                        <span style="font-weight:100; font-size:20px !important">${product.price}.00 EGP</span>
                    </div>
                    <button class="add-to-cart-btn" data-product='${JSON.stringify(product)}'
                        style="font-weight:100; font-size:20px !important; background-color:orange !important; padding:10px;
                        display:block; border-radius:20px; margin-top:10px !important; width:fit-content">
                        Add To Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}
loadFourthCarousel();


function loadFifthCarousel() {
    const thirdCarouselToFill = document.querySelector(".third-carousel-to-fill");
    const thirdCarouselIndicators = document.querySelector(".third-carousel-indicators");
    const dbRef = ref(db, 'products');

    get(dbRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const allProducts = Object.values(snapshot.val());
                const data = allProducts.filter(product => product.title.includes("carousel_5"));

                for (let i = 0; i < data.length; i += 4) {
                    const carouselItem = document.createElement('div');
                    const carouselIndicator = document.createElement('button');

                    carouselIndicator.type = "button";
                    carouselIndicator.setAttribute("data-bs-target", "#productSlider");
                    carouselIndicator.setAttribute("data-bs-slide-to", i / 4);
                    carouselIndicator.setAttribute("aria-label", `Slide ${i / 4 + 1}`);
                    if (i === 0) {
                        carouselIndicator.className = "active";
                        carouselIndicator.setAttribute("aria-current", "true");
                    }
                    thirdCarouselIndicators.appendChild(carouselIndicator);

                    const products = data.slice(i, i + 4);
                    carouselItem.className = `carousel-item${i === 0 ? ' active' : ''}`;
                    carouselItem.innerHTML = `
                        <div class="d-flex flex-wrap" style="margin-bottom:50px !important; width:100% !important">
                            ${products.map(item => `
                                <div class="col-lg-3 col-md-6 col-12 d-flex justify-content-center">
                                    <div class="product-card-tall d-flex flex-column align-items-center gap-3 position-relative">
                                        <i class="fa-solid fa-heart position-absolute translate-middle p-2 border border-light rounded-circle add-to-favorites-icon ${isProductInFavorites(item) ? 'favorite' : ''}"
                                           style="right:45px; top:35px; z-index:1;font-size:20px;
                                                  padding:5px; border-radius:50%; border:1px solid orange; opacity:0.8; cursor:pointer; transition: all 0.3s ease-in-out;">
                                        </i>
                                        <img src="${item.image}" alt="${item.alt}">
                                        <div class="product-info text-center">
                                            <span style="font-weight:100; font-size:20px !important">${ item.title.substring(item.title.indexOf(" ") + 1) }</span><br>
                                            <span style="font-weight:100; font-size:20px  !important">${item.price}.00 EGP</span>
                                            <button class="add-to-cart-btn" data-product='${JSON.stringify(item)}'
                                                style="font-weight:100; font-size:20px !important; background-color:orange !important;
                                                padding:10px; display:block; border-radius:20px; margin-top:10px !important">
                                                Add To Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;

                    const buttons = carouselItem.querySelectorAll('.add-to-cart-btn');
                    buttons.forEach(button => {
                        const product = JSON.parse(button.getAttribute('data-product'));
                        button.addEventListener('click', () => {
                            if (isSignedIn()) {
                                addToCart(product);
                                ShowBootstrapToast("Added to cart", "success");
                            } else {
                                ShowBootstrapToast("Please log in to continue shopping.", "danger");
                                setTimeout(() => {
                                    window.location.href = "./login.html";
                                }, 2000);
                            }
                        });
                    });

                    const favoriteIcons = carouselItem.querySelectorAll('.add-to-favorites-icon');
                    favoriteIcons.forEach((icon, index) => {
                        const product = products[index];
                        icon.addEventListener('click', () => {
                            icon.classList.toggle('favorite');
                            addToFavorites(product);
                        });
                    });

                    thirdCarouselToFill.appendChild(carouselItem);
                }
            } else {
                console.error("No data available in Firebase.");
            }
        })
        .catch(error => console.error('Error fetching carousel data from Firebase:', error));
}

loadFifthCarousel();

function setupAddToCartBtn(btn, product) {
    btn.addEventListener("click", () => {
        if (isSignedIn()) {
            addToCart(product);
            ShowBootstrapToast("Added to cart", "success");
        } else {
            ShowBootstrapToast("Please log in to continue shopping.", "danger");
            setTimeout(() => {
                window.location.href = "./login.html";
            }, 2000);
        }
    });
}
function addToCart(product) {
    let carts = JSON.parse(localStorage.getItem("carts")) || [];
    let userCart = carts.find(cart => cart.username === localStorage.getItem("username"));
    let username = localStorage.getItem("username");

    if (userCart == undefined || userCart == null) {
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
    updateCartCount();
}

let toggleIcon = document.querySelector("#toggle-custom-nav-icon");
toggleIcon.addEventListener('click', (e) => {
    toggleNav();
});

export function toggleNav() {
    const navbar = document.querySelector('.custom-navbar');

    navbar.classList.toggle('collapsed');

    const isCollapsed = navbar.classList.contains('collapsed');

    // غيّر الأيقونة نفسها حسب الوضع
    toggleIcon.innerHTML = `
        <i class="fa-solid ${isCollapsed ? 'fa-arrow-left' : 'fa-arrow-right'} arrow-icon"></i>
    `;



    // خزّن الوضع
    localStorage.setItem('navbarCollapsed', isCollapsed ? 'true' : 'false');
}

window.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.custom-navbar');
    const iconContainer = navbar.querySelector('.nav-toggle-btn a');
    const isCollapsed = localStorage.getItem('navbarCollapsed') === 'true';

    if (isCollapsed) {
        navbar.classList.add('collapsed');
        iconContainer.innerHTML = `<i class="fa-solid fa-arrow-left arrow-icon"></i>`;
    } else {
        iconContainer.innerHTML = `<i class="fa-solid fa-arrow-right arrow-icon"></i>`;
    }

    var scrollSpy = new bootstrap.ScrollSpy(document.body, {
        target: '.custom-navbar',  // Target navbar for active state update
        offset: 50                // Adjust the offset as needed
    });

});

window.addEventListener("load", function () {
    let welcomeMessage = localStorage.getItem("welcomeMessage");
    if (welcomeMessage) {
        ShowBootstrapToast(`${welcomeMessage}`, "success");
        localStorage.removeItem("welcomeMessage");
    }
});


