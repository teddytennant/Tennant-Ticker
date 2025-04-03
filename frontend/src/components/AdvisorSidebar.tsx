import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Calculator, 
  PieChart, 
  TrendingUp, 
  Clock, 
  Plus, 
  Trash2, 
  MessageSquare,
  ChevronRight,
  X,
  RefreshCw
} from 'lucide-react';
import { useAdvisor, AdvisorMode, Chat } from '../context/AdvisorContext';
import { useSidebar } from '../context/SidebarContext';
import toast from 'react-hot-toast';

const iconMap: Record<string, React.ComponentType<any>> = {
  Brain,
  Calculator,
  PieChart,
  TrendingUp
};

export function AdvisorSidebar() {
  const { 
    currentMode, 
    availableModes, 
    previousChats, 
    setCurrentMode, 
    deleteChat,
    clearAllChats 
  } = useAdvisor();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'modes' | 'chats'>('modes');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric'
    });
  };

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Brain;
    return <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />;
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    console.log('Deleting chat with ID:', chatId);
    deleteChat(chatId);
    toast.success('Chat deleted');
  };

  const handleClearAllChats = () => {
    console.log('Clearing all chats');
    clearAllChats();
    toast.success('All chats cleared');
  };

  const navigateToChat = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="w-64 border-r border-gray-800 bg-gray-900">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="text-white font-medium">Advisor</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'modes' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('modes')}
        >
          Advisor Modes
        </button>
        <button
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'chats' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('chats')}
        >
          Previous Chats
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-7.5rem)]">
        {activeTab === 'modes' ? (
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between px-2">
              <span className="text-xs font-medium text-gray-400">SELECT MODE</span>
            </div>
            <div className="space-y-2">
              {availableModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setCurrentMode(mode)}
                  className={`w-full px-3 py-3 text-left rounded-md text-sm flex items-center gap-2 group transition-colors ${
                    currentMode.id === mode.id
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {renderIcon(mode.icon)}
                  <div className="flex-1">
                    <div className="font-medium">{mode.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{mode.description}</div>
                  </div>
                  {currentMode.id === mode.id && (
                    <ChevronRight className="w-4 h-4 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-xs font-medium text-gray-400">RECENT CHATS</span>
              <div className="flex items-center gap-1">
                <button 
                  className="p-1 rounded-md text-gray-500 hover:text-gray-400 transition-colors"
                  title="New chat"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {previousChats.length > 0 ? (
              <div className="space-y-1">
                {previousChats.map((chat) => (
                  <div 
                    key={chat.id}
                    className="relative group"
                  >
                    <div
                      onClick={() => navigate(`/chat/${chat.id}`)}
                      className="block w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {renderIcon(chat.mode.icon)}
                        <span className="text-xs text-gray-400">{chat.mode.name}</span>
                      </div>
                      <div className="font-medium truncate pr-8">{chat.title}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(chat.timestamp)}
                      </div>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete button clicked for chat:', chat.id);
                        deleteChat(chat.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md text-gray-500 hover:text-red-400 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageSquare className="w-10 h-10 text-gray-700 mb-2" />
                <p className="text-sm text-gray-500">No chat history yet</p>
                <p className="text-xs text-gray-600 mt-1">
                  Start a new conversation with an advisor
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleClearAllChats}
          className="w-full px-3 py-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-md transition-colors text-sm flex items-center justify-center gap-2"
          title="Clear all chats"
          type="button"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear conversation
        </button>
      </div>
    </div>
  );
} 