// src/components/common/NewAnnouncementBadge.tsx - Fixed to reset on page reload

import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

interface NewAnnouncementBadgeProps {
  onReload: () => void; // Function to reload announcements
}

const NewAnnouncementBadge: React.FC<NewAnnouncementBadgeProps> = ({ onReload }) => {
  const [newAnnouncementCount, setNewAnnouncementCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { connectionStatus } = useSocket();

  // FIXED: Reset count to 0 on component mount (page reload)
  useEffect(() => {
    console.log('NewAnnouncementBadge mounted - resetting count to 0');
    setNewAnnouncementCount(0);
    setIsVisible(false);
  }, []); // Empty dependency array = runs only on mount

  // Listen for new announcements from the socket context
  useEffect(() => {
    const handleNewAnnouncement = (event: CustomEvent) => {
      if (event.detail) {
        console.log('Badge: New announcement received', event.detail);
        setNewAnnouncementCount(prev => {
          const newCount = prev + 1;
          console.log(`Badge count updated: ${prev} -> ${newCount}`);
          return newCount;
        });
        setIsVisible(true);
      }
    };

    // Listen for the custom event dispatched by SocketContext
    window.addEventListener('new-announcement-received', handleNewAnnouncement as EventListener);

    return () => {
      window.removeEventListener('new-announcement-received', handleNewAnnouncement as EventListener);
    };
  }, []);

  // Handle badge click - reload and reset count
  const handleBadgeClick = () => {
    console.log('Badge clicked - reloading announcements and resetting count');
    
    // Call the reload function passed from parent
    onReload();
    
    // Reset count and hide badge
    setNewAnnouncementCount(0);
    setIsVisible(false);
  };

  // Hide badge if no new announcements
  if (!isVisible || newAnnouncementCount === 0) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer z-50 notification-badge"
      onClick={handleBadgeClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleBadgeClick();
        }
      }}
      aria-label={`${newAnnouncementCount} new announcement${newAnnouncementCount !== 1 ? 's' : ''} - Click to reload`}
    >
      <div className="flex items-center space-x-2">
        <Bell size={16} className="animate-pulse" />
        <span className="font-medium notification-text">
          {newAnnouncementCount} new announcement{newAnnouncementCount !== 1 ? 's' : ''} - Click to reload
        </span>
        <RefreshCw size={14} />
      </div>
    </div>
  );
};

export default NewAnnouncementBadge;