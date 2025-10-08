import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Heart, 
  Activity, 
  Utensils, 
  Brain,
  ArrowLeft,
  Info,
  Database
} from 'lucide-react';
import { HealthData } from './DiabetesAssessment';
import { predictDiabetesRisk } from '@/utils/modelPrediction';
import Chatbot from '@/components/Chatbot';

interface RiskResult {
  riskLevel: 'Low' | 'Medium' | 'High';
  riskPercentage: number;
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  recommendations: string[];
  modelUsed: 'trained' | 'rule-based';
}

const Results = () => {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const storedData = localStorage.getItem('diabetesAssessmentData');
      if (storedData) {
        const data = JSON.parse(storedData) as HealthData;
        setHealthData(data);

        // Calculate risk using our prediction algorithm (ML model if available, rule-based fallback)
        const result = await predictDiabetesRisk(data);
        setRiskResult(result);
      } else {
        navigate('/assessment');
      }
    };
    loadData();
  }, [navigate]);

  if (!healthData || !riskResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing your health profile...</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'High':
        return 'destructive';
      default:
        return 'info';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Low':
        return <CheckCircle className="h-6 w-6" />;
      case 'Medium':
        return <AlertTriangle className="h-6 w-6" />;
      case 'High':
        return <AlertTriangle className="h-6 w-6" />;
      default:
        return <Info className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/assessment')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Diabetes Risk Assessment
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Based on your health profile, here's your personalized diabetes risk analysis and recommendations.
            </p>
          </div>
        </div>

        {/* Risk Level Card */}
        <Card className="shadow-medium mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getRiskIcon(riskResult.riskLevel)}
                <span>Risk Assessment</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {riskResult.modelUsed === 'trained' ? (
                    <><Database className="h-3 w-3 mr-1" />ML Model</>
                  ) : (
                    <><Brain className="h-3 w-3 mr-1" />Rule-Based</>
                  )}
                </Badge>
              </div>
              <Badge 
                variant={getRiskColor(riskResult.riskLevel) as any}
                className="text-lg px-4 py-2"
              >
                {riskResult.riskLevel} Risk
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Risk Probability</span>
                  <span className="font-bold">{riskResult.riskPercentage}%</span>
                </div>
                <Progress value={riskResult.riskPercentage} className="h-3" />
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {riskResult.riskLevel === 'Low' && 
                    "Great news! Your current health profile suggests a low risk of developing diabetes. Continue maintaining your healthy lifestyle."
                  }
                  {riskResult.riskLevel === 'Medium' && 
                    "Your assessment shows a moderate risk level. With some lifestyle modifications, you can significantly reduce this risk."
                  }
                  {riskResult.riskLevel === 'High' && 
                    "Your assessment indicates a higher risk level. We strongly recommend consulting with a healthcare provider and implementing the suggested lifestyle changes."
                  }
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Factors */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Key Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskResult.factors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`mt-1 ${
                      factor.impact === 'positive' ? 'text-success' : 
                      factor.impact === 'negative' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {factor.impact === 'positive' && <TrendingDown className="h-4 w-4" />}
                      {factor.impact === 'negative' && <TrendingUp className="h-4 w-4" />}
                      {factor.impact === 'neutral' && <div className="h-4 w-4 rounded-full bg-current" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{factor.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Profile Summary */}
        <Card className="shadow-medium mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Your Health Profile Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="font-semibold text-2xl text-primary">{healthData.age}</p>
                <p className="text-xs text-muted-foreground">Years old</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="font-semibold text-2xl text-primary">{healthData.bmi}</p>
                <p className="text-xs text-muted-foreground">BMI</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="font-semibold text-xs text-primary">{healthData.physicalActivity}</p>
                <p className="text-xs text-muted-foreground">Activity Level</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="font-semibold text-xs text-primary">{healthData.dietType}</p>
                <p className="text-xs text-muted-foreground">Diet Quality</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="font-semibold text-xs text-primary">{healthData.stressLevel}</p>
                <p className="text-xs text-muted-foreground">Stress Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/assessment')}
            variant="outline"
            size="lg"
          >
            Retake Assessment
          </Button>
          <Button
            onClick={() => navigate('/')}
            size="lg"
          >
            Return to Home
          </Button>
        </div>

        {/* Disclaimer */}
        <Card className="mt-6 border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Medical Disclaimer:</strong> This assessment is for educational purposes only and should not replace professional medical advice.
                Please consult with a qualified healthcare provider for proper diagnosis and treatment recommendations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
};

export default Results;
