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
  clock: document.getElementById("istanbul-clock"),
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
  chatMessages: document.getElementById("chat-messages"),
  chatForm: document.getElementById("chat-form"),
  chatInput: document.getElementById("chat-input"),
};

const GAMEPLAY_STORAGE = "ticarion-gameplay";
const MARKET_STORAGE = "ticarion-market";
const CHAT_STORAGE = "ticarion-chat";

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
  market: loadMarketListings(),
  chat: loadChatMessages(),
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

function loadMarketListings() {
  try {
    return JSON.parse(localStorage.getItem(MARKET_STORAGE)) || [];
  } catch (error) {
    return [];
  }
}

function saveMarketListings() {
  localStorage.setItem(MARKET_STORAGE, JSON.stringify(state.market));
}

function loadChatMessages() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_STORAGE)) || [];
  } catch (error) {
    return [];
  }
}

function saveChatMessages() {
  localStorage.setItem(CHAT_STORAGE, JSON.stringify(state.chat));
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
    const storage = loadGameplayStorage();
    return storage[username] || defaultGameplay();
  } catch (error) {
    return defaultGameplay();
  }
}

function saveState() {
  if (!state.user) return;
  const payload = loadGameplayStorage();
  payload[state.user.username] = state.gameplay;
  persistGameplayStorage(payload);
}

function loadGameplayStorage() {
  try {
    return JSON.parse(localStorage.getItem(GAMEPLAY_STORAGE)) || {};
  } catch (error) {
    return {};
  }
}

function persistGameplayStorage(payload) {
  localStorage.setItem(GAMEPLAY_STORAGE, JSON.stringify(payload));
}

function generateIdentity() {
  const existing = new Set(state.users.map((user) => user.identity).filter(Boolean));
  let identity = "";
  do {
    identity = String(Math.floor(10000000000 + Math.random() * 90000000000));
  } while (existing.has(identity));
  return identity;
}

