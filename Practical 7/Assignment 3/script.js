let model;

// Train Model
async function trainModel() {
  document.getElementById("status").innerText =
    "📌 Status: Training...";

  model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

  model.compile({
    loss: 'meanSquaredError',
    optimizer: 'sgd'
  });

  const xs = tf.tensor2d([1,2,3,4],[4,1]);
  const ys = tf.tensor2d([2,4,6,8],[4,1]);

  await model.fit(xs, ys, { epochs: 100 });

  document.getElementById("status").innerText =
    "✅ Model Trained Successfully";
}

// Export Model
async function saveModel() {
  if (!model) {
    document.getElementById("status").innerText =
      "⚠ Train model first!";
    return;
  }

  await model.save('downloads://my-model');

  document.getElementById("status").innerText =
    "📁 Model Exported (Downloaded)";
}

// Import Model
async function loadModel() {
  document.getElementById("status").innerText =
    "📥 Importing model...";

  model = await tf.loadLayersModel('model.json');

  document.getElementById("status").innerText =
    "✅ Model Imported Successfully";
}

// Predict + Add to History
async function predict() {
  if (!model) {
    document.getElementById("status").innerText =
      "⚠ Load or train model first!";
    return;
  }

  const val = document.getElementById("inputValue").value;

  if (val === "") {
    document.getElementById("status").innerText =
      "⚠ Enter a value!";
    return;
  }

  const input = tf.tensor2d([parseFloat(val)], [1,1]);
  const output = model.predict(input);
  const result = await output.data();

  // Create history card
  const card = document.createElement("div");
  card.className = "history-card";

  card.innerHTML = `
    <span>${val}</span>
    ➜
    <span>${result[0].toFixed(2)}</span>
  `;

  // Add to top (latest first)
  const historyDiv = document.getElementById("history");
  historyDiv.prepend(card);

  document.getElementById("status").innerText =
    "✨ Prediction Added to History!";
}