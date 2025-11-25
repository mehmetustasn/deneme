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
  vipToggle: document.getElementById("vip-toggle"),
  farmViews: document.querySelectorAll(".farm-view"),
  farmNavButtons: document.querySelectorAll("[data-farm-nav]"),
  farmBackButtons: document.querySelectorAll("[data-farm-back]"),
  farmHero: document.getElementById("field-hero"),
  farmAvailable: document.getElementById("field-available"),
  farmState: document.getElementById("field-state"),
  plantOpen: document.getElementById("plant-open"),
  expandOpen: document.getElementById("expand-open"),
  plantModal: document.getElementById("plant-modal"),
  plantInput: document.getElementById("plant-input"),
  plantCost: document.getElementById("plant-cost"),
  yieldInfo: document.getElementById("yield-info"),
  plantConfirm: document.getElementById("plant-confirm"),
  expandModal: document.getElementById("expand-modal"),
  expandCurrent: document.getElementById("expand-current"),
  expandCost: document.getElementById("expand-cost"),
  expandConfirm: document.getElementById("expand-confirm"),
  vipStatus: document.getElementById("vip-status"),
  farmerBonus: document.getElementById("farmer-bonus"),
  farmInfoButton: document.getElementById("farm-info-button"),
  plantCloseButtons: document.querySelectorAll("[data-plant-close]"),
  expandCloseButtons: document.querySelectorAll("[data-expand-close]"),
  farmMenu: document.getElementById("farm-menu"),
  cowCapacity: document.getElementById("cow-capacity"),
  cowCount: document.getElementById("cow-count"),
  cowVip: document.getElementById("cow-vip"),
  cowCommission: document.getElementById("cow-commission"),
  cowChallengeInput: document.getElementById("cow-challenge"),
  cowAllGrazing: document.getElementById("cow-all-grazing"),
  bulkMilkButton: document.getElementById("bulk-milk"),
  cowList: document.getElementById("cow-list"),
  cowBuyLink: document.getElementById("cow-buy-link"),
  cowShopCountdown: document.getElementById("cow-shop-countdown"),
  cowShopButton: document.getElementById("cow-shop-button"),
  cowShopList: document.getElementById("cow-shop-list"),
  cowPurchaseModal: document.getElementById("cow-purchase-modal"),
  cowModalClose: document.querySelectorAll("[data-cow-close]"),
  cowModalTrigger: document.getElementById("cow-modal-trigger"),
  cowModalActions: document.querySelectorAll("[data-cow-purchase]"),
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
const CURRENCY_CAP = 100000;
const FARM_BASE_SIZE = 100;
const FARM_MAX_SIZE = 1000;
const FARM_BASE_UPGRADE_COST = 100;
const FARM_COOLDOWN = 6 * 60 * 60 * 1000;

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
    image: "assets/tcoin.svg",
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

let farmViewStack = ["home"];
let cowChallenge = null;

const inventoryVisuals = {
  demir: { icon: "⛓️", label: "Demir", accent: "iron" },
  kagit: { icon: "📄", label: "Kağıt", accent: "paper" },
  bugday: { icon: "🌾", label: "Buğday", accent: "wheat" },
  saman: { icon: "🟫", label: "Saman", accent: "hay" },
  sut: { icon: "🥛", label: "Süt", accent: "milk" },
};

