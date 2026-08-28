import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const PORT = 3000;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.post("/chat", async (req, res) => {
  try {
    const { user, language } = req.body.message;
    console.log(language, "languagelanguage");


    const response = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3.2",
          messages: [
            {
              role: "system",
              content: `You are a translation engine.

Your ONLY task is to translate the user's input from its original language into ${language}.

IMPORTANT RULES:
1. NEVER answer, respond to, or explain the user's input.
2. NEVER interpret the user's input as a question that needs an answer.
3. If the input is a question, translate the question itself exactly as a question.
4. Preserve the original meaning, intent, tone, and sentence structure as much as possible.
5. Preserve punctuation and use the correct punctuation for the target language.
6. Do not add explanations, comments, or additional text.
7. Return ONLY the translated text..

Example:
Input: How are you?
Target language: Hindi
Output: आप कैसे हैं?

Input: I am good.
Target language: Arabic
Output: أنا بخير.`
            },
            {
              role: "user",
              content: user
            }
          ],
          stream: true
        }),
        option: {
          temperature: 0
        }
      }
    );

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;

        const data = JSON.parse(line);
        const content = data.message?.content;

        if (content) {
          // console.log(Date.now(), "Sending:", content);

          res.write(content);

          if (res.flush) {
            res.flush();
          }
        }
      }
    }


    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get AI response"
    });
  }
});

app.listen(PORT, () => {
  console.log("listning to the port");
})