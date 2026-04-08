import React, { useState } from 'react';
import { dbService } from '../mongodb';
import { Language } from '../types';
import { Mail, Lock, LogIn } from 'lucide-react';
import { translations } from '../translations';

interface LoginProps {
  lang: Language;
  onLoginSuccess?: (userData: any) => void;
  onSwitchToRegister?: () => void;
}

export const Login: React.FC<LoginProps> = ({ lang, onLoginSuccess, onSwitchToRegister }) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!formData.email.trim()) {
        throw new Error(lang === 'bn' ? 'ইমেইল প্রয়োজন' : 'Email is required');
      }
      if (!formData.password.trim()) {
        throw new Error(lang === 'bn' ? 'পাসওয়ার্ড প্রয়োজন' : 'Password is required');
      }

      // For now, just check if user exists in MongoDB (password check is basic)
      console.log('🔐 Attempting to sign in user:', formData.email);

      // Get all users and find matching email
      const { data: loginResponse, error: loginError } = await dbService.login(formData.email, formData.password);

      if (loginError || !loginResponse?.user) {
        throw new Error(loginError || (lang === 'bn' ? 'ইমেইল বা পাসওয়ার্ড ভুল' : 'Invalid email or password'));
      }

      const user = loginResponse.user;
      console.log('✅ Sign in successful for:', user.email);

      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar || '',
        token: loginResponse.token
      }));

      onLoginSuccess?.({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar || '',
        token: loginResponse.token
      });

    } catch (err: any) {
      setError(err.message || (lang === 'bn' ? 'লগইন ব্যর্থ হয়েছে' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
          {lang === 'bn' ? 'লগইন' : 'Login'}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          {lang === 'bn' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'Access your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {lang === 'bn' ? 'ইমেইল' : 'Email'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              placeholder={lang === 'bn' ? 'আপনার ইমেইল' : 'your@email.com'}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              placeholder={lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {lang === 'bn' ? 'লগইন হচ্ছে...' : 'Logging in...'}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              {lang === 'bn' ? 'লগইন করুন' : 'Login'}
            </div>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            {lang === 'bn' ? 'অ্যাকাউন্ট নেই? রেজিস্ট্রেশন করুন' : "Don't have an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
};