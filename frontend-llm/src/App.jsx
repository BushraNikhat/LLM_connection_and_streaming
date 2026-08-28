import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [language, setLanguage] = useState("");

  // const handleGet = async () => {
  //   try {
  //     setAnswer("");

  //     const response = await fetch(
  //       "http://localhost:3000/stream"
  //     );

  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder();

  //     while (true) {
  //       const { done, value } = await reader.read();

  //       if (done) break;

  //       const chunk = decoder.decode(value, {
  //         stream: true,
  //       });

  //       setAnswer((prev) => prev + chunk);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleSend = async () => {
    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: { user: message, language }
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setAnswer("");

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);

        console.log(Date.now(), "Received:", chunk);

        setAnswer((prev) => prev + chunk);
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleChange = (e) => {
    setLanguage(e.target.value);
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
      <select value={language} onChange={handleChange}>
        <option value="">Select Language</option>
        <option value="Hindi">Hindi</option>
        <option value="Arabic">Arabic</option>
        <option value="Bangla">Bangla</option>
        <option value="Spanish">Spanish</option>
      </select>
      {/* <h3>AI Response:</h3>
      <h1>Simple streamer</h1>
      <button onClick={handleGet}>Read Stream</button> */}
      <p>{answer}</p>
    </div>
  );
}

export default App;