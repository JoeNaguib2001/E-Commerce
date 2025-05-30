import { ref, push, child, set, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
const db = window.db;
document.getElementById("productButton").addEventListener("click", function () {
    if(localStorage.getItem("userRole") === "admin"){

    loadProducts();
    }else{
        let hideInfoWarning =  document.createElement("h1");
        hideInfoWarning.textContent = "You don't have permission to access this page!";   
          hideInfoWarning.style.textAlign = "center"; 
          this.body.appendChild(hideInfoWarning); 
          
      }
});

// Global categories array to maintain state across functions
let globalCategories = [];

async function loadProducts() {
    const dbRef = ref(db);

    try {
        showLoader();

        // Fetch products from Firebase
        const snapshot = await get(child(dbRef, `products/`));
        if (snapshot.exists()) {
            const userData = snapshot.val();

            // Process the products into an array
            const processedProducts = Object.values(userData).map(product => ({
                id: product.id,
                title: product.title,
                price: product.price,
                description: product.description,
                category: product.category,
                image: product.image,
                rating: product.rating
            }));

            let searchDiv = document.getElementById("searchDiv");
            searchDiv.innerHTML = "";
            
            CreateSearchFilter();
                    console.log(processedProducts);
            CreateCategoriesUi();
            createProductCardModal(processedProducts); // Update product cards
            buildProductTable(processedProducts);
        } else {
            console.error("No products found in Firebase.");
            ShowBootstrapToast("No products found in Firebase.", "danger");             
        }

        hideLoader();
    } catch (error) {
        console.error('Failed to load products:', error);
        ShowBootstrapToast("Failed to load products.", "danger");   
        hideLoader();
    }
}

// Handle Categories 
async function fetchCategories() {
    const dbRef = ref(db); 
    try {
        const snapshot = await get(child(dbRef, "categories/"));
        if (snapshot.exists()) {
            // Assign the fetched categories to the global categories variable
            globalCategories = Object.values(snapshot.val());
            return globalCategories;
        } else {
            console.error("No categories found in Firebase.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// Updated deleteCategoryByName function - now properly handles state
async function deleteCategoryByName(categoryName) {
    try {
        showLoader(); // Show loader

        const dbRef = ref(db, 'categories/');
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            let categories = snapshot.val();
            console.log("Categories:", categories);

            const categoryKey = Object.keys(categories).find(
                key => categories[key].name.toLowerCase() === categoryName.toLowerCase()
            );

            console.log("Category Key:", categoryKey);

            if (categoryKey) {
                // Delete the category from Firebase
                await set(ref(db, `categories/${categoryKey}`), null);
                
                ShowBootstrapToast(`Category "${categoryName}" has been deleted successfully.`, "success");
                
                // Update the global categories array
                globalCategories = globalCategories.filter(c => c.name !== categoryName);
                
                // Reload products to refresh the UI
                loadProducts();
            } else {
                ShowBootstrapToast (`Category "${categoryName}" not found.`, "danger");
            }
        } else {
            ShowBootstrapToast (`No categories found in the database.not found.`, "danger");
        }

        hideLoader();
    } catch (error) {
        console.error("Error deleting category:", error);
        ShowBootstrapToast (`Failed to delete category "${categoryName}".`, "danger");
        hideLoader();
    }
}

// Updated editCategory function with better handling
async function editCategory(cat) {
    try {
        const categoryNameInput = document.getElementById("categoryNameInput");
        const categoryDescInput = document.getElementById("categoryDescInput");
        
        categoryNameInput.value = cat.name;
        categoryDescInput.value = cat.description;
        
        const saveBtn = document.getElementById("saveCategoryBtn");
        saveBtn.textContent = "Save Changes";
        
        // Show the category modal
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
        
        // Store the original handler to restore it later
        const originalHandler = saveBtn.onclick;
        
        // Set up the new handler for editing
        saveBtn.onclick = async () => {
            
                showLoader();
                
                const newName = categoryNameInput.value.trim();
                const newDesc = categoryDescInput.value.trim();
    
                if (!newName || !newDesc) {
                    ShowBootstrapToast("Please provide both name and description.", "danger");
                    hideLoader();
                    return;
                }

                // Edit the category in Firebase
                const categoryRef = ref(db, `categories/${cat.id}`);
                await set(categoryRef, {
                    id: cat.id,
                    name: newName,
                    description: newDesc
                });


                // Update the global categories array
                const index = globalCategories.findIndex(c => c.id === cat.id);
                if (index !== -1) {
                    globalCategories[index] = {
                        id: cat.id,
                        name: newName,
                        description: newDesc
                    };
                }

                // Refresh the UI
                loadProducts();  // Make sure this uses the updated globalCategories array

                ShowBootstrapToast(`Category "${newName}" has been updated successfully.`, "success");
                // Close the modal
                bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
                
                // Reset the form and button handler
                document.getElementById("categoryNameInput").value = "";
                document.getElementById("categoryDescInput").value = "";
                                saveBtn.onclick = originalHandler;
                saveBtn.textContent = "Create";

                hideLoader();
            
        };
    } catch (error) {
        console.error("Error setting up category edit:", error);
        ShowBootstrapToast ("Failed to prepare category for editing. Please try again later.", "danger");
    }
}

async function CreateCategoriesUi() {
    const categoriesFromJson = await fetchCategories();
    
    // Update the global categories array
    globalCategories = [...categoriesFromJson];
    
    const CatContainer = document.getElementById("CatContainer");
    CatContainer.innerHTML = "";
    const catHeader = document.createElement("h2");
    catHeader.className = "catHeader text-center"; 
    catHeader.textContent = "Browse Categories";
    CatContainer.appendChild(catHeader);
    
    // Create the list
    const categoryList = document.createElement("ul");
    categoryList.className = "list-unstyled d-flex flex-wrap justify-content-start";
    categoryList.style.margin = "10px";
    CatContainer.appendChild(categoryList);
    
    // Create add new button
    const addNewBtn = document.createElement("button");
    addNewBtn.textContent = "Add New Category";
    addNewBtn.className = "btn btn-primary mb-3 ml-auto";
    addNewBtn.style.padding = "12px 40px";
    addNewBtn.style.margin = "30px";
    CatContainer.appendChild(addNewBtn);

    // Create modal for categories
    createCategoryModal();

    // Show modal when clicking the button
    addNewBtn.addEventListener("click", () => {
        // Reset the form and button handler
        document.getElementById("categoryNameInput").value = "";
        document.getElementById("categoryDescInput").value = "";
        const saveBtn = document.getElementById("saveCategoryBtn");
        if (saveBtn) {
            saveBtn.textContent = "Create";
            saveBtn.onclick = async () => {
                const name = document.getElementById("categoryNameInput").value.trim();
                const desc = document.getElementById("categoryDescInput").value.trim();
                
    let valid = true;

    if (!name) {
        document.getElementById('categoryNameError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('categoryNameError').style.display = 'none';
    }

    if (!desc) {
        document.getElementById('categoryDescError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('categoryDescError').style.display = 'none';
    }

    if (valid) {
    
            
                const newCategory = await addCategoryToFirebase(name, desc);
            
                if (newCategory) {
                    globalCategories.push(newCategory);
                    renderCategories();
                    
                    // Close modal and reset form
                    bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
                    
                    document.getElementById("categoryNameInput").value = "";
                    document.getElementById("categoryDescInput").value = "";

                }
            };
        }
        
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    }
    });

    function createCategoryModal() {
        const modalHTML = `
        <div class="modal fade" id="categoryModal" tabindex="-1" aria-labelledby="categoryModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content shadow-lg rounded-4">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="categoryModalLabel">Create New Category</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="categoryNameInput" class="form-label fw-bold">Category Name</label>
                            <input type="text" class="form-control" id="categoryNameInput" placeholder="Enter category name">
                         <span id="categoryNameError" class="text-danger" style="display:none;">Please enter a valid category name.</span>
                        </div>
                        <div class="mb-3">
                            <label for="categoryDescInput" class="form-label fw-bold">Description</label>
                            <input type="text" class="form-control" id="categoryDescInput" placeholder="Enter description">
                    <span id="categoryDescError" class="text-danger" style="display:none;">Please enter a valid description.</span>

                        </div>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" id="saveCategoryBtn">Create</button>
                    </div>
                </div>
            </div>
        </div>`;
    
        if (!document.getElementById('categoryModal')) {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = modalHTML;
            document.body.appendChild(wrapper);
        }
    }
    function createDeleteConfirmModal() {
        const modalHTML = `
        <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content shadow-lg rounded-4">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="deleteConfirmModalLabel">Confirm Deletion</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this ? This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
                    </div>
                </div>
            </div>
        </div>`;
    
        // التحقق إذا كان المودال موجودًا
        if (!document.getElementById('deleteConfirmModal')) {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = modalHTML;
            document.body.appendChild(wrapper);
        }
    }

    // Create delete confirmation modal
    createDeleteConfirmModal();
    
    // Render the categories list initially
    renderCategories();

    async function addCategoryToFirebase(name, description) {
        // Check for data
        if (!name || !description) {
            ShowBootstrapToast("Please provide both name and description.", "danger");  
            return;
        }
    
        try {
            showLoader();
            
            // Generate a unique ID
            const myGuid = generateSimpleGUID();
            
            // Define categories reference in Firebase
            const categoriesRef = ref(db, 'categories/' + myGuid);
            
            // Save data to Firebase under the new key
            await set(categoriesRef, {
                id: myGuid,
                name: name,
                description: description
            });
            
            hideLoader();
            
            // Return the new category data
            return { id: myGuid, name, description };
        } catch (error) {
            ShowBootstrapToast("Failed to add category. Please try again later.", "danger");    
            hideLoader();
            return null;
        }
    }
    
    // Define renderCategories inside CreateCategoriesUi to have access to the category list
    function renderCategories() {
        categoryList.innerHTML = "";
        categoryList.className = "category-list";
        
        globalCategories.forEach(cat => {
            const li = document.createElement("li");
            li.className = "category-item";
    
            // Category name link
            const link = document.createElement("a");
            link.href = "#";
            link.textContent = cat.name;
            link.className = "category-link";
            link.addEventListener("click", () => {
                console.log(`Show products in ${cat.name}`);
                filterProductsByCategory(cat.name);
            });
    
            // Three dots button
            const menuButton = document.createElement("button");
            menuButton.className = "menu-button";
            menuButton.innerHTML = "⋮";
            menuButton.title = "Options";
            menuButton.addEventListener("click", (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle("show");
            });
    
            // Options dropdown menu (edit - delete)
            const dropdownMenu = document.createElement("ul");
            dropdownMenu.className = "dropdown-menu";
    
            // "Edit" option
            const editOption = document.createElement("li");
            editOption.innerHTML = `<span class="option-icon">✏️</span> Edit`;
            editOption.addEventListener("click", (e) => {
                e.stopPropagation();
                editCategory(cat);
            });
    
            // "Delete" option
            const deleteOption = document.createElement("li");
            deleteOption.innerHTML = `<span class="option-icon">🗑️</span> Delete`;
            deleteOption.addEventListener("click", (e) => {
                e.stopPropagation();
                console.log("Delete button clicked");
                
                // Show delete confirmation modal
                const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
                deleteConfirmModal.show();
                
                // Set up delete confirmation handler
                const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
                if (confirmDeleteBtn) {
                    confirmDeleteBtn.onclick = async () => {
                        await deleteCategoryByName(cat.name);
                        bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
                    };
                }
            });
    
            dropdownMenu.appendChild(editOption);
            dropdownMenu.appendChild(deleteOption);
    
            const actionsContainer = document.createElement("div");
            actionsContainer.className = "category-actions";
            actionsContainer.appendChild(menuButton);
            actionsContainer.appendChild(dropdownMenu);
    
            li.appendChild(link);
            li.appendChild(actionsContainer);
            categoryList.appendChild(li);
        });
    
        // Close all open menus when clicking outside
        document.addEventListener("click", () => {
            document.querySelectorAll(".dropdown-menu").forEach(menu => {
                menu.classList.remove("show");
            });
        });
    }
}

// دالة لتصفية المنتجات حسب التصنيف
async function filterProductsByCategory(categoryName) {
    try {
        showLoader();

        const dbRef = ref(db);
        let snapshot;

        if (categoryName.toLowerCase() === 'all categories') {
            // Fetch all products if 'all' is selected
            snapshot = await get(child(dbRef, `products/`));
        } else {
            // Fetch products filtered by category
            snapshot = await get(child(dbRef, `products/`));
        }

        if (snapshot.exists()) {
            const userData = snapshot.val();

            // Filter products by category if not 'all'
            const filteredProducts = categoryName.toLowerCase() === 'all categories'
                ? Object.values(userData)
                : Object.values(userData).filter(product =>
                    product.category && product.category.toLowerCase() === categoryName.toLowerCase()
                );

            // Update the UI with filtered products
            buildProductTable(filteredProducts);
            createProductCardModal(filteredProducts);
        } else {
            console.warn("No products found in the database.");
            buildProductTable([]);
            createProductCardModal([]);
        }

        hideLoader();
    } catch (error) {
        console.error("Error filtering products by category:", error);
        ShowBootstrapToast("Failed to filter products. Please try again later.", "danger"); 
        hideLoader();
    }
}

// start to handle product 

function createProductCardModal(products) {
    // تم تغيير المعامل من f إلى products للتوضيح
    const totalProducts = products.length;

    const totalRevenue = products.reduce((total, product) => total + parseFloat(product.price), 0);

    const avgRating = products.reduce((total, product) => total + (product.rating?.rate || 0), 0) / totalProducts;

    const modalHeader = `
        <h2 class="cardHeader text-center">Products Analysis</h2>
    `;

    // إنشاء محتوى التقارير
    const modalHTML = `
        <div class="card">
            <div class="card-content">
                <h3 class="card-title">Total Products</h3>
                <p class="card-number">${totalProducts}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-content">
                <h3 class="card-title">Total Revenue</h3>
                <p class="card-number">$${totalRevenue.toLocaleString()}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-content">
                <h3 class="card-title">Average Rating</h3>
                <p class="card-number">${avgRating.toFixed(2)}</p>
            </div>
        </div>
    `;

    // تحديث العنوان والمحتوى
    const divHeader = document.querySelector(".cardHeader");
    if (divHeader) {
        divHeader.innerHTML = modalHeader;
    }

    const div = document.querySelector(".cardList");
    if (div) {
        div.innerHTML = modalHTML;  // إحذف أي محتوى قديم وأضف الجديد
    }
}

function buildProductTable(products) {
    let container = document.getElementById("tableData");
    if (!container) {
        console.error("Element with ID 'tableData' not found");
        return;
    }
    
    container.innerHTML = "";

    let table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    const headers = ["ID", "Title", "Price", "Details", "Edit", "Delete"];
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach(headerText => {
        let th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    products.forEach(product => {
        const row = document.createElement("tr");

        // ID
        const tdId = document.createElement("td");
        tdId.textContent = product.id;
        row.appendChild(tdId);
        
        // Title
        const tdTitle = document.createElement("td");
        tdTitle.textContent = product.title || "N/A";
        row.appendChild(tdTitle);
        
        // Price
        const tdPrice = document.createElement("td");
        tdPrice.textContent = `$${product.price}` || "N/A";
        row.appendChild(tdPrice);
        
        // Details Button
        const tdDetails = document.createElement("td");
        const detailsBtn = document.createElement("button");
        detailsBtn.textContent = "Details";
        detailsBtn.className = "btn btn-info btn-sm";
        detailsBtn.addEventListener("click", function() {
            showProductDetails(product);
        });
        tdDetails.appendChild(detailsBtn);
        row.appendChild(tdDetails);
        
        // Edit Button
        const tdEdit = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "btn btn-warning btn-sm";
        editBtn.addEventListener("click", function() {
            editProduct(product);
        });
        tdEdit.appendChild(editBtn);
        row.appendChild(tdEdit);
        
        // Delete Button
        const tdDelete = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.addEventListener("click", function() {
            deleteProduct(product.id);
        });
        tdDelete.appendChild(deleteBtn);
        row.appendChild(tdDelete);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

async function showProductDetails(product) {
    try {
        // Show loader while fetching data
        showLoader();

        // Reference to the product in Firebase
        const dbRef = ref(db, `products/${product.id}`);
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            throw new Error('Product not found in Firebase');
        }

        const productDetails = snapshot.val();
        console.log("Product Details:", productDetails);
        // Create or get the modal element
        let modalElement = document.getElementById("productDetailsModal");
        if (!modalElement) {
            createProductModal();
            modalElement = document.getElementById("productDetailsModal");
        }

        // Fill modal with product details
        document.getElementById('modalProductId').textContent = productDetails.id || "N/A";
        document.getElementById('modalProductTitle').textContent = productDetails.title || "N/A";
        document.getElementById('modalProductPrice').textContent = productDetails.price ? `$${productDetails.price}` : "N/A";
        document.getElementById('modalProductDescription').textContent = productDetails.description || "N/A";
        document.getElementById('modalProductCategory').textContent = productDetails.category || "N/A";

        // Set product image
        const imgElement = document.getElementById('modalProductImage');
        if (imgElement) {
            imgElement.src = productDetails.image || "/placeholder.jpg";
            imgElement.alt = productDetails.title || "Product Image";
        }

        // Display rating information
        if (productDetails.rating) {
            document.getElementById('modalProductRating').textContent = productDetails.rating.rate || "N/A";
            document.getElementById('modalProductReviews').textContent = productDetails.rating.count || "N/A";
        } else {
            document.getElementById('modalProductRating').textContent = "N/A";
            document.getElementById('modalProductReviews').textContent = "N/A";
        }
            
        const trendBtn = document.querySelector(".trendBts");
        if (trendBtn) {
            trendBtn.addEventListener("click", function () {
                AddProductToTrendInDataBase(productDetails);
            });
        }
        const newCollectionBtn = document.querySelector(".newCollectionBts");
        if (newCollectionBtn) {
            newCollectionBtn.addEventListener("click", function () {
                AddProductToNewCollectionInDataBase(productDetails);
            });
        }
        hideLoader();

        // Show the modal
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error("Error fetching product details:", error);
        ShowBootstrapToast("Failed to load product details. Please try again later.", "danger");    
        hideLoader();
    }
}

async function AddProductToTrendInDataBase(product) {
    try {
        // Show loader
        showLoader();


        // Reference to the carousel_2 node in Firebase
        const carouselRef = ref(db, `carousel_4/${product.id}`);

        // Add the product to the carousel_2 database
        await set(carouselRef, {
            id: product.id,
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            rating: product.rating
        });

        // Hide loader
        hideLoader();

        // Show success message
        ShowBootstrapToast(`Product "${product.title}" has been added to the trending carousel successfully!`, "success");  
    } catch (error) {
        ShowBootstrapToast("Failed to add product to the trending carousel. Please try again later.", "danger");    
        hideLoader();
    }
}

async function AddProductToNewCollectionInDataBase(product) {
    try {
        // Show loader
        showLoader();

     
      // Reference to the carousel_2 node in Firebase
      const carouselRef = ref(db, `carousel_3/${product.id}`);

      // Add the product to the carousel_2 database
      await set(carouselRef, {
            id: product.id,
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            rating: product.rating
        });

        // Hide loader
        hideLoader();

        // Show success message
        ShowBootstrapToast("Product added to the new collection successfully!", "success"); 
    } catch (error) {
        ShowBootstrapToast("Failed to add product to the trending carousel. Please try again later.", "danger");    
        hideLoader();
    }
}
async function editProduct(product) {
    try {
        // Show loader while fetching data
        showLoader();

        // Reference to the product in Firebase
        const dbRef = ref(db, `products/${product.id}`);
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            throw new Error('Failed to fetch product for editing');
        }

        const productData = snapshot.val();

        // Create or get the edit modal element
        let editModalElement = document.getElementById("editProductModal");
        if (!editModalElement) {
            createEditProductModal();
            editModalElement = document.getElementById("editProductModal");
        }

        // Fill the form with product data
        document.getElementById('editProductId').value = productData.id || "";
        document.getElementById('editProductTitle').value = productData.title || "";
        document.getElementById('editProductPrice').value = productData.price || "";
        document.getElementById('editProductDescription').value = productData.description || "";
        document.getElementById('editProductCategory').value = productData.category || "";
        document.getElementById('editProductImage').value = productData.image || "";

        if (productData.rating) {
            document.getElementById('editProductRating').value = productData.rating.rate || "";
            document.getElementById('editProductCount').value = productData.rating.count || "";
        }

        // Hide loader
        hideLoader();

        // Show the modal
        const modal = new bootstrap.Modal(editModalElement);
        modal.show();

        // Add event handler for the save button
        const saveButton = document.getElementById('saveEditProductBtn');
        saveButton.onclick = async function () {
            await saveProductChanges();
        };
    } catch (error) {
    
        ShowBootstrapToast("Failed to load product for editing. Please try again later.", "danger");
        hideLoader();
    }
}
function validateEditProductForm() {
    const title = document.getElementById('editProductTitle').value.trim();
    const price = document.getElementById('editProductPrice').value.trim();
    const description = document.getElementById('editProductDescription').value.trim();
    const category = document.getElementById('editProductCategory').value.trim();
    const image = document.getElementById('editProductImage').value.trim();
    const rate = document.getElementById('editProductRating').value.trim();
    const count = document.getElementById('editProductCount').value.trim();

    if (title === "") {
        ShowBootstrapToast("Title is required", "warning");
        return false;
    }

    if (price === "" || isNaN(price) || parseFloat(price) <= 0) {
        ShowBootstrapToast("Please enter a valid price greater than 0", "danger");
        return false;
    }

    if (description === "") {
        ShowBootstrapToast("Description is required", "danger");
        return false;
    }

    if (category === "") {
        ShowBootstrapToast("Category is required", "danger");
        return false;
    }

    if (image === "" || !isValidURL(image)) {
        ShowBootstrapToast("Please enter a valid image URL", "danger");
        return false;
    }

    if (rate === "" || isNaN(rate) || parseFloat(rate) < 0 || parseFloat(rate) > 5) {
        ShowBootstrapToast("Rating must be a number between 0 and 5", "danger");
        return false;
    }

    if (count === "" || isNaN(count) || parseInt(count) < 0) {
        ShowBootstrapToast("Rating count must be a non-negative number", "danger");
        return false;
    }

    return true;
}

function isValidURL(str) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}
async function saveProductChanges() {
    try {
        // Show loader
        showLoader();
        if (!validateEditProductForm()) {
            return;  
        }


        // Collect data from the form
        const productId = document.getElementById('editProductId').value;
        const updatedProduct = {
            id: productId,
            title: document.getElementById('editProductTitle').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            description: document.getElementById('editProductDescription').value,
            category: document.getElementById('editProductCategory').value,
            image: document.getElementById('editProductImage').value,
            rating: {
                rate: parseFloat(document.getElementById('editProductRating').value),
                count: parseInt(document.getElementById('editProductCount').value)
            }
        };

        // Reference to the product in Firebase
        const productRef = ref(db, `products/${productId}`);

        // Update the product in Firebase
        await set(productRef, updatedProduct);

        // Close the modal
        bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();

        // Reload data and update the UI
        loadProducts();

        // Hide loader
        hideLoader();

        // Show success message
        ShowBootstrapToast("Product updated successfully!", "success");
    } catch (error) {
        ShowBootstrapToast("Failed to update product. Please try again later.", "danger");
        hideLoader();
    }
}
async function deleteProduct(productId) {
    // Confirm deletion from the user
          
                // Show delete confirmation modal
                const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
                deleteConfirmModal.show();
                
                // Set up delete confirmation handler
                const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
                if (confirmDeleteBtn) {
                    confirmDeleteBtn.onclick = async () => {


                        try {
                            // Show loader
                            showLoader();
                    
                            // Reference to the product in Firebase
                            const productRef = ref(db, `products/${productId}`);
                    
                            // Delete the product from Firebase
                            await set(productRef, null);
                    
                            // Reload data and update the UI
                            loadProducts();
                    
                            // Hide loader
                            hideLoader();
                    
                            // Show success message
                            ShowBootstrapToast("Product deleted successfully!", "success");
                        } catch (error) {
                            console.error("Error deleting product:", error);
                            ShowBootstrapToast("Failed to delete product. Please try again later.", "danger");  
                            hideLoader();
                        }



                        bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
                    };
                }

}

// إنشاء مودال تفاصيل المنتج
function createProductModal() {
    const modalHTML = `
    <div class="modal fade" id="productDetailsModal" tabindex="-1" aria-labelledby="productDetailsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg rounded-4">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="productDetailsModalLabel">Product #<span id="modalProductId"></span> Details</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-4">
                <img id="modalProductImage" src="" alt="Product Image" class="img-fluid rounded-3">
              </div>
              <div class="col-md-8">
                <h4 id="modalProductTitle" class="fw-bold"></h4>
                <p><strong>Price:</strong> <span id="modalProductPrice"></span></p>
                <p><strong>Category:</strong> <span id="modalProductCategory"></span></p>
                <p><strong>Rating:</strong> <span id="modalProductRating"></span> (<span id="modalProductReviews"></span> reviews)</p>
                <p><strong>Description:</strong> <span id="modalProductDescription"></span></p>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary px-4 trendBts" data-bs-dismiss="modal">Add To Trend</button>
              <button type="button" class="btn btn-secondary px-4 newCollectionBts" data-bs-dismiss="modal">Add To New Collection</button>

            <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>س
    </div>`;

    const div = document.createElement("div");
    div.innerHTML = modalHTML;
    document.body.appendChild(div);
}

// إنشاء مودال تعديل المنتج
function createEditProductModal() {
    const modalHTML = `
    <div class="modal fade" id="editProductModal" tabindex="-1" aria-labelledby="editProductModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg rounded-4">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title" id="editProductModalLabel">Edit Product</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editProductForm">
              <input type="hidden" id="editProductId">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="editProductTitle" class="form-label">Product Title</label>
                  <input type="text" class="form-control" id="editProductTitle" required>
                </div>
                <div class="col-md-6">
                  <label for="editProductPrice" class="form-label">Price</label>
                  <input type="number" class="form-control" id="editProductPrice" step="0.01" required>
                </div>
                <div class="col-md-6">
                  <label for="editProductCategory" class="form-label">Category</label>
                  <input type="text" class="form-control" id="editProductCategory" required>
                </div>
                <div class="col-md-6">
                  <label for="editProductImage" class="form-label">Image URL</label>
                  <input type="text" class="form-control" id="editProductImage">
                </div>
                <div class="col-md-6">
                  <label for="editProductRating" class="form-label">Rating</label>
                  <input type="number" class="form-control" id="editProductRating" step="0.1" min="0" max="5">
                </div>
                <div class="col-md-6">
                  <label for="editProductCount" class="form-label">Review Count</label>
                  <input type="number" class="form-control" id="editProductCount" min="0">
                </div>
                <div class="col-12">
                  <label for="editProductDescription" class="form-label">Description</label>
                  <textarea class="form-control" id="editProductDescription" rows="3" required></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveEditProductBtn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>`;

    const div = document.createElement("div");
    div.innerHTML = modalHTML;
    document.body.appendChild(div);
}

// دوال إظهار وإخفاء مؤشر التحميل
function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "block";
    } else {
        // إنشاء مؤشر التحميل إذا لم يكن موجودًا
        const loaderHTML = `
        <div id="loader" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style="z-index: 9999;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>`;
        
        const loaderDiv = document.createElement("div");
        loaderDiv.innerHTML = loaderHTML;
        document.body.appendChild(loaderDiv.firstChild);
    }
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "none";
    }
}

function CreateSearchFilter() {
    // 1. Get the searchDiv
    const searchDiv = document.getElementById("searchDiv");
    searchDiv.style.display = "flex"; // Use flexbox for alignment
    searchDiv.style.alignItems = "center"; // Vertically align items
    searchDiv.style.gap = "10px"; // Add spacing between elements

    // 2. Create the search input
    const searchInput = document.createElement("input");
    searchInput.setAttribute("type", "text");
    searchInput.setAttribute("placeholder", "Search by product name");
    searchInput.setAttribute("id", "searchBox");
    searchInput.style.padding = "5px";
    searchInput.style.width = "200px";

    // 3. Create the "Add New Product" button
    const addNewProductBtn = document.createElement("button");
    addNewProductBtn.textContent = "Add New Product";
    addNewProductBtn.className = "btn btn-primary";
    addNewProductBtn.style.padding = "8px 16px";

    // Append the input and button to the searchDiv
    searchDiv.appendChild(searchInput);
    searchDiv.appendChild(addNewProductBtn);

    // 4. Add event listener for the search input
    searchInput.addEventListener("input", async function () {
        const queryText = searchInput.value.toLowerCase();

        try {
            // Reference to the products in Firebase
            const dbRef = ref(db, "products");
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const products = Object.values(snapshot.val());

                // Filter products by name
                const filteredProducts = products.filter(product =>
                    product.title && product.title.toLowerCase().includes(queryText)
                );

                // Display filtered products
                buildProductTable(filteredProducts);
            } else {
                ShowBootstrapToast("No products found.", "warning");
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            ShowBootstrapToast("Failed to fetch products. Please try again later.", "danger");
        }
    });
    function createAddProductModal() {
        const modalHTML = `
        <div class="modal fade" id="addProductModal" tabindex="-1" aria-labelledby="addProductModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content shadow-lg rounded-4">
              <div class="modal-header bg-success text-white">
                <h5 class="modal-title" id="addProductModalLabel">Add New Product</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form id="addProductForm">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label for="newProductTitle" class="form-label">Product Title</label>
                      <input type="text" class="form-control" id="newProductTitle" required>
                    </div>
                    <div class="col-md-6">
                      <label for="newProductPrice" class="form-label">Price</label>
                      <input type="number" class="form-control" id="newProductPrice" step="0.01" required>
                    </div>
                    <div class="col-md-6">
                      <label for="newProductCategory" class="form-label">Category</label>
                        <select class="form-select" id="newProductCategory" required>
                            <option value="" disabled selected>Select a category</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="newProductImageFile" class="form-label">Upload Image</label>
                        <input type="file" class="form-control" id="newProductImageFile" accept="image/*" required>
                    </div>
                    <div class="col-md-6">
                      <label for="newProductQuantity" class="form-label">Quantity</label>
                      <input type="number" class="form-control" id="newProductQuantity" min="1" required>
                    </div>
                    <div class="col-md-6">
                      <label for="newProductRating" class="form-label">Rating</label>
                      <input type="number" class="form-control" id="newProductRating" step="0.1" min="0" max="5" required>
                    </div>
                    <div class="col-md-6">
                      <label for="newProductReviewCount" class="form-label">Review Count</label>
                      <input type="number" class="form-control" id="newProductReviewCount" min="0" required>
                    </div>
                    <div class="col-12">
                      <label for="newProductDescription" class="form-label">Description</label>
                      <textarea class="form-control" id="newProductDescription" rows="3" required></textarea>
                    </div>
                  </div>
                </form>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-success" id="saveProductBtn">Save Product</button>
              </div>
            </div>
          </div>
        </div>`;
    
        const div = document.createElement("div");
        div.innerHTML = modalHTML;
        document.body.appendChild(div);
    }
    async function populateCategoryDropdown() {
        const categoryDropdown = document.getElementById("newProductCategory");
        categoryDropdown.innerHTML = '<option value="" disabled selected>Select a category</option>'; // Reset dropdown
    
        try {
            const dbRef = ref(db, "categories");
            const snapshot = await get(dbRef);
    
            if (snapshot.exists()) {
                const categories = Object.values(snapshot.val());
                categories.forEach(category => {
                    const option = document.createElement("option");
                    option.value = category.name; // Use the category name as the value
                    option.textContent = category.name; // Display the category name
                    categoryDropdown.appendChild(option);
                });
            } else {
                console.warn("No categories found in Firebase.");
                ShowBootstrapToast("No categories found in Firebase.", "warning");
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            ShowBootstrapToast("Failed to fetch categories. Please try again later.", "danger");
        }
    }
    // 5. Add event listener for the "Add New Product" button
    addNewProductBtn.addEventListener("click", async () => {
        let addProductModal = document.getElementById("addProductModal");
        if (!addProductModal) {
            createAddProductModal();
            addProductModal = document.getElementById("addProductModal");
        }
    
        // Populate the category dropdown
        await populateCategoryDropdown();
    
        const modal = new bootstrap.Modal(addProductModal);
        modal.show();
    
        const saveProductBtn = document.getElementById("saveProductBtn");
        saveProductBtn.onclick = async () => {
            const title = document.getElementById("newProductTitle").value.trim();
            const price = parseFloat(document.getElementById("newProductPrice").value);
            const description = document.getElementById("newProductDescription").value.trim();
            const category = document.getElementById("newProductCategory").value; // Get selected category
            const quantity = parseInt(document.getElementById("newProductQuantity").value);
            const rating = {
                rate: parseFloat(document.getElementById("newProductRating").value),
                count: parseInt(document.getElementById("newProductReviewCount").value)
            };
    
            const imageFile = document.getElementById("newProductImageFile").files[0]; // Get the uploaded file
    
            if (!title || !price || !description || !category || !imageFile || isNaN(quantity) || isNaN(rating.rate) || isNaN(rating.count)) {
                ShowBootstrapToast("Please fill in all fields correctly.", "danger");
                return;
            }
    
            try {
                showLoader();
    
                // Upload the image to Cloudinary
                const imageUrl = await uploadImageToCloudinary(imageFile);
    
                // Fetch existing products to determine the next ID
                const dbRef = ref(db, "products");
                const snapshot = await get(dbRef);
    
                let newId = 1; // Default ID if no products exist
                if (snapshot.exists()) {
                    const products = Object.values(snapshot.val());
                    const maxId = Math.max(...products.map(product => product.id));
                    newId = maxId + 1; // Increment the highest ID
                }
    
                // Add the new product to Firebase
                const newProduct = {
                    id: newId,
                    title,
                    price,
                    description,
                    category,
                    image: imageUrl, // Use the Cloudinary image URL
                    quantity,
                    rating
                };
    
                const newProductRef = ref(db, `products/${newId}`);
                await set(newProductRef, newProduct);
    
                document.getElementById("addProductForm").reset();
                bootstrap.Modal.getInstance(addProductModal).hide();
                loadProducts();
                ShowBootstrapToast("Product added successfully!", "success");
            } catch (error) {
                console.error("Error adding product:", error);
                ShowBootstrapToast("Failed to add product. Please try again later.", "danger");
            } finally {
                hideLoader();
            }
        };
    });
    async function uploadImageToCloudinary(imageFile) {
        const cloudName = "dogb1ikup"; // Replace with your Cloudinary Cloud Name
        const uploadPreset = "unsigned_preset"; // Replace with your Cloudinary Upload Preset
    
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", uploadPreset);
    
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData
            });
    
            const data = await response.json();
            console.log("Cloudinary API Response:", data); // Debugging log
    
            if (!response.ok) {
                throw new Error(data.error.message || "Failed to upload image to Cloudinary");
            }
    
            return data.secure_url; // Return the secure URL of the uploaded image
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
            throw error;
        }
    }

}

function generateSimpleGUID() {
    const date = new Date().getTime();  // وقت التوقيت الحالي بالميلي ثانية
    const random = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); // قيمة عشوائية
    return date.toString(16) + random;
  }
  
    