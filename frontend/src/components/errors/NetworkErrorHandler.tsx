import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {children}
      
      <AnimatePresence>
        {showOfflineMessage && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-red-500 dark:bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg dark:shadow-red-900/50 flex items-center space-x-3">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">网络连接已断开</span>
              <button
                onClick={() => setShowOfflineMessage(false)}
                className="ml-2 hover:bg-red-600 dark:hover:bg-red-700 rounded-full p-1 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOnline && !showOfflineMessage && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-yellow-500 dark:bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg dark:shadow-yellow-900/50 flex items-center space-x-3">
              <Wifi className="w-5 h-5" />
              <span className="font-medium">正在尝试重新连接...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NetworkErrorHandler; 