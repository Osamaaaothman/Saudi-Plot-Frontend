const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const PRIMARY_MODEL = "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash";

function isRateLimitError(status, message) {
  if (status === 429) return true;
  const msg = (message || "").toLowerCase();
  return (
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit") ||
    msg.includes("quota exceeded") ||
    msg.includes("daily limit") ||
    msg.includes("too many requests")
  );
}

function buildUrl(model) {
  return `${API_BASE}/${model}:generateContent`;
}

async function callModel(model, apiKey, requestBody, onStatus) {
  onStatus("sending");
  const response = await fetch(`${buildUrl(model)}?key=${apiKey.trim()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorMsg = `API error (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.error?.message) errorMsg = errBody.error.message;
    } catch {}
    const error = new Error(errorMsg);
    error.status = response.status;
    error.isRateLimit = isRateLimitError(response.status, errorMsg);
    error.isTransient = [429, 500, 502, 503, 504].includes(response.status);
    throw error;
  }

  onStatus("parsing");
  return response.json();
}

export async function callGeminiWithFallback({ apiKey, requestBody, onStatus = () => {} }) {
  const timestamp = new Date().toISOString();

  try {
    const data = await callModel(PRIMARY_MODEL, apiKey, requestBody, onStatus);
    console.log(`[GeminiClient] ${timestamp} | ${PRIMARY_MODEL} ok`);
    return data;
  } catch (primaryErr) {
    console.log(`[GeminiClient] ${timestamp} | ${PRIMARY_MODEL} err ${primaryErr.status || "?"}: ${primaryErr.message}`);

    if (!primaryErr.isRateLimit) {
      throw primaryErr;
    }

    try {
      const data = await callModel(FALLBACK_MODEL, apiKey, requestBody, onStatus);
      console.log(`[GeminiClient] ${timestamp} | ${PRIMARY_MODEL} → ${FALLBACK_MODEL} ok`);
      return data;
    } catch (fallbackErr) {
      console.log(`[GeminiClient] ${timestamp} | ${PRIMARY_MODEL} → ${FALLBACK_MODEL} err ${fallbackErr.status || "?"}: ${fallbackErr.message}`);

      if (fallbackErr.isRateLimit) {
        throw new Error("خدمة الذكاء الاصطناعي مشغولة مؤقتًا. يرجى المحاولة مرة أخرى بعد دقائق.");
      }

      throw fallbackErr;
    }
  }
}
