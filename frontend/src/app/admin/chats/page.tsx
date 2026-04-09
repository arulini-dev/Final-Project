'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiService } from '@/services/api';

interface ChatMessage {
  _id: string;
  text: string;
  senderId: {
    name: string;
    email: string;
    role: string;
  } | null;
  bookingId: {
    _id: string;
    eventId?: {
      title: string;
    };
  } | null;
  isRead: boolean;
  createdAt: string;
}

interface ChatThread {
  bookingId: string;
  eventTitle: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export default function AdminChatsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChatMessages();
  }, []);

  const fetchChatMessages = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/chats', { params: { limit: 100 } });
      setMessages(response.messages || []);
      if (response.messages && response.messages.length > 0) {
        const firstBooking = response.messages[0].bookingId?._id;
        setSelectedBookingId(firstBooking ?? null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  };

  const threads = useMemo(() => {
    const threadMap = new Map<string, ChatThread>();

    messages.forEach((message) => {
      const bookingId = message.bookingId?._id || 'unknown';
      const eventTitle = message.bookingId?.eventId?.title || 'Unknown Event';
      const existing = threadMap.get(bookingId);
      const createdAt = new Date(message.createdAt).toISOString();

      if (!existing) {
        threadMap.set(bookingId, {
          bookingId,
          eventTitle,
          lastMessage: message.text,
          lastMessageDate: createdAt,
          unreadCount: message.isRead ? 0 : 1,
          messages: [message]
        });
      } else {
        existing.messages.push(message);
        if (!message.isRead) existing.unreadCount += 1;
        if (new Date(message.createdAt) > new Date(existing.lastMessageDate)) {
          existing.lastMessage = message.text;
          existing.lastMessageDate = createdAt;
        }
      }
    });

    return Array.from(threadMap.values()).sort((a, b) =>
      new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
    );
  }, [messages]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.bookingId === selectedBookingId) || threads[0] || null,
    [threads, selectedBookingId]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Monitoring</h1>
          <p className="text-sm text-gray-600">Monitor chat threads by booking and review message history.</p>
        </div>
        <div className="text-sm text-gray-600">Threads: {threads.length}</div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start justify-between">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3 text-sm text-red-800">{error}</div>
          </div>
          <button onClick={() => setError(null)} className="rounded-md bg-red-50 p-1 text-red-500 hover:bg-red-100">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        <section className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Chat Threads</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {threads.length > 0 ? (
              threads.map((thread) => (
                <button
                  key={thread.bookingId}
                  onClick={() => setSelectedBookingId(thread.bookingId)}
                  className={`w-full text-left px-6 py-4 hover:bg-gray-50 ${
                    selectedThread?.bookingId === thread.bookingId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Booking {thread.bookingId.slice(-8)}</p>
                      <p className="text-xs text-gray-500">{thread.eventTitle}</p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 truncate">{thread.lastMessage}</p>
                  <p className="mt-1 text-xs text-gray-400">{new Date(thread.lastMessageDate).toLocaleString()}</p>
                </button>
              ))
            ) : (
              <div className="p-6 text-sm text-gray-500">No active chat threads found.</div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Message Viewer</h2>
              <p className="text-xs text-gray-500">Viewing messages by booking thread.</p>
            </div>
            <span className="text-xs text-gray-500">{selectedThread?.messages.length ?? 0} messages</span>
          </div>
          <div className="h-[600px] overflow-y-auto p-6 space-y-4 bg-gray-50">
            {selectedThread ? (
              selectedThread.messages
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((message) => (
                  <div key={message._id} className="rounded-2xl p-4 border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
                      <div>
                        <span className="font-semibold text-gray-900">{message.senderId?.name || 'System'}</span>
                        <span className="ml-2">({message.senderId?.role || 'unknown'})</span>
                      </div>
                      <span>{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-3 text-sm text-gray-700">{message.text}</p>
                  </div>
                ))
            ) : (
              <div className="text-center py-20 text-sm text-gray-500">Select a chat thread to view its messages.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
