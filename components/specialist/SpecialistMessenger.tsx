
import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, User, MoreVertical, Phone, Video, Info, CheckCheck, MessageSquare } from 'lucide-react';
import { Language, Conversation, Message } from '../../types';
import { dbService } from '../../mongodb';

interface SpecialistMessengerProps {
  lang: Language;
  userId?: string;
}

const mockConversations: Conversation[] = [
  {
    id: 'c1',
    farmerName: 'Abul Kashem',
    farmerImage: 'https://picsum.photos/100/100?q=10',
    lastMessage: 'আমার ধানের পাতায় হলুদ দাগ...',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'f1', senderName: 'Abul Kashem', text: 'সালামু আলাইকুম স্যার।', timestamp: new Date(Date.now() - 1000 * 60 * 10), isFromFarmer: true },
      { id: 'm2', senderId: 'f1', senderName: 'Abul Kashem', text: 'আমার ধানের পাতায় কিছু হলুদ দাগ দেখা যাচ্ছে, কি করব?', timestamp: new Date(Date.now() - 1000 * 60 * 5), isFromFarmer: true },
    ]
  },
  {
    id: 'c2',
    farmerName: 'Rahim Uddin',
    farmerImage: 'https://picsum.photos/100/100?q=11',
    lastMessage: 'ধন্যবাদ স্যার আপনার পরামর্শের জন্য।',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    unreadCount: 0,
    messages: [
      { id: 'm3', senderId: 'f2', senderName: 'Rahim Uddin', text: 'স্যার পাটের পোকা দমনে কি ব্যবহার করব?', timestamp: new Date(Date.now() - 1000 * 60 * 120), isFromFarmer: true },
      { id: 'm4', senderId: 's1', senderName: 'Dr. Rafiqul', text: 'আপনি নিম তেল ব্যবহার করে দেখতে পারেন।', timestamp: new Date(Date.now() - 1000 * 60 * 90), isFromFarmer: false },
      { id: 'm5', senderId: 'f2', senderName: 'Rahim Uddin', text: 'ধন্যবাদ স্যার আপনার পরামর্শের জন্য।', timestamp: new Date(Date.now() - 1000 * 60 * 60), isFromFarmer: true },
    ]
  }
];

