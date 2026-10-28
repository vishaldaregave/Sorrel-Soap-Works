const products = {
  prototype: {
    id: "prototype",
    name: "Artisanal Cold-Process Prototype Bar",
    number: "Batch 014",
    price: 249,
    category: "single",
    image: "assets/soap-prototype.jpg",
    alt: "Hand-poured white cold-process soap prototype bar resting on studio tile",
    notes: "Cold-pressed plant oils, rich natural glycerine, unscented clean",
    skin: "All skin types / sensitive & dry skin friendly",
    weight: "120 g / 4.2 oz",
    lather: "Dense, silken, rich plant glycerine cushion",
    description:
      "Our physical studio prototype. Hand-poured in wooden molds at 34°C and cured for 42 days. Made strictly with food-grade plant oils, mineral clays, and natural saponification. Free of palm oil, artificial hardening agents, and synthetic fragrance.",
    ingredients:
      "Saponified cold-pressed extra virgin olive oil, raw organic coconut oil, unrefined shea butter, pure castor oil, French mineral clay, distilled spring water."
  },
  trio: {
    id: "trio",
    name: "Batch 014 Studio Trio (Set of 3 Bars)",
    number: "Pack of 3",
    price: 649,
    category: "trio",
    image: "assets/soap-prototype.jpg",
    alt: "Three hand-cut prototype soap bars from Batch 014",
    notes: "Triple cut from cedar aging rack, plastic-free parchment wrap",
    skin: "Complete household / daily face and body use",
    weight: "3 x 120 g (360 g total)",
    lather: "Luxurious long-lasting lather that never dissolves into mush",
    description:
      "A complete 3-month supply of our Batch 014 prototype bars. Includes 3 individually wrapped bars cut by calibrated wire from our cured studio loaf. Automatically qualifies for complimentary studio delivery across India.",
    ingredients:
      "Cold-pressed olive oil, raw coconut oil, unrefined shea butter, mineral clay, castor oil, spring water."
  },
  loaf_reserve: {
    id: "loaf_reserve",
    name: "Workshop Reserve + Cedar Drying Dish",
    number: "Collector Set",
    price: 499,
    category: "reserve",
    image: "assets/soap-prototype.jpg",
    alt: "Prototype soap bar with handcrafted slotted cedar draining dish",
    notes: "Prototype bar paired with slotted cedar wood curing dish",
    skin: "Ideal gift / bathroom sink upgrade",
    weight: "120 g bar + handcrafted dish",
    lather: "Dries rapidly between uses for up to 6 weeks of continuous sink use",
    description:
      "One cured prototype bar accompanied by our studio-crafted slotted cedarwood drying dish. Keeps the soap elevated above water to preserve its dense crystalline hardness. Qualifies for complimentary shipping.",
    ingredients:
      "Batch 014 cold-process prototype soap + kiln-dried sustainable cedarwood draining tray."
  }
};

const SHIPPING_THRESHOLD = 499;
const cart = new Map();

const menuDialog = document.querySelector("#menu-dialog");
const cartDialog = document.querySelector("#cart-dialog");
const productDialog = document.querySelector("#product-dialog");
const menuButton = document.querySelector("[data-open-menu]");
const toast = document.querySelector("[data-toast]");
const cartList = document.querySelector("[data-cart-list]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const cartFooter = document.querySelector("[data-cart-footer]");
const cartSubtotal = document.querySelector("[data-cart-subtotal]");
const checkoutLink = document.querySelector("[data-checkout]");
const shippingProgress = document.querySelector("[data-shipping-progress]");
const shippingText = document.querySelector("[data-shipping-text]");
const shippingStatus = document.querySelector("[data-shipping-status]");
const giftNoteCheckbox = document.querySelector("#gift-note-toggle");
const backToTopBtn = document.querySelector("[data-back-to-top]");

let currentProduct = null;
let toastTimer;

function formatPrice(value) {
  return `₹${value}`;
}

function getCartCount() {
  let count = 0;
  cart.forEach((quantity) => {
    count += quantity;
  });
  return count;
}

function getCartSubtotal() {
  let subtotal = 0;
  cart.forEach((quantity, id) => {
    const product = products[id];
    if (product) subtotal += product.price * quantity;
  });
  return subtotal;
}

function syncDialogLock() {
  const hasOpenDialog = Boolean(document.querySelector("dialog[open]"));
  document.body.classList.toggle("dialog-open", hasOpenDialog);
}

function showToast(message) {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

function updateCartCount() {
  const count = getCartCount();

  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = String(count);
  });

  const bagButton = document.querySelector("[data-open-cart]");
  if (bagButton) {
    bagButton.setAttribute("aria-label", `Open bag, ${count} ${count === 1 ? "item" : "items"}`);
  }
}

