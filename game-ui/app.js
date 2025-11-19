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
  clock: document.getElementById("istanbul-clock"),
  profileUsername: document.getElementById("profile-username"),
  profileLevel: document.getElementById("profile-level"),
  profileIdentity: document.getElementById("profile-identity"),
  profileMotto: document.getElementById("profile-motto"),
  profilePanel: document.getElementById("profile-panel"),
  profileForm: document.getElementById("profile-form"),
  inventoryList: document.getElementById("inventory-list"),
  marketList: document.getElementById("market-list"),
  marketSearch: document.getElementById("market-search"),
  marketFilter: document.getElementById("market-filter"),
  currencyList: document.getElementById("currency-list"),
  selectedCurrency: document.getElementById("selected-currency"),
  selectedPrice: document.getElementById("selected-price"),
  currencyForm: document.getElementById("currency-form"),
  transferForm: document.getElementById("transfer-form"),
  receiptButton: document.getElementById("receipt-button"),
  receiptPanel: document.getElementById("receipt-panel"),
  receiptList: document.getElementById("receipt-list"),
  accountHistory: document.getElementById("account-history"),
  bankWorkButton: document.getElementById("bank-work-button"),
  chatMessages: document.getElementById("chat-messages"),
  chatForm: document.getElementById("chat-form"),
  chatInput: document.getElementById("chat-input"),
  peekPanel: document.getElementById("peek-panel"),
  peekUsername: document.getElementById("peek-username"),
  peekLevel: document.getElementById("peek-level"),
  peekIdentity: document.getElementById("peek-identity"),
  peekMotto: document.getElementById("peek-motto"),
};

dom.factoryButtons = document.querySelectorAll("[data-factory]");

const defaultUserShape = {
  level: 1,
  email: "",
  phone: "",
  motto: "",
};

const GAMEPLAY_STORAGE = "ticarion-gameplay";
const MARKET_STORAGE = "ticarion-market";
const CHAT_STORAGE = "ticarion-chat";

function normalizeUser(user = {}) {
  return { ...defaultUserShape, ...user };
}

const defaultCurrencies = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    currentPrice: 487000,
    previousClose: 495000,
    volume: 100000,
    icon: "₿",
    accent: "bitcoin",
  },
  {
    id: "tcoin",
    name: "Tcoin",
    symbol: "TCO",
    currentPrice: 210,
    previousClose: 200,
    volume: 100000,
    icon: "Ⓣ",
    accent: "tcoin",
  },
  {
    id: "gold",
    name: "Altın",
    symbol: "ALT",
    currentPrice: 10000,
    previousClose: 9000,
    volume: 100000,
    icon: "🥇",
    accent: "gold",
  },
  {
    id: "silver",
    name: "Gümüş",
    symbol: "GMŞ",
    currentPrice: 700,
    previousClose: 750,
    volume: 100000,
    icon: "🥈",
    accent: "silver",
  },
];

const state = {
  user: null,
  users: loadUsers(),
  gameplay: defaultGameplay(),
  market: loadMarketListings(),
  chat: loadChatMessages(),
};

const inventoryVisuals = {
  demir: { icon: "⛓️", label: "Demir", accent: "iron" },
  kagit: { icon: "📄", label: "Kağıt", accent: "paper" },
};

function loadUsers() {
  try {
    const payload = JSON.parse(localStorage.getItem("ticarion-users")) || [];
    return payload.map((user) => normalizeUser(user));
  } catch (error) {
    return [];
  }
}

function saveUsers() {
  const normalized = state.users.map((user) => normalizeUser(user));
  localStorage.setItem("ticarion-users", JSON.stringify(normalized));
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
      kagit: 0,
    },
    listings: [],
    receipts: [],
    transactions: [],
    factoryCooldowns: {},
  };
}