export const SpecialistMessenger: React.FC<SpecialistMessengerProps> = ({ lang, userId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConversations = async () => {
      if (!userId) return;
      
      setLoading(true);
      const { data, error } = await dbService.getConversations(userId);
      
      if (data && !error) {
        // Load messages for each conversation
        const conversationsWithMessages = await Promise.all(
          data.map(async (conv) => {
            const { data: messages } = await dbService.getMessages(conv.id);
            const messagesFormatted: Message[] = (messages || []).map(msg => ({
              id: msg.id,
              senderId: msg.sender_id,
              senderName: msg.sender_id === userId ? 'You' : conv.farmerName,
              text: msg.text,
              timestamp: new Date(msg.created_at),
              isFromFarmer: msg.sender_id !== userId
            }));
            
            return {
              ...conv,
              messages: messagesFormatted
            };
          })
        );
        
        setConversations(conversationsWithMessages);
        if (conversationsWithMessages.length > 0) {
          setSelectedConv(conversationsWithMessages[0]);
        }
      }
      setLoading(false);
    };
    
    loadConversations();
  }, [userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Realtime subscription logic - commented out as not implemented
    // if (selectedConv && userId) {
    //   const subscription = dbService.subscribeToMessages(selectedConv.id, async (payload) => {
    //     // Reload messages for this conversation
    //     const { data: messages } = await dbService.getMessages(selectedConv.id);
    //     const messagesFormatted: Message[] = (messages || []).map(msg => ({
    //       id: msg.id,
    //       senderId: msg.sender_id,
    //       senderName: msg.sender_id === userId ? 'You' : selectedConv.farmerName,
    //       text: msg.text,
    //       timestamp: new Date(msg.created_at),
    //       isFromFarmer: msg.sender_id !== userId
    //     }));
    //     
    //     setSelectedConv(prev => prev ? {
    //       ...prev,
    //       messages: messagesFormatted,
    //       lastMessage: payload.new.text,
    //       timestamp: new Date(payload.new.created_at)
    //     } : null);
    //     
    //     // Update conversations list
    //     setConversations(prev => prev.map(c => 
    //       c.id === selectedConv.id 
    //         ? { ...c, lastMessage: payload.new.text, timestamp: new Date(payload.new.created_at) }
    //         : c
    //     ));
    //   });
    //
    //   return () => {
    //     subscription.unsubscribe();
    //   };
    // }
  }, [selectedConv?.id, userId]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConv || !userId) return;

    const newMessage: Message = {
      id: Math.random().toString(),
      senderId: userId,
      senderName: 'You',
      text: replyText.trim(),
      timestamp: new Date(),
      isFromFarmer: false
    };

    const updatedConv = {
      ...selectedConv,
      messages: [...selectedConv.messages, newMessage],
      lastMessage: replyText.trim(),
      timestamp: new Date(),
      unreadCount: 0
    };

    setConversations(prev => prev.map(c => c.id === selectedConv.id ? updatedConv : c));
    setSelectedConv(updatedConv);
    
    // Save to database
    await dbService.sendMessage({
      fromUserId: userId,
      toUserId: selectedConv.farmerId || selectedConv.id.split('-').find(id => id !== userId) || '',
      text: replyText.trim(),
      timestamp: new Date()
    });
    
    setReplyText('');
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden flex h-[650px] animate-in slide-in-from-right-8 duration-500">
      {/* Inbox List */}
      <div className="w-1/3 border-r border-zinc-100 dark:border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-black mb-4">{lang === 'bn' ? 'কৃষকদের বার্তা' : 'Farmer Inquiries'}</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-green-600 transition-colors" />
            <input 
              type="text" 
              placeholder={lang === 'bn' ? 'নাম খুঁজুন...' : 'Search farmers...'}
              className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 ring-green-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`p-6 flex items-center gap-4 cursor-pointer transition-all border-l-4 ${
                selectedConv?.id === conv.id 
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-600' 
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border-transparent'
              }`}
            >
              <div className="relative">
                <img src={conv.farmerImage} className="w-12 h-12 rounded-2xl object-cover" alt={conv.farmerName} />
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-[10px] text-white font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 animate-bounce">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm truncate">{conv.farmerName}</h4>
                  <span className="text-[10px] text-zinc-400">5m</span>
                </div>
                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={selectedConv.farmerImage} className="w-10 h-10 rounded-xl" alt={selectedConv.farmerName} />
              <div>
                <h3 className="font-bold text-sm">{selectedConv.farmerName}</h3>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"><Phone className="w-5 h-5" /></button>
              <button className="p-2 text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"><Video className="w-5 h-5" /></button>
              <button className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {selectedConv.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isFromFarmer ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm relative group ${
                  msg.isFromFarmer 
                    ? 'bg-white dark:bg-zinc-800 rounded-tl-none border border-zinc-100 dark:border-zinc-700' 
                    : 'bg-green-600 text-white rounded-tr-none'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center gap-1 text-[10px] mt-2 opacity-50 ${msg.isFromFarmer ? 'justify-start' : 'justify-end'}`}>
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {!msg.isFromFarmer && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex gap-2 items-center bg-zinc-100 dark:bg-zinc-800 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 ring-green-500 transition-all">
              <input 
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                placeholder={lang === 'bn' ? 'উত্তর লিখুন...' : 'Write your reply...'}
                className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
              />
              <button 
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
           <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-full">
              <MessageSquare className="w-12 h-12 text-zinc-300" />
           </div>
           <h3 className="text-2xl font-bold">{lang === 'bn' ? 'বার্তা নির্বাচন করুন' : 'Select a Conversation'}</h3>
           <p className="text-zinc-500 max-w-xs">{lang === 'bn' ? 'বাম পাশের তালিকা থেকে কোনো কৃষকের সাথে কথা বলা শুরু করুন।' : 'Choose a farmer from the list on the left to start advising.'}</p>
        </div>
      )}
    </div>
  );
};
