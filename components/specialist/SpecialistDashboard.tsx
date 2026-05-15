
import React, { useState, useEffect, useRef } from 'react';
import { SpecialistMessenger } from './SpecialistMessenger';
import { Language } from '../../types';
import { LayoutDashboard, MessageSquare, Calendar, Users, Bell, Camera } from 'lucide-react';
import { dbService } from '../../mongodb';

interface SpecialistProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface SpecialistDashboardProps {
  userId?: string;
  user?: SpecialistProfile | null;
  lang: Language;
  onProfileUpdate?: (updates: { name: string; avatar: string }) => void;
}

const DEFAULT_AVATAR = (id?: string) =>
  `https://picsum.photos/100/100?q=${id || 'specialist'}`;

export const SpecialistDashboard: React.FC<SpecialistDashboardProps> = ({
  userId,
  user,
  lang,
  onProfileUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'messenger' | 'stats' | 'appointments' | 'profile'>('messenger');
  const [userProfile, setUserProfile] = useState<SpecialistProfile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarSrc =
    profileAvatar || userProfile?.avatar || user?.avatar || DEFAULT_AVATAR(userId);

  const loadUserProfile = async () => {
    if (!userId) return;
    setProfileLoading(true);
    setProfileError(null);
    const { data, error } = await dbService.getProfile(userId);
    if (data && !error) {
      setUserProfile(data);
      setProfileName(data.name || '');
      setProfileAvatar(data.avatar || '');
    } else if (user) {
      setUserProfile({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
      });
      setProfileName(user.name || '');
      setProfileAvatar(user.avatar || '');
    } else if (error) {
      setProfileError(error);
    }
    setProfileLoading(false);
  };

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError(
        lang === 'bn' ? 'শুধু ছবি ফাইল গ্রহণযোগ্য' : 'Only image files are allowed'
      );
      return;
    }

    if (file.size > 400_000) {
      setProfileError(
        lang === 'bn'
          ? 'ছবি ৪০০KB এর ছোট হতে হবে'
          : 'Image must be smaller than 400KB'
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileAvatar(reader.result as string);
      setProfileError(null);
      setProfileSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!userId || profileSaving) return;

    const name = profileName.trim();
    if (!name) {
      setProfileError(lang === 'bn' ? 'নাম প্রয়োজন' : 'Name is required');
      return;
    }

    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    const { data, error } = await dbService.updateProfile(userId, {
      name,
      avatar: profileAvatar,
    });

    setProfileSaving(false);

    if (error || !data) {
      setProfileError(
        error || (lang === 'bn' ? 'প্রোফাইল আপডেট ব্যর্থ' : 'Failed to update profile')
      );
      return;
    }

    setUserProfile(data);
    setProfileName(data.name);
    setProfileAvatar(data.avatar || '');
    setProfileSuccess(true);
    onProfileUpdate?.({ name: data.name, avatar: data.avatar || '' });
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <LayoutDashboard className="text-green-700 dark:text-green-400" />
            {lang === 'bn' ? 'বিশেষজ্ঞ ড্যাশবোর্ড' : 'Specialist Dashboard'}
          </h1>
          <p className="text-zinc-500 mt-2">
            {lang === 'bn'
              ? 'স্বাগতম, আপনার পরামর্শের জন্য কৃষকরা অপেক্ষা করছেন।'
              : 'Welcome back, farmers are waiting for your advice.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setNotifications(
                  notifications.length > 0
                    ? []
                    : [{ id: 1, message: 'New message from farmer', time: '5 min ago' }]
                )
              }
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
                  <h3 className="font-bold text-zinc-900 dark:text-white">
                    {lang === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
                  </h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map((notif: { id: number; message: string; time: string }) => (
                    <div
                      key={notif.id}
                      className="p-4 border-b border-zinc-100 dark:border-zinc-700 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    >
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
            <img src={avatarSrc} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
            <div className="text-left">
              <p className="text-xs font-bold leading-none">
                {userProfile?.name || user?.name || 'Loading...'}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-tighter">
                {lang === 'bn' ? 'বিশেষজ্ঞ' : 'Specialist'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'messenger', label: lang === 'bn' ? 'মেসেঞ্জার' : 'Messenger', icon: MessageSquare },
            { id: 'stats', label: lang === 'bn' ? 'পরিসংখ্যান' : 'Analytics', icon: LayoutDashboard },
            { id: 'appointments', label: lang === 'bn' ? 'অ্যাপয়েন্টমেন্ট' : 'Appointments', icon: Calendar },
            { id: 'profile', label: lang === 'bn' ? 'প্রোফাইল' : 'Profile', icon: Users },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as typeof activeTab)}
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

        <div className="md:col-span-3 min-h-[600px]">
          {activeTab === 'messenger' ? (
            <SpecialistMessenger lang={lang} userId={userId} />
          ) : activeTab === 'profile' ? (
            <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">
                {lang === 'bn' ? 'প্রোফাইল' : 'Profile'}
              </h2>

              {profileLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <img
                        src={avatarSrc}
                        className="w-24 h-24 rounded-full border-4 border-green-500 object-cover"
                        alt="Profile"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all"
                        title={lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change photo'}
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                        {profileName || userProfile?.name}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400">{userProfile?.email}</p>
                      <p className="text-sm text-green-600 font-bold uppercase mt-1">
                        {lang === 'bn' ? 'বিশেষজ্ঞ' : 'Specialist'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                      {lang === 'bn' ? 'নাম' : 'Name'}
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => {
                        setProfileName(e.target.value);
                        setProfileSuccess(false);
                      }}
                      className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold"
                      placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your name'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                      {lang === 'bn' ? 'ইমেইল' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={userProfile?.email || ''}
                      disabled
                      className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                    />
                  </div>

                  {profileError && (
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{profileError}</p>
                  )}
                  {profileSuccess && (
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      {lang === 'bn' ? 'প্রোফাইল সংরক্ষিত হয়েছে!' : 'Profile saved successfully!'}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400 text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed"
                  >
                    {profileSaving
                      ? lang === 'bn'
                        ? 'সংরক্ষণ হচ্ছে...'
                        : 'Saving...'
                      : lang === 'bn'
                        ? 'সংরক্ষণ করুন'
                        : 'Save Profile'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-800 p-12 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 flex flex-col items-center justify-center text-center">
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-full mb-6">
                <LayoutDashboard className="w-12 h-12 text-zinc-300" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {lang === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
              </h3>
              <p className="text-zinc-500 max-w-sm">
                {lang === 'bn'
                  ? 'আমরা এই ফিচারটি আপনার জন্য তৈরি করছি।'
                  : 'We are currently building this feature for you.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

