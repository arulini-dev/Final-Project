'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';

interface ChatMessage {
  _id: string;
  bookingId: string;
  message: string;
  messageType: string;
  createdAt: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function BookingChatPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSentTypingRef = useRef(false);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!bookingId) return;

    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError('');
      const token = localStorage.getItem('token');
      if (token) {
        socket.emit('authenticate', token);
        socket.emit('join_room', bookingId);
      } else {
        setError('Missing authentication token.');
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setJoinedRoom(false);
    });

    socket.on('joined_room', () => {
      setJoinedRoom(true);
      setError('');
    });

    socket.on('receive_message', (message: ChatMessage) => {
      setMessages((current) => [...current, message]);
    });

    socket.on('user_typing', (data: { userId: string }) => {
      setTypingUsers((current) => Array.from(new Set([...current, data.userId])));
    });

    socket.on('user_stop_typing', (data: { userId: string }) => {
      setTypingUsers((current) => current.filter((userId) => userId !== data.userId));
    });

    socket.on('error', (payload: { message: string }) => {
      setError(payload?.message ?? 'Socket error.');
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingId, isAuthenticated]);

  useEffect(() => {
    if (!bookingId || !isAuthenticated) return;

    const loadMessages = async () => {
      try {
        const response = await apiService.getBookingMessages(bookingId);
        setMessages(response?.messages ?? []);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Unable to load chat history.');
      }
    };

    loadMessages();
  }, [bookingId, isAuthenticated]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!socketRef.current || !joinedRoom) return;
    if (!hasSentTypingRef.current) {
      socketRef.current.emit('typing', { bookingId });
      hasSentTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { bookingId });
      hasSentTypingRef.current = false;
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }
    if (!socketRef.current || !joinedRoom) {
      setError('Unable to send message until you join the room.');
      return;
    }

    try {
      setSending(true);
      socketRef.current.emit('send_message', {
        bookingId,
        message: newMessage.trim(),
      });
      setNewMessage('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const typingIndicator = useMemo(() => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return 'Someone is typing...';
    return 'People are typing...';
  }, [typingUsers]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Please log in to join your booking chat.</p>
        <a href="/login">
          <Button>Login</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Chat</h1>
          <p className="text-sm text-gray-500">Real-time messaging for booking {bookingId}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${joinedRoom ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
            {joinedRoom ? 'Joined room' : 'Joining room...'}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex h-[60vh] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No messages yet. Start the conversation.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                    <span>{message.sender?.name ?? 'Guest'}</span>
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="mt-3 text-gray-900 whitespace-pre-wrap">{message.message}</p>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-slate-50 px-4 py-4">
          {typingIndicator && <div className="mb-2 text-sm text-slate-500">{typingIndicator}</div>}
          <div className="flex gap-3">
            <input
              value={newMessage}
              onChange={(event) => handleTyping(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Write a message..."
              className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sending || !joinedRoom}>
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
