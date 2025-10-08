import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';

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
  Diabetes: string; // Target variable
}

interface DatasetUploadProps {
  onDatasetLoad: (data: DiabetesData[]) => void;
}

export function DatasetUpload({ onDatasetLoad }: DatasetUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [datasetInfo, setDatasetInfo] = useState<{ rows: number; columns: string[] } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadStatus('error');
      setUploadMessage('Please upload a valid CSV file.');
      return;
    }

    setUploadStatus('processing');
    setUploadMessage('Processing dataset...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as DiabetesData[];
          
          // Validate required columns
          const requiredColumns = [
            'Age', 'Gender', 'BMI', 'Family_History', 'Physical_Activity',
            'Diet_Type', 'Smoking_Status', 'Alcohol_Intake', 'Stress_Level',
            'Hypertension', 'Diabetes'
          ];
          
          const fileColumns = Object.keys(data[0] || {});
          const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));
          
          if (missingColumns.length > 0) {
            setUploadStatus('error');
            setUploadMessage(`Missing required columns: ${missingColumns.join(', ')}`);
            return;
          }

          // Process and clean data
          const cleanedData = data
            .filter(row => row.Age && row.BMI && row.Diabetes) // Filter out incomplete rows
            .map(row => ({
              ...row,
              Age: Number(row.Age),
              BMI: Number(row.BMI)
            }));

          if (cleanedData.length === 0) {
            setUploadStatus('error');
            setUploadMessage('No valid data rows found in the CSV file.');
            return;
          }

          setDatasetInfo({
            rows: cleanedData.length,
            columns: fileColumns
          });

          setUploadStatus('success');
          setUploadMessage(`Successfully loaded ${cleanedData.length} records`);
          onDatasetLoad(cleanedData);
          
        } catch (error) {
          setUploadStatus('error');
          setUploadMessage('Error processing CSV file. Please check the file format.');
          console.error('CSV processing error:', error);
        }
      },
      error: (error) => {
        setUploadStatus('error');
        setUploadMessage(`Error reading file: ${error.message}`);
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Diabetes Dataset
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload your Kaggle diabetes dataset (CSV format)
            </p>
            <Button
              onClick={() => document.getElementById('csv-upload')?.click()}
              disabled={uploadStatus === 'processing'}
            >
              {uploadStatus === 'processing' ? 'Processing...' : 'Choose CSV File'}
            </Button>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {uploadStatus !== 'idle' && (
          <Alert className={uploadStatus === 'error' ? 'border-destructive' : uploadStatus === 'success' ? 'border-green-500' : ''}>
            {uploadStatus === 'error' && <AlertCircle className="h-4 w-4" />}
            {uploadStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
            <AlertDescription>{uploadMessage}</AlertDescription>
          </Alert>
        )}

        {datasetInfo && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Dataset Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Records:</span> {datasetInfo.rows}
                </div>
                <div>
                  <span className="font-medium">Columns:</span> {datasetInfo.columns.length}
                </div>
              </div>
              <div className="mt-3">
                <span className="font-medium text-sm">Available Columns:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {datasetInfo.columns.map(col => (
                    <span key={col} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Required columns:</p>
          <p>Age, Gender, BMI, Family_History, Physical_Activity, Diet_Type, Smoking_Status, Alcohol_Intake, Stress_Level, Hypertension, Diabetes</p>
        </div>
      </CardContent>
    </Card>
  );
}