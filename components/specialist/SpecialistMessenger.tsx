
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Send, CheckCheck, MessageSquare } from 'lucide-react';
import { Language, Conversation, Message } from '../../types';
import { dbService } from '../../mongodb';

interface SpecialistMessengerProps {
  lang: Language;
  userId?: string;
}

export const SpecialistMessenger: React.FC<SpecialistMessengerProps> = ({ lang, userId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await dbService.getConversations(userId);

    if (data && !error) {
      const list = data as Conversation[];
      setConversations(list);
      setSelectedConv((prev) => {
        if (!list.length) return null;
        if (prev) {
          return list.find((c) => c.id === prev.id) || list[0];
        }
        return list[0];
      });
    } else {
      setConversations([]);
      setSelectedConv(null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConv?.messages, selectedConv?.id]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConv || !userId || sending) return;

    const text = replyText.trim();
    const farmerId = selectedConv.farmerId;
    if (!farmerId) return;

    setSending(true);
    setReplyText('');

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      senderId: userId,
      senderName: 'You',
      text,
      timestamp: new Date(),
      isFromFarmer: false,
    };

    const updatedConv: Conversation = {
      ...selectedConv,
      messages: [...selectedConv.messages, optimistic],
      lastMessage: text,
      timestamp: new Date(),
      unreadCount: 0,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConv.id ? updatedConv : c))
    );
    setSelectedConv(updatedConv);

    const { error } = await dbService.sendMessage({
      fromUserId: userId,
      toUserId: farmerId,
      text,
      timestamp: new Date(),
    });

    setSending(false);

    if (error) {
      await loadConversations();
      return;
    }

    await loadConversations();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl h-[650px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden flex h-[650px] animate-in slide-in-from-right-8 duration-500">
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
          {conversations.length === 0 ? (
            <p className="p-6 text-sm text-zinc-500 text-center">
              {lang === 'bn' ? 'এখনও কোনো বার্তা নেই' : 'No messages yet'}
            </p>
          ) : (
            conversations.map((conv) => (
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
                  <img
                    src={conv.farmerImage}
                    className="w-12 h-12 rounded-2xl object-cover"
                    alt={conv.farmerName}
                  />
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-[10px] text-white font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm truncate">{conv.farmerName}</h4>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(conv.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${
                      conv.unreadCount > 0
                        ? 'font-bold text-zinc-900 dark:text-white'
                        : 'text-zinc-500'
                    }`}
                  >
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedConv ? (
        <div className="flex-1 flex flex-col bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedConv.farmerImage}
                className="w-10 h-10 rounded-xl"
                alt={selectedConv.farmerName}
              />
              <div>
                <h3 className="font-bold text-sm">{selectedConv.farmerName}</h3>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                  {lang === 'bn' ? 'কৃষক' : 'Farmer'}
                </p>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {selectedConv.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isFromFarmer ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm relative group ${
                    msg.isFromFarmer
                      ? 'bg-white dark:bg-zinc-800 rounded-tl-none border border-zinc-100 dark:border-zinc-700'
                      : 'bg-green-600 text-white rounded-tr-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <div
                    className={`flex items-center gap-1 text-[10px] mt-2 opacity-50 ${
                      msg.isFromFarmer ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
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
                disabled={sending}
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sending}
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
          <h3 className="text-2xl font-bold">
            {lang === 'bn' ? 'বার্তা নির্বাচন করুন' : 'Select a Conversation'}
          </h3>
          <p className="text-zinc-500 max-w-xs">
            {lang === 'bn'
              ? 'বাম পাশের তালিকা থেকে কোনো কৃষকের সাথে কথা বলা শুরু করুন।'
              : 'Choose a farmer from the list on the left to start advising.'}
          </p>
        </div>
      )}
    </div>
  );
};

