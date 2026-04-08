'use client'

import React, { useState, useEffect } from 'react';
import { apiService } from '../apiService';
import { Navbar } from '../components/common/Navbar';
import { Hero } from '../components/common/Hero';
import FarmerDashboard from '../components/farmer/FarmerDashboard';
import { SpecialistDashboard } from '../components/specialist/SpecialistDashboard';
import { About } from '../components/common/About';
import { Datasets } from '../components/common/Datasets';
import { Contact } from '../components/common/Contact';
import { Footer } from '../components/common/Footer';
import { Register } from '../components/Register';
import { Login } from '../components/Login';
import { Language, UserRole } from '../types';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'dashboard' | 'datasets' | 'about' | 'contact'>('home');
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('agrovision-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    // Load language from localStorage
    const savedLang = localStorage.getItem('agrovision-lang');
    if (savedLang === 'bn') {
      setLang('bn');
    }

    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setUserRole(userData.role || 'farmer');
      if (userData.token) {
        apiService.setToken(userData.token);
      }
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = (userData: any) => {
    if (userData.token) {
      apiService.setToken(userData.token);
    }
    setUser(userData);
    setUserRole(userData.role || 'farmer');
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    apiService.clearToken();
    setUser(null);
    setUserRole('guest');
    setCurrentPage('home');
    localStorage.removeItem('user');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('agrovision-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Hero onGetStarted={() => setCurrentPage('register')} lang={lang} />;
      case 'login':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-6">
            <Login
              lang={lang}
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setCurrentPage('register')}
            />
          </div>
        );
      case 'register':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-6">
            <Register
              lang={lang}
              onRegisterSuccess={handleLoginSuccess}
              onSwitchToLogin={() => setCurrentPage('login')}
            />
          </div>
        );
      case 'dashboard':
        return userRole === 'specialist'
          ? <SpecialistDashboard userId={user?.id} lang={lang} />
          : <FarmerDashboard userRole={userRole} userId={user?.id} user={user} lang={lang} />;
      case 'datasets':
        return <Datasets />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return <Hero onGetStarted={() => setCurrentPage('register')} lang={lang} />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
      <Navbar
        theme={theme}
        currentPage={currentPage}
        userRole={userRole}
        onPageChange={(page) => setCurrentPage(page as typeof currentPage)}
        onThemeChange={handleThemeChange}
        onLogout={handleLogout}
        lang={lang}
        onLangChange={setLang}
      />
      <main className="pt-16 min-h-[calc(100vh-80px)]">
        {renderPage()}
      </main>
      <Footer lang={lang} />
    </div>
  );
}