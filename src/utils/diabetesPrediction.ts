import { HealthData } from '@/pages/DiabetesAssessment';

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
}

export function calculateDiabetesRisk(data: HealthData): RiskResult {
  let riskScore = 0;
  const factors: RiskFactor[] = [];
  const recommendations: string[] = [];

  // Age factor (0-20 points)
  if (data.age >= 45) {
    riskScore += 15;
    factors.push({
      name: 'Age Factor',
      impact: 'negative',
      description: `Age ${data.age} increases diabetes risk significantly after 45`
    });
  } else if (data.age >= 35) {
    riskScore += 8;
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

  // BMI factor (0-25 points)
  if (data.bmi >= 30) {
    riskScore += 25;
    factors.push({
      name: 'BMI (Obesity)',
      impact: 'negative',
      description: `BMI of ${data.bmi} indicates obesity, a major diabetes risk factor`
    });
    recommendations.push('Work with a healthcare provider to develop a sustainable weight management plan');
    recommendations.push('Consider consulting with a registered dietitian for personalized nutrition guidance');
  } else if (data.bmi >= 25) {
    riskScore += 15;
    factors.push({
      name: 'BMI (Overweight)',
      impact: 'negative',
      description: `BMI of ${data.bmi} indicates overweight status, increasing diabetes risk`
    });
    recommendations.push('Aim for gradual weight loss through balanced diet and regular exercise');
  } else if (data.bmi >= 18.5) {
    factors.push({
      name: 'BMI (Healthy)',
      impact: 'positive',
      description: `BMI of ${data.bmi} is in the healthy range, reducing diabetes risk`
    });
  } else {
    factors.push({
      name: 'BMI (Underweight)',
      impact: 'neutral',
      description: `BMI of ${data.bmi} is below normal range`
    });
  }

  // Family History (0-20 points)
  if (data.familyHistory === 'Yes') {
    riskScore += 20;
    factors.push({
      name: 'Family History',
      impact: 'negative',
      description: 'Family history of diabetes significantly increases your risk'
    });
    recommendations.push('Schedule regular diabetes screenings with your healthcare provider');
  } else {
    factors.push({
      name: 'Family History',
      impact: 'positive',
      description: 'No family history of diabetes reduces your overall risk'
    });
  }

  // Physical Activity (0-15 points)
  if (data.physicalActivity === 'Low') {
    riskScore += 15;
    factors.push({
      name: 'Physical Activity',
      impact: 'negative',
      description: 'Low physical activity increases diabetes risk'
    });
    recommendations.push('Aim for at least 150 minutes of moderate-intensity exercise per week');
    recommendations.push('Start with short walks and gradually increase activity level');
  } else if (data.physicalActivity === 'Moderate') {
    riskScore += 5;
    factors.push({
      name: 'Physical Activity',
      impact: 'neutral',
      description: 'Moderate activity level provides some protection against diabetes'
    });
    recommendations.push('Consider increasing to high activity level for maximum health benefits');
  } else {
    factors.push({
      name: 'Physical Activity',
      impact: 'positive',
      description: 'High physical activity significantly reduces diabetes risk'
    });
  }

  // Diet Type (0-15 points)
  if (data.dietType === 'Unhealthy') {
    riskScore += 15;
    factors.push({
      name: 'Diet Quality',
      impact: 'negative',
      description: 'Unhealthy diet with high sugar and processed foods increases risk'
    });
    recommendations.push('Focus on whole foods: vegetables, lean proteins, whole grains, and healthy fats');
    recommendations.push('Limit sugary drinks, processed foods, and refined carbohydrates');
  } else if (data.dietType === 'Balanced') {
    riskScore += 3;
    factors.push({
      name: 'Diet Quality',
      impact: 'neutral',
      description: 'Balanced diet provides moderate protection against diabetes'
    });
    recommendations.push('Continue maintaining a balanced diet with plenty of vegetables and whole grains');
  } else {
    factors.push({
      name: 'Diet Quality',
      impact: 'positive',
      description: 'Very healthy diet significantly reduces diabetes risk'
    });
  }

  // Smoking Status (0-12 points)
  if (data.smokingStatus === 'Smoker') {
    riskScore += 12;
    factors.push({
      name: 'Smoking Status',
      impact: 'negative',
      description: 'Current smoking increases diabetes risk and complications'
    });
    recommendations.push('Consider smoking cessation programs - quitting reduces diabetes risk within years');
  } else if (data.smokingStatus === 'Former Smoker') {
    riskScore += 3;
    factors.push({
      name: 'Smoking Status',
      impact: 'neutral',
      description: 'Former smoking status has reduced impact on current diabetes risk'
    });
  } else {
    factors.push({
      name: 'Smoking Status',
      impact: 'positive',
      description: 'Non-smoking status reduces diabetes and cardiovascular risks'
    });
  }

  // Alcohol Intake (0-8 points)
  if (data.alcoholIntake === 'Yes') {
    riskScore += 8;
    factors.push({
      name: 'Alcohol Consumption',
      impact: 'negative',
      description: 'Regular alcohol consumption can affect blood sugar control'
    });
    recommendations.push('Consider reducing alcohol intake to moderate levels or eliminating entirely');
  } else if (data.alcoholIntake === 'Occasional') {
    riskScore += 2;
    factors.push({
      name: 'Alcohol Consumption',
      impact: 'neutral',
      description: 'Occasional alcohol consumption has minimal impact on diabetes risk'
    });
  } else {
    factors.push({
      name: 'Alcohol Consumption',
      impact: 'positive',
      description: 'No alcohol consumption reduces diabetes risk factors'
    });
  }

  // Stress Level (0-10 points)
  if (data.stressLevel === 'High') {
    riskScore += 10;
    factors.push({
      name: 'Stress Level',
      impact: 'negative',
      description: 'High chronic stress can affect blood sugar regulation'
    });
    recommendations.push('Practice stress management techniques like meditation, yoga, or deep breathing');
    recommendations.push('Consider counseling or therapy if stress feels overwhelming');
  } else if (data.stressLevel === 'Medium') {
    riskScore += 4;
    factors.push({
      name: 'Stress Level',
      impact: 'neutral',
      description: 'Medium stress levels have moderate impact on diabetes risk'
    });
    recommendations.push('Implement regular stress-reduction activities in your routine');
  } else {
    factors.push({
      name: 'Stress Level',
      impact: 'positive',
      description: 'Low stress levels support healthy blood sugar regulation'
    });
  }

  // Hypertension (0-15 points)
  if (data.hypertension === 'Yes') {
    riskScore += 15;
    factors.push({
      name: 'Hypertension',
      impact: 'negative',
      description: 'High blood pressure significantly increases diabetes risk'
    });
    recommendations.push('Work closely with your healthcare provider to manage blood pressure');
    recommendations.push('Follow a DASH diet (low sodium, high potassium) for blood pressure control');
  } else {
    factors.push({
      name: 'Blood Pressure',
      impact: 'positive',
      description: 'Normal blood pressure reduces diabetes and cardiovascular risks'
    });
  }

  // Gender factor (slight adjustment)
  if (data.gender === 'Male') {
    riskScore += 2;
  }

  // Add general recommendations based on risk level
  if (riskScore <= 30) {
    recommendations.unshift('Maintain your current healthy lifestyle habits');
    recommendations.push('Continue regular health check-ups every 2-3 years');
  } else if (riskScore <= 60) {
    recommendations.unshift('Schedule a consultation with your healthcare provider within 6 months');
    recommendations.push('Consider annual diabetes screening');
  } else {
    recommendations.unshift('Schedule an urgent consultation with your healthcare provider');
    recommendations.push('Request comprehensive diabetes screening including HbA1c and fasting glucose tests');
  }

  // Calculate final risk level and percentage
  const riskPercentage = Math.min(Math.round((riskScore / 120) * 100), 95);
  
  let riskLevel: 'Low' | 'Medium' | 'High';
  if (riskScore <= 30) {
    riskLevel = 'Low';
  } else if (riskScore <= 60) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'High';
  }

  return {
    riskLevel,
    riskPercentage,
    factors,
    recommendations
  };
}