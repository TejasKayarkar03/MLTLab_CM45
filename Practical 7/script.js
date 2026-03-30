let model;

// Train Model
async function trainModel() {
  document.getElementById("status").innerText = "📌 Status: Training...";

  model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

  model.compile({
    loss: 'meanSquaredError',
    optimizer: 'sgd'
  });

  const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
  const ys = tf.tensor2d([2, 4, 6, 8], [4, 1]);

  await model.fit(xs, ys, { epochs: 100 });

  document.getElementById("status").innerText =
    "📌 Status:  Model Trained Successfully";
}

// Save Model
async function saveModel() {
  if (!model) {
    document.getElementById("status").innerText =
      "⚠ Please train model first!";
    return;
  }

  await model.save('downloads://my-model');

  document.getElementById("modelStatus").innerText =
    " Model: Saved (model.json + weights.bin)";
}

// Load Model
async function loadModel() {
  document.getElementById("status").innerText =
    "📌 Status: Loading Model...";

  model = await tf.loadLayersModel('model.json');

  document.getElementById("status").innerText =
    "📌Status: ✅ Model Loaded Successfully";

  document.getElementById("modelStatus").innerText =
    " Model: Saved & Reloaded";
}

// Predict
async function predict() {
  if (!model) {
    document.getElementById("status").innerText =
      "⚠ Load or train model first!";
    return;
  }

  const value = document.getElementById("inputValue").value;

  if (value === "") {
    document.getElementById("status").innerText =
      "⚠ Please enter a value!";
    return;
  }

  document.getElementById("inputDisplay").innerText =
    "🔢 Input Value: " + value;

  const input = tf.tensor2d([parseFloat(value)], [1, 1]);
  const output = model.predict(input);
  const result = await output.data();

  document.getElementById("result").innerText =
    result[0].toFixed(2);

  document.getElementById("finalStatus").innerText =
    "⚡ Result: Prediction Successful ✅";
}