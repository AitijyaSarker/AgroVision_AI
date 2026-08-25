
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Language } from '../types';

export const Contact: React.FC<{ lang: Language }> = ({ lang }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-16">
      <div className="space-y-8">
        <h2 className="text-5xl font-black leading-tight">
          {lang === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch with Us'}
        </h2>
        <p className="text-lg text-zinc-500">
          {lang === 'bn' ? 'আপনার কোনো প্রশ্ন বা পরামর্শ থাকলে আমাদের জানাতে পারেন। আমরা সবসময় আপনাদের পাশে আছি।' : 'If you have any questions or suggestions, feel free to reach out. We are always here to help.'}
        </p>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600">
              <Mail />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Email</p>
              <p className="font-bold">support@agrovision.bd</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
              <Phone />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Call</p>
              <p className="font-bold">+880 1712-345678</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600">
              <MapPin />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Office</p>
              <p className="font-bold">Agri-Tech Park, Banani, Dhaka</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 p-10 rounded-[3rem] shadow-2xl border border-zinc-100 dark:border-zinc-700 relative overflow-hidden">
        {submitted ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black">{lang === 'bn' ? 'বার্তা পাঠানো হয়েছে!' : 'Message Sent!'}</h3>
            <p className="text-zinc-500">{lang === 'bn' ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।' : 'We will get back to you shortly.'}</p>
            <button onClick={() => setSubmitted(false)} className="text-green-600 font-bold hover:underline">Send another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">{lang === 'bn' ? 'আপনার নাম' : 'Full Name'}</label>
                <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none focus:ring-2 ring-green-500 transition-all outline-none" placeholder="e.g. Abul Kashem" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}</label>
                <input required type="tel" className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none focus:ring-2 ring-green-500 transition-all outline-none" placeholder="+880 1XXX XXXXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">{lang === 'bn' ? 'বার্তা' : 'Message'}</label>
                <textarea required rows={4} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none focus:ring-2 ring-green-500 transition-all outline-none resize-none" placeholder={lang === 'bn' ? 'আপনার প্রশ্ন এখানে লিখুন...' : 'Write your question here...'} />
              </div>
            </div>
            <button type="submit" className="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 active:scale-95">
              <Send className="w-5 h-5" />
              {lang === 'bn' ? 'বার্তা পাঠান' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
