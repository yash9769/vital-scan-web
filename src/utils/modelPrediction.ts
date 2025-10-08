import { HealthData } from '@/pages/DiabetesAssessment';
import { datasetProcessor } from './datasetProcessor';

interface RiskFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface RiskResult {
  riskLevel: 'Low' | 'Medium' | 'High';
  riskPercentage: number;
  factors: RiskFactor[];
  recommendations: string[];
  modelUsed: 'trained' | 'rule-based';
}

export async function predictDiabetesRisk(data: HealthData): Promise<RiskResult> {
  try {
    // Try to get prediction from backend API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('http://localhost:3001/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      return {
        riskLevel: result.riskLevel,
        riskPercentage: result.riskPercentage,
        factors: generateFactors(data),
        recommendations: generateRecommendations(data, result.riskLevel),
        modelUsed: 'trained'
      };
    }
  } catch (error) {
    console.warn('Backend not available or timeout, falling back to rule-based:', error);
  }

  // Fall back to rule-based prediction
  return useRuleBasedModel(data);
}

function useTrainedModel(data: HealthData, model: { weights: number[]; bias: number }, accuracy: string | null): RiskResult {
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
    ...data,
    dietType: formToCsvMap.dietType[data.dietType as keyof typeof formToCsvMap.dietType] || data.dietType,
    smokingStatus: formToCsvMap.smokingStatus[data.smokingStatus as keyof typeof formToCsvMap.smokingStatus] || data.smokingStatus,
    alcoholIntake: formToCsvMap.alcoholIntake[data.alcoholIntake as keyof typeof formToCsvMap.alcoholIntake] || data.alcoholIntake
  };

  // Encode the input data the same way as training data (matching CSV values and backend)
  const genderMap = { 'Male': 1, 'Female': 0 };
  const binaryMap = { 'Yes': 1, 'No': 0 };
  const activityMap = { 'Low': 0, 'Moderate': 1, 'High': 2 };
  const dietMap = { 'Non-Vegetarian': 0, 'Vegetarian': 1, 'Vegan': 2 };
  const smokingMap = { 'Current': 2, 'Former': 1, 'Never': 0 };
  const alcoholMap = { 'High': 2, 'Moderate': 1, 'None': 0 };
  const stressMap = { 'High': 2, 'Medium': 1, 'Low': 0 };

  const features = [
    csvData.age,
    genderMap[csvData.gender as keyof typeof genderMap] ?? 0,
    csvData.bmi,
    binaryMap[csvData.familyHistory as keyof typeof binaryMap] ?? 0,
    activityMap[csvData.physicalActivity as keyof typeof activityMap] ?? 0,
    dietMap[csvData.dietType as keyof typeof dietMap] ?? 0,
    smokingMap[csvData.smokingStatus as keyof typeof smokingMap] ?? 0,
    alcoholMap[csvData.alcoholIntake as keyof typeof alcoholMap] ?? 0,
    stressMap[csvData.stressLevel as keyof typeof stressMap] ?? 0,
    binaryMap[csvData.hypertension as keyof typeof binaryMap] ?? 0
  ];

  // Make prediction using the trained model
  const riskProbability = datasetProcessor.predict(features, model);
  const riskPercentage = Math.round(riskProbability * 100);

  // Determine risk level based on probability
  let riskLevel: 'Low' | 'Medium' | 'High';
  if (riskProbability < 0.3) {
    riskLevel = 'Low';
  } else if (riskProbability < 0.7) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'High';
  }

  // Generate factors and recommendations based on the input data
  const factors = generateFactors(data);
  const recommendations = generateRecommendations(data, riskLevel);

  return {
    riskLevel,
    riskPercentage,
    factors,
    recommendations: [
      `Prediction made using trained ML model (${accuracy ? `${parseFloat(accuracy).toFixed(1)}% accuracy` : 'accuracy unknown'})`,
      ...recommendations
    ],
    modelUsed: 'trained'
  };
}