function updateShippingProgress(subtotal) {
  if (!shippingProgress || !shippingText || !shippingStatus) return;

  const percentage = Math.min(100, Math.round((subtotal / SHIPPING_THRESHOLD) * 100));
  shippingProgress.style.width = `${percentage}%`;

  if (subtotal >= SHIPPING_THRESHOLD) {
    shippingText.textContent = "✦ Complimentary studio shipping unlocked!";
    shippingStatus.textContent = "Free Shipping";
    shippingProgress.style.backgroundColor = "var(--moss)";
  } else {
    const remaining = SHIPPING_THRESHOLD - subtotal;
    shippingText.textContent = `Add ₹${remaining} for complimentary studio shipping`;
    shippingStatus.textContent = `₹${subtotal} / ₹${SHIPPING_THRESHOLD}`;
    shippingProgress.style.backgroundColor = "var(--clay)";
  }
}

function buildCheckoutHref() {
  const lines = [];
  const subtotal = getCartSubtotal();

  cart.forEach((quantity, id) => {
    const product = products[id];
    if (!product) return;
    lines.push(
      `${quantity} x ${product.name} at ${formatPrice(product.price)} each = ${formatPrice(quantity * product.price)}`
    );
  });

  const isGiftNote = giftNoteCheckbox?.checked;
  const shippingNote = subtotal >= SHIPPING_THRESHOLD ? "Complimentary studio shipping (Order >= ₹499)" : "Standard shipping calculated by location";

  const subject = "Sorrel Soap Works order enquiry - Prototype Batch 014";
  const body = [
    "Hello Vishal, Dikshant & Soham (Sorrel Studio),",
    "",
    "I would like to order the following cold-process prototype bars:",
    "",
    ...lines,
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    `Shipping: ${shippingNote}`,
    isGiftNote ? "Gift Note: Yes, please include complimentary handwritten studio note." : "",
    "",
    "Name:",
    "Shipping address:",
    "Phone (for delivery courier):",
    "",
    "Thank you."
  ].filter(Boolean).join("\n");

  return `mailto:hello@sorrelsoap.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function createCartItem(id, quantity) {
  const product = products[id];
  const item = document.createElement("li");

  const image = document.createElement("img");
  image.className = "cart-item-image";
  image.src = product.image;
  image.alt = product.alt;
  image.width = 82;
  image.height = 102;

  const info = document.createElement("div");
  info.className = "cart-item-info";

  const name = document.createElement("h3");
  name.textContent = product.name;

  const meta = document.createElement("p");
  meta.textContent = `${product.number} / ${formatPrice(product.price)}`;

  const controls = document.createElement("div");
  controls.className = "cart-item-controls";

  const qtyGroup = document.createElement("div");
  qtyGroup.className = "qty-group";

  const decrease = document.createElement("button");
  decrease.className = "qty-button";
  decrease.type = "button";
  decrease.textContent = "−";
  decrease.dataset.cartAction = "decrease";
  decrease.dataset.cartId = id;
  decrease.setAttribute("aria-label", `Decrease quantity of ${product.name}`);

  const qty = document.createElement("span");
  qty.className = "qty-value";
  qty.textContent = String(quantity);
  qty.setAttribute("aria-live", "polite");

  const increase = document.createElement("button");
  increase.className = "qty-button";
  increase.type = "button";
  increase.textContent = "+";
  increase.dataset.cartAction = "increase";
  increase.dataset.cartId = id;
  increase.setAttribute("aria-label", `Increase quantity of ${product.name}`);

  const remove = document.createElement("button");
  remove.className = "remove-button";
  remove.type = "button";
  remove.textContent = "Remove";
  remove.dataset.cartAction = "remove";
  remove.dataset.cartId = id;
  remove.setAttribute("aria-label", `Remove ${product.name} from bag`);

  qtyGroup.append(decrease, qty, increase);
  controls.append(qtyGroup, remove);
  info.append(name, meta, controls);

  const total = document.createElement("span");
  total.className = "cart-item-total";
  total.textContent = formatPrice(product.price * quantity);

  item.append(image, info, total);
  return item;
}

function renderCart() {
  const count = getCartCount();
  const subtotal = getCartSubtotal();

  updateCartCount();
  updateShippingProgress(subtotal);

  if (!cartList || !cartEmpty || !cartFooter || !cartSubtotal) return;

  if (count === 0) {
    cartList.replaceChildren();
    cartList.hidden = true;
    cartEmpty.hidden = false;
    cartFooter.hidden = true;
    updateCheckoutLink();
    return;
  }

  cartEmpty.hidden = true;
  cartList.hidden = false;
  cartFooter.hidden = false;
  cartList.replaceChildren();

  cart.forEach((quantity, id) => {
    const product = products[id];
    if (!product) return;
    cartList.append(createCartItem(id, quantity));
  });

  cartSubtotal.textContent = String(subtotal);
  updateCheckoutLink();
}

function updateCheckoutLink() {
  if (!checkoutLink) return;
  const count = getCartCount();

  if (count === 0) {
    checkoutLink.href = "mailto:hello@sorrelsoap.com";
    checkoutLink.setAttribute("aria-disabled", "true");
    return;
  }

  checkoutLink.removeAttribute("aria-disabled");
  checkoutLink.href = buildCheckoutHref();
}

function addToCart(id, clickedBtn) {
  const product = products[id];
  if (!product) return;

  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(`${product.name} added to your bag.`);

  if (clickedBtn && clickedBtn.classList.contains("add-button")) {
    const originalText = clickedBtn.innerHTML;
    clickedBtn.innerHTML = 'Added &#x2713;';
    clickedBtn.classList.add("is-added");
    window.setTimeout(() => {
      clickedBtn.innerHTML = originalText;
      clickedBtn.classList.remove("is-added");
    }, 1400);
  }
}

function changeCartQuantity(id, change) {
  const next = (cart.get(id) || 0) + change;

  if (next <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, next);
  }

  renderCart();
}

function removeFromCart(id) {
  const product = products[id];
  cart.delete(id);
  renderCart();
  if (product) showToast(`${product.name} removed from your bag.`);
}

function openMenu() {
  if (!menuDialog || menuDialog.open) return;
  menuDialog.showModal();
  menuButton?.setAttribute("aria-expanded", "true");
  syncDialogLock();
}

function closeMenu() {
  if (!menuDialog?.open) return;
  menuDialog.close();
}

function openCart() {
  if (!cartDialog || cartDialog.open) return;
  renderCart();
  cartDialog.showModal();
  syncDialogLock();
}

function closeCart() {
  if (!cartDialog?.open) return;
  cartDialog.close();
}

function openProduct(id) {
  const product = products[id];
  if (!product || !productDialog) return;

  currentProduct = id;

  productDialog.querySelector("[data-product-image]").src = product.image;
  productDialog.querySelector("[data-product-image]").alt = product.alt;
  productDialog.querySelector("[data-product-number]").textContent = product.number;
  productDialog.querySelector("[data-product-title]").textContent = product.name;
  productDialog.querySelector("[data-product-price]").textContent = formatPrice(product.price);
  productDialog.querySelector("[data-product-description]").textContent = product.description;
  productDialog.querySelector("[data-product-notes]").textContent = product.notes;
  productDialog.querySelector("[data-product-skin]").textContent = product.skin;
  productDialog.querySelector("[data-product-weight]").textContent = product.weight;
  productDialog.querySelector("[data-product-ingredients]").textContent = product.ingredients;

  productDialog.showModal();
  syncDialogLock();
}

function closeProduct() {
  if (!productDialog?.open) return;
  productDialog.close();
}

/* Matcher tab updater */
const matcherDisplay = document.querySelector("[data-matcher-display]");
const matcherTabs = document.querySelectorAll("[data-match-target]");

function updateMatcher(targetId) {
  const product = products[targetId];
  if (!product || !matcherDisplay) return;

  matcherTabs.forEach((tab) => {
    const isActive = tab.dataset.matchTarget === targetId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  matcherDisplay.innerHTML = `
    <div class="matcher-result-card" data-result-id="${product.id}">
      <div class="result-media">
        <img src="${product.image}" alt="${product.alt}" width="320" height="400">
      </div>
      <div class="result-content">
        <span class="result-match-pill">Recommended Selection</span>
        <h3>${product.name} &mdash; <span class="result-price">${formatPrice(product.price)}</span></h3>
        <p class="result-desc">${product.description}</p>
        <div class="result-specs">
          <div><strong>Skin Suitability:</strong> ${product.skin}</div>
          <div><strong>Weight / Specs:</strong> ${product.weight}</div>
          <div><strong>Lather Profile:</strong> ${product.lather}</div>
        </div>
        <div class="result-cta-row">
          <button class="button button--primary" type="button" data-add="${product.id}">Add this to bag <span class="button-arrow" aria-hidden="true">+</span></button>
          <button class="text-link" type="button" data-quick-view="${product.id}">Full formula notes &rarr;</button>
        </div>
      </div>
    </div>
  `;
}

/* Filtering functionality */
const filterButtons = document.querySelectorAll("[data-filter]");
const productCards = document.querySelectorAll("[data-product]");

function filterProducts(category) {
  filterButtons.forEach((btn) => {
    const isActive = btn.dataset.filter === category;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  productCards.forEach((card) => {
    if (category === "all" || card.dataset.category === category) {
      card.classList.remove("is-filtered-out");
    } else {
      card.classList.add("is-filtered-out");
    }
  });
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterProducts(btn.dataset.filter);
  });
});

/* Event Listeners Setup */
document.addEventListener("click", (event) => {
  const target = event.target;

  // Add to cart button
  const addTrigger = target.closest("[data-add]");
  if (addTrigger) {
    const id = addTrigger.dataset.add;
    addToCart(id, addTrigger);
    return;
  }

  // Quick view button
  const quickTrigger = target.closest("[data-quick-view]");
  if (quickTrigger) {
    const id = quickTrigger.dataset.quickView;
    openProduct(id);
    return;
  }

  // Open Cart
  if (target.closest("[data-open-cart]")) {
    openCart();
    return;
  }

  // Close Cart
  if (target.closest("[data-close-cart]")) {
    closeCart();
    return;
  }

  // Open Menu
  if (target.closest("[data-open-menu]")) {
    openMenu();
    return;
  }

  // Close Menu
  if (target.closest("[data-close-menu]")) {
    closeMenu();
    return;
  }

  // Close Product Dialog
  if (target.closest("[data-close-product]")) {
    closeProduct();
    return;
  }

  // Add from product dialog
  if (target.closest("[data-product-add]")) {
    if (currentProduct) {
      addToCart(currentProduct, null);
      closeProduct();
      openCart();
    }
    return;
  }

  // Cart item actions (increase, decrease, remove)
  const cartActionBtn = target.closest("[data-cart-action]");
  if (cartActionBtn) {
    const action = cartActionBtn.dataset.cartAction;
    const id = cartActionBtn.dataset.cartId;
    if (action === "increase") changeCartQuantity(id, 1);
    if (action === "decrease") changeCartQuantity(id, -1);
    if (action === "remove") removeFromCart(id);
    return;
  }

  // Matcher tabs
  const matchTab = target.closest("[data-match-target]");
  if (matchTab) {
    updateMatcher(matchTab.dataset.matchTarget);
    return;
  }

  // Mobile menu links close dialog
  if (target.closest("[data-menu-link]")) {
    closeMenu();
    return;
  }
});

// Backdrop click closes dialogs
[menuDialog, cartDialog, productDialog].forEach((dialog) => {
  if (!dialog) return;
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      dialog.close();
      syncDialogLock();
    }
  });

  dialog.addEventListener("close", () => {
    syncDialogLock();
    if (dialog === menuDialog) {
      menuButton?.setAttribute("aria-expanded", "false");
    }
  });
});

// Gift note toggle updates checkout mailto link
giftNoteCheckbox?.addEventListener("change", () => {
  updateCheckoutLink();
});

// Sticky header shadow & floating back-to-top button
const siteHeader = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  const scrolled = window.scrollY > 30;
  siteHeader?.classList.toggle("is-scrolled", scrolled);

  if (backToTopBtn) {
    backToTopBtn.classList.toggle("is-visible", window.scrollY > 400);
  }
}, { passive: true });

backToTopBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Signup Form handling
const signupForm = document.querySelector("[data-signup-form]");
const formStatus = document.querySelector("[data-form-status]");

signupForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const emailInput = signupForm.querySelector("input[type='email']");
  if (!emailInput || !emailInput.value) return;

  if (formStatus) {
    formStatus.textContent = "Thank you. You are on the Batch 015 reserve notice list.";
    formStatus.style.color = "var(--olive)";
  }
  showToast("Email saved for Batch 015 notification.");
  emailInput.value = "";
});

// Scroll reveal animations
const revealElements = document.querySelectorAll(".reveal");

function activateReveal(el) {
  if (!el) return;
  el.classList.add("is-visible", "is-revealed");
}

// Immediately reveal elements near or above fold
revealElements.forEach((el) => {
  const rect = el.getBoundingClientRect();
  if (rect.top < (window.innerHeight || document.documentElement.clientHeight) + 100) {
    activateReveal(el);
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activateReveal(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: "60px 0px" });

  revealElements.forEach((el) => {
    if (!el.classList.contains("is-visible")) {
      revealObserver.observe(el);
    }
  });
} else {
  revealElements.forEach(activateReveal);
}

// Failsafe timer: guarantee all elements are visible after 350ms
window.setTimeout(() => {
  revealElements.forEach(activateReveal);
}, 350);

// Initial render
renderCart();
