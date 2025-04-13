let wishlistData = JSON.parse(localStorage.getItem("favorites")) || [];
console.log("Parsed data:", wishlistData);

const container = document.getElementById("divs");

function renderWishlist() {
  container.innerHTML = "";
  if (wishlistData && Array.isArray(wishlistData)) {
    wishlistData.forEach((userData, userIndex) => {
      if (userData.favorites && Array.isArray(userData.favorites)) {
        userData.favorites.forEach((item, itemIndex) => {
          const itemElement = document.createElement("div");
          const imageSrc =
            item.image || "https://via.placeholder.com/200x200?text=No+Image";
          itemElement.innerHTML = `      
            <div class="list-product">
              <div class="list-product item">
                <img src="${imageSrc}" alt="${item.title || "Product image"}" 
                     onerror="this.src='https://via.placeholder.com/200x200?text=Image+Not+Found'" />
                <br>
                <h2>${item.title || "No title"}</h2>
                <br>
                <p class="price">${item.price || "No price"}$</p>
                <br>
    
                <br>
                <button onclick="removeFromWishlist(${userIndex}, ${itemIndex})">Remove 🗑️  </button>
                <br>
              </div>
            </div>
            <br>
          
          `;
          container.appendChild(itemElement);
        });
      }
    });
  } else {
    container.textContent = "No wishlist items found";
  }
}

function removeFromWishlist(userIndex, itemIndex) {
  if (
    wishlistData[userIndex] &&
    wishlistData[userIndex].favorites &&
    Array.isArray(wishlistData[userIndex].favorites)
  ) {
    wishlistData[userIndex].favorites.splice(itemIndex, 1);

    if (wishlistData[userIndex].favorites.length === 0) {
      wishlistData.splice(userIndex, 1);
    }

    localStorage.setItem("favorites", JSON.stringify(wishlistData));

    renderWishlist();
  }
}

// Initial render
renderWishlist();
