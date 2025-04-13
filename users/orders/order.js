const data = {
  orderId: 1743725530147,
  userName: "123456",
  orderDate: "2025-04-04",
  estimatedDelivery: "2025-04-07",
  order: [
    {
      id: 3,
      title: "Mens Cotton Jacket",
      price: 55.99,
      description: "great outerwear jackets...",
      category: "Men's Clothing",
      image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
      rating: {
        rate: 4.7,
        count: 500,
      },
      quantity: 1,
    },
  ],
  orderStatus: "Waiting",
  totalPrice: "167.97",
  paymentMethod: "Credit Card",
};

const itemsContainer = document.getElementById("items");
const div = document.getElementById("pay");
data.order.forEach((item) => {
  const itemHTML = `
        <div class="item">
          <img src="${item.image}" alt="${item.title}">
          <div class="item-details">
            <h4>${item.title}</h4>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: $${item.price}</p>

            
          </div>
        </div>
      `;

  itemsContainer.insertAdjacentHTML("beforeend", itemHTML);
});
data.forEach((item) => {
  const itemHTML = `
        <div class="item">
       
            <p>Price: $${item.paymentMethod}</p>

            
          </div>
        </div>
      `;
  div.insertAdjacentHTML("beforeend", itemHTML);
});
