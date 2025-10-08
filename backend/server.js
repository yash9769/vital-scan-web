const express = require('express');
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

require('dotenv').config({ path: './.env' });

// Initialize Gemini AI client
const { GoogleGenerativeAI } = require('@google/generative-ai');
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('Error: GEMINI_API_KEY environment variable is not set.');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Dataset and model storage
let dataset = [];
let trainedModel = null;
let modelAccuracy = null;
let normalizationStats = null;

// Load CSV data
function loadDataset() {
  const results = [];
  const csvPath = path.join(__dirname, '..', 'synthetic_diabetes_dataset.csv');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        dataset = results;
        console.log(`Loaded ${dataset.length} records from CSV`);
        resolve(dataset);
      })
      .on('error', reject);
  });
}

// Feature encoding maps (matching CSV values)
const genderMap = { 'Male': 1, 'Female': 0, 'Other': 0.5 };
const binaryMap = { 'Yes': 1, 'No': 0 };
const activityMap = { 'Low': 0, 'Medium': 1, 'High': 2 };
const dietMap = { 'Non-Vegetarian': 0, 'Vegetarian': 1, 'Vegan': 2 };
const smokingMap = { 'Never': 0, 'Current': 2, 'Former': 1 };
const alcoholMap = { 'None': 0, 'Moderate': 1, 'High': 2 };
const stressMap = { 'Low': 0, 'Medium': 1, 'High': 2 };

