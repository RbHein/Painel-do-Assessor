// ======== CONFIG ========
const CACHE_TTL_MS = 10 * 1000;

// ======== CACHE LOCAL ========
let cache = { timestamp: 0, data: null };

function isCacheValid() {
  return cache.data && Date.now() - cache.timestamp < CACHE_TTL_MS;
}

function formatNumber(n, digits = 4) {
  if (!n || isNaN(n)) return "--";
  return Number(n).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

// ======== BUSCA VIA BACKEND ========
async function fetchRates() {
  try {
    const res = await fetch(`/api/rates?nocache=${Date.now()}`);
    const data = await res.json();

    const usdPrice = data?.USD;
    const eurPrice = data?.EUR;

    if (!usdPrice || !eurPrice) {
      throw new Error("Não foi possível obter USD ou EUR do backend (Investing).");
    }

    // ======== USD ========
    document.getElementById("usdMarket").textContent = `R$ ${formatNumber(usdPrice)}`;
    document.getElementById("usdCash").textContent = `R$ ${formatNumber(usdPrice * 1.075)}`;
    document.getElementById("usdInvestGlobal").textContent = `R$ ${formatNumber(usdPrice * 1.0187)}`;
    document.getElementById("usdDigitalGlobal").textContent = `R$ ${formatNumber(usdPrice * 1.0225)}`;

    // ======== EUR ========
    document.getElementById("eurMarket").textContent = `R$ ${formatNumber(eurPrice)}`;
    document.getElementById("eurCash").textContent = `R$ ${formatNumber(eurPrice * 1.075)}`;

  } catch (err) {
    console.error("Erro ao buscar cotações via proxy Investing:", err);
  }
}

// ======== EXECUÇÃO ========
fetchRates();
setInterval(fetchRates, 1_000);
