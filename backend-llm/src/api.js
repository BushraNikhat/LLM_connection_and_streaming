import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const PORT = 3000;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const conversationHistory = {};

app.post("/chat", async (req, res) => {
  try {
    const { user, convoId } = req.body.message;
    if(!user || !convoId) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    if(!conversationHistory[convoId]) {
      conversationHistory[convoId] = []
    }
    // console.log(conversationHistory,"converstationhistory");
    const history = conversationHistory[convoId];
    history.push({ role: "user", content: user });


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
              content: `You are a helpful assistant.`
            },
            ...history.slice(-10)
          ],
          stream: false
        }),
        option: {
          temperature: 0
        }
      }
    );
    const data = await response.json();
    history.push(data.message);

    console.log(history.slice(-10), "history");


    res.send(data);

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