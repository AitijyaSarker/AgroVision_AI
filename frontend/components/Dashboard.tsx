
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Scanner } from './Scanner';
import { ChatBot } from './ChatBot';
import { UserRole, Language, Specialist } from '../types';
import { translations } from '../translations';
import { MessageSquare, MapPin, Search, Bell, Users, LayoutDashboard } from 'lucide-react';

// Dynamically import MapComponent to prevent SSR issues
const MapComponent = dynamic(() => import('./farmer/MapComponent').then(mod => ({ default: mod.MapComponent })), {
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

interface DashboardProps {
  lang: Language;
  userRole: UserRole;
}

const specialists: Specialist[] = [
  { id: '1', name: 'Dr. Rafiqul Islam', institution: 'BARI', department: 'Plant Pathology', location: { lat: 23.9920, lng: 90.4125, address: 'Gazipur' }, image: 'https://picsum.photos/100/100?person=1', online: true },
  { id: '2', name: 'Sabrina Akter', institution: 'BAU', department: 'Entomology', location: { lat: 24.7471, lng: 90.4203, address: 'Mymensingh' }, image: 'https://picsum.photos/100/100?person=2', online: true },
  { id: '3', name: 'Mustafa Kamal', institution: 'Agri Dept', department: 'Field Officer', location: { lat: 24.8467, lng: 89.3730, address: 'Bogra' }, image: 'https://picsum.photos/100/100?person=3', online: false },
];

export const Dashboard: React.FC<DashboardProps> = ({ lang, userRole }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'chat' | 'offices' | 'specialists'>('scan');
  const t = (key: string) => translations[key]?.[lang] || key;

  const renderContent = () => {
    switch (activeTab) {
      case 'scan':
        return <Scanner />;
      case 'chat':
        return <ChatBot lang={lang} />;
      case 'offices':
        return <MapComponent lang={lang} />;
      case 'specialists':
        return (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
            {specialists.map(s => (
              <div key={s.id} className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-lg border border-zinc-100 dark:border-zinc-700 hover:shadow-xl transition-all group">
                <div className="relative mb-4">
                  <img src={s.image} className="w-20 h-20 rounded-2xl object-cover" alt={s.name} />
                  {s.online && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-zinc-800 rounded-full" />}
                </div>
                <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                <p className="text-zinc-500 text-sm mb-1">{s.institution} • {s.department}</p>
                <div className="flex items-center gap-1 text-zinc-400 text-xs mb-4">
                  <MapPin className="w-3 h-3" />
                  {s.location.address}
                </div>
                <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                  <MessageSquare className="w-4 h-4" />
                  {lang === 'bn' ? 'চ্যাট করুন' : 'Connect Now'}
                </button>
              </div>
            ))}
          </div>
        );
      default:
        return <Scanner />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <LayoutDashboard className="text-green-600" />
            {lang === 'bn' ? 'কৃষক ড্যাশবোর্ড' : 'Farmer Dashboard'}
          </h1>
          <p className="text-zinc-500 mt-2">{lang === 'bn' ? 'স্বাগতম! আপনার ফসল আজ কেমন আছে?' : 'Welcome back! How are your crops today?'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
             <Bell className="w-6 h-6 text-zinc-400 cursor-pointer hover:text-green-600 transition-colors" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full font-bold">2</div>
          </div>
          <div className="h-10 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-4 py-2 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700">
             <img src="https://picsum.photos/32/32" className="rounded-full" alt="avatar" />
             <span className="text-sm font-bold">Ahmed Ali</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-fit">
        {[
          { id: 'scan', label: lang === 'bn' ? 'ফসল স্ক্যান' : 'Crop Scan', icon: Search },
          { id: 'chat', label: lang === 'bn' ? 'এআই চ্যাটবট' : 'AI ChatBot', icon: MessageSquare },
          { id: 'offices', label: lang === 'bn' ? 'নিকটবর্তী অফিস' : 'Nearby Offices', icon: MapPin },
          { id: 'specialists', label: lang === 'bn' ? 'বিশেষজ্ঞগণ' : 'Specialists', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-zinc-700 text-green-600 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
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