// Process data for training
function processData() {
  const features = [];
  const labels = [];
  const ages = [];
  const bmis = [];
  const cholesterols = [];
  const fastingSugars = [];
  const hba1cs = [];
  const heartRates = [];
  const waistHipRatios = [];

  // First pass: collect valid data and stats
  for (const row of dataset) {
    const age = parseFloat(row.Age);
    const bmi = parseFloat(row.BMI);
    const cholesterol = parseFloat(row.Cholesterol_Level);
    const fastingSugar = parseFloat(row.Fasting_Blood_Sugar);
    const hba1c = parseFloat(row.HBA1C);
    const heartRate = parseFloat(row.Heart_Rate);
    const waistHipRatio = parseFloat(row.Waist_Hip_Ratio);

    // Skip rows with invalid Age or BMI
    if (isNaN(age) || isNaN(bmi) || age <= 0 || bmi <= 0) {
      continue;
    }

    // Check other fields for validity
    if (!row.Gender || !row.Family_History || !row.Physical_Activity || !row.Diet_Type ||
        !row.Smoking_Status || !row.Alcohol_Intake || !row.Stress_Level || !row.Hypertension ||
        !row.Diabetes) {
      continue;
    }

    ages.push(age);
    bmis.push(bmi);
    if (!isNaN(cholesterol)) cholesterols.push(cholesterol);
    if (!isNaN(fastingSugar)) fastingSugars.push(fastingSugar);
    if (!isNaN(hba1c)) hba1cs.push(hba1c);
    if (!isNaN(heartRate)) heartRates.push(heartRate);
    if (!isNaN(waistHipRatio)) waistHipRatios.push(waistHipRatio);
  }

  // Calculate mean and std for normalization
  const ageMean = ages.reduce((a, b) => a + b, 0) / ages.length;
  const ageStd = Math.sqrt(ages.reduce((sum, val) => sum + Math.pow(val - ageMean, 2), 0) / ages.length);
  const bmiMean = bmis.reduce((a, b) => a + b, 0) / bmis.length;
  const bmiStd = Math.sqrt(bmis.reduce((sum, val) => sum + Math.pow(val - bmiMean, 2), 0) / bmis.length);
  const cholesterolMean = cholesterols.length > 0 ? cholesterols.reduce((a, b) => a + b, 0) / cholesterols.length : 0;
  const cholesterolStd = cholesterols.length > 0 ? Math.sqrt(cholesterols.reduce((sum, val) => sum + Math.pow(val - cholesterolMean, 2), 0) / cholesterols.length) : 1;
  const fastingSugarMean = fastingSugars.length > 0 ? fastingSugars.reduce((a, b) => a + b, 0) / fastingSugars.length : 0;
  const fastingSugarStd = fastingSugars.length > 0 ? Math.sqrt(fastingSugars.reduce((sum, val) => sum + Math.pow(val - fastingSugarMean, 2), 0) / fastingSugars.length) : 1;
  const hba1cMean = hba1cs.length > 0 ? hba1cs.reduce((a, b) => a + b, 0) / hba1cs.length : 0;
  const hba1cStd = hba1cs.length > 0 ? Math.sqrt(hba1cs.reduce((sum, val) => sum + Math.pow(val - hba1cMean, 2), 0) / hba1cs.length) : 1;
  const heartRateMean = heartRates.length > 0 ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length : 0;
  const heartRateStd = heartRates.length > 0 ? Math.sqrt(heartRates.reduce((sum, val) => sum + Math.pow(val - heartRateMean, 2), 0) / heartRates.length) : 1;
  const waistHipRatioMean = waistHipRatios.length > 0 ? waistHipRatios.reduce((a, b) => a + b, 0) / waistHipRatios.length : 0;
  const waistHipRatioStd = waistHipRatios.length > 0 ? Math.sqrt(waistHipRatios.reduce((sum, val) => sum + Math.pow(val - waistHipRatioMean, 2), 0) / waistHipRatios.length) : 1;

  // Second pass: process features with normalization
  for (const row of dataset) {
    const age = parseFloat(row.Age);
    const bmi = parseFloat(row.BMI);
    const cholesterol = parseFloat(row.Cholesterol_Level);
    const fastingSugar = parseFloat(row.Fasting_Blood_Sugar);
    const hba1c = parseFloat(row.HBA1C);
    const heartRate = parseFloat(row.Heart_Rate);
    const waistHipRatio = parseFloat(row.Waist_Hip_Ratio);

    if (isNaN(age) || isNaN(bmi) || age <= 0 || bmi <= 0) {
      continue;
    }

    if (!row.Gender || !row.Family_History || !row.Physical_Activity || !row.Diet_Type ||
        !row.Smoking_Status || !row.Alcohol_Intake || !row.Stress_Level || !row.Hypertension ||
        !row.Diabetes) {
      continue;
    }

    const normalizedAge = (age - ageMean) / ageStd;
    const normalizedBmi = (bmi - bmiMean) / bmiStd;
    const normalizedCholesterol = !isNaN(cholesterol) ? (cholesterol - cholesterolMean) / cholesterolStd : 0;
    const normalizedFastingSugar = !isNaN(fastingSugar) ? (fastingSugar - fastingSugarMean) / fastingSugarStd : 0;
    const normalizedHba1c = !isNaN(hba1c) ? (hba1c - hba1cMean) / hba1cStd : 0;
    const normalizedHeartRate = !isNaN(heartRate) ? (heartRate - heartRateMean) / heartRateStd : 0;
    const normalizedWaistHipRatio = !isNaN(waistHipRatio) ? (waistHipRatio - waistHipRatioMean) / waistHipRatioStd : 0;

    const feature = [
      normalizedAge,
      genderMap[row.Gender] || 0,
      normalizedBmi,
      binaryMap[row.Family_History] || 0,
      activityMap[row.Physical_Activity] || 0,
      dietMap[row.Diet_Type] || 0,
      smokingMap[row.Smoking_Status] || 0,
      alcoholMap[row.Alcohol_Intake] || 0,
      stressMap[row.Stress_Level] || 0,
      binaryMap[row.Hypertension] || 0,
      normalizedCholesterol,
      normalizedFastingSugar,
      normalizedHba1c,
      normalizedHeartRate,
      normalizedWaistHipRatio
    ];

    const label = binaryMap[row.Diabetes] || 0;

    features.push(feature);
    labels.push(label);
  }

  console.log(`Processed ${features.length} valid records out of ${dataset.length}`);
  console.log(`Age mean: ${ageMean.toFixed(2)}, std: ${ageStd.toFixed(2)}`);
  console.log(`BMI mean: ${bmiMean.toFixed(2)}, std: ${bmiStd.toFixed(2)}`);

  return { features, labels, stats: { ageMean, ageStd, bmiMean, bmiStd, cholesterolMean, cholesterolStd, fastingSugarMean, fastingSugarStd, hba1cMean, hba1cStd, heartRateMean, heartRateStd, waistHipRatioMean, waistHipRatioStd } };
}

