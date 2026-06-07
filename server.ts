import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Shared lazy-initialized Gemini SDK client
let genAIClient: any = null;

function getGeminiClient() {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      genAIClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return genAIClient;
}

// REST API endpoints

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
  });
});

// Post endpoint for Medicine Smart Suggestion using Gemini
app.post("/api/gemini/suggest-medicine", async (req: express.Request, res: express.Response) => {
  const { query, rawText } = req.body;

  if (!query && !rawText) {
    return res.status(400).json({ error: "Missing 'query' or 'rawText' parameters." });
  }

  const promptInput = rawText 
    ? `Analyze the following textual description or invoice lines of a medicine and onboard it:\n${rawText}`
    : `Onboard the medicine: "${query}"`;

  const client = getGeminiClient();

  if (!client) {
    // Elegant fallback simulation if API key is not present/configured
    console.warn("GEMINI_API_KEY is not configured or placeholder detected. Invoking smart fallback handler.");
    return res.json(getMockAISuggestion(query || "Generic Medicine"));
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptInput,
      config: {
        systemInstruction: `You are an expert pharmacist and automated medical inventory cataloging assistant.
Your job is to take a medicine name or purchase text/invoice, and return systematic inventory configuration recommendation.
Configure custom attributes following this strict taxonomy of Zones & Shelf numbers:
- Zone A: Pain, Fever & Inflammation (Analgesics, NSAIDs) -> Suggested Shelf: A-1, A-2, A-3, or A-4
- Zone B: Infections (Antibiotics, Antivirals, Antifungals) -> Suggested Shelf: B-1, B-2, B-3, or B-4
- Zone C: Respiratory & Allergies (Antihistamines, Bronchodilators, Cough syrups) -> Suggested Shelf: C-1, C-2, C-3, or C-4
- Zone D: Gastrointestinal (Antacids, Laxatives, PPIs, Antidiarrheals) -> Suggested Shelf: D-1, D-2, D-3, or D-4
- Zone E: Cardiovascular & Diabetes (Statins, Blood Pressure, Oral Antidiabetics) -> Suggested Shelf: E-1, E-2, E-3, or E-4
- Zone F: Dermatological & Topical (Creams, Ointments, Gels) -> Suggested Shelf: F-1, F-2, F-3, or F-4
- Zone S: Specials (Vitamins, Supplements, OTC remedies) -> Suggested Shelf: S-1, S-2, S-3, or S-4
- Zone R: Cold Chain (Insulin, biologicals, vaccines) requires refrigerated temperature -> Suggested Shelf: R-1 or R-2 (And 'storageTemp' MUST be set to "Refrigerated (2-8°C)")

General rules:
- Infer the generic/active ingredients accurately.
- Classify into appropriate category (e.g. "Pain Relief", "Antibiotic", "Gastrointestinal", "Respiratory", "Cardiac & Diabetes", "Dermatological", "Vitamins & Supplements", "Cold Chain / Biologicals").
- Suggest standard Unit types ("Tablets", "Capsules", "Liquid (ml)", "Cream (g)", "Injection", "Inhaler").
- Set dynamic realistic Base Price in USD (floating point number).
- Target standard min stock values (e.g., 20 tablets, 10 bottles or creams).
- Provide a brief description/explain justification in 'explanation'.
`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Normalized Commercial Name" },
            genericName: { type: Type.STRING, description: "Active Pharmaceutical Ingredients" },
            category: { type: Type.STRING, description: "Classification e.g. Pain Relief, Antibiotic, Gastrointestinal, Cardic, Vitamins, Cold Chain etc." },
            suggestedShelf: { type: Type.STRING, description: "Specific zone & shelf index. Must fit the zone taxonomy e.g., A-1, B-3, R-1" },
            suggestedMinStock: { type: Type.INTEGER, description: "Suggested safety threshold for re-stock alerts" },
            unit: { type: Type.STRING, description: "Unit e.g., Tablets, Capsules, Liquid (ml), Cream (g)" },
            price: { type: Type.NUMBER, description: "Approximate trade/base price in USD" },
            storageTemp: { type: Type.STRING, description: "Storage rule: Room Temp, Refrigerated (2-8°C), Cool Place (<15°C)" },
            notes: { type: Type.STRING, description: "Dosage indications or crucial tips" },
            explanation: { type: Type.STRING, description: "Explain why you placed it on this specific shelf zone and storage temp" }
          },
          required: ["name", "genericName", "category", "suggestedShelf", "suggestedMinStock", "unit", "price", "storageTemp", "explanation"]
        }
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    return res.json(parsedData);
  } catch (error) {
    console.error("Gemini API suggestion compilation failed: ", error);
    return res.status(500).json({
      error: "Could not generate AI suggestions.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Standalone smart search suggestion fallback
function getMockAISuggestion(query: string) {
  const norm = query.toLowerCase().trim();

  let name = query;
  let genericName = "Generic Active Compound";
  let category = "Vitamins & Supplements";
  let suggestedShelf = "S-1";
  let suggestedMinStock = 20;
  let unit = "Tablets";
  let price = 12.50;
  let storageTemp = "Room Temp";
  let explanation = "Classified as vitamin or supplement placed on Zone S.";
  let notes = "Standard daily dose or with meals.";

  if (norm.includes("para") || norm.includes("acet") || norm.includes("aspir") || norm.includes("ibu") || norm.includes("tyleno")) {
    name = norm.includes("para") ? "Paracetamol 500mg" : query;
    genericName = "Acetaminophen / Ibuprofen";
    category = "Pain Relief";
    suggestedShelf = "A-2";
    suggestedMinStock = 30;
    unit = "Tablets";
    price = 6.99;
    storageTemp = "Room Temp";
    notes = "Effective for fever reducing and moderate pain management.";
    explanation = "Inferred as an Analgesic/NSAID compound, assigned to shelf Zone A.";
  } else if (norm.includes("amox") || norm.includes("penic") || norm.includes("antibio") || norm.includes("cipro")) {
    name = norm.includes("amox") ? "Amoxicillin 250mg" : query;
    genericName = "Amoxicillin Trihydrate";
    category = "Antibiotics";
    suggestedShelf = "B-2";
    suggestedMinStock = 15;
    unit = "Capsules";
    price = 18.25;
    storageTemp = "Cool Place (<15°C)";
    notes = "Take the full course as directed by the physician.";
    explanation = "Recognized as antibacterial agent, mapped to sterile antibacterial stock Zone B.";
  } else if (norm.includes("insu") || norm.includes("lant") || norm.includes("huma")) {
    name = norm.includes("insu") ? "Insulin Glargine" : query;
    genericName = "Insulin recombinant DNA";
    category = "Cold Chain / Biologicals";
    suggestedShelf = "R-1";
    suggestedMinStock = 5;
    unit = "Injection";
    price = 45.00;
    storageTemp = "Refrigerated (2-8°C)";
    notes = "Do not freeze. Store in cold storage and keep away from sunlight.";
    explanation = "Inferred as high-sensitivity peptide hormone requiring cold-chain temperature control; allocated to refrigeration Zone R.";
  } else if (norm.includes("lip") || norm.includes("ator") || norm.includes("stat")) {
    name = norm.includes("ator") ? "Atorvastatin 20mg" : query;
    genericName = "Atorvastatin Calcium";
    category = "Cardiac & Diabetes";
    suggestedShelf = "E-2";
    suggestedMinStock = 15;
    unit = "Tablets";
    price = 32.40;
    storageTemp = "Room Temp";
    notes = "Cholesterol lowering medication. Administer at night.";
    explanation = "Cardiovascular lipid regulator mapped to chronic condition medication Zone E.";
  } else if (norm.includes("ome") || norm.includes("gastr") || norm.includes("acid")) {
    name = "Omeprazole 20mg";
    genericName = "Omeprazole Delayed-Release";
    category = "Gastrointestinal";
    suggestedShelf = "D-1";
    suggestedMinStock = 25;
    unit = "Capsules";
    price = 14.80;
    storageTemp = "Room Temp";
    notes = "Take 30 minutes before first meal of the day.";
    explanation = "Gastrointestinal active proton-pump inhibitor. Assigned to stomach health Zone D.";
  } else if (norm.includes("cream") || norm.includes("hydro") || norm.includes("gel") || norm.includes("betameth")) {
    category = "Dermatological";
    suggestedShelf = "F-1";
    unit = "Cream (g)";
    price = 9.80;
    explanation = "Topical skin medication classified under skincare Tube Zone F.";
  }

  return {
    name,
    genericName,
    category,
    suggestedShelf,
    suggestedMinStock,
    unit,
    price,
    storageTemp,
    notes,
    explanation
  };
}

// Vite integration middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middleware
    app.use(vite.middlewares);
  } else {
    // Serve static assets in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Medical Store backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
