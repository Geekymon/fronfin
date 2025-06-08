import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Bell, ChevronUp } from 'lucide-react';
import { ProcessedAnnouncement } from '../../api';
import { useSocket } from '../../context/SocketContext';

// Inline indicator
export const InlineNewAnnouncementIndicator: React.FC<{
  count: number;
  className?: string;
  showDot?: boolean;
}> = ({ count, className = '', showDot = true }) => {
  if (count <= 0) return null;

  return (
    <div
      className={`flex items-center text-sm font-medium text-blue-600 ${className}`}
      aria-label={`${count} new update${count !== 1 ? 's' : ''}`}
    >
      {showDot && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 badge-pulse" />}
      {count} new update{count !== 1 ? 's' : ''}
    </div>
  );
};

interface NotificationIndicatorProps {
  onViewNewAnnouncements?: () => void;
}

const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({
  onViewNewAnnouncements
}) => {
  const { newAnnouncements, connectionStatus } = useSocket();
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(
    localStorage.getItem('notificationAudio') !== 'disabled'
  );

  const notificationSound = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/airping.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  }, []);

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    localStorage.setItem('notificationAudio', newState ? 'enabled' : 'disabled');
  };

  useEffect(() => {
    if (newAnnouncements && newAnnouncements.length > 0) {
      setCount(newAnnouncements.length);
      setIsVisible(true);
      if (audioEnabled && notificationSound) {
        notificationSound.play().catch(err => {
          console.warn('Could not play notification sound:', err);
        });
      }
    } else {
      setIsVisible(false);
    }
  }, [newAnnouncements, audioEnabled, notificationSound]);

  useEffect(() => {
    const handleNewAnnouncement = (event: CustomEvent<ProcessedAnnouncement>) => {
      if (event.detail) {
        setCount(prev => prev + 1);
        setIsVisible(true);
        if (audioEnabled && notificationSound) {
          notificationSound.play().catch(err => {
            console.warn('Could not play notification sound:', err);
          });
        }
      }
    };

    window.addEventListener('new-announcement-received', handleNewAnnouncement as EventListener);
    return () => {
      window.removeEventListener('new-announcement-received', handleNewAnnouncement as EventListener);
    };
  }, [audioEnabled, notificationSound]);

  return (
    <>
      <Toaster />

      {/* Header-style inline indicator (optional, can be used in navbars) */}
      <InlineNewAnnouncementIndicator count={count} className="fixed top-4 right-4 z-40" />

      {/* Floating bottom-right button */}
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 scale-in-animation">
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={toggleAudio}
              className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              title={audioEnabled ? "Disable notification sound" : "Enable notification sound"}
            >
              {audioEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              )}
            </button>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center transition-colors"
              onClick={onViewNewAnnouncements}
              aria-label={`${count} new announcements, click to view`}
            >
              <span className="badge-pulse mr-2 flex items-center justify-center">
                <Bell size={16} />
              </span>
              <span className="font-medium mr-1">{count} new announcement{count !== 1 ? 's' : ''}</span>
              <ChevronUp size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationIndicator;
