// src/context/SocketContext.tsx - Fixed to properly dispatch badge events

import React, { createContext, useEffect, useState, useRef, useCallback, ReactNode, useContext, } from 'react';
import { setupSocketConnection, ProcessedAnnouncement, enhanceAnnouncementData } from '../api';
import { toast } from 'react-hot-toast';
import { sortByNewestDate } from '../utils/dateUtils';
import ReactMarkdown from 'react-markdown';

// Toast notification cache to prevent duplicates - use Map with timestamps
const toastNotificationCache = new Map<string, number>();

// Define the shape of our context
type SocketContextType = {
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  newAnnouncements: ProcessedAnnouncement[];
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastError: string | null;
  reconnect: () => void;
};

// Create the context
export const SocketContext = createContext<SocketContextType | null>(null);

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
  onNewAnnouncement?: (announcement: ProcessedAnnouncement) => void;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  onNewAnnouncement
}) => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connecting');
  const [lastError, setLastError] = useState<string | null>(null);
  const [newAnnouncements, setNewAnnouncements] = useState<ProcessedAnnouncement[]>([]);
  const activeRooms = useRef<Set<string>>(new Set());
  const socketRef = useRef<any>(null);
  const processedAnnouncementIds = useRef<Set<string>>(new Set());
  const processingAnnouncement = useRef<boolean>(false);

  // Enhanced function to display a toast notification with improved deduplication
  const showAnnouncementToast = useCallback((announcement: ProcessedAnnouncement) => {
    const now = Date.now();

    if (toastNotificationCache.has(announcement.id)) {
      const lastShown = toastNotificationCache.get(announcement.id);
      if (now - lastShown! < 30000) { // 30 seconds
        console.log(`DUPLICATE PREVENTED: Announcement ${announcement.id} shown recently, skipping toast`);
        return;
      }
    }

    toastNotificationCache.set(announcement.id, now);
    console.log(`SHOWING TOAST for ${announcement.id}`);

    toast.success(
      <div>
        <div className="font-medium">{announcement.company}</div>
        <div className="text-sm">
          <ReactMarkdown>{announcement.summary?.substring(0, 80)}</ReactMarkdown>
          <ReactMarkdown>{announcement.summary?.length > 80 ? '...' : ''}</ReactMarkdown>
        </div>
      </div>,
      {
        id: `toast-${announcement.id}-${now}`,
        duration: 5000,
        position: 'top-right',
        className: 'announcement-toast',
        icon: '🔔',
      }
    );

    const cutoff = now - 60000;
    toastNotificationCache.forEach((timestamp, id) => {
      if (timestamp < cutoff) {
        toastNotificationCache.delete(id);
      }
    });
  }, []);

  // FIXED: Enhanced function to process new announcements and dispatch badge events
  const processNewAnnouncement = useCallback((data: any) => {
    if (processingAnnouncement.current) {
      console.log("Already processing an announcement, waiting...");
      setTimeout(() => processNewAnnouncement(data), 100);
      return;
    }

    processingAnnouncement.current = true;
    console.log("Socket context: Processing new announcement for badge:", data);

    try {
      if (!data) {
        console.warn("Received empty announcement data");
        return;
      }

      const announcementId = data.corp_id || data.id || data.dedup_id ||
        (data.companyname && data.summary ?
          `${data.companyname}-${data.summary.substring(0, 20)}` :
          `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

      if (processedAnnouncementIds.current.has(announcementId)) {
        console.log(`Already processed announcement ${announcementId}, skipping`);
        return;
      }

      processedAnnouncementIds.current.add(announcementId);

      const processedAnnouncement: ProcessedAnnouncement = {
        id: announcementId,
        company: data.companyname || data.company || "Unknown Company",
        ticker: data.symbol || data.Symbol || "",
        category: data.category || data.Category || "Other",
        date: data.date || data.created_at || new Date().toISOString(),
        summary: data.ai_summary || data.summary || "",
        detailedContent: data.ai_summary || data.summary || "",
        isin: data.isin || data.ISIN || "",
        sentiment: "Neutral",
        isNew: true
      };

      try {
        const enhancedAnnouncement = enhanceAnnouncementData([processedAnnouncement])[0];
        
        // Show toast notification
        showAnnouncementToast(enhancedAnnouncement);
        
        // FIXED: Dispatch custom event for notification badge
        console.log('Dispatching new-announcement-received event for badge');
        const customEvent = new CustomEvent('new-announcement-received', {
          detail: enhancedAnnouncement
        });
        window.dispatchEvent(customEvent);
        
        // Call parent callback if provided
        if (onNewAnnouncement) {
          onNewAnnouncement(enhancedAnnouncement);
        }
        
      } catch (enhanceError) {
        console.error("Error enhancing announcement:", enhanceError);
        
        // Still dispatch event and show toast even if enhancement fails
        showAnnouncementToast(processedAnnouncement);
        
        console.log('Dispatching new-announcement-received event for badge (fallback)');
        const customEvent = new CustomEvent('new-announcement-received', {
          detail: processedAnnouncement
        });
        window.dispatchEvent(customEvent);
        
        if (onNewAnnouncement) {
          onNewAnnouncement(processedAnnouncement);
        }
      }
    } catch (error) {
      console.error("Error processing announcement:", error);
    } finally {
      processingAnnouncement.current = false;
    }
  }, [showAnnouncementToast, onNewAnnouncement]);

  // Initialize socket connection
  useEffect(() => {
    console.log("Initializing socket connection...");
    setConnectionStatus('connecting');

    try {
      // Set up socket connection
      const socketConnection = setupSocketConnection((data) => {
        // Wrap the callback to prevent duplicate processing
        const announcementId = data?.corp_id || data?.id || data?.dedup_id;
        if (announcementId && toastNotificationCache.has(announcementId)) {
          console.log(`Preventing duplicate processing for ${announcementId}`);
          return;
        }
        processNewAnnouncement(data);
      });

      setSocket(socketConnection);
      socketRef.current = socketConnection;

      console.log("Socket connection initialized");

      // Set up event listeners for connection status
      const handleConnect = () => {
        console.log("Socket connected event received");
        setIsConnected(true);
        setConnectionStatus('connected');
        setLastError(null);

        // Clear old announcement IDs on reconnection to prevent issues
        processedAnnouncementIds.current.clear();

        // Show connection toast
        toast.success("Live updates connected!", {
          id: "socket-connected",
          duration: 3000,
          position: "bottom-right"
        });

        // Rejoin all active rooms
        Array.from(activeRooms.current).forEach(room => {
          console.log(`Rejoining room after connection: ${room}`);
          socketConnection.joinRoom(room);
        });
      };

      const handleDisconnect = () => {
        console.log("Socket disconnected event received");
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Show disconnection toast
        toast.error("Live updates disconnected", {
          id: "socket-disconnected",
          duration: 3000,
          position: "bottom-right"
        });
      };

      const handleError = (e: any) => {
        console.error("Socket error event received:", e);
        setConnectionStatus('error');
        setLastError(e.detail?.message || 'Unknown connection error');
      };

      // Listen for socket events
      window.addEventListener('socket:connect', handleConnect);
      window.addEventListener('socket:disconnect', handleDisconnect);
      window.addEventListener('socket:error', handleError);

      return () => {
        // Clean up event listeners
        window.removeEventListener('socket:connect', handleConnect);
        window.removeEventListener('socket:disconnect', handleDisconnect);
        window.removeEventListener('socket:error', handleError);

        // Disconnect socket
        if (socketConnection) {
          console.log("Cleaning up socket connection");
          socketConnection.disconnect();
        }
      };
    } catch (error) {
      console.error("Error setting up socket connection:", error);
      setConnectionStatus('error');
      setLastError(`Failed to initialize socket: ${error instanceof Error ? error.message : String(error)}`);
      return () => { };
    }
  }, [processNewAnnouncement, showAnnouncementToast]);

  // Method to reconnect socket manually
  const reconnect = useCallback(() => {
    console.log("Manual reconnection requested");
    setConnectionStatus('connecting');

    // Clear the processed announcements set to ensure we don't miss any
    processedAnnouncementIds.current.clear();

    if (socketRef.current) {
      socketRef.current.reconnect();
    } else {
      // If socket ref is not available, re-initialize
      const socketConnection = setupSocketConnection(processNewAnnouncement);
      setSocket(socketConnection);
      socketRef.current = socketConnection;
    }
  }, [processNewAnnouncement]);

  // Context value
  const contextValue: SocketContextType = {
    joinRoom: (room: string) => {
      if (!room) return;

      // Store the room to rejoin later if needed
      activeRooms.current.add(room);

      if (socketRef.current) {
        socketRef.current.joinRoom(room);
      } else {
        console.warn(`Cannot join room ${room}: Socket not initialized`);
      }
    },
    leaveRoom: (room: string) => {
      if (!room) return;

      // Remove from active rooms
      activeRooms.current.delete(room);

      if (socketRef.current) {
        socketRef.current.leaveRoom(room);
      }
    },
    newAnnouncements,
    isConnected,
    connectionStatus,
    lastError,
    reconnect
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};