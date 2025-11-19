const authOverlay = document.getElementById("auth-overlay");
const authTabs = document.querySelectorAll(".auth-tab");
const authForms = document.querySelectorAll(".auth-form");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const appRoot = document.getElementById("app");
const profileButton = document.getElementById("profile-button");
const panels = document.querySelectorAll(".panel");
const dialog = {
  root: document.getElementById("feedback-dialog"),
  card: document.querySelector("#feedback-dialog .dialog-card"),
  message: document.getElementById("dialog-message"),
  close: document.getElementById("dialog-close"),
};

const dom = {
  playerName: document.getElementById("player-name"),
  playerLevel: document.getElementById("player-level"),
  cashBalance: document.getElementById("cash-balance"),
  ironBalance: document.getElementById("iron-balance"),
  profileUsername: document.getElementById("profile-username"),
  profileLevel: document.getElementById("profile-level"),
  profileIdentity: document.getElementById("profile-identity"),
  profilePanel: document.getElementById("profile-panel"),
  profileForm: document.getElementById("profile-form"),
  inventoryList: document.getElementById("inventory-list"),
  listingForm: document.getElementById("listing-form"),
  listingSelect: document.querySelector("#listing-form select"),
  marketList: document.getElementById("market-list"),
  marketSearch: document.getElementById("market-search"),
  marketFilter: document.getElementById("market-filter"),
  workButton: document.getElementById("work-button"),
  currencyList: document.getElementById("currency-list"),
  selectedCurrency: document.getElementById("selected-currency"),
  selectedPrice: document.getElementById("selected-price"),
  currencyForm: document.getElementById("currency-form"),
  transferForm: document.getElementById("transfer-form"),
  receiptButton: document.getElementById("receipt-button"),
  receiptPanel: document.getElementById("receipt-panel"),
  receiptList: document.getElementById("receipt-list"),
};

const GAMEPLAY_STORAGE = "ticarion-gameplay";

const defaultCurrencies = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    currentPrice: 487000,
    previousClose: 495000,
    volume: 100000,
  },
  {
    id: "tcoin",
    name: "Tcoin",
    symbol: "TCO",
    currentPrice: 210,
    previousClose: 200,
    volume: 100000,
  },
  {
    id: "gold",
    name: "Altın",
    symbol: "ALT",
    currentPrice: 10000,
    previousClose: 9000,
    volume: 100000,
  },
  {
    id: "silver",
    name: "Gümüş",
    symbol: "GMŞ",
    currentPrice: 700,
    previousClose: 750,
    volume: 100000,
  },
];

const state = {
  user: null,
  users: loadUsers(),
  gameplay: defaultGameplay(),
};

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem("ticarion-users")) || [];
  } catch (error) {
    return [];
  }
}

function saveUsers() {
  localStorage.setItem("ticarion-users", JSON.stringify(state.users));
}

function defaultGameplay() {
  return {
    balances: {
      cash: 150000,
      iron: 0,
    },
    currencies: defaultCurrencies.reduce((acc, currency) => {
      acc[currency.id] = { holdings: 0 };
      return acc;
    }, {}),
    inventory: {
      demir: 0,
      tohum: 10,
      makine: 1,
    },
    listings: [],
    receipts: [],
  };
}

function loadState(username) {
  try {
    const storage = JSON.parse(localStorage.getItem(GAMEPLAY_STORAGE)) || {};
    return storage[username] || defaultGameplay();
  } catch (error) {
    return defaultGameplay();
  }
}

function saveState() {
  if (!state.user) return;
  const payload = JSON.parse(localStorage.getItem(GAMEPLAY_STORAGE) || "{}");
  payload[state.user.username] = state.gameplay;
  localStorage.setItem(GAMEPLAY_STORAGE, JSON.stringify(payload));
}

function showDialog(message, variant = "info") {
  dialog.message.textContent = message;
  dialog.card.dataset.variant = variant;
  dialog.root.classList.remove("hidden");
}

function hideDialog() {
  dialog.root.classList.add("hidden");
  dialog.card.dataset.variant = "info";
}

function togglePanel(panelId, open = true) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  if (open) {
    panel.classList.remove("hidden");
  } else {
    panel.classList.add("hidden");
  }
}

function closePanels() {
  panels.forEach((panel) => panel.classList.add("hidden"));
}

function renderSummary() {
  if (!state.user) return;
  dom.playerName.textContent = state.user.username;
  dom.playerLevel.textContent = `Seviye ${state.user.level ?? 1}`;
  dom.cashBalance.textContent = formatCurrency(state.gameplay.balances.cash);
  dom.ironBalance.textContent = state.gameplay.balances.iron.toLocaleString("tr-TR");
}

function renderProfile() {
  dom.profileUsername.textContent = state.user.username;
  dom.profileLevel.textContent = `Seviye ${state.user.level ?? 1}`;
  dom.profileIdentity.textContent = state.user.identity;
  dom.profileForm.phone.value = state.user.phone;
  dom.profileForm.email.value = state.user.email || "";
}

