import React, { useState } from 'react';
import { dbService } from '../mongodb';
import { Language, UserRole } from '../types';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { translations } from '../translations';

interface RegisterProps {
  lang: Language;
  onRegisterSuccess?: (userData: any) => void;
  onSwitchToLogin?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ lang, onRegisterSuccess, onSwitchToLogin }) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer' as UserRole
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!formData.name.trim()) {
        throw new Error(lang === 'bn' ? 'নাম প্রয়োজন' : 'Name is required');
      }
      if (!formData.email.trim()) {
        throw new Error(lang === 'bn' ? 'ইমেইল প্রয়োজন' : 'Email is required');
      }
      if (!formData.email.includes('@')) {
        throw new Error(lang === 'bn' ? 'সঠিক ইমেইল ঠিকানা দিন' : 'Please enter a valid email address');
      }
      if (formData.password.length < 6) {
        throw new Error(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' : 'Password must be at least 6 characters');
      }

      console.log('🔐 Creating user profile:', formData.email, 'Role:', formData.role);
      const { data: registerResponse, error: createError } = await dbService.createProfile(
        '',
        formData.name,
        formData.email,
        formData.role,
        formData.password
      );

      if (createError || !registerResponse?.user) {
        console.error('❌ Failed to create profile:', createError);
        throw new Error(lang === 'bn' ? 'প্রোফাইল তৈরি করতে ব্যর্থ হয়েছে' : 'Failed to create profile');
      }

      const user = registerResponse.user;
      console.log('✅ Profile created successfully:', user);

      setSuccess(true);
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        token: registerResponse.token
      }));
      onRegisterSuccess?.({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        token: registerResponse.token
      });

    } catch (err: any) {
      setError(err.message || (lang === 'bn' ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            {lang === 'bn' ? 'রেজিস্ট্রেশন সফল!' : 'Registration Successful!'}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            {lang === 'bn' ? 'আপনার অ্যাকাউন্ট তৈরি হয়েছে। লগইন করুন।' : 'Your account has been created. Please login.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
          {lang === 'bn' ? 'রেজিস্ট্রেশন' : 'Register'}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          {lang === 'bn' ? 'আপনার অ্যাকাউন্ট তৈরি করুন' : 'Create your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {lang === 'bn' ? 'নাম' : 'Name'}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your name'}
              required
            />
          </div>
        </div>

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

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {lang === 'bn' ? 'ভূমিকা' : 'Role'}
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
          >
            <option value="farmer">{lang === 'bn' ? 'কৃষক' : 'Farmer'}</option>
            <option value="specialist">{lang === 'bn' ? 'বিশেষজ্ঞ' : 'Specialist'}</option>
          </select>
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
              {lang === 'bn' ? 'রেজিস্ট্রেশন হচ্ছে...' : 'Registering...'}
            </div>
          ) : (
            lang === 'bn' ? 'রেজিস্ট্রেশন করুন' : 'Register'
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            {lang === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Login'}
          </button>
        </div>
      </form>
    </div>
  );
};