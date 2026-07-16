import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MessageSquare, MapPin, Users, Bell, LayoutDashboard, RefreshCw, Send, Camera } from 'lucide-react';
import { normalizeUserId } from '../../lib/messages';
import dynamic from 'next/dynamic';
import { dbService } from '../../mongodb';
import { Specialist, Conversation, Language } from '../../types';
import { Scanner } from './Scanner';
import { translations } from '../../translations';

// Dynamically import MapComponent to prevent SSR issues
const MapComponent = dynamic(() => import('./MapComponent').then(mod => ({ default: mod.MapComponent })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p>Loading map...</p>
      </div>
    </div>
  )
});

interface FarmerDashboardProps {
  userRole: 'farmer' | 'guest';
  userId?: string;
  user?: any;
  lang: Language;
  onProfileUpdate?: (updates: { name: string; avatar: string }) => void;
}

const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  userRole,
  userId,
  user,
  lang,
  onProfileUpdate,
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [activeTab, setActiveTab] = useState<'scan' | 'chat' | 'offices' | 'specialists' | 'messages' | 'profile'>('scan');
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [specialistsLoading, setSpecialistsLoading] = useState(false);
  const [specialistsError, setSpecialistsError] = useState<string | null>(null);
  const [consulting, setConsulting] = useState<Specialist | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedMessageConv, setSelectedMessageConv] = useState<Conversation | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const farmerId = normalizeUserId(userId);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    // Initialize chat with greeting message
    setChatMessages([{ role: 'assistant', content: t('ai_greeting') }]);
  }, [lang]);

  const avatarSrc =
    profileAvatar || userProfile?.avatar || user?.avatar || `https://picsum.photos/80/80?person=${farmerId || 'farmer'}`;

  const loadUserProfile = useCallback(async () => {
    if (!farmerId) return;
    setProfileLoading(true);
    const { data, error } = await dbService.getProfile(farmerId);
    if (data && !error) {
      setUserProfile(data);
      setProfileName(data.name || '');
      setProfileAvatar(data.avatar || '');
    } else if (error && (error.includes('not found') || error.includes('404') || error.includes('Invalid user'))) {
      // Stale session — user ID no longer exists in MongoDB (e.g. DB was reset).
      // Clear localStorage and reload so the user is prompted to re-register/login.
      console.warn('[FarmerDashboard] Stale user ID detected — clearing session:', farmerId, error);
      localStorage.removeItem('user');
      window.location.reload();
      return;
    } else if (user) {
      setUserProfile(user);
      setProfileName(user.name || '');
      setProfileAvatar(user.avatar || '');
    }
    setProfileLoading(false);
  }, [farmerId, user]);

  useEffect(() => {
    if (user) {
      setUserProfile((prev: any) => ({ ...prev, ...user }));
      if (!profileName) setProfileName(user.name || '');
      if (!profileAvatar) setProfileAvatar(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    if (farmerId) {
      loadSpecialists();
      loadConversations();
      loadUserProfile();
    }
  }, [farmerId]);

  useEffect(() => {
    if (activeTab !== 'messages' || !farmerId) return;
    loadConversations(true);
    const interval = setInterval(() => loadConversations(true), 8000);
    return () => clearInterval(interval);
  }, [activeTab, farmerId]);

  const loadSpecialists = async () => {
    setSpecialistsLoading(true);
    setSpecialistsError(null);
    const { data, error } = await dbService.getSpecialists();
    if (error) {
      setSpecialists([]);
      setSpecialistsError(error);
    } else {
      setSpecialists(data || []);
    }
    setSpecialistsLoading(false);
  };

  const loadConversations = async (silent = false) => {
    if (!farmerId) return;
    if (!silent) setMessagesLoading(true);
    const { data, error } = await dbService.getConversations(farmerId);
    if (!error && data) {
      setConversations(data);
      setSelectedMessageConv((prev) => {
        if (!prev) return prev;
        return data.find((c: Conversation) => c.id === prev.id) || prev;
      });
    }
    if (!silent) setMessagesLoading(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError(lang === 'bn' ? 'শুধু ছবি ফাইল গ্রহণযোগ্য' : 'Only image files are allowed');
      return;
    }
    if (file.size > 400_000) {
      setProfileError(
        lang === 'bn' ? 'ছবি ৪০০KB এর ছোট হতে হবে' : 'Image must be smaller than 400KB'
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
    if (!farmerId || profileSaving) return;
    const name = profileName.trim();
    if (!name) {
      setProfileError(lang === 'bn' ? 'নাম প্রয়োজন' : 'Name is required');
      return;
    }
    setProfileSaving(true);
    setProfileError(null);
    const { data, error } = await dbService.updateProfile(farmerId, {
      name,
      avatar: profileAvatar,
    });
    setProfileSaving(false);
    if (error || !data) {
      setProfileError(error || (lang === 'bn' ? 'সংরক্ষণ ব্যর্থ' : 'Failed to save'));
      return;
    }
    setUserProfile(data);
    setProfileName(data.name);
    setProfileAvatar(data.avatar || '');
    setProfileSuccess(true);
    onProfileUpdate?.({ name: data.name, avatar: data.avatar || '' });
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const isOwnMessage = (senderId: string) => normalizeUserId(senderId) === farmerId;

  const handleConsult = (specialist: Specialist) => {
    setConsulting(specialist);
    setSentSuccess(false);
    setSendError(null);
    setMessageText('');
  };

  const handleSendMessage = async () => {
    if (!consulting || !messageText.trim() || !userId || sendingMessage) return;

    const specialistId = String(consulting.id || '').trim();
    if (!specialistId) {
      setSendError(lang === 'bn' ? 'বিশেষজ্ঞ আইডি পাওয়া যায়নি' : 'Specialist id missing');
      return;
    }

    setSendingMessage(true);
    setSendError(null);

    const { error } = await dbService.sendMessage({
      fromUserId: farmerId,
      toUserId: specialistId,
      text: messageText.trim(),
      timestamp: new Date(),
    });

    setSendingMessage(false);

    if (error) {
      setSendError(
        error ||
          (lang === 'bn' ? 'বার্তা পাঠাতে ব্যর্থ' : 'Failed to send message')
      );
      return;
    }

    await loadConversations(true);
    const convId = [farmerId, specialistId].sort().join('_');
    setActiveTab('messages');
    setTimeout(async () => {
      const { data } = await dbService.getConversations(farmerId);
      if (data) {
        setConversations(data);
        const match = data.find((c: Conversation) => c.id === convId);
        if (match) setSelectedMessageConv(match);
      }
    }, 300);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setConsulting(null);
      setMessageText('');
    }, 2000);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const history = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          language: lang,
          history: [...history, { role: 'user', content: userMessage }].slice(-10),
        }),
      });

      if (!res.ok) throw new Error('Chat failed');

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response || 'No response.' },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            lang === 'bn'
              ? 'সংযোগ সমস্যা। GEMINI_API_KEY যাচাই করুন এবং সার্ভার রিস্টার্ট করুন।'
              : 'Connection issue. Check GEMINI_API_KEY and restart the server.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'scan':
        return <Scanner lang={lang} userId={userId} />;
      case 'chat':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('chat_title')}</h2>

            <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <div className="p-6 bg-green-700 text-white">
                <h3 className="text-xl font-bold">{t('app_title')} Assistant</h3>
                <p className="text-green-100 font-bold">{t('chat_subtitle')}</p>
              </div>

              <div className="h-96 p-6 overflow-y-auto space-y-4">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">AI</div>
                    )}
                    <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                      <p className={`font-bold p-3 rounded-2xl max-w-md ${
                        message.role === 'user'
                          ? 'bg-green-600 text-white'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {message.content}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-bold text-sm">{t('you')}</div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">AI</div>
                    <div className="flex-1">
                      <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-2xl max-w-md">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick question starters */}
                {chatMessages.length === 1 && !chatLoading && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                    <h4 className="font-bold text-green-800 dark:text-green-300 mb-3">
                      {lang === 'bn' ? 'দ্রুত প্রশ্ন:' : 'Quick Questions:'}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        lang === 'bn' ? 'আমার ধানে হলুদ দাগ কেন?' : 'Why are there yellow spots on my rice?',
                        lang === 'bn' ? 'মাটি পরীক্ষা কীভাবে করব?' : 'How to test soil quality?',
                        lang === 'bn' ? 'জৈব সার কীভাবে ব্যবহার করব?' : 'How to use organic fertilizers?',
                        lang === 'bn' ? 'কীট নিয়ন্ত্রণের উপায়?' : 'Pest control methods?'
                      ].map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setChatInput(question)}
                          className="text-left p-2 bg-white dark:bg-zinc-800 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800 transition-colors text-sm"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                    placeholder={t('chat_placeholder')}
                    className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl outline-none focus:ring-2 ring-green-600"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-6 py-4 bg-green-700 hover:bg-green-800 disabled:bg-zinc-400 text-white font-black rounded-2xl shadow-lg transition-all disabled:cursor-not-allowed"
                  >
                    {t('send_message')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'offices':
        return <MapComponent lang={lang} />;
      case 'specialists':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('specialists_title')}</h2>
              <button
                onClick={loadSpecialists}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('refresh')}
              </button>
            </div>

            {specialistsError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-sm font-bold">
                {specialistsError}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {specialistsLoading ? (
                <div className="col-span-3 flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
                </div>
              ) : specialists.length > 0 ? specialists.map(s => (
                <div key={s.id} className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-all group">
                  <div className="relative mb-4">
                    <img src={s.image} className="w-20 h-20 rounded-2xl object-cover" alt={s.name} />
                    {s.online && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 border-2 border-white dark:border-zinc-800 rounded-full" />}
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-zinc-900 dark:text-white">{s.name}</h3>
                  <p className="text-zinc-700 dark:text-zinc-500 text-sm font-bold mb-1">{s.institution} • {s.department}</p>
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs font-black mb-4 uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    {s.location.address}
                  </div>
                  <button
                    onClick={() => handleConsult(s)}
                    className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] shadow-lg shadow-green-700/20"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t('consult_now')}
                  </button>
                </div>
              )) : (
                <div className="col-span-3 text-center py-12">
                  <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-full mx-auto w-fit mb-6">
                    <Users className="w-12 h-12 text-zinc-300" />
                  </div>
                    <h3 className="text-2xl font-bold mb-2">{t('no_specialists')}</h3>
                    <p className="text-zinc-500 max-w-md mx-auto">{t('specialists_description')}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('messages_title')}</h2>
              <button
                type="button"
                onClick={() => loadConversations()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('refresh')}
              </button>
            </div>

            <div className="space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
                </div>
              ) : conversations.length > 0 ? conversations.map((conv) => (
                <div
                  key={conv.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedMessageConv(selectedMessageConv?.id === conv.id ? null : conv)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedMessageConv(selectedMessageConv?.id === conv.id ? null : conv)}
                  className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={conv.otherUserImage || conv.farmerImage}
                      className="w-10 h-10 rounded-full border border-zinc-200 object-cover"
                      alt={conv.otherUserName || conv.farmerName}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {conv.otherUserName || conv.farmerName}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(conv.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 font-bold">{conv.lastMessage}</p>

                      {selectedMessageConv?.id === conv.id && (
                        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3 max-h-80 overflow-y-auto">
                          {(selectedMessageConv.messages.length
                            ? selectedMessageConv.messages
                            : conv.messages
                          ).map((msg) => {
                            const mine = isOwnMessage(msg.senderId);
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                              >
                                {!mine && (
                                  <span className="text-[10px] font-bold text-green-700 dark:text-green-400 mb-1 uppercase">
                                    {conv.otherUserName ||
                                      conv.farmerName ||
                                      (lang === 'bn' ? 'বিশেষজ্ঞ' : 'Specialist')}
                                  </span>
                                )}
                                <p
                                  className={`text-sm font-bold p-3 rounded-2xl max-w-md ${
                                    mine
                                      ? 'bg-green-600 text-white'
                                      : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                                  }`}
                                >
                                  {msg.text}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-full mx-auto w-fit mb-6">
                    <MessageSquare className="w-12 h-12 text-zinc-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{t('no_messages')}</h3>
                  <p className="text-zinc-500 max-w-md mx-auto">{t('messages_description')}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('profile_title')}</h2>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700">
              {profileLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <div className="relative">
                      <img
                        src={avatarSrc}
                        className="w-24 h-24 rounded-2xl border-4 border-green-500 object-cover"
                        alt="avatar"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg"
                        title={lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change photo'}
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                        {profileName || userProfile?.name || 'Farmer'}
                      </h3>
                      <p className="text-zinc-700 dark:text-zinc-500 font-bold">
                        {userProfile?.email || user?.email}
                      </p>
                      <p className="text-sm text-green-600 font-bold uppercase mt-1">
                        {lang === 'bn' ? 'কৃষক' : 'Farmer'}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-black text-zinc-700 dark:text-zinc-500 uppercase tracking-widest mb-2 block">
                        {t('full_name')}
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => {
                          setProfileName(e.target.value);
                          setProfileSuccess(false);
                        }}
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl outline-none focus:ring-2 ring-green-600"
                        placeholder={t('full_name')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-black text-zinc-700 dark:text-zinc-500 uppercase tracking-widest mb-2 block">
                        {t('email')}
                      </label>
                      <input
                        type="email"
                        value={userProfile?.email || ''}
                        disabled
                        className="w-full p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 text-zinc-500 font-bold rounded-2xl cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {profileError && (
                    <p className="mt-4 text-sm font-bold text-red-600 dark:text-red-400">{profileError}</p>
                  )}
                  {profileSuccess && (
                    <p className="mt-4 text-sm font-bold text-green-600 dark:text-green-400">
                      {lang === 'bn' ? 'প্রোফাইল সংরক্ষিত হয়েছে!' : 'Profile saved successfully!'}
                    </p>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-zinc-400 text-white font-black rounded-2xl shadow-lg transition-all disabled:cursor-not-allowed"
                    >
                      {profileSaving
                        ? lang === 'bn'
                          ? 'সংরক্ষণ হচ্ছে...'
                          : 'Saving...'
                        : t('save_changes')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      default:
        return <div>Default Content</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Consultation Modal */}
      {consulting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-green-700 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={consulting.image} className="w-10 h-10 rounded-full border-2 border-white/50" alt={consulting.name} />
                <div>
                  <h3 className="font-bold">{consulting.name}</h3>
                  <p className="text-xs opacity-80">{consulting.department}</p>
                </div>
              </div>
              <button onClick={() => setConsulting(null)} className="text-2xl font-light hover:rotate-90 transition-transform">&times;</button>
            </div>
            <div className="p-6">
              {sentSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-700">
                    <LayoutDashboard className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-green-800">{t('message_sent')}</h4>
                  <p className="text-zinc-700 dark:text-zinc-500 font-bold">{t('specialist_contact')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-sm font-black text-zinc-700 dark:text-zinc-500 uppercase tracking-widest">{t('describe_problem')}</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={5}
                    disabled={sendingMessage}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl outline-none focus:ring-2 ring-green-600"
                    placeholder={t('problem_placeholder')}
                  />
                  {sendError && (
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{sendError}</p>
                  )}
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageText.trim()}
                    className="w-full py-4 bg-green-700 hover:bg-green-800 disabled:bg-zinc-400 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    {sendingMessage
                      ? lang === 'bn'
                        ? 'পাঠানো হচ্ছে...'
                        : 'Sending...'
                      : t('send_message')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3 text-zinc-900 dark:text-white">
            <LayoutDashboard className="text-green-700 dark:text-green-400" />
            {t('dashboard_title')}
          </h1>
          <p className="text-zinc-700 dark:text-zinc-500 mt-2 font-bold">{t('dashboard_welcome')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-700 dark:text-zinc-400 hover:text-green-700 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Bell className="w-6 h-6" />
          </button>
          <div className="h-10 w-[1px] bg-zinc-300 dark:bg-zinc-800" />
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-4 py-2 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <img src={avatarSrc} className="w-8 h-8 rounded-full border border-zinc-200 object-cover" alt="avatar" />
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{userProfile?.name || 'Farmer'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-fit">
        {[
          { id: 'scan', label: t('tab_scan'), icon: Search },
          { id: 'chat', label: t('tab_chat'), icon: MessageSquare },
          { id: 'offices', label: t('tab_offices'), icon: MapPin },
          { id: 'specialists', label: t('tab_specialists'), icon: Users },
          { id: 'messages', label: t('tab_messages'), icon: MessageSquare },
          { id: 'profile', label: t('tab_profile'), icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-zinc-700 text-green-700 dark:text-green-400 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default FarmerDashboard;