import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import zxcvbn from 'zxcvbn';
import { authApi } from '../api/auth.api';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Eye, EyeOff, Check, X } from 'lucide-react';

// ─── Strength configuration ───────────────────────────────────────────────────
const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = [
  'bg-red-500',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-lime-500',
  'bg-green-500',
];
const STRENGTH_TEXT = [
  'text-red-500',
  'text-orange-400',
  'text-yellow-500',
  'text-lime-600',
  'text-green-600',
];

// ─── Rule checklist ───────────────────────────────────────────────────────────
interface Rule {
  label: string;
  test: (pw: string) => boolean;
}
const RULES: Rule[] = [
  { label: 'At least 8 characters',  test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter',   test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One number',             test: (pw) => /[0-9]/.test(pw) },
  { label: 'One special character',  test: (pw) => /[!@#$%^&*(),.?":{}|<>\-_=+[\]\\;'`~/]/.test(pw) },
];

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    universityId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ── Derived password analysis (memoised for performance) ──────────────────
  const strength = useMemo(() => {
    if (!formData.password) return null;
    return zxcvbn(formData.password);
  }, [formData.password]);

  const ruleResults = useMemo(
    () => RULES.map((r) => ({ ...r, passed: r.test(formData.password) })),
    [formData.password]
  );

  const allRulesPassed = ruleResults.every((r) => r.passed);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.endsWith('@sltc.ac.lk')) {
      toast.error('Only @sltc.ac.lk email addresses are allowed.');
      return;
    }

    if (!allRulesPassed) {
      toast.error('Password does not meet all requirements.');
      return;
    }

    if (strength && strength.score < 2) {
      toast.error('Password is too weak. Please choose a stronger password.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
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

  const score = strength?.score ?? -1;
  const showStrengthUI = formData.password.length > 0 && (passwordFocused || formData.password.length > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <Input
        label="Full Name"
        name="name"
        type="text"
        placeholder="John Doe"
        value={formData.name}
        onChange={handleChange}
        required
      />

      {/* University ID */}
      <Input
        label="University ID (Registration Number)"
        name="universityId"
        type="text"
        placeholder="AA0000"
        value={formData.universityId}
        onChange={handleChange}
        required
      />

      {/* University Email */}
      <Input
        label="University Email"
        name="email"
        type="email"
        placeholder="AA0000@sltc.ac.lk"
        value={formData.email}
        onChange={handleChange}
        required
      />

      {/* Password + Strength UI */}
      <div className="space-y-2">
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none flex items-center justify-center h-full"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        {/* Strength bar + label */}
        {showStrengthUI && (
          <div className="space-y-2 animate-fade-in">
            {/* Segmented bar (5 segments) */}
            <div className="flex gap-1 h-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    i <= score ? STRENGTH_COLORS[score] : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Score label */}
            <p className={`text-xs font-semibold ${score >= 0 ? STRENGTH_TEXT[score] : 'text-gray-400'}`}>
              {score >= 0 ? STRENGTH_LABELS[score] : ''}
              {strength?.feedback?.warning
                ? ` — ${strength.feedback.warning}`
                : ''}
            </p>

            {/* Interactive rule checklist */}
            <ul className="space-y-1 pt-1">
              {ruleResults.map((rule) => (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                    rule.passed ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                    rule.passed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {rule.passed ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                  </span>
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none flex items-center justify-center h-full"
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />
        {formData.confirmPassword.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-medium mt-1 transition-all duration-200">
            {formData.password === formData.confirmPassword ? (
              <>
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-scale-in">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span className="text-green-600">Passwords match</span>
              </>
            ) : (
              <>
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center animate-scale-in">
                  <X size={10} strokeWidth={3} />
                </span>
                <span className="text-red-500">Passwords do not match</span>
              </>
            )}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
        Create Account
      </Button>
    </form>
  );
};


