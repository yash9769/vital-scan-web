import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, Activity, User, Utensils, Cigarette, Wine, Brain, Stethoscope } from 'lucide-react';

export interface HealthData {
  age: number;
  gender: 'Male' | 'Female';
  bmi: number;
  familyHistory: 'Yes' | 'No';
  physicalActivity: 'Low' | 'Moderate' | 'High';
  dietType: 'Balanced' | 'Unhealthy' | 'Very Healthy';
  smokingStatus: 'Smoker' | 'Non-Smoker' | 'Former Smoker';
  alcoholIntake: 'Yes' | 'No' | 'Occasional';
  stressLevel: 'Low' | 'Medium' | 'High';
  hypertension: 'Yes' | 'No';
}

const DiabetesAssessment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<HealthData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.age || formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Please enter a valid age between 1-120';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    if (!formData.bmi || formData.bmi < 10 || formData.bmi > 50) {
      newErrors.bmi = 'Please enter a valid BMI between 10-50';
    }
    
    const requiredFields = ['familyHistory', 'physicalActivity', 'dietType', 'smokingStatus', 'alcoholIntake', 'stressLevel', 'hypertension'];
    requiredFields.forEach(field => {
      if (!formData[field as keyof HealthData]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      localStorage.setItem('diabetesAssessmentData', JSON.stringify(formData));
      navigate('/results');
    }
  };

  const updateFormData = (field: keyof HealthData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Diabetes Risk Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please provide your health information below. This assessment uses advanced analytics to evaluate your diabetes risk based on key health indicators.
          </p>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Your Health Profile
            </CardTitle>
            <CardDescription>
              All information is processed locally and never stored on our servers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Basic Information</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age || ''}
                      onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                      className={errors.age ? 'border-destructive' : ''}
                    />
                    {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => updateFormData('gender', value)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </RadioGroup>
                    {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
                  </div>

                  <div>
                    <Label htmlFor="bmi">BMI (Body Mass Index)</Label>
                    <Input
                      id="bmi"
                      type="number"
                      step="0.1"
                      min="10"
                      max="50"
                      value={formData.bmi || ''}
                      onChange={(e) => updateFormData('bmi', parseFloat(e.target.value))}
                      className={errors.bmi ? 'border-destructive' : ''}
                    />
                    {errors.bmi && <p className="text-sm text-destructive mt-1">{errors.bmi}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculate: Weight (kg) ÷ Height² (m²)
                    </p>
                  </div>
                </div>

                {/* Medical History */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Medical History</h3>
                  </div>

                  <div>
                    <Label>Family History of Diabetes</Label>
                    <Select value={formData.familyHistory} onValueChange={(value) => updateFormData('familyHistory', value)}>
                      <SelectTrigger className={errors.familyHistory ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.familyHistory && <p className="text-sm text-destructive mt-1">{errors.familyHistory}</p>}
                  </div>

                  <div>
                    <Label>Hypertension (High Blood Pressure)</Label>
                    <Select value={formData.hypertension} onValueChange={(value) => updateFormData('hypertension', value)}>
                      <SelectTrigger className={errors.hypertension ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.hypertension && <p className="text-sm text-destructive mt-1">{errors.hypertension}</p>}
                  </div>
                </div>
              </div>

              {/* Lifestyle Factors */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Lifestyle Factors</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Physical Activity Level</Label>
                    <Select value={formData.physicalActivity} onValueChange={(value) => updateFormData('physicalActivity', value)}>
                      <SelectTrigger className={errors.physicalActivity ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low (Sedentary)</SelectItem>
                        <SelectItem value="Moderate">Moderate (Regular exercise)</SelectItem>
                        <SelectItem value="High">High (Very active)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.physicalActivity && <p className="text-sm text-destructive mt-1">{errors.physicalActivity}</p>}
                  </div>

                  <div>
                    <Label>Diet Type</Label>
                    <Select value={formData.dietType} onValueChange={(value) => updateFormData('dietType', value)}>
                      <SelectTrigger className={errors.dietType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select diet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Very Healthy">Very Healthy (Plant-based, low sugar)</SelectItem>
                        <SelectItem value="Balanced">Balanced (Mixed, moderate)</SelectItem>
                        <SelectItem value="Unhealthy">Unhealthy (High sugar, processed foods)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.dietType && <p className="text-sm text-destructive mt-1">{errors.dietType}</p>}
                  </div>

                  <div>
                    <Label>Smoking Status</Label>
                    <Select value={formData.smokingStatus} onValueChange={(value) => updateFormData('smokingStatus', value)}>
                      <SelectTrigger className={errors.smokingStatus ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select smoking status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Non-Smoker">Non-Smoker</SelectItem>
                        <SelectItem value="Former Smoker">Former Smoker</SelectItem>
                        <SelectItem value="Smoker">Current Smoker</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.smokingStatus && <p className="text-sm text-destructive mt-1">{errors.smokingStatus}</p>}
                  </div>

                  <div>
                    <Label>Alcohol Intake</Label>
                    <Select value={formData.alcoholIntake} onValueChange={(value) => updateFormData('alcoholIntake', value)}>
                      <SelectTrigger className={errors.alcoholIntake ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select alcohol consumption" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">No alcohol</SelectItem>
                        <SelectItem value="Occasional">Occasional (1-2 times/week)</SelectItem>
                        <SelectItem value="Yes">Regular consumption</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.alcoholIntake && <p className="text-sm text-destructive mt-1">{errors.alcoholIntake}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label>Stress Level</Label>
                    <Select value={formData.stressLevel} onValueChange={(value) => updateFormData('stressLevel', value)}>
                      <SelectTrigger className={errors.stressLevel ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select stress level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low (Manageable, relaxed)</SelectItem>
                        <SelectItem value="Medium">Medium (Moderate pressure)</SelectItem>
                        <SelectItem value="High">High (Chronic stress, overwhelming)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.stressLevel && <p className="text-sm text-destructive mt-1">{errors.stressLevel}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button type="submit" size="lg" className="w-full md:w-auto px-8">
                  Analyze My Risk
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiabetesAssessment;