import { useState, useRef } from 'react';
import { Brain, Share2, Download, Copy } from 'lucide-react';
import { useAdvisor } from '../context/AdvisorContext';
import { getResearchResponse } from '../services/researchApi';
import { toast } from 'react-hot-toast';
import { VercelV0Chat } from '../components/ui/v0-ai-chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SuggestedPrompt {
  heading: string;
  prompts: string[];
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    heading: "Technical Analysis",
    prompts: [
      "Analyze key technical indicators for AAPL",
      "Identify chart patterns in major tech stocks",
      "Show support and resistance levels for NVDA"
    ]
  },
  {
    heading: "Market Research",
    prompts: [
      "Current market sentiment around AI stocks",
      "Key market risks and opportunities",
      "Performance analysis of tech sector"
    ]
  },
  {
    heading: "Portfolio Analysis",
    prompts: [
      "Analyze my portfolio performance",
      "Suggest portfolio optimizations",
      "Identify portfolio risks"
    ]
  }
];

export function ResearchAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { usePortfolioContext, setUsePortfolioContext } = useAdvisor();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (input: string) => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const response = await getResearchResponse(input, 'GENERAL_ADVISOR');
      setMessages(prev => [...prev, 
        { role: 'user', content: input },
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background/95 to-background">
      {/* Header */}
      <div className="glass-panel sticky top-0 z-50 border-b border-border/20 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">Research Assistant</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">PRO</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-secondary btn-sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            <button className="btn-primary btn-sm">
              <Download className="w-4 h-4 mr-2" />
              Export Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="container h-full px-4 mx-auto">
          <VercelV0Chat
            messages={messages}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            suggestedPrompts={SUGGESTED_PROMPTS}
            emptyState={
              <div className="flex flex-col items-center justify-center text-center">
                <Brain className="w-12 h-12 mb-4 text-primary" />
                <h2 className="text-2xl font-semibold mb-2">Welcome to Research Assistant</h2>
                <p className="text-foreground/70 max-w-md mb-6">
                  Your AI-powered research companion. Ask questions about stocks, markets, or use our specialized tools.
                </p>
              </div>
            }
            messageActions={(message: Message) => (
              message.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      toast.success('Copied to clipboard');
                    }}
                    className="text-xs text-foreground/50 hover:text-foreground transition-colors"
                  >
                    <Copy className="w-3 h-3 mr-1 inline" />
                    Copy
                  </button>
                  <button className="text-xs text-foreground/50 hover:text-foreground transition-colors">
                    <Share2 className="w-3 h-3 mr-1 inline" />
                    Share
                  </button>
                </div>
              )
            )}
            inputOptions={
              <div className="flex items-center gap-2 mb-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePortfolioContext}
                    onChange={(e) => setUsePortfolioContext(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm text-foreground/70">Use Portfolio Context</span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
} 