const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function buildPrompt() {
  return `You are a specialized AI that analyzes Saudi real estate deed documents (صك عقاري).

Analyze the uploaded document image or PDF and extract ALL visible information.

CRITICAL RULES:
1. Read ALL text, including text inside tables.
2. Identify and list every owner with full name, ID number (رقم الهوية), and ownership percentage (نسبة الملكية).
3. Extract all property details: property ID, type, city (المدينة), district (الحي), plan type/ number, block (المربع), parcel number (رقم القطعة), and area in m².
4. Read boundaries (الحدود): north (شمال), south (جنوب), east (شرق), west (غرب).
5. Identify ALL QR codes visible in the document. For each QR code detected, decode its content. If the decoded content is a URL, return the URL in decoded_text. Record all QR codes in the qr_codes array.
6. Extract document info: number, type, status, issue dates (Hijri and Gregorian if available), previous document reference, operation type.
7. Look for any verification URL or reference.
8. Put any extra fields that don't fit the schema into extra_information as key-value pairs.
9. For raw_text, include every piece of text visible in the document, including Arabic text as-is.

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON.
- Do NOT include markdown formatting, code fences, or any explanatory text before or after the JSON.
- Use null for any missing or unidentifiable values.
- Boolean values must be true or false (not strings).
- Numbers must be actual numbers (not strings), except ID numbers which should be strings.
- Owner names can be in Arabic — keep them as-is, do not translate.

SCHEMA:
{
  "document": {
    "document_number": null,
    "document_type": null,
    "document_status": null,
    "issue_date_hijri": null,
    "issue_date_gregorian": null,
    "previous_document_number": null,
    "previous_document_date": null,
    "operation_type": null
  },
  "owners": [
    {
      "name": null,
      "id_number": null,
      "ownership_percentage": null
    }
  ],
  "property": {
    "property_id": null,
    "property_type": null,
    "city": null,
    "district": null,
    "plan_type": null,
    "plan_number": null,
    "block": null,
    "parcel_number": null,
    "area_m2": null
  },
  "boundaries": {
    "north": null,
    "south": null,
    "east": null,
    "west": null
  },
  "qr_codes": [
    {
      "exists": true,
      "decoded_text": null,
      "type": null
    }
  ],
  "verification": {
    "verification_url": null
  },
  "extra_information": {},
  "raw_text": null
}

Remember: ONLY valid JSON. No markdown. No explanations. No code fences.`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("فشل قراءة الملف. حاول مرة أخرى."));
  });
}

function extractJSON(text) {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // fall through
    }
  }

  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {
      // fall through
    }
  }

  try {
    return JSON.parse(text.trim());
  } catch {
    // fall through
  }

  throw new Error(
    "فشل تحليل استجابة الذكاء الاصطناعي. تأكد أن الملف يحتوي على صك واضح."
  );
}

export function validateFile(file) {
  const isAllowed =
    ALLOWED_TYPES.includes(file.type) ||
    file.type === "image/jpg" ||
    /\.(pdf|jpg|jpeg|png)$/i.test(file.name);

  if (!isAllowed) {
    throw new Error("نوع الملف غير مدعوم. الرجاء رفع ملف PDF أو JPG أو PNG.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("حجم الملف يتجاوز 20 ميغابايت. الرجاء رفع ملف أصغر.");
  }
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiOnce(apiKey, base64, mimeType, onStatus) {
  const response = await fetch(`${API_URL}?key=${apiKey.trim()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: buildPrompt() },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    let errorMsg = `فشل الاتصال بالخادم (رمز الخطأ: ${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.error?.message) errorMsg = errBody.error.message;
    } catch {
      // ignore parse error
    }
    const error = new Error(errorMsg);
    error.transient = RETRYABLE_STATUS.has(response.status);
    throw error;
  }

  onStatus("parsing");
  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    if (data.promptFeedback?.blockReason) {
      throw new Error(`تم حجب المحتوى: ${data.promptFeedback.blockReason}`);
    }
    throw new Error(
      "لم يُرجع الذكاء الاصطناعي أي بيانات. تأكد أن الملف يحتوي على صك."
    );
  }

  const candidate = data.candidates[0];
  if (candidate.finishReason && candidate.finishReason !== "STOP") {
    throw new Error(`توقف التحليل: ${candidate.finishReason}. حاول مرة أخرى.`);
  }

  const text = candidate.content?.parts?.[0]?.text;
  if (!text?.trim()) {
    throw new Error("الاستجابة فارغة. حاول مرة أخرى.");
  }

  const result = extractJSON(text);
  if (typeof result !== "object" || result === null || Array.isArray(result)) {
    throw new Error("تنسيق غير متوقع من الذكاء الاصطناعي. حاول مرة أخرى.");
  }

  return result;
}

export async function analyzeDeed(file, onStatus) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("مفتاح API غير مضبوط. تواصل مع الدعم الفني.");
  }

  onStatus("reading");
  const base64 = await fileToBase64(file);

  const mimeType =
    file.type ||
    (/\.pdf$/i.test(file.name)
      ? "application/pdf"
      : /\.png$/i.test(file.name)
        ? "image/png"
        : "image/jpeg");

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    onStatus("sending");
    try {
      return await callGeminiOnce(apiKey, base64, mimeType, onStatus);
    } catch (err) {
      const isLastAttempt = attempt === MAX_RETRIES;
      if (!err.transient || isLastAttempt) throw err;
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
}
