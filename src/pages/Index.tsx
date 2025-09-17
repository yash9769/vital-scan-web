import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Activity, 
  Brain, 
  Shield, 
  TrendingUp, 
  Users,
  CheckCircle,
  ArrowRight,
  Database
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced algorithms analyze your health profile using evidence-based risk factors.'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Privacy First',
      description: 'Your data stays on your device. We never store or share your personal health information.'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Personalized Results',
      description: 'Get tailored risk assessment and actionable recommendations for your lifestyle.'
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: 'Evidence-Based',
      description: 'Based on clinical research and validated diabetes risk prediction models.'
    }
  ];

  const stats = [
    { number: '422M+', label: 'People with diabetes globally' },
    { number: '90%', label: 'Have Type 2 diabetes' },
    { number: '50%', label: 'Cases are preventable' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4">
            Free Health Assessment
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Know Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Diabetes Risk</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take our comprehensive health assessment to understand your diabetes risk and get personalized recommendations for a healthier future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => navigate('/assessment')}
              className="text-lg px-8 py-6 shadow-medium"
            >
              Start Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center shadow-soft hover:shadow-medium transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="pt-6">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Simple, secure, and scientifically accurate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold mb-2">Complete Assessment</h3>
              <p className="text-muted-foreground">Answer questions about your health, lifestyle, and family history. Takes just 3-5 minutes.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-accent-foreground font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">Our algorithm analyzes your data using validated diabetes risk prediction models.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-success rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-success-foreground font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold mb-2">Get Results</h3>
              <p className="text-muted-foreground">Receive your personalized risk assessment and actionable health recommendations.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-0 shadow-medium">
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Take Control of Your Health Today</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Early detection and prevention are key to managing diabetes risk. 
              Our assessment takes just a few minutes and could make a lifetime of difference.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/assessment')}
              className="text-lg px-8 py-6"
            >
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Footer Disclaimer */}
        <div className="text-center mt-12 text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            <strong>Medical Disclaimer:</strong> This tool is for educational purposes only and should not replace professional medical advice. 
            Always consult with qualified healthcare providers for proper diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
