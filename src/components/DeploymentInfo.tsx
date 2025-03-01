import { useState, useEffect } from 'react';

interface DeploymentData {
  id: string;
  timestamp: string;
  version: string;
}

export function DeploymentInfo() {
  const [deploymentData, setDeploymentData] = useState<DeploymentData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchDeploymentInfo = async () => {
      try {
        const response = await fetch('/netlify-deploy-identifier.txt');
        if (!response.ok) {
          throw new Error('Failed to fetch deployment info');
        }
        
        const text = await response.text();
        
        // Parse the text file
        const idMatch = text.match(/Deployment ID: (.*)/);
        const timestampMatch = text.match(/Timestamp: (.*)/);
        const versionMatch = text.match(/Build Version: (.*)/);
        
        if (idMatch && timestampMatch && versionMatch) {
          setDeploymentData({
            id: idMatch[1],
            timestamp: timestampMatch[1],
            version: versionMatch[1]
          });
        }
      } catch (error) {
        console.error('Error fetching deployment info:', error);
      }
    };

    fetchDeploymentInfo();
  }, []);

  if (!deploymentData) return null;

  return (
    <div 
      className="fixed bottom-2 right-2 bg-gray-800 text-gray-300 text-xs rounded-md shadow-md z-50 transition-all duration-300"
      style={{ opacity: isExpanded ? 0.95 : 0.6, maxWidth: isExpanded ? '300px' : '150px' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-2">
        {isExpanded ? (
          <>
            <div className="font-semibold mb-1">Deployment Information</div>
            <div className="text-gray-400 truncate">ID: {deploymentData.id}</div>
            <div className="text-gray-400">Date: {deploymentData.timestamp}</div>
          </>
        ) : (
          <div className="truncate">
            Build: {new Date(parseInt(deploymentData.version)).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
} 