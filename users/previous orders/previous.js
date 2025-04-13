const ratingSelect = document.getElementById("rating");
const orderId = "1235";
const savedRatingEl = document.getElementById("saved-rating"); // you can make this dynamic if needed

function showSavedRating(value) {
  savedRatingEl.innerHTML = `Your rate: ${"⭐".repeat(value)}`;
}

// Save rating to localStorage when changed
ratingSelect.addEventListener("change", () => {
  localStorage.setItem(`orderRating_${orderId}`, ratingSelect.value);
  alert("Thanks for rating!");
  ratingSelect.value = "";
});
// Show the review textarea when "Write Review" button is clicked
document.getElementById("reviewButton").addEventListener("click", function () {
  document.getElementById("reviewContainer").style.display = "block";
  document.getElementById("submit-review").style.display = "inline-block";
  document.getElementById("reviewButton").style.display = "none"; // Show submit button
});

// Submit the review and save to localStorage
document.getElementById("submit-review").addEventListener("click", function () {
  const reviewText = document.getElementById("review-text").value;

  if (reviewText) {
    // Save review to localStorage
    localStorage.setItem("userReview", reviewText);

    // Hide the review container and submit button
    document.getElementById("reviewContainer").style.display = "none";
    document.getElementById("submit-review").style.display = "none"; // Hide submit button

    alert("Your review has been submitted!");
    document.getElementById("reviewButton").style.display = "inline-block"; // Optional: Confirm submission
  } else {
    alert("Please write a review before submitting.");
  }
});
