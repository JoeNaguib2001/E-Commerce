import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
const db = window.db;


    document.getElementById("addAdminBtn").addEventListener("click", function () {
        if(localStorage.getItem("userRole") === "admin"){

        const searchDiv = document.getElementById("searchDiv");
        const tableData = document.getElementById("tableData");
        const cardHeader = document.getElementById("cardHeader");
        const cardList = document.getElementById("cardList");

        if (searchDiv) {
            searchDiv.innerHTML = ""; // Clear the content of searchDiv
        }
        if (cardHeader) {
            cardHeader.innerHTML = ""; // Clear the content of cardHeader
        }
        if (cardList) {
            cardList.innerHTML = ""; // Clear the content of cardList
        }

        if (tableData) {
            tableData.innerHTML = ""; // Clear the content of tableData
        }

        CatContainer.innerHTML = `
        <div class="container mt-5">
            <h1>Add New Admin</h1>
            <form id="addAdminForm">
                <label for="adminFullName">Full Name:</label>
                <div class="d-flex align-items-center">
                    <input type="text" id="adminFullName" required>
                </div>
                <br>
    
                <label for="adminUsername">Username:</label>
                <div class="d-flex align-items-center">
                    <input type="text" id="adminUsername" required>
                </div>
                <br>
    
                <label for="adminEmail">Email:</label>
                <div class="d-flex align-items-center">
                    <input type="email" id="adminEmail" required>
                </div>
                <br>
    
                <label for="adminPassword">Password:</label>
               <div class="d-flex align-items-center">
                    <input type="password" id="adminPassword" class="form-control password" required>
                </div>
                <br>
    
                <label for="adminConfirmPassword">Confirm Password:</label>
                <div class="d-flex align-items-center">
                    <input type="password" id="adminConfirmPassword" required>
                </div>
                <br>
    
                <button type="submit">Add Admin</button>
            </form>
        </div>
    `;

        addAdmins();
}else{

    
    let hideInfoWarning =  document.createElement("h1");
    hideInfoWarning.textContent = "You don't have permission to access this page!";   
    hideInfoWarning.style.textAlign = "center"; 
    this.body.appendChild(hideInfoWarning); 
}
});

function addAdmins() {
    document.getElementById("addAdminForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        const email = document.getElementById("adminEmail").value.trim();
        const username = document.getElementById("adminUsername").value.trim();
        const fullName = document.getElementById("adminFullName").value.trim();
        const password = document.getElementById("adminPassword").value.trim();
        const confirmPassword = document.getElementById("adminConfirmPassword").value.trim();

        // Validation for Full Name
        if (!fullName || fullName.length < 6) {
            ShowBootstrapToast("Full Name must be at least 6 characters long.", "danger");

            return;
        }

        // Validation for Username
        if (!username || username.length < 6 || /\s/.test(username)) {
            ShowBootstrapToast("Username must be at least 6 characters long and should not contain spaces.", "danger");
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            ShowBootstrapToast("Username can only contain letters and numbers.", "danger");
            return;
        }

        // Validation for Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            ShowBootstrapToast("Please enter a valid email address.", "danger");
            return;
        }

        // Validation for Password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;

        if (!password) {
            ShowBootstrapToast("Password cannot be empty.", "danger");
            return;
        }

        if (password.length < 6) {
            ShowBootstrapToast("Password must be at least 6 characters long.", "danger");
            return;
        }

        if (!passwordRegex.test(password)) {
            ShowBootstrapToast("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.", "danger");
            return;
        }

        // Confirm Password Validation
        if (password !== confirmPassword) {
            ShowBootstrapToast("Passwords do not match. Please confirm your password.", "danger");
            return;
        }

        const userData = {
            fullName: fullName,
            userName: username,
            email: email,
            password: password,
            userType: "admin"
        };

        set(ref(db, "users/" + username), userData)
            .then(() => {
                ShowBootstrapToast("You added a new admin successfully!", "success");
                // Clear fields
                document.getElementById("addAdminForm").reset();
                resetValidationIndicators(); // Reset validation indicators
            })
            .catch((error) => {
                console.error("Error:", error);
                ShowBootstrapToast(error.message + " Please try again.", "danger");
            });

        // Optional debug logging
        console.log("Admin data:", userData);
    });
    clearFormInputs(); // Clear all input fields
    // Add validation indicators for each field
    addValidationIndicators("adminFullName", value => value.length >= 6 );
    addValidationIndicators("adminUsername", value => value.length >= 6 && !/\s/.test(value));
    addValidationIndicators("adminEmail", value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    addValidationIndicators("adminPassword", value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/.test(value));
    addValidationIndicators("adminConfirmPassword", value => value === document.getElementById("adminPassword").value.trim());
}
// document.getElementById("adminUsername").addEventListener("keypress", function (event) {
//     if (event.key === " ") {
//         event.preventDefault();
//         ShowBootstrapToast("Spaces are not allowed in the username.", "danger");
//     }
// });
function addValidationIndicators(fieldId, validationFn) {
    const field = document.getElementById(fieldId);
    const indicator = document.createElement("span");

    // Add classes and styles for the indicator
    indicator.className = "validation-indicator";
    indicator.style.marginLeft = "10px";
    indicator.style.marginBottom = "10px";
    indicator.style.width = "20px";
    indicator.style.height = "20px";
    indicator.style.borderRadius = "50%";
    indicator.style.display = "inline-block";
    indicator.style.backgroundColor = "red"; // Default to red

    // Insert the indicator beside the input field
    field.parentNode.insertBefore(indicator, field.nextSibling);

    // Add event listener for real-time validation
    field.addEventListener("input", () => {
        if (validationFn(field.value.trim())) {
            indicator.style.backgroundColor = "green"; // Valid input
        } else {
            indicator.style.backgroundColor = "red"; // Invalid input
        }
    });
}
function resetValidationIndicators() {
    const indicators = document.querySelectorAll(".validation-indicator");
    indicators.forEach(indicator => {
        indicator.style.backgroundColor = "red";
    });
}

function clearFormInputs() {
    // Clear all input fields
    document.querySelectorAll("input").forEach(input => {
        if (input.type === "text" || input.type === "email" || input.type === "password") {
            input.value = "";
        }
    })
    };
