import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Hash,
  Users,
  TrendingUp,
  Star,
  PlusCircle,
  Search,
  Send,
  Smile,
  Paperclip,
  ArrowLeft,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { AppDock } from '../components/AppDock';

interface Channel {
  id: string;
  name: string;
  description: string;
  members: number;
  isPrivate: boolean;
}

interface Message {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  timestamp: Date;
}

const channels: Channel[] = [
  {
    id: 'general',
    name: 'general',
    description: 'General discussion about markets and trading',
    members: 1234,
    isPrivate: false,
  },
  {
    id: 'market-analysis',
    name: 'market-analysis',
    description: 'Share and discuss market analysis',
    members: 856,
    isPrivate: false,
  },
  {
    id: 'trading-strategies',
    name: 'trading-strategies',
    description: 'Trading strategies and techniques',
    members: 654,
    isPrivate: false,
  },
];

const messages: Message[] = [
  {
    id: '1',
    content: 'What do you think about the recent market trends?',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    timestamp: new Date('2024-01-20T10:30:00'),
  },
  {
    id: '2',
    content: 'The volatility has been quite high lately.',
    author: {
      name: 'Mike Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    },
    timestamp: new Date('2024-01-20T10:32:00'),
  },
];

export function CommunityPage() {
  const [selectedChannel, setSelectedChannel] = useState<Channel>(channels[0]);
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    // Here you would typically send the message to your backend
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader
        title="Community"
        subtitle="Connect with traders and investors"
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search channels"
                className="w-full bg-gray-900 text-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 mb-4">
              <div className="flex items-center justify-between text-gray-400 text-sm mb-2">
                <span>Channels</span>
                <button className="hover:text-white transition-colors">
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full flex items-center px-2 py-1.5 rounded-md mb-1 ${
                    selectedChannel.id === channel.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  } transition-colors`}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  {channel.name}
                </button>
              ))}
            </div>

            <div className="px-4">
              <div className="flex items-center justify-between text-gray-400 text-sm mb-2">
                <span>Direct Messages</span>
                <button className="hover:text-white transition-colors">
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>
              {/* Add direct message list here */}
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-700">
            <button className="w-full flex items-center px-2 py-1.5 rounded-md text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                alt="Your avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>Your Profile</span>
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Channel Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Hash className="w-5 h-5 mr-2 text-gray-400" />
                  {selectedChannel.name}
                </h2>
                <p className="text-sm text-gray-400">{selectedChannel.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Star className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start mb-6">
                <img
                  src={message.author.avatar}
                  alt={message.author.name}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div>
                  <div className="flex items-baseline mb-1">
                    <span className="font-medium text-white mr-2">
                      {message.author.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
              <button
                type="button"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message #${selectedChannel.name}`}
                className="flex-1 bg-gray-800 text-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="text-gray-400 hover:text-white transition-colors"
                disabled={!messageInput.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
} 