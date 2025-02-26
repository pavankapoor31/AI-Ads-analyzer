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
// Configure Express and Multer
const app = (0, express_1.default)();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET,POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});
const upload = (0, multer_1.default)({ dest: "uploads/" });
const anthropic = new sdk_1.default();
// Streaming Claude API function
const asyncTalkToAI = async (messages, config = {}) => {
    const payload = {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 3000,
        messages: messages,
        ...config
    };
    const message = await anthropic.messages.create(payload);
    return message;
};
function parseAdReport(xmlString) {
    const result = {};
    // Extract hook section
    const hookMatch = xmlString.match(/<hook>[\s\S]*?<score>(.*?)<\/score>[\s\S]*?<what_works>([\s\S]*?)<\/what_works>[\s\S]*?<what_needs_improvement>([\s\S]*?)<\/what_needs_improvement>[\s\S]*?<\/hook>/);
    if (hookMatch) {
        result.hook = {
            score: hookMatch[1].trim(),
            whatWorks: hookMatch[2].trim().split('\n').map(item => item.trim()).filter(item => item.length > 0),
            whatNeedsImprovement: hookMatch[3].trim().split('\n').map(item => item.trim()).filter(item => item.length > 0)
        };
    }
    // Extract script section
    const scriptMatch = xmlString.match(/<script>[\s\S]*?<score>(.*?)<\/score>[\s\S]*?<what_works>([\s\S]*?)<\/what_works>[\s\S]*?<what_needs_improvement>([\s\S]*?)<\/what_needs_improvement>[\s\S]*?<\/script>/);
    if (scriptMatch) {
        result.script = {
            score: scriptMatch[1].trim(),
            whatWorks: scriptMatch[2].trim().split('\n').map(item => item.trim()).filter(item => item.length > 0),
            whatNeedsImprovement: scriptMatch[3].trim().split('\n').map(item => item.trim()).filter(item => item.length > 0)
        };
    }
    // Extract visuals section (note: may not have what_needs_improvement)
    const visualsMatch = xmlString.match(/<visuals>[\s\S]*?<score>(.*?)<\/score>[\s\S]*?<what_works>([\s\S]*?)<\/what_works>[\s\S]*?<\/visuals>/);
    if (visualsMatch) {
        result.visuals = {
            score: visualsMatch[1].trim(),
            whatWorks: visualsMatch[2].trim().split('\n').map(item => item.trim()).filter(item => item.length > 0)
        };
    }
    // Extract captions section
    const captionsMatch = xmlString.match(/<captions>[\s\S]*?<score>(.*?)<\/score>[\s\S]*?<what_works>([\s\S]*?)<\/what_works>[\s\S]*?<what_needs_improvement>([\s\S]*?)<\/what_needs_improvement>[\s\S]*?<\/captions>/);
    if (captionsMatch) {
        result.captions = {
            score: captionsMatch[1].trim(),
            whatWorks: captionsMatch[2].trim().split('\n').map(item => item.trim()).filter(item => item.length > 0),
            whatNeedsImprovement: captionsMatch[3].trim().split('\n').map(item => item.trim()).filter(item => item.length > 0)
        };
    }
    // Extract summary
    const summaryMatch = xmlString.match(/<summary>([\s\S]*?)<\/summary>/);
    if (summaryMatch) {
        result.summary = summaryMatch[1].trim();
    }
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
  1. Ensure the response is **well-structured** using XML-like tags.
  2. Keep the **scores realistic** (out of 50).
  3. Focus on **advertising effectiveness**.
  4. **Do not add extra text outside the structured format.**`;
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
                            "text": "Analyze this advertisement image."
                        }
                    ]
                }
            ]
        };
        // Fixed spread operator usage with proper array and object arguments
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
        // Get response from Claude (fixed streaming approach)
        const response = await streamClaudeResponse(imageBase64, fileType);
        console.log(response);
        const textContent = response?.find((item) => item?.type === "text")?.text || "";
        const parsedData = parseAdReport(textContent);
        res.json({ analysis: parsedData });
        // Return the response as JSON
        // res.json({ analysis: response });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
    finally {
        // Delete the uploaded file to save space
        if (req.file) {
            fs_1.default.unlink(req.file.path, (err) => {
                if (err)
                    console.error("Failed to delete uploaded file:", err);
            });
        }
    }
});
const port = process.env.PORT || 3000;
// Start Server
app.listen(port, () => console.log("Server running on port 3000"));
