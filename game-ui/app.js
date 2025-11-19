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
  inventoryCapacity: document.getElementById("inventory-capacity"),
  marketList: document.getElementById("market-list"),
  marketSearch: document.getElementById("market-search"),
  marketFilter: document.getElementById("market-filter"),
  marketSort: document.getElementById("market-sort"),
  currencyList: document.getElementById("currency-list"),
  transferForm: document.getElementById("transfer-form"),
  receiptPanel: document.getElementById("receipt-panel"),
  receiptList: document.getElementById("receipt-list"),
  chatMessages: document.getElementById("chat-messages"),
  chatForm: document.getElementById("chat-form"),
  chatInput: document.getElementById("chat-input"),
  accountHistory: document.getElementById("account-history"),
  earnButton: document.getElementById("earn-button"),
};

const INVENTORY_CAPACITY = 100;
const PAPER_COOLDOWN = 10 * 1000;
const GAMEPLAY_STORAGE = "ticarion-gameplay";
const MARKET_STORAGE = "ticarion-market";
const CHAT_STORAGE = "ticarion-chat";
const VOLUME_STORAGE = "ticarion-volume";

const inventoryCatalog = {
  demir: { label: "Demir", icon: "⛏️" },
  kagit: { label: "Kağıt", icon: "📄" },
};

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
  ui: { selectedCurrency: null },
};

let volumeState = loadVolumeState();
let paperInterval = null;
ensureVolumeDefaults();

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

function loadVolumeState() {
  try {
    return JSON.parse(localStorage.getItem(VOLUME_STORAGE)) || {};
  } catch (error) {
    return {};
  }
}

function saveVolumeState() {
  localStorage.setItem(VOLUME_STORAGE, JSON.stringify(volumeState));
}

function ensureVolumeDefaults() {
  defaultCurrencies.forEach((currency) => {
    if (typeof volumeState[currency.id] !== "number") {
      volumeState[currency.id] = 0;
    }
  });
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
      kagit: 0,
    },
    listings: [],
    currencyReceipts: [],
    accountHistory: [],
    factoryCooldowns: { kagit: 0 },
  };
}

function normalizeGameplay(snapshot = {}) {
  const base = defaultGameplay();
  const merged = {
    ...base,
    ...snapshot,
    balances: { ...base.balances, ...(snapshot.balances || {}) },
    currencies: { ...base.currencies, ...(snapshot.currencies || {}) },
    inventory: { ...base.inventory, ...(snapshot.inventory || {}) },
  };
  merged.currencyReceipts =
    snapshot.currencyReceipts || snapshot.receipts || base.currencyReceipts;
  merged.accountHistory = snapshot.accountHistory || base.accountHistory;
  merged.factoryCooldowns = {
    ...base.factoryCooldowns,
    ...(snapshot.factoryCooldowns || {}),
  };
  Object.keys(inventoryCatalog).forEach((key) => {
    merged.inventory[key] = Number(merged.inventory[key]) || 0;
  });
  delete merged.inventory.tohum;
  delete merged.inventory.makine;
  return merged;
}

function getInventoryUnits(target = state.gameplay) {
  return Object.keys(inventoryCatalog).reduce((total, key) => {
    return total + (Number(target.inventory?.[key]) || 0);
  }, 0);
}

function syncIronBalance() {
  const ironTotal = Number(state.gameplay.inventory?.demir) || 0;
  state.gameplay.balances.iron = ironTotal;
  return ironTotal;
}

function addToInventory(item, qty) {
  const amount = Number(qty);
  if (!inventoryCatalog[item] || !amount || amount <= 0) return false;
  const nextUnits = getInventoryUnits() + amount;
  if (Math.ceil(nextUnits / 1000) > INVENTORY_CAPACITY) {
    showDialog("Envanter kapasitesi dolu.", "error");
    return false;
  }
  state.gameplay.inventory[item] =
    (Number(state.gameplay.inventory[item]) || 0) + amount;
  syncIronBalance();
  return true;
}

function removeFromInventory(item, qty) {
  const amount = Number(qty);
  if (!inventoryCatalog[item] || !amount || amount <= 0) return false;
  if ((Number(state.gameplay.inventory[item]) || 0) < amount) {
    return false;
  }
  state.gameplay.inventory[item] -= amount;
  syncIronBalance();
  return true;
}

