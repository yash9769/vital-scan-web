import { useState } from 'react';
import { DatasetUpload } from '@/components/DatasetUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { datasetProcessor } from '@/utils/datasetProcessor';
import { Brain, Database, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function DatasetManager() {
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<DiabetesData[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  const handleDatasetLoad = async (data: DiabetesData[]) => {
    setDataset(data);
    datasetProcessor.loadData(data);
    
    // Process data and calculate statistics
    const processedData = datasetProcessor.processData();
    setStatistics(processedData.statistics);
  };

  const trainModel = async () => {
    if (dataset.length === 0) return;
    
    setIsTraining(true);
    
    try {
      const processedData = datasetProcessor.processData();
      
      // Split data for training/testing (80/20)
      const splitIndex = Math.floor(processedData.features.length * 0.8);
      const trainFeatures = processedData.features.slice(0, splitIndex);
      const trainLabels = processedData.labels.slice(0, splitIndex);
      const testFeatures = processedData.features.slice(splitIndex);
      const testLabels = processedData.labels.slice(splitIndex);
      
      // Train model
      const model = datasetProcessor.trainModel(trainFeatures, trainLabels);
      
      // Calculate accuracy on test set
      let correct = 0;
      for (let i = 0; i < testFeatures.length; i++) {
        const prediction = datasetProcessor.predict(testFeatures[i], model);
        const predictedLabel = prediction > 0.5 ? 1 : 0;
        if (predictedLabel === testLabels[i]) {
          correct++;
        }
      }
      
      const accuracy = (correct / testFeatures.length) * 100;
      setModelAccuracy(accuracy);
      
      // Store model in localStorage for use in predictions
      localStorage.setItem('diabetesModel', JSON.stringify(model));
      localStorage.setItem('modelAccuracy', accuracy.toString());
      
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const ageDistribution = statistics ? [
    { range: '18-30', count: dataset.filter(d => d.Age >= 18 && d.Age <= 30).length },
    { range: '31-45', count: dataset.filter(d => d.Age >= 31 && d.Age <= 45).length },
    { range: '46-60', count: dataset.filter(d => d.Age >= 46 && d.Age <= 60).length },
    { range: '60+', count: dataset.filter(d => d.Age > 60).length }
  ] : [];

  const diabetesDistribution = statistics ? [
    { name: 'No Diabetes', value: dataset.filter(d => d.Diabetes === 'No').length, color: '#22c55e' },
    { name: 'Diabetes', value: dataset.filter(d => d.Diabetes === 'Yes').length, color: '#ef4444' }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="container mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Dataset Manager</h1>
          <p className="text-muted-foreground">Upload and train your diabetes prediction model</p>
        </div>

        {!dataset.length ? (
          <DatasetUpload onDatasetLoad={handleDatasetLoad} />
        ) : (
          <div className="space-y-6">
            {/* Dataset Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{dataset.length}</p>
                      <p className="text-sm text-muted-foreground">Total Records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {statistics ? `${(statistics.diabetesRate * 100).toFixed(1)}%` : '0%'}
                      </p>
                      <p className="text-sm text-muted-foreground">Diabetes Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {statistics ? statistics.ageStats.mean.toFixed(1) : '0'}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Age</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {modelAccuracy ? `${modelAccuracy.toFixed(1)}%` : 'Not Trained'}
                      </p>
                      <p className="text-sm text-muted-foreground">Model Accuracy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={ageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diabetes Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={diabetesDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {diabetesDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Training Section */}
            <Card>
              <CardHeader>
                <CardTitle>Model Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Train Diabetes Prediction Model</p>
                    <p className="text-sm text-muted-foreground">
                      This will train a logistic regression model on your dataset
                    </p>
                  </div>
                  <Button 
                    onClick={trainModel} 
                    disabled={isTraining}
                    className="min-w-[120px]"
                  >
                    {isTraining ? 'Training...' : 'Train Model'}
                  </Button>
                </div>
                
                {isTraining && (
                  <div className="space-y-2">
                    <Progress value={100} className="animate-pulse" />
                    <p className="text-sm text-center text-muted-foreground">Training in progress...</p>
                  </div>
                )}
                
                {modelAccuracy && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Model Accuracy: {modelAccuracy.toFixed(1)}%
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/assessment')}
                      className="ml-auto"
                    >
                      Test Model →
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}