import React, { useState } from 'react';
import { dbService } from '../mongodb';
import { Language } from '../types';
import { Mail, Lock, LogIn } from 'lucide-react';
import { AppLogo } from './common/AppLogo';
import { translations } from '../translations';
import { apiService } from '../apiService';

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
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

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

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      await apiService.requestPasswordReset(formData.email);

      setNotice(
        lang === 'bn'
          ? 'যদি এই ইমেইলে অ্যাকাউন্ট থাকে, ১০ মিনিটের মধ্যে ৬ সংখ্যার কোড পাঠানো হবে।'
          : 'If an account exists for this email, a 6-digit code will arrive shortly and expire in 10 minutes.'
      );
      setView('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request password recovery.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      if (newPassword.length < 8) {
        throw new Error(lang === 'bn' ? 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' : 'New password must be at least 8 characters');
      }
      if (newPassword !== confirmPassword) {
        throw new Error(lang === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না' : 'Passwords do not match');
      }

      await apiService.resetPassword({
        email: formData.email,
        code: resetCode,
        password: newPassword,
      });

      setView('login');
      setFormData((prev) => ({ ...prev, password: '' }));
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice(
        lang === 'bn'
          ? 'পাসওয়ার্ড পরিবর্তন হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
          : 'Password changed. Sign in with your new password.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <AppLogo className="h-24 w-auto max-w-[260px] mx-auto mb-4 object-contain" alt="AgroVision" priority />
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
          {view === 'login'
            ? lang === 'bn' ? 'লগইন' : 'Login'
            : view === 'forgot'
              ? lang === 'bn' ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset password'
              : lang === 'bn' ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Choose a new password'}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          {view === 'login'
            ? lang === 'bn' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'Access your account'
            : view === 'forgot'
              ? lang === 'bn' ? 'আপনার অ্যাকাউন্টের ইমেইল লিখুন' : 'Enter the email address for your account'
              : lang === 'bn' ? 'ইমেইলে পাঠানো ৬ সংখ্যার কোড লিখুন' : 'Enter the 6-digit code sent to your email'}
        </p>
      </div>

      <form
        onSubmit={view === 'login' ? handleSubmit : view === 'forgot' ? handleRequestPasswordReset : handleResetPassword}
        className="space-y-6"
      >
        {view !== 'reset' && (
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
              onChange={(e) => {
                handleInputChange(e);
                setNotice(null);
              }}
              className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              placeholder={lang === 'bn' ? 'আপনার ইমেইল' : 'your@email.com'}
              required
            />
          </div>
        </div>
        )}

        {view === 'login' && (
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
        )}

        {view === 'reset' && (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {lang === 'bn' ? 'যাচাইকরণ কোড' : 'Verification code'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                required
              />
            </div>
            {[{ label: lang === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New password', value: newPassword, set: setNewPassword }, { label: lang === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm new password', value: confirmPassword, set: setConfirmPassword }].map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{field.label}</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  required
                />
              </div>
            ))}
          </>
        )}

        {notice && (
          <div role="status" className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-green-700 dark:text-green-300 text-sm">{notice}</p>
          </div>
        )}

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
              {lang === 'bn' ? 'অপেক্ষা করুন...' : 'Please wait...'}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              {view === 'login' && <LogIn className="w-5 h-5" />}
              {view === 'login'
                ? lang === 'bn' ? 'লগইন করুন' : 'Login'
                : view === 'forgot'
                  ? lang === 'bn' ? 'যাচাইকরণ কোড পাঠান' : 'Send verification code'
                  : lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change password'}
            </div>
          )}
        </button>

        {view === 'login' ? (
          <div className="space-y-3 text-center">
            <button type="button" onClick={() => { setError(null); setNotice(null); setView('forgot'); }} className="block mx-auto text-green-600 hover:text-green-700 text-sm font-medium">
              {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
            </button>
            <button type="button" onClick={onSwitchToRegister} className="text-green-600 hover:text-green-700 text-sm font-medium">
              {lang === 'bn' ? 'অ্যাকাউন্ট নেই? রেজিস্ট্রেশন করুন' : "Don't have an account? Register"}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button type="button" onClick={() => { setError(null); setNotice(null); setView('login'); }} className="text-green-600 hover:text-green-700 text-sm font-medium">
              {lang === 'bn' ? 'লগইনে ফিরে যান' : 'Back to login'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};