function appendAccountHistory(target, direction, amount, counterparty) {
  target.accountHistory = target.accountHistory || [];
  target.accountHistory.unshift({
    direction,
    amount,
    counterparty,
    timestamp: getIstanbulDate().toLocaleString("tr-TR"),
  });
  target.accountHistory = target.accountHistory.slice(0, 50);
}

function recordAccountHistory(direction, amount, counterparty) {
  appendAccountHistory(state.gameplay, direction, amount, counterparty);
  renderAccountHistory();
}

function loadState(username) {
  try {
    const storage = loadGameplayStorage();
    return normalizeGameplay(storage[username] || defaultGameplay());
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
  const filtered = state.market.filter((listing) => inventoryCatalog[listing.item]);
  if (filtered.length !== state.market.length) {
    state.market = filtered;
    mutated = true;
  }
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
    if (panelId === "factory-panel") {
      renderFactoryState();
    }
    if (panelId === "market-panel") {
      renderMarket();
    }
    if (panelId === "inventory-panel") {
      renderInventory();
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
  const ironTotal = syncIronBalance();
  dom.ironBalance.textContent = ironTotal.toLocaleString("tr-TR");
  renderAccountHistory();
}

function renderProfile() {
  dom.profileUsername.textContent = state.user.username;
  dom.profileLevel.textContent = `Seviye ${state.user.level ?? 1}`;
  dom.profileIdentity.textContent = state.user.identity;
  dom.profileForm.phone.value = state.user.phone;
  dom.profileForm.email.value = state.user.email || "";
}

function renderInventory() {
  const total = getInventoryUnits();
  const load = Math.ceil(total / 1000);
  if (dom.inventoryCapacity) {
    dom.inventoryCapacity.textContent = `${load}/${INVENTORY_CAPACITY}`;
  }
  dom.inventoryList.innerHTML = Object.entries(inventoryCatalog)
    .map(([key, meta]) => {
      const amount = Number(state.gameplay.inventory[key]) || 0;
      return `
        <article class="inventory-card ${amount ? "" : "is-empty"}" data-item="${key}">
          <div class="inventory-header">
            <div class="inventory-icon">${meta.icon}</div>
            <div class="inventory-info">
              <h4>${meta.label}</h4>
              <p>${amount.toLocaleString("tr-TR")} adet</p>
            </div>
          </div>
          <button class="btn-positive btn-compact" data-toggle-sell ${
            amount ? "" : "disabled"
          }>Pazarda Sat</button>
          <form class="sell-form hidden" data-item="${key}">
            <label>Adet
              <input name="quantity" type="number" min="1" max="${Math.max(
                amount,
                1
              )}" required />
            </label>
            <label>Toplam Fiyat (₺)
              <input name="price" type="number" min="1" required />
            </label>
            <div class="form-actions">
              <button type="submit" class="btn-positive btn-compact">Satışa Koy</button>
              <button type="button" class="btn-negative btn-compact" data-cancel-sell>Vazgeç</button>
            </div>
          </form>
        </article>
      `;
    })
    .join("");
}

function renderMarket() {
  if (!dom.marketList) return;
  const query = (dom.marketSearch.value || "").toLowerCase();
  const filter = dom.marketFilter.value;
  const sort = dom.marketSort?.value || "new";
  let listings = [...(state.market || [])];
  if (sort === "cheap") {
    listings.sort((a, b) => (a.unitPrice ?? a.price) - (b.unitPrice ?? b.price));
  } else if (sort === "expensive") {
    listings.sort((a, b) => (b.unitPrice ?? b.price) - (a.unitPrice ?? a.price));
  } else {
    listings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  const cards = listings
    .filter((listing) => (filter === "all" ? true : listing.category === filter))
    .filter((listing) =>
      formatItem(listing.item).toLowerCase().includes(query)
    )
    .map((listing) => {
      const owned = state.user && listing.seller === state.user.username;
      const unit = listing.unitPrice ?? listing.price;
      const total = listing.totalPrice ?? unit * listing.quantity;
      const icon = inventoryCatalog[listing.item]?.icon || "🎁";
      return `
        <article class="market-card" data-listing="${listing.id}">
          ${owned ? '<span class="badge">Senin</span>' : ""}
          <div class="market-icon">${icon}</div>
          <h4>${formatItem(listing.item)}</h4>
          <p>Satıcı: ${listing.seller}</p>
          <p>Adet: ${listing.quantity.toLocaleString("tr-TR")}</p>
          <strong>${formatCurrency(unit)}</strong>
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

  dom.marketList.innerHTML =
    cards || `<p class="empty-state">Henüz ilan yok.</p>`;
}

function renderCurrencies() {
  dom.currencyList.innerHTML = defaultCurrencies
    .map((currency) => {
      const holdings = state.gameplay.currencies[currency.id]?.holdings || 0;
      const change = calculateChange(currency);
      const usedVolume = volumeState[currency.id] || 0;
      const ratio = `${currency.volume.toLocaleString("tr-TR")}/${usedVolume.toLocaleString(
        "tr-TR"
      )}`;
      const remaining = Math.max(0, currency.volume - usedVolume).toLocaleString(
        "tr-TR"
      );
      const active = state.ui.selectedCurrency === currency.id;
      return `
        <article class="currency-card ${active ? "active" : ""}" data-currency="${currency.id}">
          <div>
            <h4>${currency.name}</h4>
            <small>${currency.symbol}</small>
          </div>
          <strong>${formatCurrency(currency.currentPrice)}</strong>
          <p class="price-change ${change >= 0 ? "positive" : "negative"}">
            ${change >= 0 ? "+" : ""}${change.toFixed(2)}%
          </p>
          <p class="currency-volume">Hacim: ${ratio}<small>Kalan: ${remaining}</small></p>
          <p>Bakiye: ${holdings.toLocaleString("tr-TR")} adet</p>
          ${active ? renderTradeForm(currency) : ""}
        </article>
      `;
    })
    .join("");
}

function renderTradeForm(currency) {
  return `
    <form class="trade-form" data-selected="${currency.id}">
      <label>Adet Giriniz
        <input name="amount" type="number" min="1" required />
      </label>
      <label>İşlem Seçiniz
        <select name="action" required>
          <option value="">Seçiniz</option>
          <option value="buy">Alış Yap</option>
          <option value="sell">Satış Yap</option>
        </select>
      </label>
      <p>Güncel Fiyat: <strong>${formatCurrency(currency.currentPrice)}</strong></p>
      <div class="trade-actions">
        <button type="submit" class="btn-positive">İşlem Yap</button>
        <button type="button" class="btn-ghost receipt-button receipt-trigger">Dekont</button>
      </div>
    </form>
  `;
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
  return inventoryCatalog[key]?.label || key;
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
  const form = event.target.closest(".trade-form");
  if (!form) return;
  event.preventDefault();
  const { amount, action } = Object.fromEntries(new FormData(form));
  const currencyId = form.dataset.selected;
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
  const usedVolume = volumeState[currencyId] || 0;

  if (action === "buy") {
    if (state.gameplay.balances.cash < price) {
      return showDialog("Bakiyeniz yetersizdir!", "error");
    }
    if (usedVolume + qty > currency.volume) {
      return showDialog("Hacim limitine ulaşıldı.", "error");
    }
    state.gameplay.balances.cash -= price;
    state.gameplay.currencies[currencyId].holdings = holdings + qty;
    volumeState[currencyId] = usedVolume + qty;
    saveVolumeState();
    pushCurrencyReceipt("Alış", currency, qty, currency.currentPrice);
    showDialog("İşlem yapıldı.", "success");
  } else if (action === "sell") {
    if (holdings < qty) {
      return showDialog("Yeterli adet yok!", "error");
    }
    state.gameplay.balances.cash += price;
    state.gameplay.currencies[currencyId].holdings = holdings - qty;
    volumeState[currencyId] = Math.max(0, usedVolume - qty);
    saveVolumeState();
    pushCurrencyReceipt("Satış", currency, qty, currency.currentPrice);
    showDialog("İşlem yapıldı.", "success");
  } else {
    return showDialog("İşlem seçiniz.", "error");
  }

  form.reset();
  saveState();
  renderSummary();
  renderCurrencies();
}

function handleCurrencyListClick(event) {
  if (event.target.closest(".receipt-button")) {
    renderReceipts();
    togglePanel("receipt-panel");
    return;
  }
  if (event.target.closest(".trade-form")) {
    return;
  }
  const card = event.target.closest(".currency-card");
  if (!card) return;
  const currencyId = card.dataset.currency;
  state.ui.selectedCurrency =
    state.ui.selectedCurrency === currencyId ? null : currencyId;
  renderCurrencies();
}

function pushCurrencyReceipt(type, currency, quantity, unitPrice) {
  const now = getIstanbulDate();
  state.gameplay.currencyReceipts.unshift({
    type,
    currency: currency.name,
    symbol: currency.symbol,
    quantity,
    unitPrice,
    total: quantity * unitPrice,
    timestamp: now.toLocaleString("tr-TR"),
  });
  state.gameplay.currencyReceipts = state.gameplay.currencyReceipts.slice(0, 25);
}

function renderReceipts() {
  const entries = state.gameplay.currencyReceipts || [];
  if (!entries.length) {
    dom.receiptList.innerHTML = '<li class="empty-state">Henüz işlem yok.</li>';
    return;
  }
  dom.receiptList.innerHTML = entries
    .map((receipt) => {
      const variant = receipt.type === "Alış" ? "negative" : "positive";
      return `
        <li class="receipt-item ${variant}">
          <strong>${receipt.type} - ${receipt.currency}</strong>
          <p>${receipt.timestamp}</p>
          <p>${receipt.quantity} adet × ${formatCurrency(receipt.unitPrice)}</p>
          <p>Toplam: ${formatCurrency(receipt.total)}</p>
        </li>
      `;
    })
    .join("");
}

function renderAccountHistory() {
  if (!dom.accountHistory) return;
  const entries = state.gameplay.accountHistory || [];
  if (!entries.length) {
    dom.accountHistory.innerHTML = '<li class="empty-state">Henüz hareket yok.</li>';
    return;
  }
  dom.accountHistory.innerHTML = entries
    .map((entry) => {
      const positive = entry.direction === "incoming";
      const sign = positive ? "+" : "-";
      return `
        <li class="history-item ${positive ? "positive" : "negative"}">
          <div>
            <strong>${sign}${formatCurrency(entry.amount)}</strong>
            <span>${entry.counterparty}</span>
          </div>
          <span>${entry.timestamp}</span>
        </li>
      `;
    })
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
  recordAccountHistory("outgoing", amount, recipient.username);
  const storage = loadGameplayStorage();
  const recipientState = storage[recipient.username] || defaultGameplay();
  recipientState.balances = recipientState.balances || { cash: 0, iron: 0 };
  recipientState.balances.cash += amount;
  appendAccountHistory(recipientState, "incoming", amount, state.user.username);
  storage[recipient.username] = recipientState;
  storage[state.user.username] = state.gameplay;
  persistGameplayStorage(storage);
  showDialog("Para gönderildi.", "success");
  event.target.reset();
  saveState();
  renderSummary();
}

function handleListing(event) {
  const form = event.target.closest(".sell-form");
  if (!form) return;
  event.preventDefault();
  const item = form.dataset.item;
  const { quantity, price } = Object.fromEntries(new FormData(form));
  const qty = Number(quantity);
  const totalPrice = Number(price);
  if (!qty || !totalPrice) {
    return showDialog("Geçerli adet ve toplam fiyat giriniz.", "error");
  }
  if (!removeFromInventory(item, qty)) {
    return showDialog("Envanterde yeterli adet yok!", "error");
  }
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
  form.reset();
  form.classList.add("hidden");
  renderInventory();
  renderSummary();
  renderMarket();
  saveState();
  saveMarketListings();
}

function handleInventoryClick(event) {
  const card = event.target.closest(".inventory-card");
  if (!card) return;
  if (event.target.matches("[data-toggle-sell]")) {
    const form = card.querySelector(".sell-form");
    form.classList.toggle("hidden");
  }
  if (event.target.matches("[data-cancel-sell]")) {
    const form = event.target.closest(".sell-form");
    form.classList.add("hidden");
  }
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
  if (!addToInventory(listing.item, qty)) {
    return;
  }
  state.gameplay.balances.cash -= total;
  listing.quantity -= qty;
  listing.totalPrice = Math.max(0, (listing.totalPrice || 0) - total);
  listing.unitPrice = unitPrice;
  listing.price = unitPrice;
  const storage = loadGameplayStorage();
  const sellerGameplay = storage[listing.seller] || defaultGameplay();
  sellerGameplay.balances = sellerGameplay.balances || { cash: 0, iron: 0 };
  sellerGameplay.balances.cash += total;
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

function handleFactoryWork(event) {
  const button = event.target.closest(".factory-work");
  if (!button) return;
  state.gameplay.factoryCooldowns = state.gameplay.factoryCooldowns || { kagit: 0 };
  const resource = button.dataset.resource;
  const earned = Math.floor(Math.random() * 3001) + 2000;
  if (resource === "kagit") {
    const remaining = paperCooldownRemaining();
    if (remaining > 0) {
      return showDialog(
        `Kağıt fabrikası için ${Math.ceil(remaining / 1000)} sn bekleyin.`,
        "error"
      );
    }
    if (!addToInventory("kagit", earned)) {
      return;
    }
    state.gameplay.factoryCooldowns.kagit = Date.now() + PAPER_COOLDOWN;
    startPaperWatcher();
    showDialog(`${earned.toLocaleString("tr-TR")} adet kağıt üretildi.`, "success");
  } else {
    if (!addToInventory("demir", earned)) {
      return;
    }
    showDialog(`${earned.toLocaleString("tr-TR")} adet demir üretildi.`, "success");
  }
  renderSummary();
  renderInventory();
  renderFactoryState();
  saveState();
}

function paperCooldownRemaining() {
  return Math.max(0, (state.gameplay.factoryCooldowns?.kagit || 0) - Date.now());
}

function startPaperWatcher() {
  stopPaperWatcher();
  paperInterval = setInterval(() => {
    if (paperCooldownRemaining() <= 0) {
      stopPaperWatcher();
      renderFactoryState();
      return;
    }
    renderFactoryState();
  }, 1000);
}

function renderFactoryState() {
  document.querySelectorAll(".factory-work").forEach((button) => {
    const resource = button.dataset.resource;
    if (resource === "kagit") {
      const remaining = paperCooldownRemaining();
      if (remaining > 0) {
        button.disabled = true;
        button.classList.remove("btn-positive");
        button.classList.add("btn-negative");
        button.textContent = `${Math.ceil(remaining / 1000)} sn`;
      } else {
        button.disabled = false;
        button.classList.add("btn-positive");
        button.classList.remove("btn-negative");
        button.textContent = "Çalış";
      }
    } else {
      button.disabled = false;
      button.classList.add("btn-positive");
      button.classList.remove("btn-negative");
      button.textContent = "Çalış";
    }
  });
  if (paperCooldownRemaining() > 0 && !paperInterval) {
    startPaperWatcher();
  }
}

function stopPaperWatcher() {
  if (paperInterval) {
    clearInterval(paperInterval);
    paperInterval = null;
  }
}

function handleEarnMoney() {
  state.gameplay.balances.cash += 100000;
  showDialog("100.000 ₺ kazandın.", "success");
  renderSummary();
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

  dom.currencyList.addEventListener("click", handleCurrencyListClick);
  dom.currencyList.addEventListener("submit", handleTrade);
  dom.transferForm.addEventListener("submit", handleTransfer);
  dom.inventoryList.addEventListener("click", handleInventoryClick);
  dom.inventoryList.addEventListener("submit", handleListing);
  dom.marketList.addEventListener("submit", handleMarketPurchase);
  dom.chatForm.addEventListener("submit", handleChatSubmit);
  dom.marketSearch.addEventListener("input", renderMarket);
  dom.marketFilter.addEventListener("change", renderMarket);
  dom.marketSort?.addEventListener("change", renderMarket);
  dom.earnButton?.addEventListener("click", handleEarnMoney);

  document.querySelectorAll(".bank-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".bank-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".bank-view").forEach((view) => view.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.target).classList.add("active");
    });
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".factory-work");
    if (button) {
      handleFactoryWork(event);
    }
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
  state.ui.selectedCurrency = null;
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
  stopPaperWatcher();
  renderFactoryState();
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
    if (event.key === VOLUME_STORAGE) {
      volumeState = loadVolumeState();
      renderCurrencies();
    }
  });
  if (state.users.length) {
    authTabs[1].click();
  }
}

init();
