import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../api/auth.api';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    universityId: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.endsWith('@sltc.ac.lk')) {
      toast.error('Only @sltc.ac.lk email addresses are allowed.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({
        name: formData.name,
        universityId: formData.universityId,
        email: formData.email,
        password: formData.password,
      });
      
      if (response.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="name"
        type="text"
        placeholder="John Doe"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        label="University ID (Registration Number)"
        name="universityId"
        type="text"
        placeholder="AA0000"
        value={formData.universityId}
        onChange={handleChange}
        required
      />
      <Input
        label="University Email"
        name="email"
        type="email"
        placeholder="AA0000@sltc.ac.lk"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
        Create Account
      </Button>
    </form>
  );
};
