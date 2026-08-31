import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const PORT = 3000;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const conversationHistory = {};


const summarizeHistory = async (history) => {
  try {
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
              content: `
You are a conversation summarizer.

Summarize the conversation concisely.

Preserve:
- Important facts
- Important decisions
- Relevant user information
- Important context needed to continue the conversation

Remove:
- Greetings
- Pleasantries
- Repetition
- Irrelevant information

Return only the summary.
              `
            },
            {
              role: "user",
              content: JSON.stringify(history)
            }
          ],

          stream: false,

          options: {
            temperature: 0
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to summarize conversation");
    }

    const data = await response.json();

    return data.message.content;

  } catch (error) {
    console.error("Summarization error:", error);
    return null;
  }
};


app.post("/chat", async (req, res) => {

  try {

    const { user, convoId } = req.body.message;

    if (!user || !convoId) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }


    // Create conversation
    if (!conversationHistory[convoId]) {

      conversationHistory[convoId] = {
        summary: "",
        messages: []
      };

    }


    const conversation = conversationHistory[convoId];

    const history = conversation.messages;


    // Add current user message
    history.push({
      role: "user",
      content: user
    });


    if (history.length > 10) {

      console.log("Starting summarization...");

      const oldMessages = history.slice(0, -4);

      const recentMessages = history.slice(-4);


      const summary = await summarizeHistory(oldMessages);


      if (summary) {

        conversation.summary = summary;

        conversation.messages = recentMessages;

      }

    }

    const messages = [

      {           
        role: "system",
        content: `
          You are a helpful assistant.

          Here is the summary of the earlier conversation:

          ${conversation.summary}
        ` 
      },

      ...conversation.messages

    ];


    // Call main LLM
    const response = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "llama3.2",

          messages,

          stream: false,

          options: {
            temperature: 0
          }
        })
      }
    );


    if (!response.ok) {
      throw new Error("Ollama request failed");
    }


    const data = await response.json();


    const assistantMessage = data.message.content;


    // Store assistant response
    conversation.messages.push({
      role: "assistant",
      content: assistantMessage
    });


    res.json({
      message: assistantMessage
    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to get AI response"
    });

  }

});


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});