function loadState(username) {
  try {
    const storage = loadGameplayStorage();
    return ensureGameplayShape(storage[username]);
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

function ensureGameplayShape(payload = {}) {
  const base = defaultGameplay();
  const merged = {
    ...base,
    ...payload,
    balances: { ...base.balances, ...(payload.balances || {}) },
    inventory: { ...base.inventory, ...(payload.inventory || {}) },
    listings: payload.listings || [],
    receipts: payload.receipts || [],
    transactions: payload.transactions || [],
    factoryCooldowns: payload.factoryCooldowns || {},
  };

  merged.currencies = defaultCurrencies.reduce((acc, currency) => {
    acc[currency.id] = {
      holdings: payload.currencies?.[currency.id]?.holdings || 0,
    };
    return acc;
  }, {});

  return merged;
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
    if (typeof next.quantity !== "number") {
      next.quantity = Number(next.quantity) || 0;
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
  state.gameplay.balances.iron =
    state.gameplay.inventory?.demir ?? state.gameplay.balances.iron ?? 0;
  renderAccountHistory();
  renderFactories();
}

function renderProfile() {
  dom.profileUsername.textContent = state.user.username;
  dom.profileLevel.textContent = `Seviye ${state.user.level ?? 1}`;
  dom.profileIdentity.textContent = state.user.identity;
  dom.profileMotto.textContent =
    state.user.motto?.trim() || "Henüz motto eklenmedi.";
  dom.profileForm.phone.value = state.user.phone || "";
  dom.profileForm.email.value = state.user.email || "";
  dom.profileForm.motto.value = state.user.motto || "";
}

function renderInventory() {
  if (!dom.inventoryList) return;
  const allKeys = Array.from(
    new Set([
      ...Object.keys(inventoryVisuals),
      ...Object.keys(state.gameplay.inventory || {}),
    ])
  );
  const visibleKeys = allKeys.filter((key) => !["tohum", "makine"].includes(key));
  if (!visibleKeys.length) {
    dom.inventoryList.innerHTML =
      '<p class="empty-state">Envanter boş, fabrikadan üretim yap.</p>';
    return;
  }

  dom.inventoryList.innerHTML = visibleKeys
    .map((key) => {
      const qty = Number(state.gameplay.inventory?.[key] || 0);
      const visual = getItemVisual(key);
      const label = escapeHtml(visual.label);
      const disabled = qty <= 0 ? "disabled" : "";
      return `
        <article class="inventory-card" data-item="${key}">
          <div class="inventory-thumb accent-${visual.accent || "default"}">
            <span>${visual.icon}</span>
          </div>
          <h4>${label}</h4>
          <p class="muted">Adet: <strong>${qty.toLocaleString("tr-TR")}</strong></p>
          <button type="button" class="btn-ghost toggle-sell" ${disabled}>
            Pazarda Sat
          </button>
          <form class="sell-form hidden" data-item="${key}">
            <label>Adet
              <input name="quantity" type="number" min="1" max="${qty}" ${
                disabled ? "disabled" : "required"
              } />
            </label>
            <label>Toplam Fiyat (₺)
              <input name="price" type="number" min="1" ${
                disabled ? "disabled" : "required"
              } />
            </label>
            <button type="submit" class="btn-positive">Satışa Koy</button>
          </form>
        </article>
      `;
    })
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
    .filter((listing) => {
      const itemKey = (listing.item || "").toLowerCase();
      const label = getItemVisual(listing.item).label.toLowerCase();
      return itemKey.includes(query) || label.includes(query);
    })
    .map((listing) => {
      const owned = state.user && listing.seller === state.user.username;
      const unit = listing.unitPrice ?? listing.price;
      const availableQty = Number(listing.quantity) || 0;
      const total = listing.totalPrice ?? unit * availableQty;
      const visual = getItemVisual(listing.item);
      const sellerName = escapeHtml(listing.seller || "-");
      const label = escapeHtml(visual.label);
      return `
        <article class="market-card" data-listing="${listing.id}">
          ${owned ? '<span class="badge">Senin</span>' : ""}
          <div class="market-thumb accent-${visual.accent || "default"}">
            <span>${visual.icon}</span>
          </div>
          <h4>${label}</h4>
          <p class="muted">Satıcı: ${sellerName}</p>
          <p>Adet: <strong>${availableQty.toLocaleString("tr-TR")}</strong></p>
          <p>Birim Fiyat: <strong>${formatCurrency(unit)}</strong></p>
          <p>Toplam Fiyat: <strong>${formatCurrency(total)}</strong></p>
          ${
            owned
              ? '<small class="muted">İlanın diğer oyunculara açıktır.</small>'
              : `
                  <form class="purchase-form" data-id="${listing.id}">
                    <input type="number" name="quantity" min="1" max="${availableQty}" value="1" required />
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
      const changeClass = change >= 0 ? "positive" : "negative";
      const changePrefix = change >= 0 ? "+" : "";
      return `
        <article class="currency-card" data-currency="${currency.id}" ${
          index === 0 ? "data-selected" : ""
        }>
          <header class="currency-top">
            <div class="currency-art accent-${currency.accent || currency.id}">
              <span>${currency.icon || "🪙"}</span>
            </div>
            <div class="currency-meta">
              <p class="currency-name">${currency.name}</p>
              <small>${currency.symbol} Bakiyeniz</small>
            </div>
            <div class="price-change ${changeClass}">
              ${changePrefix}${change.toFixed(2)}%
            </div>
          </header>
          <div class="currency-body">
            <p class="currency-price">${formatCurrency(currency.currentPrice)}</p>
            <p class="muted">Dünkü kapanış: ${formatCurrency(currency.previousClose)}</p>
            <p class="currency-balance">
              ${currency.name} Bakiyeniz: <strong>${holdings.toLocaleString("tr-TR")}</strong> Adet
            </p>
            <p class="currency-volume">
              Hacim: ${currency.volume.toLocaleString("tr-TR")} / ${(
                currency.volume * 5
              ).toLocaleString("tr-TR")}
            </p>
          </div>
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

function formatSignedCurrency(value) {
  const formatted = formatCurrency(Math.abs(value));
  return `${value >= 0 ? "+" : "-"}${formatted}`;
}

function formatItem(key) {
  const mapping = {
    demir: "Demir",
    kagit: "Kağıt",
    tohum: "Premium Tohum",
    makine: "Hasat Makinesi",
  };
  return mapping[key] || key || "Eşya";
}

function getItemVisual(key) {
  return inventoryVisuals[key] || { icon: "📦", label: formatItem(key) };
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
  renderFactories();
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
    pushReceipt("Alış", currency, qty, currency.currentPrice, "out");
    logTransaction(`${currency.name} Alış`, -price);
    showDialog("İşlem yapıldı.", "success");
  } else if (action === "sell") {
    if (holdings < qty) {
      return showDialog("Yeterli adet yok!", "error");
    }
    state.gameplay.balances.cash += price;
    state.gameplay.currencies[currencyId].holdings = holdings - qty;
    pushReceipt("Satış", currency, qty, currency.currentPrice, "in");
    logTransaction(`${currency.name} Satış`, price);
    showDialog("İşlem yapıldı.", "success");
  } else {
    return showDialog("İşlem seçiniz.", "error");
  }

  saveState();
  renderSummary();
  renderCurrencies();
}

function pushReceipt(type, currency, quantity, unitPrice, direction = "out") {
  const now = getIstanbulDate();
  const total = quantity * unitPrice;
  state.gameplay.receipts.unshift({
    kind: "currency",
    type,
    currency: currency.name,
    symbol: currency.symbol,
    quantity,
    unitPrice,
    total,
    direction,
    timestamp: now.toLocaleString("tr-TR"),
  });
  state.gameplay.receipts = state.gameplay.receipts.slice(0, 25);
}

function logTransaction(label, amount, target = state.gameplay) {
  if (!target) return;
  const entry = {
    id: `txn-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    label,
    amount,
    timestamp: getIstanbulDate().toLocaleString("tr-TR"),
  };
  target.transactions = target.transactions || [];
  target.transactions.unshift(entry);
  target.transactions = target.transactions.slice(0, 60);
}

function renderReceipts() {
  const rows = (state.gameplay.receipts || [])
    .filter((receipt) => receipt.kind === "currency")
    .map((receipt) => {
      const signedTotal = receipt.direction === "in" ? receipt.total : -receipt.total;
      const cls = signedTotal >= 0 ? "positive" : "negative";
      return `
        <li class="receipt-item">
          <div>
            <strong>${receipt.type} - ${receipt.currency}</strong>
            <p>${receipt.timestamp}</p>
            <p>${receipt.quantity} adet × ${formatCurrency(receipt.unitPrice)}</p>
          </div>
          <p class="receipt-amount ${cls}">${formatSignedCurrency(signedTotal)}</p>
        </li>
      `;
    })
    .join("");

  dom.receiptList.innerHTML = rows || '<li class="receipt-item muted">Henüz döviz işlemi yok.</li>';
}

function renderAccountHistory() {
  if (!dom.accountHistory) return;
  const rows = (state.gameplay.transactions || [])
    .map((entry) => `
      <li class="history-item">
        <div>
          <strong>${escapeHtml(entry.label)}</strong>
          <small>${entry.timestamp || ""}</small>
        </div>
        <span class="history-amount ${entry.amount >= 0 ? "positive" : "negative"}">
          ${formatSignedCurrency(entry.amount)}
        </span>
      </li>
    `)
    .join("");

  dom.accountHistory.innerHTML =
    rows || '<li class="history-item muted">Henüz hesap hareketi yok.</li>';
}

function renderFactories() {
  if (!dom.factoryButtons || !dom.factoryButtons.length) return;
  const now = Date.now();
  dom.factoryButtons.forEach((button) => {
    const type = button.dataset.factory;
    let label = "Çalış";
    button.disabled = false;
    button.classList.remove("cooldown");
    if (type === "paper") {
      const readyAt = state.gameplay.factoryCooldowns.paperReadyAt || 0;
      const remaining = Math.ceil((readyAt - now) / 1000);
      if (remaining > 0) {
        button.disabled = true;
        button.classList.add("cooldown");
        label = `Bekle (${Math.max(remaining, 0)}s)`;
      }
    }
    button.textContent = label;
  });
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
      const rawUsername = message.username || "Bilinmiyor";
      const stamp = message.timestamp
        ? formatter.format(new Date(message.timestamp))
        : "";
      const username = escapeHtml(rawUsername);
      const text = escapeHtml(message.message);
      return `
        <article class="chat-message">
          <div class="chat-header">
            <span class="chat-username" data-player="${encodeURIComponent(
              rawUsername
            )}">${username}</span>
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

function openPlayerPeek(username) {
  if (!dom.peekPanel) return;
  const target = state.users.find((user) => user.username === username);
  if (!target) {
    return showDialog("Oyuncu profili bulunamadı.", "error");
  }
  dom.peekUsername.textContent = target.username;
  dom.peekLevel.textContent = `Seviye ${target.level ?? 1}`;
  dom.peekIdentity.textContent = `TC ${target.identity || "-"}`;
  dom.peekMotto.textContent = target.motto?.trim() || "Motto paylaşılmamış.";
  dom.peekPanel.classList.remove("hidden");
}

function hidePeek() {
  if (dom.peekPanel) {
    dom.peekPanel.classList.add("hidden");
  }
}

function handleChatClick(event) {
  const usernameEl = event.target.closest(".chat-username");
  if (!usernameEl) return;
  const encoded = usernameEl.dataset.player || "";
  let username = encoded;
  try {
    username = decodeURIComponent(encoded);
  } catch (error) {
    username = encoded;
  }
  openPlayerPeek(username);
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
  logTransaction(`Havale - ${recipient.username}`, -amount);
  const storage = loadGameplayStorage();
  const recipientState = ensureGameplayShape(storage[recipient.username]);
  recipientState.balances = recipientState.balances || { cash: 0, iron: 0 };
  recipientState.balances.cash += amount;
  logTransaction(`Havale + ${state.user.username}`, amount, recipientState);
  storage[recipient.username] = recipientState;
  storage[state.user.username] = state.gameplay;
  persistGameplayStorage(storage);
  showDialog("Para gönderildi.", "success");
  event.target.reset();
  saveState();
  renderSummary();
}

function createListing(item, qty, totalPrice) {
  if (!item) {
    showDialog("Lütfen eşya seçiniz.", "error");
    return false;
  }
  if (!qty || !totalPrice) {
    showDialog("Geçerli adet ve toplam fiyat giriniz.", "error");
    return false;
  }
  if ((state.gameplay.inventory[item] || 0) < qty) {
    showDialog("Envanterde yeterli adet yok!", "error");
    return false;
  }
  state.gameplay.inventory[item] =
    (state.gameplay.inventory[item] || 0) - qty;
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
  state.gameplay.balances.iron = state.gameplay.inventory.demir;
  renderInventory();
  renderSummary();
  renderMarket();
  saveState();
  saveMarketListings();
  return true;
}

function handleInventoryToggle(event) {
  const toggle = event.target.closest(".toggle-sell");
  if (!toggle) return;
  const card = toggle.closest(".inventory-card");
  const form = card?.querySelector(".sell-form");
  if (!form || toggle.disabled) return;
  form.classList.toggle("hidden");
}

function handleInventorySell(event) {
  const form = event.target.closest(".sell-form");
  if (!form) return;
  event.preventDefault();
  const item = form.dataset.item;
  const formData = new FormData(form);
  const quantity = Number(formData.get("quantity"));
  const price = Number(formData.get("price"));
  const success = createListing(item, quantity, price);
  if (success) {
    form.reset();
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
  if (!state.gameplay.inventory[listing.item]) {
    state.gameplay.inventory[listing.item] = 0;
  }
  state.gameplay.inventory[listing.item] += qty;
  state.gameplay.balances.cash -= total;
  logTransaction(`Pazar Alış (${getItemVisual(listing.item).label})`, -total);
  if (listing.item === "demir") {
    state.gameplay.balances.iron = state.gameplay.inventory.demir;
  }
  listing.quantity -= qty;
  listing.totalPrice = Math.max(0, (listing.totalPrice || 0) - total);
  listing.unitPrice = unitPrice;
  listing.price = unitPrice;
  const storage = loadGameplayStorage();
  const sellerGameplay = ensureGameplayShape(storage[listing.seller]);
  sellerGameplay.balances = sellerGameplay.balances || { cash: 0, iron: 0 };
  sellerGameplay.balances.cash += total;
  logTransaction(
    `Pazar Satış (${formatItem(listing.item)})`,
    total,
    sellerGameplay
  );
  sellerGameplay.listings = (sellerGameplay.listings || [])
    .map((entry) =>
      entry.id === listingId
        ? { ...entry, quantity: listing.quantity, totalPrice: listing.totalPrice }
        : entry
    )
    .filter((entry) => (entry.quantity || 0) > 0);
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
  const button = event.target.closest("[data-factory]");
  if (!button) return;
  const type = button.dataset.factory;
  const earned = Math.floor(Math.random() * 3001) + 2000;
  if (type === "iron") {
    state.gameplay.inventory.demir += earned;
    showDialog(`${earned.toLocaleString("tr-TR")} adet demir üretildi.`, "success");
  } else if (type === "paper") {
    const now = Date.now();
    const readyAt = state.gameplay.factoryCooldowns.paperReadyAt || 0;
    if (now < readyAt) {
      const remaining = Math.ceil((readyAt - now) / 1000);
      return showDialog(
        `Kağıt fabrikası ${remaining} saniye sonra tekrar çalışacak.`,
        "error"
      );
    }
    state.gameplay.inventory.kagit += earned;
    state.gameplay.factoryCooldowns.paperReadyAt = now + 10000;
    showDialog(`${earned.toLocaleString("tr-TR")} adet kağıt üretildi.`, "success");
  }
  state.gameplay.balances.iron = state.gameplay.inventory.demir;
  renderSummary();
  renderInventory();
  renderFactories();
  saveState();
}

function handleBankWork() {
  const payout = 100000;
  state.gameplay.balances.cash += payout;
  logTransaction("Bankada Çalış", payout);
  showDialog("100.000 TL maaş hesabına aktarıldı.", "success");
  saveState();
  renderSummary();
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
  const peekClose = document.querySelector("[data-peek-close]");
  if (peekClose) {
    peekClose.addEventListener("click", hidePeek);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideDialog();
      hidePeek();
    }
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
    const newUser = normalizeUser({
      ...payload,
      identity: generateIdentity(),
    });
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
    state.user = normalizeUser(found);
    state.users = state.users.map((user) =>
      user.username === state.user.username ? state.user : user
    );
    saveUsers();
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
    state.user.motto = (payload.motto || "").toString().trim();
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
  if (dom.inventoryList) {
    dom.inventoryList.addEventListener("click", handleInventoryToggle);
    dom.inventoryList.addEventListener("submit", handleInventorySell);
  }
  dom.marketList.addEventListener("submit", handleMarketPurchase);
  dom.factoryButtons.forEach((button) =>
    button.addEventListener("click", handleFactoryWork)
  );
  dom.chatForm.addEventListener("submit", handleChatSubmit);
  if (dom.chatMessages) {
    dom.chatMessages.addEventListener("click", handleChatClick);
  }
  dom.marketSearch.addEventListener("input", renderMarket);
  dom.marketFilter.addEventListener("change", renderMarket);
  dom.receiptButton.addEventListener("click", () => {
    renderReceipts();
    togglePanel("receipt-panel");
  });
  if (dom.bankWorkButton) {
    dom.bankWorkButton.addEventListener("click", handleBankWork);
  }

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
  setInterval(() => {
    if (state.user) {
      renderFactories();
    }
  }, 1000);
  window.addEventListener("storage", (event) => {
    if (event.key === CHAT_STORAGE) {
      renderChat();
    }
    if (event.key === MARKET_STORAGE) {
      state.market = loadMarketListings();
      normalizeMarketListings();
      renderMarket();
    }
    if (event.key === GAMEPLAY_STORAGE && state.user) {
      const storage = loadGameplayStorage();
      const updated = storage[state.user.username];
      if (updated) {
        state.gameplay = updated;
        renderSummary();
        renderInventory();
      }
    }
  });
  if (state.users.length) {
    authTabs[1].click();
  }
}

init();
