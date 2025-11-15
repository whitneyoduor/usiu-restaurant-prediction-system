import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { AlertCircle, ChefHat } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 50%, rgb(236, 72, 153) 100%)'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex justify-center">
            <div 
              className="p-5 rounded-2xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgb(99, 102, 241), rgb(168, 85, 247))'
              }}
            >
              <ChefHat className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold" style={{ color: 'rgb(15, 23, 42)' }}>
              USIU Restaurant Prediction System
            </CardTitle>
            <CardDescription className="text-base" style={{ color: 'rgb(100, 116, 139)' }}>
              Sign in to access your dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold" style={{ color: 'rgb(15, 23, 42)' }}>
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-2 focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold" style={{ color: 'rgb(15, 23, 42)' }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-2 focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgb(99, 102, 241), rgb(168, 85, 247))',
                border: 'none'
              }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
