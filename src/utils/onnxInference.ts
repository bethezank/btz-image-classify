// 13. onnxruntime-web
import * as ort from 'onnxruntime-web';

interface PredictionResult {
  className: string;
  probability: number;
}

export const loadONNXModel = async (modelFile: File): Promise<ort.InferenceSession> => {
  const arrayBuffer = await modelFile.arrayBuffer();
  const session = await ort.InferenceSession.create(arrayBuffer);
  return session;
};

export const loadClassLabels = async (classFile: File): Promise<string[]> => {
  const text = await classFile.text();
  const classData = JSON.parse(text);
  return Array.isArray(classData) ? classData : Object.values(classData);
};

export const preprocessImage = async (
  imageFile: File,
  targetSize: number = 227
): Promise<ort.Tensor> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // mean จาก Netron (data_Mean)
    const mean = [113.84185, 107.20119, 100.25863]; // R, G, B

    img.onload = () => {
      canvas.width = targetSize;
      canvas.height = targetSize;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      const imageData = ctx.getImageData(0, 0, targetSize, targetSize);

      // Channel-first: [1, 3, height, width]
      const red: number[] = [];
      const green: number[] = [];
      const blue: number[] = [];

      for (let i = 0; i < imageData.data.length; i += 4) {
        // ลบ mean ต่อ channel
        red.push(imageData.data[i]     - mean[0]); // R
        green.push(imageData.data[i+1] - mean[1]); // G
        blue.push(imageData.data[i+2] - mean[2]); // B
      }

      // รวมเป็น [R...G...B...] -> NCHW
      const transposedData = red.concat(green).concat(blue);
      const float32Data = Float32Array.from(transposedData);

      const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, targetSize, targetSize]);
      resolve(inputTensor);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
};


export const runInference = async (
  session: ort.InferenceSession,
  inputTensor: ort.Tensor,
  classLabels: string[],
  topK: number = 5
): Promise<PredictionResult[]> => {
  const feeds: Record<string, ort.Tensor> = {};
  feeds[session.inputNames[0]] = inputTensor;

  const results = await session.run(feeds);
  const output = results[session.outputNames[0]];

  const predictions: PredictionResult[] = [];
  const outputData = output.data as Float32Array;

  const probabilities = Array.from(outputData);
  const indices = probabilities
    .map((prob, index) => ({ prob, index }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, topK);

  for (const { prob, index } of indices) {
    predictions.push({
      className: classLabels[index] || `Class ${index}`,
      probability: prob,
    });
  }

  return predictions;
};