function createListingId() {
  return `listing-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function normalizeMarketListings() {
  let mutated = false;
  state.market = (state.market || []).map((listing) => {
    let next = { ...listing };
    if (!next.id) {
      next.id = createListingId();
      mutated = true;
    }
    if (typeof next.totalPrice !== "number") {
      const unit = next.price || next.unitPrice || 0;
      next.totalPrice = unit * (next.quantity || 1);
      mutated = true;
    }
    if (typeof next.unitPrice !== "number" || Number.isNaN(next.unitPrice)) {
      const qty = next.quantity || 1;
      next.unitPrice = (next.totalPrice || 0) / qty;
      mutated = true;
    }
    return next;
  });
  if (mutated) {
    saveMarketListings();
  }
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
    if (panelId === "chat-panel") {
      renderChat();
    }
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
  const ironTotal =
    state.gameplay.inventory?.demir ?? state.gameplay.balances.iron ?? 0;
  state.gameplay.balances.iron = ironTotal;
  dom.ironBalance.textContent = ironTotal.toLocaleString("tr-TR");
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
  const listings = [...(state.market || [])].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );
  const cards = listings
    .filter((listing) => (filter === "all" ? true : listing.category === filter))
    .filter((listing) => listing.item.toLowerCase().includes(query))
    .map((listing) => {
      const owned = state.user && listing.seller === state.user.username;
      const unit = listing.unitPrice ?? listing.price;
      const total = listing.totalPrice ?? unit * listing.quantity;
      return `
        <article class="market-card" data-listing="${listing.id}">
          ${owned ? '<span class="badge">Senin</span>' : ""}
          <h4>${formatItem(listing.item)}</h4>
          <p>Satıcı: ${listing.seller}</p>
          <p>Adet: ${listing.quantity.toLocaleString("tr-TR")}</p>
          <p>Birim: ${formatCurrency(unit)}</p>
          <p>Toplam: ${formatCurrency(total)}</p>
          ${
            owned
              ? '<small class="muted">İlanın diğer oyunculara açıktır.</small>'
              : `
                  <form class="purchase-form" data-id="${listing.id}">
                    <input type="number" name="quantity" min="1" max="${listing.quantity}" value="1" required />
                    <button type="submit" class="btn-positive">Satın Al</button>
                  </form>
                `
          }
        </article>
      `;
    })
    .join("");

  dom.marketList.innerHTML = cards || `<p class="empty-state">Henüz ilan yok.</p>`;
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

function escapeHtml(value = "") {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (char) => map[char] || char);
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

function getIstanbulDate() {
  const now = new Date();
  return new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" })
  );
}

function updateClock() {
  if (!dom.clock) return;
  const now = getIstanbulDate();
  dom.clock.textContent = now.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function tradingWindowOpen() {
  const now = getIstanbulDate();
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
  const now = getIstanbulDate();
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

function renderChat() {
  if (!dom.chatMessages) return;
  state.chat = loadChatMessages();
  if (!state.chat.length) {
    dom.chatMessages.innerHTML = '<p class="empty-state">Henüz mesaj yok.</p>';
    return;
  }
  const formatter = new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Istanbul",
  });
  dom.chatMessages.innerHTML = state.chat
    .slice(-100)
    .map((message) => {
      const stamp = message.timestamp
        ? formatter.format(new Date(message.timestamp))
        : "";
      const username = escapeHtml(message.username);
      const text = escapeHtml(message.message);
      return `
        <article class="chat-message">
          <div class="chat-header">
            <span class="chat-username">${username}</span>
            <span class="chat-level">Seviye ${message.level || 1}</span>
          </div>
          <p class="chat-text">${text}</p>
          <small class="chat-timestamp">${stamp}</small>
        </article>
      `;
    })
    .join("");
  dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

function handleTransfer(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const amount = Number(data.amount);
  if (!amount || amount <= 0) {
    return showDialog("Geçerli bir tutar giriniz.", "error");
  }
  if (!/^\d{11}$/.test(data.identity || "")) {
    return showDialog("Alıcı TC 11 haneli olmalıdır.", "error");
  }
  const recipient = state.users.find(
    (user) => user.username === data.username && user.identity === data.identity
  );
  if (!recipient) {
    return showDialog("Alıcı bilgileri eşleşmiyor.", "error");
  }
  if (state.gameplay.balances.cash < amount) {
    return showDialog("Bakiyeniz yetersizdir!", "error");
  }
  if (recipient.username === state.user.username) {
    return showDialog("Kendine havale gönderemezsin.", "error");
  }
  state.gameplay.balances.cash -= amount;
  pushReceipt(
    `Havale (${recipient.username})`,
    { name: "Transfer", symbol: "TL" },
    1,
    amount
  );
  const storage = loadGameplayStorage();
  const recipientState = storage[recipient.username] || defaultGameplay();
  recipientState.balances = recipientState.balances || { cash: 0, iron: 0 };
  recipientState.balances.cash += amount;
  recipientState.receipts = recipientState.receipts || [];
  recipientState.receipts.unshift({
    type: `Havale Giriş (${state.user.username})`,
    currency: "Transfer",
    symbol: "TL",
    quantity: 1,
    unitPrice: amount,
    total: amount,
    timestamp: getIstanbulDate().toLocaleString("tr-TR"),
  });
  storage[recipient.username] = recipientState;
  storage[state.user.username] = state.gameplay;
  persistGameplayStorage(storage);
  showDialog("Para gönderildi.", "success");
  event.target.reset();
  saveState();
  renderSummary();
}

function handleListing(event) {
  event.preventDefault();
  const { item, quantity, price } = Object.fromEntries(new FormData(event.target));
  const qty = Number(quantity);
  const totalPrice = Number(price);
  if (!qty || !totalPrice) {
    return showDialog("Geçerli adet ve toplam fiyat giriniz.", "error");
  }
  if (state.gameplay.inventory[item] < qty) {
    return showDialog("Envanterde yeterli adet yok!", "error");
  }
  state.gameplay.inventory[item] -= qty;
  const unitPrice = totalPrice / qty;
  const listing = {
    id: createListingId(),
    item,
    quantity: qty,
    price: unitPrice,
    unitPrice,
    totalPrice,
    seller: state.user.username,
    category: item,
    createdAt: Date.now(),
  };
  state.gameplay.listings.push(listing);
  state.market.unshift(listing);
  showDialog("İlan pazar yerine taşındı.", "success");
  event.target.reset();
  renderInventory();
  state.gameplay.balances.iron = state.gameplay.inventory.demir;
  renderSummary();
  renderMarket();
  saveState();
  saveMarketListings();
}

function handleMarketPurchase(event) {
  const form = event.target.closest(".purchase-form");
  if (!form) return;
  event.preventDefault();
  if (!state.user) return;
  const listingId = form.dataset.id;
  const listing = state.market.find((entry) => entry.id === listingId);
  if (!listing) {
    return showDialog("İlan bulunamadı.", "error");
  }
  if (listing.seller === state.user.username) {
    return showDialog("Kendi ilanını satın alamazsın.", "error");
  }
  const qty = Number(new FormData(form).get("quantity"));
  if (!qty || qty < 1) {
    return showDialog("Geçerli bir adet gir.", "error");
  }
  if (qty > listing.quantity) {
    return showDialog("Bu kadar stok yok.", "error");
  }
  const unitPrice = listing.unitPrice ?? listing.price;
  const total = qty * unitPrice;
  if (state.gameplay.balances.cash < total) {
    return showDialog("Bakiyeniz yetersizdir!", "error");
  }
  if (!state.gameplay.inventory[listing.item]) {
    state.gameplay.inventory[listing.item] = 0;
  }
  state.gameplay.inventory[listing.item] += qty;
  state.gameplay.balances.cash -= total;
  if (listing.item === "demir") {
    state.gameplay.balances.iron = state.gameplay.inventory.demir;
  }
  listing.quantity -= qty;
  listing.totalPrice = Math.max(0, (listing.totalPrice || 0) - total);
  listing.unitPrice = unitPrice;
  listing.price = unitPrice;
  pushReceipt(
    "Pazar Alış",
    { name: formatItem(listing.item), symbol: "Pazar" },
    qty,
    unitPrice
  );
  const storage = loadGameplayStorage();
  const sellerGameplay = storage[listing.seller] || defaultGameplay();
  sellerGameplay.balances = sellerGameplay.balances || { cash: 0, iron: 0 };
  sellerGameplay.balances.cash += total;
  sellerGameplay.receipts = sellerGameplay.receipts || [];
  sellerGameplay.receipts.unshift({
    type: "Pazar Satış",
    currency: formatItem(listing.item),
    symbol: "Pazar",
    quantity: qty,
    unitPrice,
    total,
    timestamp: getIstanbulDate().toLocaleString("tr-TR"),
  });
  storage[listing.seller] = sellerGameplay;
  if (listing.quantity <= 0) {
    state.market = state.market.filter((entry) => entry.id !== listingId);
  }
  showDialog("Satın alma tamamlandı.", "success");
  renderSummary();
  renderInventory();
  renderMarket();
  saveState();
  storage[state.user.username] = state.gameplay;
  persistGameplayStorage(storage);
  saveMarketListings();
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

function handleChatSubmit(event) {
  event.preventDefault();
  if (!state.user) {
    return showDialog("Sohbet için giriş yapmalısın.", "error");
  }
  const formData = new FormData(event.target);
  const message = (formData.get("message") || "").toString().trim();
  if (!message) return;
  const entry = {
    id: `msg-${Date.now()}`,
    username: state.user.username,
    level: state.user.level || 1,
    message,
    timestamp: getIstanbulDate().toISOString(),
  };
  state.chat.push(entry);
  state.chat = state.chat.slice(-200);
  saveChatMessages();
  event.target.reset();
  renderChat();
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
      identity: generateIdentity(),
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
  dom.marketList.addEventListener("submit", handleMarketPurchase);
  dom.workButton.addEventListener("click", handleWork);
  dom.chatForm.addEventListener("submit", handleChatSubmit);
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
  if (!state.user.identity) {
    state.user.identity = generateIdentity();
    state.users = state.users.map((user) =>
      user.username === state.user.username ? state.user : user
    );
    saveUsers();
  }
  state.gameplay = loadState(state.user.username);
  state.market = loadMarketListings();
  normalizeMarketListings();
  authOverlay.classList.add("hidden");
  appRoot.classList.remove("hidden");
  renderSummary();
  renderInventory();
  renderMarket();
  renderCurrencies();
  renderChat();
}

function init() {
  attachEvents();
  updateClock();
  setInterval(updateClock, 1000);
  window.addEventListener("storage", (event) => {
    if (event.key === CHAT_STORAGE) {
      renderChat();
    }
    if (event.key === MARKET_STORAGE) {
      state.market = loadMarketListings();
      normalizeMarketListings();
      renderMarket();
    }
  });
  if (state.users.length) {
    authTabs[1].click();
  }
}

init();