// Simple logistic regression implementation
function trainLogisticRegression(features, labels, learningRate = 0.01, iterations = 1000) {
  const numFeatures = features[0].length;
  let weights = Array(numFeatures).fill(0);
  let bias = 0;

  for (let iter = 0; iter < iterations; iter++) {
    let totalError = 0;
    let gradientWeights = Array(numFeatures).fill(0);
    let gradientBias = 0;

    for (let i = 0; i < features.length; i++) {
      const z = features[i].reduce((sum, feature, idx) => sum + feature * weights[idx], 0) + bias;
      const prediction = sigmoid(z);

      const error = prediction - labels[i];
      totalError += error * error;

      for (let j = 0; j < numFeatures; j++) {
        gradientWeights[j] += error * features[i][j];
      }
      gradientBias += error;
    }

    // Update weights and bias
    for (let j = 0; j < numFeatures; j++) {
      weights[j] -= learningRate * gradientWeights[j] / features.length;
    }
    bias -= learningRate * gradientBias / features.length;
  }

  return { weights, bias };
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function predict(features, model) {
  const logits = features.reduce((sum, feature, idx) => sum + feature * model.weights[idx], 0) + model.bias;
  return sigmoid(logits);
}

// Train model on startup
async function trainModel() {
  try {
    await loadDataset();
    const { features, labels, stats } = processData();
    normalizationStats = stats;

    // Split data for training/testing (80/20)
    const splitIndex = Math.floor(features.length * 0.8);
    const trainFeatures = features.slice(0, splitIndex);
    const trainLabels = labels.slice(0, splitIndex);
    const testFeatures = features.slice(splitIndex);
    const testLabels = labels.slice(splitIndex);

    console.log('Training model...');
    trainedModel = trainLogisticRegression(trainFeatures, trainLabels, 0.01, 2000);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < testFeatures.length; i++) {
      const prediction = predict(testFeatures[i], trainedModel);
      const predictedLabel = prediction > 0.5 ? 1 : 0;
      if (predictedLabel === testLabels[i]) {
        correct++;
      }
    }

    modelAccuracy = (correct / testFeatures.length) * 100;
    console.log(`Model trained with ${modelAccuracy.toFixed(2)}% accuracy`);
  } catch (error) {
    console.error('Error training model:', error);
  }
}

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', datasetSize: dataset.length, modelTrained: !!trainedModel });
});

app.post('/api/predict', (req, res) => {
  try {
    const userData = req.body;

    // Map form values to CSV-compatible values
    const formToCsvMap = {
      dietType: {
        'Very Healthy': 'Vegan',
        'Balanced': 'Vegetarian',
        'Unhealthy': 'Non-Vegetarian'
      },
      smokingStatus: {
        'Smoker': 'Current',
        'Former Smoker': 'Former',
        'Non-Smoker': 'Never'
      },
      alcoholIntake: {
        'Yes': 'High',
        'Occasional': 'Moderate',
        'No': 'None'
      }
    };

    // Convert form data to CSV-compatible format
    const csvData = {
      ...userData,
      dietType: formToCsvMap.dietType[userData.dietType] || userData.dietType,
      smokingStatus: formToCsvMap.smokingStatus[userData.smokingStatus] || userData.smokingStatus,
      alcoholIntake: formToCsvMap.alcoholIntake[userData.alcoholIntake] || userData.alcoholIntake
    };

    // Normalize user age and bmi using training stats
    const normalizedAge = (csvData.age - normalizationStats.ageMean) / normalizationStats.ageStd;
    const normalizedBmi = (csvData.bmi - normalizationStats.bmiMean) / normalizationStats.bmiStd;

    // Encode user input using CSV-compatible data
    const features = [
      normalizedAge,
      genderMap[csvData.gender] || 0,
      normalizedBmi,
      binaryMap[csvData.familyHistory] || 0,
      activityMap[csvData.physicalActivity] || 0,
      dietMap[csvData.dietType] || 0,
      smokingMap[csvData.smokingStatus] || 0,
      alcoholMap[csvData.alcoholIntake] || 0,
      stressMap[csvData.stressLevel] || 0,
      binaryMap[csvData.hypertension] || 0,
      0, // normalizedCholesterol (using mean)
      0, // normalizedFastingSugar (using mean)
      0, // normalizedHba1c (using mean)
      0, // normalizedHeartRate (using mean)
      0  // normalizedWaistHipRatio (using mean)
    ];

    if (!trainedModel) {
      return res.status(500).json({ error: 'Model not trained yet' });
    }

    const riskProbability = predict(features, trainedModel);
    const riskPercentage = Math.round(riskProbability * 100);

    let riskLevel;
    if (riskProbability < 0.3) {
      riskLevel = 'Low';
    } else if (riskProbability < 0.7) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'High';
    }

    res.json({
      riskLevel,
      riskPercentage,
      modelUsed: 'trained',
      accuracy: modelAccuracy
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

const MODEL_NAME = 'models/gemini-2.5-flash'; // Valid Google Generative AI model

// Chatbot endpoint using Gemini AI
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Chatbot request received:', message);
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    console.log('Calling Gemini API with model:', MODEL_NAME);
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini response:', text);

    res.json({ reply: text });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Error communicating with AI' });
  }
});

// Start server and train model
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await trainModel();
});
