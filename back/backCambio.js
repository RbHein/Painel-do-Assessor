// =======================================
// BACKEND - Cotações direto do Investing
// =======================================

const CACHE_TTL_MS = 10 * 1000; // 10 segundos
let cache = { timestamp: 0, data: null };

// -------------------------------
// Verifica se cache ainda é válido
// -------------------------------
function isCacheValid() {
  return cache.data && (Date.now() - cache.timestamp) < CACHE_TTL_MS;
}

// -------------------------------
// Função auxiliar: extrai número do HTML
// -------------------------------

function parseInvestingPrice(html) {
  const regex = /<div[^>]*data-test="instrument-price-last"[^>]*>([\d.,]+)<\/div>/i;
  const match = html.match(regex);
  if (!match) return NaN;

  let value = match[1];

  // remove separador de milhar e converte vírgula para ponto
  if (value.includes(",") && value.includes(".")) {
    value = value.replace(/\.(?=\d{3},)/g, "").replace(",", ".");
  } else if (value.includes(",")) {
    value = value.replace(",", ".");
  }

  return parseFloat(value);
}

// -------------------------------
// Função para buscar cotação Investing
// -------------------------------
async function fetchInvesting(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const value = parseInvestingPrice(html);
    return isNaN(value) ? null : value;
  } catch (err) {
    console.error("❌ Erro ao buscar Investing:", err.message);
    return null;
  }
}

// -------------------------------
// Função principal
// -------------------------------
async function getRates() {
  if (isCacheValid()) return { ...cache.data, cached: true };

  // URLs do Investing
  const USD_URL = "https://www.investing.com/currencies/usd-brl";
  const EUR_URL = "https://www.investing.com/currencies/eur-brl";
  const CHF_URL = "https://www.investing.com/currencies/chf-brl";

  // Busca simultânea
  const [USD, EUR, CHF] = await Promise.all([
    fetchInvesting(USD_URL),
    fetchInvesting(EUR_URL),
    fetchInvesting(CHF_URL),
  ]);

  if (!USD || !EUR || !CHF) throw new Error("❌ Falha ao obter cotações do Investing.");

  const result = { USD, EUR, CHF, source: "investing" };

  // Atualiza cache
  cache = { timestamp: Date.now(), data: result };

  return { ...result, cached: false };
}

// -------------------------------
// Exporta
// -------------------------------
module.exports = { getRates };
