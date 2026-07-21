import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../api/auth.api';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  emailLabel?: string;
  emailPlaceholder?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  emailLabel = "University Email", 
  emailPlaceholder = "e.g. AA0000@sltc.ac.lk" 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success) {
        login(response.data.accessToken, response.data.user);
        toast.success(`Welcome back, ${response.data.user.name}!`);
        
        // Redirect based on role
        if (response.data.user.role === 'STUDENT') {
          navigate('/menu');
        } else {
          navigate('/admin');
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to login. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label={emailLabel}
        type="email"
        placeholder={emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none flex items-center justify-center h-full"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        }
      />
      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        Sign In
      </Button>
    </form>
  );
};

