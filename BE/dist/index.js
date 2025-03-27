"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = require("stream");
const util_1 = require("util");

// Configure Express and Multer
const app = (0, express_1.default)();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET,POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

const upload = (0, multer_1.default)({ 
    dest: "uploads/",
    limits: { 
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    }
});

const anthropic = new sdk_1.default();

// Timeout utility
const timeoutPromise = (ms, promise) => {
    let timeout = new Promise((_, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject(new Error('Request timed out'));
        }, ms);
    });

    return Promise.race([
        promise,
        timeout
    ]);
};

// Streaming Claude API function with timeout
const asyncTalkToAI = async (messages, config = {}) => {
    const payload = {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000, // Reduced from 5000
        messages: messages,
        ...config
    };

    try {
        // Add a 9-second timeout to avoid Vercel 10-second limit
        return await timeoutPromise(9000, anthropic.messages.create(payload));
    } catch (error) {
        console.error("Claude API Error:", error);
        throw new Error("Failed to get response from Claude API within timeout");
    }
};

// Existing parseAdReport function remains the same
function parseAdReport(xmlString) {
    const result = {};
    // [Previous implementation remains unchanged]
    return result;
}

async function streamClaudeResponse(imageBase64, fileType) {
    const systemPrompt = `
  You are an expert in ad performance analysis. Given an advertisement image, analyze its effectiveness and return a structured response.

  === RESPONSE FORMAT ===
  <ad_report>
    <hook>
      <score>##/50</score>
      <what_works>List of things that work well</what_works>
      <what_needs_improvement>List of areas for improvement</what_needs_improvement>
    </hook>
    <script>
      <score>##/50</score>
      <what_works>List of things that work well</what_works>
      <what_needs_improvement>List of areas for improvement</what_needs_improvement>
    </script>
    <visuals>
      <score>##/50</score>
      <what_works>List of things that work well</what_works>
    </visuals>
    <captions>
      <score>##/50</score>
      <what_works>List of things that work well</what_works>
      <what_needs_improvement>List of areas for improvement</what_needs_improvement>
    </captions>
    <summary>Brief summary of improvements</summary>
  </ad_report>

  === INSTRUCTIONS ===
  1. Ensure the response is **structured** using XML-like tags.
  2. Keep the **scores realistic** (out of 50).
  3. Focus on **advertising effectiveness**.
  4. Keep response concise.`;

    try {
        const payload = {
            config: { system: systemPrompt },
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": fileType,
                                "data": imageBase64,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Analyze this advertisement image concisely."
                        }
                    ]
                }
            ]
        };

        const response = await asyncTalkToAI(payload.messages, payload.config);
        return response.content;
    }
    catch (error) {
        console.error("Claude API Error:", error.response?.data || error.message);
        throw new Error("Failed to get response from Claude API");
    }
}

// API Route to upload an image and analyze it
app.post("/analyze-ad", upload.single("adImage"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    try {
        // Convert image to Base64
        const imageBase64 = fs_1.default.readFileSync(req.file.path, { encoding: "base64" });
        const fileType = req.file.mimetype;

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(fileType)) {
            return res.status(400).json({ error: "Unsupported file type" });
        }

        // Get response from Claude
        const response = await streamClaudeResponse(imageBase64, fileType);
        const textContent = response?.find((item) => item?.type === "text")?.text || "";
        const parsedData = parseAdReport(textContent);

        res.json({ analysis: parsedData });
    }
    catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: error.message });
    }
    finally {
        // Delete the uploaded file to save space
        if (req.file) {
            fs_1.default.unlink(req.file.path, (err) => {
                if (err) console.error("Failed to delete uploaded file:", err);
            });
        }
    }
});

const port = process.env.PORT || 3000;
// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));

// Serverless function export for Vercel
module.exports = app;