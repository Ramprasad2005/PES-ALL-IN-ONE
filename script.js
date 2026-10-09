const phoneNumber = "919701122034";
const page = document.body.dataset.page || "home";
const whatsappLinks = document.querySelectorAll(".js-whatsapp-link");

const books = [
  { id: "kd-tripathi", name: "KD Tripathi - Pharmacology with MCQ book", price: 1200 },
  { id: "apurba-sastry", name: "Apurba Sastry - Microbiology", price: 1200 },
  { id: "robbins", name: "Robbins - Pathology with Pathology at a Glance", price: 1200 }
];

const selectedBooks = new Set();
const selectedFoods = [];

const cartTitle = document.querySelector("#cart-title");
const cartNote = document.querySelector("#cart-note");
const cartTotal = document.querySelector("#cart-total");
const checkoutLink = document.querySelector(".cart-checkout");
const cartItems = document.querySelector("#cart-items");
const cartClearBtn = document.querySelector("#cart-clear-btn");

function makeWhatsAppUrl(message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

function setWhatsAppLinks(message) {
  const url = makeWhatsAppUrl(message);

  whatsappLinks.forEach((link) => {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

function renderCartItems(items, onRemove) {
  if (!cartItems) return;

  cartItems.innerHTML = "";
  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "cart-item";

    const labelSpan = document.createElement("span");
    labelSpan.className = "cart-item-name";
    labelSpan.textContent = typeof item === "string" ? item : item.label;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "cart-item-remove";
    const itemName = typeof item === "string" ? item : item.label;
    removeBtn.setAttribute("aria-label", `Delete ${itemName}`);
    removeBtn.title = "Delete";
    removeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
      <span>Delete</span>
    `;

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (onRemove) {
        onRemove(index, item);
      }
    });

    li.appendChild(labelSpan);
    li.appendChild(removeBtn);
    cartItems.appendChild(li);
  });
}

function getSelectedBookData() {
  return books.filter((book) => selectedBooks.has(book.id));
}

function getBookTotal(selected) {
  return selected.length === 3 ? 3000 : selected.reduce((total, book) => total + book.price, 0);
}

function updateBooksCart() {
  const selected = getSelectedBookData();
  const total = getBookTotal(selected);

  if (cartClearBtn) {
    cartClearBtn.style.display = selected.length > 0 ? "inline-flex" : "none";
  }

  if (selected.length === 0) {
    cartTitle.textContent = "No books selected yet";
    cartNote.textContent = "Add any book for ₹1200, or all 3 books for ₹3000.";
    cartTotal.textContent = "₹0";
    checkoutLink.setAttribute("aria-disabled", "true");
    renderCartItems([], null);
    setWhatsAppLinks([
      "Hi, I am interested in ALL IN ONE books.",
      "Please share pictures and details.",
      "Book price: ₹1200 each, all 3 books for ₹3000"
    ].join("\n"));
    return;
  }

  cartTitle.textContent = `${selected.length} ${selected.length === 1 ? "book" : "books"} selected`;
  cartNote.textContent =
    selected.length === 3
      ? "Bundle applied: all 3 books for ₹3000 instead of ₹3600."
      : "Add all 3 books to get the ₹3000 bundle.";
  cartTotal.textContent = `₹${total}`;
  checkoutLink.setAttribute("aria-disabled", "false");
  renderCartItems(
    selected.map((book) => ({
      label: `${book.name} - ₹${book.price}`,
      id: book.id
    })),
    (_index, item) => {
      selectedBooks.delete(item.id);
      const button = document.querySelector(`.js-cart-toggle[data-book-id="${item.id}"]`);
      if (button) {
        button.classList.remove("is-selected");
        button.textContent = "Add to Cart";
      }
      updateBooksCart();
    }
  );
  setWhatsAppLinks([
    "Hi, I want to book these ALL IN ONE books:",
    ...selected.map((book) => `- ${book.name} - ₹${book.price}`),
    selected.length === 3 ? "Bundle applied: 3 books for ₹3000" : `Books total: ₹${total}`,
    "Please share pictures and pickup/delivery details."
  ].join("\n"));
}

function updateFoodCart() {
  if (cartClearBtn) {
    cartClearBtn.style.display = selectedFoods.length > 0 ? "inline-flex" : "none";
  }

  if (selectedFoods.length === 0) {
    cartTitle.textContent = "No food selected yet";
    cartNote.textContent = "Add food items, then checkout on WhatsApp to confirm price and availability.";
    cartTotal.textContent = "Ask";
    checkoutLink.setAttribute("aria-disabled", "true");
    renderCartItems([], null);
    setWhatsAppLinks([
      "Hi, I am interested in ALL IN ONE gym protein food.",
      "Please share today's menu, prices, and availability."
    ].join("\n"));
    return;
  }

  cartTitle.textContent = `${selectedFoods.length} ${selectedFoods.length === 1 ? "food item" : "food items"} selected`;
  cartNote.textContent = "Food price and availability will be confirmed on WhatsApp.";
  cartTotal.textContent = "Ask";
  checkoutLink.setAttribute("aria-disabled", "false");
  renderCartItems(
    selectedFoods.map((item) => ({
      label: `${item.name} - ${item.serving}`,
      raw: item
    })),
    (index) => {
      selectedFoods.splice(index, 1);
      updateFoodCart();
    }
  );
  setWhatsAppLinks([
    "Hi, I want to order these ALL IN ONE food items:",
    ...selectedFoods.map((item) => `- ${item.name} - ${item.serving}`),
    "Please confirm price, availability, and pickup/delivery details."
  ].join("\n"));
}

if (cartClearBtn) {
  cartClearBtn.addEventListener("click", () => {
    if (page === "food") {
      selectedFoods.length = 0;
      updateFoodCart();
    } else if (page === "books") {
      selectedBooks.clear();
      document.querySelectorAll(".js-cart-toggle").forEach((button) => {
        button.classList.remove("is-selected");
        button.textContent = "Add to Cart";
      });
      updateBooksCart();
    }
  });
}

document.querySelectorAll(".js-cart-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const bookId = button.dataset.bookId;

    if (selectedBooks.has(bookId)) {
      selectedBooks.delete(bookId);
      button.classList.remove("is-selected");
      button.textContent = "Add to Cart";
    } else {
      selectedBooks.add(bookId);
      button.classList.add("is-selected");
      button.textContent = "Added";
    }

    updateBooksCart();
  });
});

document.querySelectorAll(".js-food-add").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".food-card");
    const name = card.dataset.foodName;
    const serving = card.querySelector(".food-serving").value;

    selectedFoods.push({ name, serving });
    button.textContent = "Added";
    button.classList.add("is-selected");

    window.setTimeout(() => {
      button.textContent = "Add to Cart";
      button.classList.remove("is-selected");
    }, 900);

    updateFoodCart();
  });
});

if (page === "books") {
  updateBooksCart();
} else if (page === "food") {
  updateFoodCart();
}
