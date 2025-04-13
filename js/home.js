// CTRL + K + , || CTRL + K + C
// CTRL + M + O || CTRL + M + L
// CTRL + K + (1,2,3)
import { updateCartCount } from "../navbar/navbar.js";
import { addToFavorites } from "./shop.js";

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

function loadThirdCarousel() {
    //This function loads the first carousel with data from a JSON file. It creates carousel items and indicators dynamically based on the data.
    const firstCarouselToFill = document.querySelector(".first-carousel-to-fill");
    const firstCarouselIndicators = document.querySelector(".first-carousel-indicators");
    fetch('./Data/Carousel_3.json')
        .then(response => response.json())
        .then(data => {
            data.forEach((item, index) => {
                const carouselItem = document.createElement('div');
                const carouselIndicator = document.createElement('button');
                carouselIndicator.type = "button";
                carouselIndicator.setAttribute("data-bs-target", "#carouselExample");
                carouselIndicator.setAttribute("data-bs-slide-to", index);
                carouselIndicator.setAttribute("aria-label", `Slide ${index + 1}`);
                if (index === 0) {
                    carouselIndicator.className = "active";
                    carouselIndicator.setAttribute("aria-current", "true");
                }
                firstCarouselIndicators.appendChild(carouselIndicator);




                carouselItem.className = `carousel-item${index === 0 ? ' active' : ''}`;

                const carouselContent = document.createElement("div");
                carouselContent.className = "d-flex flex-column gap-3 align-items-center position-relative";

                const icon = document.createElement("i");
                icon.className = "fa-solid fa-heart position-absolute translate-middle p-2  border border-light rounded-circle add-to-favorites-icon";
                icon.style.right = "10px";
                icon.style.top = "35px";
                icon.style.zIndex = "1";
                icon.style.backgroundColor = "white";
                icon.style.fontSize = "20px";
                icon.style.padding = "5px";
                icon.style.borderRadius = "50%";
                icon.style.border = "1px solid orange";
                icon.style.opacity = "0.8";
                icon.style.borderRadius = "50%";
                icon.style.cursor = "pointer";
                icon.style.transition = "all 0.3s ease-in-out";

                carouselContent.appendChild(icon);
                icon.addEventListener("click", () => {
                    addToFavorites(item);
                });

                const img = document.createElement("img");
                img.src = item.image;
                img.alt = item.alt;
                img.className = "d-block w-100";
                carouselContent.appendChild(img);

                const carouselText = document.createElement("div");

                const productName = document.createElement("span");
                productName.innerHTML = item.title + " ";
                productName.style.fontWeight = "100";
                productName.style.fontSize = "25px";
                productName.style.marginBottom = "20px";
                productName.style.textAlign = "center";
                productName.style.color = "white";
                carouselText.appendChild(productName);

                const productPrice = document.createElement("span");
                productPrice.innerHTML = item.price + ".00 EGP";
                productPrice.style.fontWeight = "100";
                productPrice.style.fontSize = "25px";
                productPrice.style.marginBottom = "20px";
                productPrice.style.textAlign = "center";
                productPrice.style.color = "white";
                carouselText.appendChild(productPrice);
                carouselContent.append(carouselText);

                let addToCartBtn = document.createElement("button");
                addToCartBtn.innerHTML = "Add To Cart";
                addToCartBtn.style.marginBottom = "50px";
                addToCartBtn.style.padding = "20px";
                addToCartBtn.className = "col-3";
                addToCartBtn.style.backgroundColor = "orange";
                addToCartBtn.style.minWidth = "300px";
                addToCartBtn.style.fontWeight = "100";
                addToCartBtn.style.borderRadius = "25px";
                addToCartBtn.style.fontSize = "20px";
                setupAddToCartBtn(addToCartBtn, item);
                carouselContent.appendChild(addToCartBtn);
                carouselItem.appendChild(carouselContent);

                firstCarouselToFill.appendChild(carouselItem);
            });
        })
        .catch(error => console.error('Error fetching carousel data:', error));
}

loadThirdCarousel();

