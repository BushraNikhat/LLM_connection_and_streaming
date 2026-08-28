const response = await fetch("http://localhost:3000/stream");
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(Date.now(), JSON.stringify(decoder.decode(value, { stream: true })));
}