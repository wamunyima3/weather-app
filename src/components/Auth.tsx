import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

// Placeholder for weather-themed background image from Unsplash
const weatherImageUrl = 'https://www.pexels.com/photo/cumulus-clouds-209831/';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try signing in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If sign-in fails, try signing up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        // After sign-up, optionally navigate to the verification page or dashboard
        navigate('/home'); // Adjust the route accordingly
      } else {
        // Successful sign-in
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('Authentication failed. Please check your email or password.');
      console.error('Auth error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${weatherImageUrl})`, filter: 'brightness(0.7)' }}
      ></div>

      <div className="relative z-10 p-8 bg-white rounded-lg shadow-md max-w-lg w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to Weather App</h1>
        <p className="text-gray-600">Sign in or sign up to access weather data.</p>

        {/* Email Input */}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />

        {/* Password Input */}
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
        />

        {/* Auth Button */}
        <Button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {loading ? (
            <RefreshCcw className="animate-spin h-5 w-5 mr-2" />
          ) : (
            'Continue'
          )}
        </Button>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default Auth;
