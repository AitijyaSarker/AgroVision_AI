
import React, { useState, useEffect } from 'react';
import { SpecialistMessenger } from './SpecialistMessenger';
import { Language } from '../../types';
import { LayoutDashboard, MessageSquare, Calendar, Users, Bell, Search, Settings } from 'lucide-react';
import { dbService } from '../../mongodb';
import { translations } from '../../translations';

interface SpecialistDashboardProps {
  userId?: string;
  lang: Language;
}

export const SpecialistDashboard: React.FC<SpecialistDashboardProps> = ({ userId, lang }) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [activeTab, setActiveTab] = useState<'messenger' | 'stats' | 'appointments' | 'profile'>('messenger');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      const { data, error } = await dbService.getProfile(userId);
      if (data && !error) {
        setUserProfile(data);
      }
    };
    loadUserProfile();
  }, [userId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Specialist Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <LayoutDashboard className="text-green-700 dark:text-green-400" />
            {lang === 'bn' ? 'বিশেষজ্ঞ ড্যাশবোর্ড' : 'Specialist Dashboard'}
          </h1>
          <p className="text-zinc-500 mt-2">{lang === 'bn' ? 'স্বাগতম, আপনার পরামর্শের জন্য কৃষকরা অপেক্ষা করছেন।' : 'Welcome back, farmers are waiting for your advice.'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setNotifications(notifications.length > 0 ? [] : [{ id: 1, message: 'New message from farmer', time: '5 min ago' }])}
              className="relative p-2 text-zinc-400 hover:text-green-600 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full font-bold">
                  {unreadCount}
                </div>
              )}
            </button>
            {notifications.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                  <h3 className="font-bold text-zinc-900 dark:text-white">{lang === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map((notif: any) => (
                    <div key={notif.id} className="p-4 border-b border-zinc-100 dark:border-zinc-700 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                      <p className="text-sm text-zinc-900 dark:text-white">{notif.message}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="h-10 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-4 py-2 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700">
            <img src={`https://picsum.photos/100/100?person=${userId}`} className="w-8 h-8 rounded-full" alt="avatar" />
            <div className="text-left">
              <p className="text-xs font-bold leading-none">{userProfile?.name || 'Loading...'}</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-tighter">{userProfile?.role === 'specialist' ? 'Plant Pathologist' : 'Specialist'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'messenger', label: lang === 'bn' ? 'মেসেঞ্জার' : 'Messenger', icon: MessageSquare },
            { id: 'stats', label: lang === 'bn' ? 'পরিসংখ্যান' : 'Analytics', icon: LayoutDashboard },
            { id: 'appointments', label: lang === 'bn' ? 'অ্যাপয়েন্টমেন্ট' : 'Appointments', icon: Calendar },
            { id: 'profile', label: lang === 'bn' ? 'প্রোফাইল' : 'Profile', icon: Users },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 min-h-[600px]">
          {activeTab === 'messenger' ? (
            <SpecialistMessenger lang={lang} userId={userId} />
          ) : activeTab === 'profile' ? (
            <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">{lang === 'bn' ? 'প্রোফাইল' : 'Profile'}</h2>
              {userProfile && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <img src={`https://picsum.photos/100/100?person=${userId}`} className="w-20 h-20 rounded-full border-4 border-green-500" alt="Profile" />
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{userProfile.name}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400">{userProfile.email}</p>
                      <p className="text-sm text-green-600 font-bold uppercase">{userProfile.role}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">{lang === 'bn' ? 'নাম' : 'Name'}</label>
                      <input 
                        type="text" 
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">{lang === 'bn' ? 'ইমেইল' : 'Email'}</label>
                      <input 
                        type="email" 
                        value={userProfile.email}
                        disabled
                        className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <button 
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
                    onClick={async () => {
                      // Update profile
                      const { error } = await dbService.updateProfile(userId!, { name: userProfile.name });
                      if (!error) {
                        alert(lang === 'bn' ? 'প্রোফাইল আপডেট হয়েছে!' : 'Profile updated successfully!');
                      }
                    }}
                  >
                    {lang === 'bn' ? 'আপডেট করুন' : 'Update Profile'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-800 p-12 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 flex flex-col items-center justify-center text-center">
               <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-full mb-6">
                 <LayoutDashboard className="w-12 h-12 text-zinc-300" />
               </div>
               <h3 className="text-2xl font-bold mb-2">{lang === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}</h3>
               <p className="text-zinc-500 max-w-sm">{lang === 'bn' ? 'আমরা এই ফিচারটি আপনার জন্য তৈরি করছি।' : 'We are currently building this feature for you.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
