import { useState } from 'react';
import { Play, MonitorPlay } from 'lucide-react';

interface NewsSource {
  id: string;
  name: string;
  channelId: string;
  description: string;
}

const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    channelId: 'iEpJwprxDdk',
    description: 'Global financial news and market coverage'
  },
  {
    id: 'cnbc',
    name: 'CNBC',
    channelId: '9NyxcX3rhQs',
    description: 'Breaking news and global market coverage'
  },
  {
    id: 'schwab',
    name: 'Schwab Network',
    channelId: 'EK76hBAOMEk',
    description: 'Market insights and analysis'
  },
  {
    id: 'yahoo-finance',
    name: 'Yahoo Finance',
    channelId: 'KQp-e_XQnDE',
    description: 'Market analysis and financial news'
  }
];

export function LiveVideoStream() {
  const [selectedSource, setSelectedSource] = useState<NewsSource>(NEWS_SOURCES[0]);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Live Coverage</h2>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            {isExpanded ? 'Minimize' : 'Expand'}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {NEWS_SOURCES.map((source) => (
            <button
              key={source.id}
              onClick={() => setSelectedSource(source)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                selectedSource.id === source.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Play className="w-4 h-4" />
              {source.name}
            </button>
          ))}
        </div>
      </div>

      {isExpanded && (
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${selectedSource.channelId}?autoplay=1&mute=1`}
            title={`${selectedSource.name} Live Stream`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
} 