import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSend = async () => {
    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: { user: message, convoId: "123" }
        })
      });
      const data = await response.json();
      
      setAnswer(data?.message || "No response from AI");

    } catch (error) {
      console.error("Error:", error)
    }
  };


  return (
    <div>
      <h1>Simple AI Chat</h1>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
      />

      <button onClick={handleSend}>
        Send
      </button>
      {/* <select value={language} onChange={handleChange}>
        <option value="">Select Language</option>
        <option value="Hindi">Hindi</option>
        <option value="Arabic">Arabic</option>
        <option value="Bangla">Bangla</option>
        <option value="Spanish">Spanish</option>
      </select> */}
      {/* <h3>AI Response:</h3>
      <h1>Simple streamer</h1>
      <button onClick={handleGet}>Read Stream</button> */}
      <p>{answer}</p>
    </div>
  );
}

export default App;