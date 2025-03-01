import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ErrorNotification {
  id: string;
  message: string;
  details?: string;
  timestamp: number;
}

interface ErrorNotificationProps {
  notifications: ErrorNotification[];
  onDismiss: (id: string) => void;
}

export function ErrorNotifications({ notifications, onDismiss }: ErrorNotificationProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">
                  {notification.message}
                </p>
                {notification.details && (
                  <p className="mt-1 text-sm text-red-700">
                    {notification.details}
                  </p>
                )}
                <p className="mt-1 text-xs text-red-600">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="ml-4 flex-shrink-0 inline-flex text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}