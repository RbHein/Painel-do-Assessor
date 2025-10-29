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
  // regex para pegar o conteúdo do div que tem class text-5xl/9 font-bold ...
  const regex = /<div[^>]*text-5xl\/9[^>]*>([\d.,]+)<\/div>/i;
  const match = html.match(regex);
  if (!match) return NaN;

  let value = match[1];

  // remove pontos que são separadores de milhar (antes da vírgula) e troca vírgula por ponto decimal
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

  // URLs do Investing (USD/BRL e EUR/BRL)
    const USD_URL = "https://www.investing.com/currencies/usd-brl";
    const EUR_URL = "https://www.investing.com/currencies/eur-brl";

    const [USD, EUR] = await Promise.all([
    fetchInvesting(USD_URL),
    fetchInvesting(EUR_URL)
    ]);

  if (!USD || !EUR) throw new Error("Não foi possível obter USD ou EUR do backend (Investing).");

  const result = { USD, EUR, source: "investing" };
  cache = { timestamp: Date.now(), data: result };
  return { ...result, cached: false };
}

// -------------------------------
// Exporta
// -------------------------------
module.exports = { getRates };
