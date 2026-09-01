

const cosineSimilarity = (a, b) => {

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {

    dotProduct += a[i] * b[i];

    magnitudeA += a[i] * a[i];

    magnitudeB += b[i] * b[i];

  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) *
     Math.sqrt(magnitudeB))
  );
};


const getEmbedding = async (text) => {

    const response = await fetch("http://localhost:11434/api/embed", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
        model: "nomic-embed-text",
        input: text
      })
    });
    
    const data = await response.json();
    return data["embeddings"][0];
}

const a = await getEmbedding(
  "How many vacation days do employees get?"
);

const b = await getEmbedding(
  "What is the annual leave entitlement for employees?"
);

const c = await getEmbedding(
  "I love pizza and ice cream in holidays."
);


console.log(
  "A vs B:",
  cosineSimilarity(a, b)
);

console.log(
  "A vs C:",
  cosineSimilarity(a, c)
);