function renderInventory() {
  const entries = Object.entries(state.gameplay.inventory);
  dom.inventoryList.innerHTML = entries
    .map(
      ([key, value]) => `
        <article class="inventory-card">
          <h4>${formatItem(key)}</h4>
          <p>Adet: <strong>${value.toLocaleString("tr-TR")}</strong></p>
        </article>
      `
    )
    .join("");

  dom.listingSelect.innerHTML = entries
    .map(([key]) => `<option value="${key}">${formatItem(key)}</option>`)
    .join("");
}

function renderMarket() {
  const query = dom.marketSearch.value.toLowerCase();
  const filter = dom.marketFilter.value;
  const cards = state.gameplay.listings
    .filter((listing) =>
      filter === "all" ? true : listing.category === filter
    )
    .filter((listing) => listing.item.toLowerCase().includes(query))
    .map(
      (listing) => `
        <article class="market-card">
          <h4>${formatItem(listing.item)}</h4>
          <p>Satıcı: ${listing.seller}</p>
          <p>Adet: ${listing.quantity.toLocaleString("tr-TR")}</p>
          <p>Birim: ${formatCurrency(listing.price)}</p>
          <p>Toplam: ${formatCurrency(listing.price * listing.quantity)}</p>
        </article>
      `
    )
    .join("");

  dom.marketList.innerHTML = cards || `<p>Henüz ilan yok.</p>`;
}

function renderCurrencies() {
  dom.currencyList.innerHTML = defaultCurrencies
    .map((currency, index) => {
      const holdings = state.gameplay.currencies[currency.id]?.holdings || 0;
      const change = calculateChange(currency);
      return `
        <article class="currency-card" data-currency="${currency.id}" ${
          index === 0 ? "data-selected" : ""
        }>
          <div>
            <h4>${currency.name}</h4>
            <small>${currency.symbol}</small>
          </div>
          <strong>${formatCurrency(currency.currentPrice)}</strong>
          <p class="price-change ${change >= 0 ? "positive" : "negative"}">
            ${change >= 0 ? "+" : ""}${change.toFixed(2)}%
          </p>
          <p>Dünkü kapanış: ${formatCurrency(currency.previousClose)}</p>
          <p>Hacim: ${currency.volume.toLocaleString("tr-TR")}</p>
          <p>Bakiye: ${holdings.toLocaleString("tr-TR")} adet</p>
        </article>
      `;
    })
    .join("");

  selectCurrency(defaultCurrencies[0].id);
}

function calculateChange(currency) {
  const diff = currency.currentPrice - currency.previousClose;
  return (diff / currency.previousClose) * 100;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatItem(key) {
  const mapping = {
    demir: "Demir",
    tohum: "Premium Tohum",
    makine: "Hasat Makinesi",
  };
  return mapping[key] || key;
}

function selectCurrency(id) {
  const cards = document.querySelectorAll(".currency-card");
  cards.forEach((card) => {
    if (card.dataset.currency === id) {
      card.classList.add("active");
      card.dataset.selected = "true";
    } else {
      card.classList.remove("active");
      card.removeAttribute("data-selected");
    }
  });
  const currency = defaultCurrencies.find((item) => item.id === id);
  if (currency) {
    dom.currencyForm.dataset.selected = id;
    dom.selectedCurrency.textContent = currency.name;
    dom.selectedPrice.textContent = formatCurrency(currency.currentPrice);
  }
}

function tradingWindowOpen() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 9 && hour < 21;
}

function handleTrade(event) {
  event.preventDefault();
  const { amount, action } = Object.fromEntries(new FormData(event.target));
  const currencyId = event.target.dataset.selected;
  if (!currencyId) {
    return showDialog("Lütfen bir döviz seç.", "error");
  }

  if (!tradingWindowOpen()) {
    return showDialog("Döviz işlemleri 09:00 - 21:00 arasında yapılabilir.", "error");
  }

  const currency = defaultCurrencies.find((item) => item.id === currencyId);
  const qty = Number(amount);
  if (!qty || qty <= 0) {
    return showDialog("Geçerli bir adet gir.", "error");
  }

  const price = currency.currentPrice * qty;
  const holdings = state.gameplay.currencies[currencyId]?.holdings || 0;

  if (action === "buy") {
    if (state.gameplay.balances.cash < price) {
      return showDialog("Bakiyeniz yetersizdir!", "error");
    }
    state.gameplay.balances.cash -= price;
    state.gameplay.currencies[currencyId].holdings = holdings + qty;
    pushReceipt("Alış", currency, qty, currency.currentPrice);
    showDialog("İşlem yapıldı.", "success");
  } else if (action === "sell") {
    if (holdings < qty) {
      return showDialog("Yeterli adet yok!", "error");
    }
    state.gameplay.balances.cash += price;
    state.gameplay.currencies[currencyId].holdings = holdings - qty;
    pushReceipt("Satış", currency, qty, currency.currentPrice);
    showDialog("İşlem yapıldı.", "success");
  } else {
    return showDialog("İşlem seçiniz.", "error");
  }

  saveState();
  renderSummary();
  renderCurrencies();
}

