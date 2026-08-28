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
    const { user } = req.body.message;

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
              content: "You are an AI assistant explaining things to beginners. Answer should not exceed 20 words"
            },
            {
              role: "user",
              content: user
            }
          ],
          stream: true
        })
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
          console.log(Date.now(), "Sending:", content);
    
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