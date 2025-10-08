interface DiabetesData {
  Age: number;
  Gender: string;
  BMI: number;
  Family_History: string;
  Physical_Activity: string;
  Diet_Type: string;
  Smoking_Status: string;
  Alcohol_Intake: string;
  Stress_Level: string;
  Hypertension: string;
  Diabetes: string;
}

interface ProcessedData {
  features: number[][];
  labels: number[];
  featureNames: string[];
  statistics: {
    totalSamples: number;
    diabetesRate: number;
    ageStats: { mean: number; std: number };
    bmiStats: { mean: number; std: number };
  };
}

export class DatasetProcessor {
  private data: DiabetesData[] = [];
  
  loadData(dataset: DiabetesData[]) {
    this.data = dataset;
  }

  processData(): ProcessedData {
    if (this.data.length === 0) {
      throw new Error('No data loaded');
    }

    const features: number[][] = [];
    const labels: number[] = [];

    // Feature encoding maps (matching CSV values and backend)
    const genderMap = { 'Male': 1, 'Female': 0 };
    const binaryMap = { 'Yes': 1, 'No': 0 };
    const activityMap = { 'Low': 0, 'Moderate': 1, 'High': 2 };
    const dietMap = { 'Non-Vegetarian': 0, 'Vegetarian': 1, 'Vegan': 2 };
    const smokingMap = { 'Current': 2, 'Former': 1, 'Never': 0 };
    const alcoholMap = { 'High': 2, 'Moderate': 1, 'None': 0 };
    const stressMap = { 'High': 2, 'Medium': 1, 'Low': 0 };

    for (const row of this.data) {
      const feature = [
        row.Age,
        genderMap[row.Gender as keyof typeof genderMap] ?? 0,
        row.BMI,
        binaryMap[row.Family_History as keyof typeof binaryMap] ?? 0,
        activityMap[row.Physical_Activity as keyof typeof activityMap] ?? 0,
        dietMap[row.Diet_Type as keyof typeof dietMap] ?? 0,
        smokingMap[row.Smoking_Status as keyof typeof smokingMap] ?? 0,
        alcoholMap[row.Alcohol_Intake as keyof typeof alcoholMap] ?? 0,
        stressMap[row.Stress_Level as keyof typeof stressMap] ?? 0,
        binaryMap[row.Hypertension as keyof typeof binaryMap] ?? 0
      ];

      const label = binaryMap[row.Diabetes as keyof typeof binaryMap] ?? 0;

      features.push(feature);
      labels.push(label);
    }

    // Calculate statistics
    const ages = this.data.map(d => d.Age);
    const bmis = this.data.map(d => d.BMI);
    const diabetesCount = labels.reduce((sum, label) => sum + label, 0);

    const ageStats = {
      mean: ages.reduce((sum, age) => sum + age, 0) / ages.length,
      std: Math.sqrt(ages.reduce((sum, age) => sum + Math.pow(age - ages.reduce((s, a) => s + a, 0) / ages.length, 2), 0) / ages.length)
    };

    const bmiStats = {
      mean: bmis.reduce((sum, bmi) => sum + bmi, 0) / bmis.length,
      std: Math.sqrt(bmis.reduce((sum, bmi) => sum + Math.pow(bmi - bmis.reduce((s, b) => s + b, 0) / bmis.length, 2), 0) / bmis.length)
    };

    return {
      features,
      labels,
      featureNames: [
        'Age', 'Gender', 'BMI', 'Family_History', 'Physical_Activity',
        'Diet_Type', 'Smoking_Status', 'Alcohol_Intake', 'Stress_Level', 'Hypertension'
      ],
      statistics: {
        totalSamples: this.data.length,
        diabetesRate: diabetesCount / labels.length,
        ageStats,
        bmiStats
      }
    };
  }

  // Simple logistic regression implementation for browser
  trainModel(features: number[][], labels: number[], learningRate = 0.01, iterations = 1000) {
    const numFeatures = features[0].length;
    let weights = Array(numFeatures).fill(0);
    let bias = 0;

    for (let iter = 0; iter < iterations; iter++) {
      let totalError = 0;
      let gradientWeights = Array(numFeatures).fill(0);
      let gradientBias = 0;

      for (let i = 0; i < features.length; i++) {
        const prediction = this.sigmoid(
          features[i].reduce((sum, feature, idx) => sum + feature * weights[idx], 0) + bias
        );
        
        const error = prediction - labels[i];
        totalError += error * error;

        // Calculate gradients
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

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  predict(features: number[], model: { weights: number[]; bias: number }): number {
    const logits = features.reduce((sum, feature, idx) => sum + feature * model.weights[idx], 0) + model.bias;
    return this.sigmoid(logits);
  }
}

export const datasetProcessor = new DatasetProcessor();