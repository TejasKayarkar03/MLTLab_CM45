let originalModel, loadedModel;

async function trainOriginal() {
  document.getElementById("status").innerText = "Training original model...";

  originalModel = tf.sequential();
  originalModel.add(tf.layers.dense({ units: 1, inputShape: [1] }));

  originalModel.compile({
    loss: 'meanSquaredError',
    optimizer: 'sgd'
  });

  const xs = tf.tensor2d([1,2,3,4],[4,1]);
  const ys = tf.tensor2d([2,4,6,8],[4,1]);

  await originalModel.fit(xs, ys, { epochs: 100 });

  await originalModel.save('localstorage://my-model');

  document.getElementById("status").innerText =
    "✅ Original model trained & saved!";
}

async function loadModel() {
  loadedModel = await tf.loadLayersModel('localstorage://my-model');

  document.getElementById("status").innerText =
    "📥 Model loaded from LocalStorage!";
}

async function compare() {
  const val = parseFloat(document.getElementById("inputValue").value);

  if (!originalModel || !loadedModel) {
    document.getElementById("status").innerText =
      "⚠ Train and load model first!";
    return;
  }

  const input = tf.tensor2d([val], [1,1]);

  const o1 = await originalModel.predict(input).data();
  const o2 = await loadedModel.predict(input).data();

  const originalVal = o1[0];
  const loadedVal = o2[0];
  const diff = Math.abs(originalVal - loadedVal);

  document.getElementById("original").innerText =
    originalVal.toFixed(2);

  document.getElementById("loaded").innerText =
    loadedVal.toFixed(2);

  document.getElementById("difference").innerText =
    "Difference: " + diff.toFixed(4);

  if (diff < 0.05) {
    document.getElementById("status").innerText =
      "🟢 MATCH: Predictions are consistent!";
  } else {
    document.getElementById("status").innerText =
      "🔴 NOT MATCH: Something is wrong!";
  }
}