import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
const PORT = 3000;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.get("/stream", async (req, res) => {
    res.status(200);
  
    res.setHeader(
      "Content-Type",
      "text/plain; charset=utf-8"
    );
  
    res.setHeader(
      "Cache-Control",
      "no-cache, no-transform"
    );
  
    res.setHeader(
      "Connection",
      "keep-alive"
    );
  
    // Send headers immediately
    res.flushHeaders();
    res.write(" ".repeat(2048) + "\n");
  
    const stream = fs.createReadStream(
      "./docs/about_ai.txt",
      {
        encoding: "utf8",
        highWaterMark: 20,
      }
    );
  
    for await (const chunk of stream) {
        console.log(chunk ,Date.now())
        res.write(chunk);
        await new Promise((r) => setTimeout(r, 100)); // artificial delay, remove later
      }
      res.end();
  });

app.listen(PORT, () => {
    console.log("listning to the port");
})