function useRuleBasedModel(data: HealthData): RiskResult {
  // Import the original rule-based calculation
  const { calculateDiabetesRisk } = require('./diabetesPrediction');
  const result = calculateDiabetesRisk(data);
  
  return {
    ...result,
    recommendations: [
      'Prediction made using rule-based algorithm',
      ...result.recommendations
    ],
    modelUsed: 'rule-based'
  };
}

function generateFactors(data: HealthData): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // Age factor
  if (data.age >= 45) {
    factors.push({
      name: 'Age Factor',
      impact: 'negative',
      description: `Age ${data.age} increases diabetes risk significantly after 45`
    });
  } else if (data.age >= 35) {
    factors.push({
      name: 'Age Factor',
      impact: 'negative',
      description: `Age ${data.age} shows moderate increased risk`
    });
  } else {
    factors.push({
      name: 'Age Factor',
      impact: 'positive',
      description: `Age ${data.age} is associated with lower diabetes risk`
    });
  }

  // BMI factor
  if (data.bmi >= 30) {
    factors.push({
      name: 'BMI (Obesity)',
      impact: 'negative',
      description: `BMI of ${data.bmi} indicates obesity, a major diabetes risk factor`
    });
  } else if (data.bmi >= 25) {
    factors.push({
      name: 'BMI (Overweight)',
      impact: 'negative',
      description: `BMI of ${data.bmi} indicates overweight status, increasing diabetes risk`
    });
  } else if (data.bmi >= 18.5) {
    factors.push({
      name: 'BMI (Healthy)',
      impact: 'positive',
      description: `BMI of ${data.bmi} is in the healthy range, reducing diabetes risk`
    });
  }

  // Add other factors based on user input
  if (data.familyHistory === 'Yes') {
    factors.push({
      name: 'Family History',
      impact: 'negative',
      description: 'Family history of diabetes significantly increases your risk'
    });
  }

  if (data.physicalActivity === 'Low') {
    factors.push({
      name: 'Physical Activity',
      impact: 'negative',
      description: 'Low physical activity increases diabetes risk'
    });
  } else if (data.physicalActivity === 'High') {
    factors.push({
      name: 'Physical Activity',
      impact: 'positive',
      description: 'High physical activity significantly reduces diabetes risk'
    });
  }

  if (data.hypertension === 'Yes') {
    factors.push({
      name: 'Hypertension',
      impact: 'negative',
      description: 'High blood pressure significantly increases diabetes risk'
    });
  }

  return factors;
}

function generateRecommendations(data: HealthData, riskLevel: string): string[] {
  const recommendations: string[] = [];

  // General recommendations based on risk level
  if (riskLevel === 'Low') {
    recommendations.push('Maintain your current healthy lifestyle habits');
    recommendations.push('Continue regular health check-ups every 2-3 years');
  } else if (riskLevel === 'Medium') {
    recommendations.push('Schedule a consultation with your healthcare provider within 6 months');
    recommendations.push('Consider annual diabetes screening');
  } else {
    recommendations.push('Schedule an urgent consultation with your healthcare provider');
    recommendations.push('Request comprehensive diabetes screening including HbA1c and fasting glucose tests');
  }

  // Specific recommendations based on risk factors
  if (data.bmi >= 25) {
    recommendations.push('Work with a healthcare provider to develop a sustainable weight management plan');
  }

  if (data.physicalActivity === 'Low') {
    recommendations.push('Aim for at least 150 minutes of moderate-intensity exercise per week');
  }

  if (data.dietType === 'Unhealthy') {
    recommendations.push('Focus on whole foods: vegetables, lean proteins, whole grains, and healthy fats');
  }

  if (data.smokingStatus === 'Smoker') {
    recommendations.push('Consider smoking cessation programs - quitting reduces diabetes risk within years');
  }

  if (data.stressLevel === 'High') {
    recommendations.push('Practice stress management techniques like meditation, yoga, or deep breathing');
  }

  return recommendations;
}