function pushReceipt(type, currency, quantity, unitPrice) {
  const now = new Date();
  state.gameplay.receipts.unshift({
    type,
    currency: currency.name,
    symbol: currency.symbol,
    quantity,
    unitPrice,
    total: quantity * unitPrice,
    timestamp: now.toLocaleString("tr-TR"),
  });
  state.gameplay.receipts = state.gameplay.receipts.slice(0, 25);
}

function renderReceipts() {
  dom.receiptList.innerHTML = state.gameplay.receipts
    .map(
      (receipt) => `
        <li class="receipt-item">
          <strong>${receipt.type} - ${receipt.currency}</strong>
          <p>${receipt.timestamp}</p>
          <p>${receipt.quantity} adet × ${formatCurrency(receipt.unitPrice)}</p>
          <p>Toplam: ${formatCurrency(receipt.total)}</p>
        </li>
      `
    )
    .join("");
}

function handleTransfer(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const amount = Number(data.amount);
  if (state.gameplay.balances.cash < amount) {
    return showDialog("Bakiyeniz yetersizdir!", "error");
  }
  state.gameplay.balances.cash -= amount;
  pushReceipt("Havale", { name: "Transfer", symbol: "TL" }, 1, amount);
  showDialog("Para gönderildi.", "success");
  event.target.reset();
  saveState();
  renderSummary();
}

function handleListing(event) {
  event.preventDefault();
  const { item, quantity, price } = Object.fromEntries(new FormData(event.target));
  const qty = Number(quantity);
  const unitPrice = Number(price);
  if (state.gameplay.inventory[item] < qty) {
    return showDialog("Envanterde yeterli adet yok!", "error");
  }
  state.gameplay.inventory[item] -= qty;
  state.gameplay.listings.push({
    item,
    quantity: qty,
    price: unitPrice,
    seller: state.user.username,
    category: item,
  });
  showDialog("İlan pazar yerine taşındı.", "success");
  event.target.reset();
  renderInventory();
  renderMarket();
  saveState();
}

function handleWork() {
  const earned = Math.floor(Math.random() * 3001) + 2000;
  state.gameplay.inventory.demir += earned;
  state.gameplay.balances.iron = state.gameplay.inventory.demir;
  showDialog(`${earned.toLocaleString("tr-TR")} adet demir üretildi.`, "success");
  renderSummary();
  renderInventory();
  saveState();
}

function attachEvents() {
  dialog.close.addEventListener("click", hideDialog);
  dialog.root.addEventListener("click", (event) => {
    if (event.target === dialog.root) hideDialog();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideDialog();
  });

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      authForms.forEach((form) => form.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.target).classList.add("active");
    });
  });

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target));
    const exists = state.users.some((user) => user.username === payload.username);
    if (exists) {
      return showDialog("Bu kullanıcı adı kullanımda.", "error");
    }
    const newUser = {
      ...payload,
      level: 1,
      email: "",
    };
    state.users.push(newUser);
    state.user = newUser;
    saveUsers();
    state.gameplay = defaultGameplay();
    saveState();
    finalizeLogin();
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target));
    const found = state.users.find(
      (user) => user.username === payload.username && user.password === payload.password
    );
    if (!found) {
      return showDialog("Kullanıcı adı veya şifre hatalı.", "error");
    }
    state.user = found;
    finalizeLogin();
  });

  profileButton.addEventListener("click", () => {
    renderProfile();
    togglePanel("profile-panel");
  });

  dom.profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target));
    state.user.phone = payload.phone;
    state.user.email = payload.email;
    state.users = state.users.map((user) =>
      user.username === state.user.username ? state.user : user
    );
    saveUsers();
    renderProfile();
    showDialog("Profil güncellendi.", "success");
  });

  document.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", closePanels)
  );

  document.querySelectorAll(".action-card").forEach((card) =>
    card.addEventListener("click", () => togglePanel(card.dataset.panel))
  );

  dom.currencyList.addEventListener("click", (event) => {
    const card = event.target.closest(".currency-card");
    if (!card) return;
    selectCurrency(card.dataset.currency);
  });

  dom.currencyForm.addEventListener("submit", handleTrade);
  dom.transferForm.addEventListener("submit", handleTransfer);
  dom.listingForm.addEventListener("submit", handleListing);
  dom.workButton.addEventListener("click", handleWork);
  dom.marketSearch.addEventListener("input", renderMarket);
  dom.marketFilter.addEventListener("change", renderMarket);
  dom.receiptButton.addEventListener("click", () => {
    renderReceipts();
    togglePanel("receipt-panel");
  });

  document.querySelectorAll(".bank-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".bank-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".bank-view").forEach((view) => view.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.target).classList.add("active");
    });
  });
}

function finalizeLogin() {
  state.gameplay = loadState(state.user.username);
  authOverlay.classList.add("hidden");
  appRoot.classList.remove("hidden");
  renderSummary();
  renderInventory();
  renderMarket();
  renderCurrencies();
}

function init() {
  attachEvents();
  if (state.users.length) {
    authTabs[1].click();
  }
}

init();