function loadFourthCarousel() {
    const secondCarouselToFill = document.querySelector(".second-carousel-to-fill");
    const secondCarouselIndicators = document.querySelector(".second-carousel-indicators");
    fetch('./Data/Carousel_4.json').then(response => response.json()).then(data => {
        for (let i = 0; i < data.length; i += 2) {
            const carouselItem = document.createElement('div');
            const carouselIndicator = document.createElement('button');
            carouselIndicator.type = "button";
            carouselIndicator.setAttribute("data-bs-target", "#productSlider2");
            carouselIndicator.setAttribute("data-bs-slide-to", i / 2);
            carouselIndicator.setAttribute("aria-label", `Slide ${i / 2 + 1}`);
            if (i === 0) {
                carouselIndicator.className = "active";
                carouselIndicator.setAttribute("aria-current", "true");
            }
            secondCarouselIndicators.appendChild(carouselIndicator);
            carouselItem.className = `carousel-item${i === 0 ? ' active' : ''}`;
            carouselItem.innerHTML = `
                <div class="d-flex flex-wrap">
                    <div class="col-lg-6 col-12 d-flex justify-content-center">
                    <div class="product-card">
                        <img  src="${data[i].image}" alt="${data[i].alt}" style="margin-bottom:20px !important">
                        <div class="product-info d-flex flex-column align-items-center" style="margin-bottom:20px !important">
                            <div> 
                                <span style="font-weight:100; font-size:20px !important">${data[i].title}</span>
                                <span style="font-weight:100; font-size:20px  !important">${data[i].price}.00 EGP</span>
                            </div>
                                                <button class="add-to-cart-btn" data-product='${JSON.stringify(data[i])}' style="font-weight:100; font-size:20px !important; background-color:orange !important; padding:10px; display:block;
                                                border-radius:20px; margin-top:10px !important; width:fit-content">Add To Cart</button>
                        </div>
                    </div>
                    </div>
                    ${i + 1 < data.length ? `
                    <div class="col-lg-6 col-12 d-flex justify-content-center">
                    <div class="product-card">
                        <img src="${data[i + 1].image}" alt="${data[i + 1].alt}"  style="margin-bottom:20px !important">
                       <div class="product-info d-flex flex-column align-items-center" style="margin-bottom:20px !important">
                            <div>
                                <span style="font-weight:100; font-size:20px !important">${data[i + 1].title}</span>
                                <span style="font-weight:100; font-size:20px  !important">${data[i + 1].price}.00 EGP</span>
                            </div>
                                                <button class="add-to-cart-btn" data-product='${JSON.stringify(data[i + 1])}' style="font-weight:100; font-size:20px !important; background-color:orange !important; padding:10px !important; display:block;
                                                border-radius:20px; margin-top:10px !important; width:fit-content ">Add To Cart</button>
                        </div>
                    </div>
                    </div>` : ''}
                </div>`;
            console.log(carouselItem);


            // Add event listeners to the buttons
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
    }).catch(error => console.error('Error fetching carousel data:', error));
}
loadFourthCarousel();


function loadFifthCarousel() {
    const thirdCarouselToFill = document.querySelector(".third-carousel-to-fill");
    const thirdCarouselIndicators = document.querySelector(".third-carousel-indicators");
    fetch('./Data/Carousel_5.json')
        .then(response => response.json())
        .then(data => {
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

                carouselItem.className = `carousel-item${i === 0 ? ' active' : ''}`;
                carouselItem.innerHTML = `
                            <div class="d-flex flex-wrap" style="margin-bottom:50px !important">
                                ${data.slice(i, i + 4).map(item => `
                                    <div class="col-lg-3 col-md-6 col-12 d-flex justify-content-center">
                                        <div class="product-card-tall d-flex flex-column align-items-center gap-3">
                                            <img src="${item.image}" alt="${item.alt}">
                                            <div class="product-info">
                                                <span style="font-weight:100; font-size:20px !important">${item.title}</span>
                                                <span style="font-weight:100; font-size:20px  !important">${item.price}.00 EGP</span>
                                                <button class="add-to-cart-btn" data-product='${JSON.stringify(item)}' style="font-weight:100; font-size:20px !important; background-color:orange !important; padding:10px; display:block;
                                                border-radius:20px; margin-top:10px !important">Add To Cart</button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>`;

                // Add event listeners to the buttons
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

                thirdCarouselToFill.appendChild(carouselItem);
            }
        })
        .catch(error => console.error('Error fetching carousel data:', error));
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