const cowTypes = [
  {
    id: "montofon",
    name: "Montofon Standart",
    weight: 80,
    boostedWeight: 80,
    min: 5000,
    max: 10000,
    art: "🐮",
  },
  {
    id: "alaca",
    name: "Alaca İyi",
    weight: 60,
    boostedWeight: 60,
    min: 7500,
    max: 15000,
    art: "🐄",
  },
  {
    id: "hereford",
    name: "Hereford Nadir",
    weight: 40,
    boostedWeight: 40,
    min: 10000,
    max: 20000,
    art: "🐂",
  },
  {
    id: "montbeliard",
    name: "Montbeliard Ender",
    weight: 20,
    boostedWeight: 50,
    min: 15000,
    max: 30000,
    art: "🦬",
  },
];

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
      diamonds: 20,
    },
    vipActive: false,
    farmerBonus: 0,
    currencies: defaultCurrencies.reduce((acc, currency) => {
      acc[currency.id] = { holdings: 0 };
      return acc;
    }, {}),
    inventory: {
      demir: 0,
      kagit: 0,
      bugday: 0,
      saman: 0,
      sut: 0,
    },
    listings: [],
    receipts: [],
    transactions: [],
    factoryCooldowns: {},
    cows: [],
    nextCowPurchaseAt: 0,
    farm: {
      size: FARM_BASE_SIZE,
      upgradeLevel: 0,
      plantedArea: 0,
      plantedAt: null,
      harvestReadyAt: null,
    },
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
    cows: payload.cows || [],
    nextCowPurchaseAt: payload.nextCowPurchaseAt || 0,
    farm: { ...base.farm, ...(payload.farm || {}) },
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
    if (panelId === "farm-panel") {
      farmViewStack = ["home"];
      showFarmView("home");
      renderFarm();
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
  renderVip();
  renderFarm();
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

function renderVip() {
  if (!dom.vipToggle) return;
  if (state.gameplay.vipActive) {
    dom.vipToggle.textContent = "Vip'i İptal Et";
    dom.vipToggle.classList.remove("btn-positive");
    dom.vipToggle.classList.add("btn-negative");
  } else {
    dom.vipToggle.textContent = "Vip ol";
    dom.vipToggle.classList.remove("btn-negative");
    dom.vipToggle.classList.add("btn-positive");
  }
}

function farmYieldRange(area = 1) {
  const vipMultiplier = state.gameplay.vipActive ? 2 : 1;
  const farmerBonus = (state.gameplay.farmerBonus || 0) / 100 + 1;
  const wheatMin = 500 * area * vipMultiplier * farmerBonus;
  const wheatMax = 5000 * area * vipMultiplier * farmerBonus;
  const hayMin = 1000 * area * vipMultiplier * farmerBonus;
  const hayMax = 10000 * area * vipMultiplier * farmerBonus;
  return {
    wheatMin: Math.round(wheatMin),
    wheatMax: Math.round(wheatMax),
    hayMin: Math.round(hayMin),
    hayMax: Math.round(hayMax),
  };
}

function renderFarm() {
  if (!dom.farmViews || !dom.farmViews.length) return;
  const farm = state.gameplay.farm || defaultGameplay().farm;
  if (dom.farmAvailable) {
    const available = Math.max(0, farm.size - getCowAreaUsage());
    dom.farmAvailable.textContent = `Ekilebilir ${available.toLocaleString(
      "tr-TR"
    )} m2 tarlanız mevcut`;
  }
  if (dom.vipStatus) {
    dom.vipStatus.textContent = state.gameplay.vipActive
      ? "2x VİP Aktif"
      : "2x VİP Pasif";
    dom.vipStatus.classList.toggle("positive", state.gameplay.vipActive);
    dom.vipStatus.classList.toggle("negative", !state.gameplay.vipActive);
  }
  if (dom.farmerBonus) {
    const bonus = state.gameplay.farmerBonus || 0;
    dom.farmerBonus.textContent = `Çiftçi bonusunuz: %${bonus}`;
  }
  renderFieldState();
  renderCows();
  renderCowShop();
}

function renderFieldState() {
  if (!dom.farmState) return;
  const farm = state.gameplay.farm || defaultGameplay().farm;
  const now = Date.now();
  const planted = farm.plantedArea || 0;
  dom.farmState.innerHTML = "";
  if (dom.plantOpen) {
    dom.plantOpen.disabled = planted > 0;
  }
  if (dom.expandOpen) {
    dom.expandOpen.disabled = planted > 0;
  }
  if (dom.farmHero) {
    dom.farmHero.classList.toggle("planted", planted > 0);
  }
  if (!planted) {
    dom.farmState.innerHTML =
      '<p class="muted">Henüz ekim yapmadın. "Tarlayı Ek" ile başla.</p>';
    return;
  }
  const remaining = (farm.harvestReadyAt || 0) - now;
  if (remaining > 0) {
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    dom.farmState.innerHTML = `
      <div class="field-status">
        <p class="positive">${planted.toLocaleString("tr-TR")} m2 Arazi Ekilmiştir</p>
        <p class="negative">Toplama İçin Kalan Süre</p>
        <p class="countdown">${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}</p>
      </div>
    `;
  } else {
    dom.farmState.innerHTML = `
      <div class="field-status ready">
        <p class="positive">${planted.toLocaleString("tr-TR")} m2 Arazi Ekilmiştir</p>
        <button class="btn-info" id="harvest-button">Topla</button>
      </div>
    `;
    const harvestButton = document.getElementById("harvest-button");
    if (harvestButton) {
      harvestButton.addEventListener("click", handleHarvest);
    }
  }
}

function getCowDefinition(type) {
  return cowTypes.find((entry) => entry.id === type);
}

function getCowAreaUsage() {
  return (state.gameplay.cows || []).length * 3;
}

function getTotalUsedArea() {
  const farm = state.gameplay.farm || defaultGameplay().farm;
  return (farm.plantedArea || 0) + getCowAreaUsage();
}

function getCowRange(cow) {
  const def = getCowDefinition(cow.type) || { min: 0, max: 0 };
  const multiplier = state.gameplay.vipActive ? 2 : 1;
  return {
    min: def.min * multiplier,
    max: def.max * multiplier,
  };
}

function getCommissionRange() {
  const totals = (state.gameplay.cows || [])
    .filter((cow) => isCowMilkable(cow))
    .reduce(
    (acc, cow) => {
      const range = getCowRange(cow);
      acc.min += range.min;
      acc.max += range.max;
      return acc;
    },
    { min: 0, max: 0 }
  );
  return {
    min: Math.floor(totals.min * 0.9),
    max: Math.floor(totals.max * 0.9),
  };
}

function cleanupCows() {
  const now = Date.now();
  state.gameplay.cows = (state.gameplay.cows || []).filter(
    (cow) => !cow.expiresAt || cow.expiresAt > now
  );
}

function isCowMilkable(cow) {
  if (!cow) return false;
  const now = Date.now();
  const grazingUntil = cow.grazesUntil || 0;
  return now >= grazingUntil && !cow.listed;
}

function formatDateTime(timestamp) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatCountdownLong(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor((totalSeconds / 60 / 60) % 24);
  const days = Math.floor(totalSeconds / 60 / 60 / 24);
  const parts = [];
  if (days > 0) parts.push(`${days}g`);
  if (hours > 0 || days > 0) parts.push(`${String(hours).padStart(2, "0")}s`);
  parts.push(`${String(minutes).padStart(2, "0")}d`);
  parts.push(`${String(totalSeconds % 60).padStart(2, "0")}s`);
  return parts.join(" ");
}

function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function generateCowQuestion() {
  const a = Math.floor(Math.random() * 8) + 1;
  const b = Math.floor(Math.random() * 8) + 1;
  const isAdd = Math.random() > 0.4;
  const question = isAdd
    ? `${a}+${b} Kaç Eder?`
    : `${Math.max(a, b)}-${Math.min(a, b)} Kaç Eder?`;
  const answer = isAdd ? a + b : Math.abs(a - b);
  cowChallenge = { question, answer };
  if (dom.cowChallengeInput) {
    dom.cowChallengeInput.value = "";
    dom.cowChallengeInput.placeholder = question;
  }
}

function renderCowCards(cows) {
  const now = Date.now();
  return cows
    .map((cow) => {
      const def = getCowDefinition(cow.type) || { name: "İnek", min: 0, max: 0, art: "🐄" };
      const range = getCowRange(cow);
      const grazingUntil = cow.grazesUntil || 0;
      const isGrazing = grazingUntil > now;
      const statusLabel = isGrazing ? "Otlanıyor" : "Sağıma Hazır";
      const action = isGrazing
        ? `<button class="btn-warn" disabled>${formatClock(grazingUntil - now)}</button>`
        : `<button class="btn-positive" data-cow-milk="${cow.id}">İneği Sağ</button>`;
      return `
        <article class="cow-card">
          <div class="cow-thumb">${def.art}</div>
          <div class="cow-body">
            <h4>${def.name}</h4>
            <p class="muted">Üretim: ${range.min.toLocaleString("tr-TR")} / ${range.max.toLocaleString(
        "tr-TR"
      )} Litre Arası</p>
            <p>Kalan Ömrü: <strong>${formatDateTime(cow.expiresAt)}</strong></p>
            <p class="status ${isGrazing ? "grazing" : "ready"}">${statusLabel}</p>
          </div>
          <div class="cow-actions">${action}</div>
        </article>
      `;
    })
    .join("");
}

function renderCows() {
  if (!dom.cowList) return;
  cleanupCows();
  const farm = state.gameplay.farm || defaultGameplay().farm;
  const cows = state.gameplay.cows || [];
  const planted = farm.plantedArea || 0;
  const used = getTotalUsedArea();
  if (dom.cowCapacity) {
    dom.cowCapacity.textContent = `Tarla Kapasitem: ${farm.size.toLocaleString(
      "tr-TR"
    )} M2 / ${used.toLocaleString("tr-TR")} M2`;
  }
  if (dom.cowCount) {
    dom.cowCount.textContent = `Mevcut İnek Sayısı: ${cows.length}`;
  }
  if (dom.cowVip) {
    dom.cowVip.textContent = state.gameplay.vipActive
      ? "Vip 2X Tahsilat Aktif"
      : "Vip 2x Tahsilat Pasif";
    dom.cowVip.classList.toggle("positive", state.gameplay.vipActive);
    dom.cowVip.classList.toggle("negative", !state.gameplay.vipActive);
  }
  if (dom.cowCommission) {
    const range = getCommissionRange();
    dom.cowCommission.innerHTML = `Toplu Sağma İşlemi Yaparak %10 Komisyon Kesilir. Komisyon farkı ile <strong>${range.min.toLocaleString(
      "tr-TR"
    )}</strong> ile <strong>${range.max.toLocaleString("tr-TR")}</strong> Litre Arası Süt Kazanırsınız.`;
  }
  const hasMilkable = cows.some((cow) => isCowMilkable(cow));
  const showGrazing = !hasMilkable && cows.length > 0;
  if (dom.bulkMilkButton) {
    dom.bulkMilkButton.disabled = !hasMilkable;
    dom.bulkMilkButton.classList.toggle("hidden", !hasMilkable);
  }
  if (dom.cowChallengeInput) {
    dom.cowChallengeInput.disabled = !hasMilkable;
    dom.cowChallengeInput.classList.toggle("hidden", !hasMilkable);
  }
  if (dom.cowAllGrazing) dom.cowAllGrazing.classList.toggle("hidden", !showGrazing);
  if (!hasMilkable && cows.length > 0) {
    if (dom.cowChallengeInput) dom.cowChallengeInput.value = "";
  }
  if (!cowChallenge) generateCowQuestion();
  dom.cowList.innerHTML = cows.length
    ? renderCowCards(cows)
    : '<p class="empty-state">Henüz ineğin yok, satın alarak başla.</p>';
}

function renderCowShop() {
  if (!dom.cowShopList) return;
  const now = Date.now();
  const remaining = (state.gameplay.nextCowPurchaseAt || 0) - now;
  if (dom.cowShopButton) {
    dom.cowShopButton.disabled = remaining > 0;
    dom.cowShopButton.classList.toggle("hidden", remaining > 0);
  }
  if (dom.cowShopCountdown) {
    if (remaining > 0) {
      const vipText = state.gameplay.vipActive ? "30" : "60";
      dom.cowShopCountdown.innerHTML = `Yeni inek almak için sürenin bitmesini beklemelisiniz! <span class="negative">${formatClock(
        remaining
      )}</span> (${vipText} dakikadan geriye sayıyor)`;
      dom.cowShopCountdown.classList.remove("hidden");
    } else {
      dom.cowShopCountdown.classList.add("hidden");
      dom.cowShopCountdown.textContent = "";
    }
  }

  dom.cowShopList.innerHTML = cowTypes
    .map((type) => {
      const chance = `${type.weight}%`;
      return `
        <article class="cow-type-card">
          <div class="cow-type-thumb">${type.art}</div>
          <div class="cow-type-body">
            <h4>${type.name} (${chance})</h4>
            <p>Üretim: ${type.min.toLocaleString("tr-TR")} / ${type.max.toLocaleString(
        "tr-TR"
      )} Litre Arası Süt</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function openCowPurchaseModal() {
  if (!dom.cowPurchaseModal) return;
  const now = Date.now();
  const remaining = (state.gameplay.nextCowPurchaseAt || 0) - now;
  if (remaining > 0) {
    return showDialog("Bekleme süresi dolmadan yeni inek alamazsın.", "error");
  }
  dom.cowPurchaseModal.classList.remove("hidden");
}

function closeCowPurchaseModal() {
  if (dom.cowPurchaseModal) {
    dom.cowPurchaseModal.classList.add("hidden");
  }
}

function pickCow(variant = "standard") {
  const weights = cowTypes.map((type) => {
    if (variant === "premium" && type.id === "montbeliard") return type.boostedWeight;
    return type.weight;
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < cowTypes.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      return cowTypes[i];
    }
  }
  return cowTypes[cowTypes.length - 1];
}

function handleCowPurchase(event) {
  const button = event.target.closest("[data-cow-purchase]");
  if (!button) return;
  const variant = button.dataset.cowPurchase;
  const now = Date.now();
  const remaining = (state.gameplay.nextCowPurchaseAt || 0) - now;
  if (remaining > 0) {
    return showDialog("Yeni inek için sürenin bitmesini beklemelisin.", "error");
  }
  const farm = state.gameplay.farm || defaultGameplay().farm;
  const freeSpace = Math.max(0, farm.size - getTotalUsedArea());
  if (freeSpace < 3) {
    return showDialog("Tarlanızda yeterli yer yok.", "error");
  }
  const tcoinWallet = state.gameplay.currencies.tcoin?.holdings || 0;
  const diamonds = state.gameplay.balances.diamonds || 0;
  if (tcoinWallet < 1000) {
    return showDialog("En az 1.000 TCoin gerekir.", "error");
  }
  if (variant === "premium" && diamonds < 10) {
    return showDialog("Yeterli elmas yok.", "error");
  }
  state.gameplay.currencies.tcoin.holdings = tcoinWallet - 1000;
  if (variant === "premium") {
    state.gameplay.balances.diamonds = diamonds - 10;
  }
  const selection = pickCow(variant);
  const cow = {
    id: `cow-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    type: selection.id,
    createdAt: now,
    expiresAt: now + 90 * 24 * 60 * 60 * 1000,
    grazesUntil: 0,
    listed: false,
  };
  state.gameplay.cows = [...(state.gameplay.cows || []), cow];
  state.gameplay.nextCowPurchaseAt =
    now + (state.gameplay.vipActive ? 30 : 60) * 60 * 1000;
  closeCowPurchaseModal();
  renderCurrencies();
  renderCows();
  renderCowShop();
  renderInventory();
  saveState();
  showDialog(`Tebrikler! ${selection.name} ineğini kazandınız.`, "success");
}

function handleCowMilk(event) {
  const button = event.target.closest("[data-cow-milk]");
  if (!button) return;
  const cowId = button.dataset.cowMilk;
  const cow = (state.gameplay.cows || []).find((entry) => entry.id === cowId);
  if (!cow) return;
  if (!isCowMilkable(cow)) {
    return showDialog("İnek şu an otlanıyor.", "error");
  }
  const range = getCowRange(cow);
  const produced = Math.floor(range.min + Math.random() * (range.max - range.min));
  state.gameplay.inventory.sut =
    (state.gameplay.inventory.sut || 0) + Math.max(0, produced);
  cow.grazesUntil = Date.now() + 3 * 60 * 60 * 1000;
  renderInventory();
  renderCows();
  saveState();
  showDialog(`${produced.toLocaleString("tr-TR")} Litre süt toplandı.`, "success");
}

function handleBulkMilk(event) {
  event.preventDefault();
  if (!dom.bulkMilkButton) return;
  const milkable = (state.gameplay.cows || []).filter((cow) => isCowMilkable(cow));
  if (!milkable.length) {
    generateCowQuestion();
    renderCows();
    return showDialog("Tüm inekler otlanıyor.", "error");
  }
  const answer = Number(dom.cowChallengeInput?.value || 0);
  if (!cowChallenge || answer !== cowChallenge.answer) {
    generateCowQuestion();
    return showDialog("Güvenlik sorusu hatalı.", "error");
  }
  let total = 0;
  milkable.forEach((cow) => {
    const range = getCowRange(cow);
    const produced = Math.floor(range.min + Math.random() * (range.max - range.min));
    total += produced;
    cow.grazesUntil = Date.now() + 3 * 60 * 60 * 1000;
  });
  const finalTotal = Math.floor(total * 0.9);
  state.gameplay.inventory.sut =
    (state.gameplay.inventory.sut || 0) + Math.max(0, finalTotal);
  generateCowQuestion();
  renderInventory();
  renderCows();
  saveState();
  showDialog(
    `${finalTotal.toLocaleString("tr-TR")} Litre süt toplandı (komisyon kesildi).`,
    "success"
  );
}

function showFarmView(target) {
  dom.farmViews.forEach((view) => {
    view.classList.toggle("active", view.dataset.farmView === target);
  });
}

function handleFarmNav(event) {
  const target = event.target.closest("[data-farm-nav]");
  if (!target) return;
  const view = target.dataset.farmNav;
  farmViewStack.push(view);
  showFarmView(view);
  if (view === "field") {
    renderFieldState();
  }
  if (view === "cows") {
    renderCows();
  }
  if (view === "cow-shop") {
    renderCowShop();
  }
}

function handleFarmBack() {
  farmViewStack.pop();
  const previous = farmViewStack[farmViewStack.length - 1] || "home";
  showFarmView(previous);
  if (previous === "field") renderFieldState();
  if (previous === "cows") renderCows();
  if (previous === "cow-shop") renderCowShop();
}

function openPlantModal() {
  if (!dom.plantModal) return;
  const farm = state.gameplay.farm;
  dom.plantModal.classList.remove("hidden");
  if (dom.plantInput) {
    const maxArea = Math.max(0, farm.size - getCowAreaUsage());
    dom.plantInput.placeholder = `Max: ${maxArea} M2`;
    dom.plantInput.value = "";
  }
  updatePlantPreview();
}

function closePlantModal() {
  if (dom.plantModal) {
    dom.plantModal.classList.add("hidden");
  }
}

function updatePlantPreview() {
  if (!dom.plantCost || !dom.plantInput) return;
  const farm = state.gameplay.farm;
  const area = Number(dom.plantInput.value) || 0;
  const maxArea = Math.max(0, farm.size - getCowAreaUsage());
  dom.plantInput.placeholder = `Max: ${maxArea} M2`;
  const cost = area * 100;
  dom.plantCost.textContent = `Ekilecek M2 İçin Gerekli TCOİN: ${cost.toLocaleString(
    "tr-TR"
  )}`;
  const range = farmYieldRange(Math.max(area, 1));
  dom.yieldInfo.innerHTML =
    `Ekilen Araziden Ortalama minimum ile maksimum <span class="positive">${range.wheatMin.toLocaleString(
      "tr-TR"
    )}</span> ile <span class="positive">${range.wheatMax.toLocaleString(
      "tr-TR"
    )}</span> Arası Buğday, minimum ile maksimum <span class="positive">${range.hayMin.toLocaleString(
      "tr-TR"
    )}</span> ile <span class="positive">${range.hayMax.toLocaleString(
      "tr-TR"
    )}</span> arası Saman kazanırsınız`;
}

function handlePlantConfirm() {
  const farm = state.gameplay.farm;
  const amount = Number(dom.plantInput.value);
  const maxArea = Math.max(0, farm.size - getCowAreaUsage());
  if (!amount || amount <= 0) {
    return showDialog("Geçerli bir M2 giriniz.", "error");
  }
  if (amount > maxArea) {
    return showDialog("Ekilebilir alanı aşıyorsun.", "error");
  }
  if (farm.plantedArea > 0) {
    return showDialog("Tarla zaten ekili.", "error");
  }
  const cost = amount * 100;
  const tcoin = state.gameplay.currencies.tcoin?.holdings || 0;
  if (tcoin < cost) {
    return showDialog("Yeterli TCoin yok.", "error");
  }
  state.gameplay.currencies.tcoin.holdings = tcoin - cost;
  const now = Date.now();
  farm.plantedArea = amount;
  farm.plantedAt = now;
  farm.harvestReadyAt = now + FARM_COOLDOWN;
  closePlantModal();
  renderCurrencies();
  renderFieldState();
  showDialog("Ekim tamamlandı.", "success");
  saveState();
}

function openExpandModal() {
  if (!dom.expandModal) return;
  const farm = state.gameplay.farm;
  const cost = FARM_BASE_UPGRADE_COST * Math.pow(2, farm.upgradeLevel);
  dom.expandCurrent.textContent = `Mevcut tarla kapasiteniz: ${farm.size.toLocaleString(
    "tr-TR"
  )} m2`;
  dom.expandCost.textContent = `Yükseltmek İçin Gerekli TCoin: ${cost.toLocaleString(
    "tr-TR"
  )}`;
  dom.expandModal.dataset.cost = cost;
  dom.expandModal.classList.remove("hidden");
}

function closeExpandModal() {
  if (dom.expandModal) {
    dom.expandModal.classList.add("hidden");
  }
}

function handleExpandConfirm() {
  const farm = state.gameplay.farm;
  if (farm.size >= FARM_MAX_SIZE) {
    return showDialog("Tarla maksimum seviyede.", "error");
  }
  const cost = Number(dom.expandModal?.dataset.cost) ||
    FARM_BASE_UPGRADE_COST * Math.pow(2, farm.upgradeLevel);
  const tcoin = state.gameplay.currencies.tcoin?.holdings || 0;
  if (tcoin < cost) {
    return showDialog("Yeterli TCoin yok.", "error");
  }
  state.gameplay.currencies.tcoin.holdings = tcoin - cost;
  farm.size = Math.min(FARM_MAX_SIZE, farm.size + 10);
  farm.upgradeLevel += 1;
  closeExpandModal();
  renderCurrencies();
  renderFarm();
  showDialog("Tarla büyütüldü.", "success");
  saveState();
}

function handleHarvest() {
  const farm = state.gameplay.farm;
  if (!farm.plantedArea) return;
  const range = farmYieldRange(farm.plantedArea);
  const wheat = Math.floor(
    Math.random() * (range.wheatMax - range.wheatMin + 1)
  ) + range.wheatMin;
  const hay = Math.floor(Math.random() * (range.hayMax - range.hayMin + 1)) +
    range.hayMin;
  state.gameplay.inventory.bugday += wheat;
  state.gameplay.inventory.saman += hay;
  farm.plantedArea = 0;
  farm.plantedAt = null;
  farm.harvestReadyAt = null;
  renderInventory();
  renderFieldState();
  showDialog(
    `${wheat.toLocaleString("tr-TR")} buğday ve ${hay.toLocaleString(
      "tr-TR"
    )} saman toplandı.`,
    "success"
  );
  saveState();
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
      const art = currency.image
        ? `<img src="${currency.image}" alt="${currency.name}" />`
        : `<span>${currency.icon || "🪙"}</span>`;

      return `
        <article class="currency-card" data-currency="${currency.id}" ${
          index === 0 ? "data-selected" : ""
        }>
          <header class="currency-top">
            <div class="currency-art accent-${currency.accent || currency.id}">
              ${art}
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
            <p class="currency-volume">Hacim: ${CURRENCY_CAP.toLocaleString(
              "tr-TR"
            )} / ${holdings.toLocaleString("tr-TR")}</p>
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
    bugday: "Buğday",
    saman: "Saman",
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
  renderFieldState();
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
  if (action === "buy" && holdings + qty > CURRENCY_CAP) {
    return showDialog("Bu döviz için hacim sınırına ulaşıldı.", "error");
  }

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

function toggleVip() {
  state.gameplay.vipActive = !state.gameplay.vipActive;
  renderVip();
  renderFarm();
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

  dom.farmNavButtons.forEach((btn) =>
    btn.addEventListener("click", handleFarmNav)
  );
  dom.farmBackButtons.forEach((btn) =>
    btn.addEventListener("click", handleFarmBack)
  );
  if (dom.plantOpen) dom.plantOpen.addEventListener("click", openPlantModal);
  dom.plantCloseButtons.forEach((btn) =>
    btn.addEventListener("click", closePlantModal)
  );
  if (dom.plantInput) dom.plantInput.addEventListener("input", updatePlantPreview);
  if (dom.plantConfirm) dom.plantConfirm.addEventListener("click", handlePlantConfirm);
  if (dom.expandOpen) dom.expandOpen.addEventListener("click", openExpandModal);
  dom.expandCloseButtons.forEach((btn) =>
    btn.addEventListener("click", closeExpandModal)
  );
  if (dom.expandConfirm) dom.expandConfirm.addEventListener("click", handleExpandConfirm);
  if (dom.bulkMilkButton) dom.bulkMilkButton.addEventListener("click", handleBulkMilk);
  if (dom.cowList) dom.cowList.addEventListener("click", handleCowMilk);
  if (dom.cowBuyLink)
    dom.cowBuyLink.addEventListener("click", () => {
      const view = dom.cowBuyLink.dataset.farmNav;
      if (view) {
        farmViewStack.push(view);
        showFarmView(view);
        renderCowShop();
      }
    });
  if (dom.cowShopButton) dom.cowShopButton.addEventListener("click", openCowPurchaseModal);
  if (dom.cowModalTrigger) dom.cowModalTrigger.addEventListener("click", openCowPurchaseModal);
  dom.cowModalActions.forEach((btn) =>
    btn.addEventListener("click", handleCowPurchase)
  );
  dom.cowModalClose.forEach((btn) =>
    btn.addEventListener("click", closeCowPurchaseModal)
  );
  if (dom.cowPurchaseModal)
    dom.cowPurchaseModal.addEventListener("click", (event) => {
      if (event.target === dom.cowPurchaseModal) closeCowPurchaseModal();
    });
  if (dom.farmInfoButton)
    dom.farmInfoButton.addEventListener("click", () =>
      showDialog("Çiftlik bilgisi yakında eklenecek.", "info")
    );
  if (dom.vipToggle) dom.vipToggle.addEventListener("click", toggleVip);

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
      renderFieldState();
      renderCows();
      renderCowShop();
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
