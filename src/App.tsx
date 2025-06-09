// App.tsx - Fixed auto-reload behavior and badge reset on page reload

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import WatchlistPage from './components/watchlist/WatchlistPage';
import CompanyPage from './components/company/CompanyPage';
import AuthRouter from './components/auth/AuthRouter';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { WatchlistProvider } from './context/WatchlistContext';
import { FilterProvider } from './context/FilterContext';
import { AuthProvider } from './context/AuthContext';
import { Company, ProcessedAnnouncement, enhanceAnnouncementData } from './api';
import { SocketProvider } from './context/SocketContext';
import { useAuth } from './context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import NotificationIndicator from './components/common/NotificationIndicator';
import NewAnnouncementBadge from './components/common/NewAnnouncementBadge';
import { sortByNewestDate } from './utils/dateUtils';

// Inner component with enhanced socket handling
const AppWithSocket = () => {
  const [activePage, setActivePage] = useState<'dashboard' | 'watchlist' | 'company'>('dashboard');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [watchlistParams, setWatchlistParams] = useState<{ watchlistId?: string }>({});
  const [reloadTrigger, setReloadTrigger] = useState(0); // For triggering reloads
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const processedAnnouncementIds = useRef<Set<string>>(new Set());

  // REMOVED: newAnnouncements state - we don't auto-merge new announcements anymore
  // They are only tracked by the badge for manual reload

  // Navigation handlers
  const handleViewNewAnnouncements = () => {
    // Scroll to top where new announcements are displayed
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleViewAnnouncements = useCallback(() => {
    setActivePage('dashboard');
  }, []);

  const handleNavigate = (page: 'home' | 'watchlist' | 'company', params?: { watchlistId?: string }) => {
    console.log(`Navigating to ${page} with params:`, params);
    
    if (page === 'home') {
      setActivePage('dashboard');
      setSelectedCompany(null);
    } else if (page === 'watchlist') {
      setActivePage('watchlist');
      setWatchlistParams(params || {});
      console.log("Set watchlist params to:", params);
    } else if (page === 'company' && selectedCompany) {
      setActivePage('company');
    }
  };

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setActivePage('company');
  };

  // FIXED: Remove auto-merge of new announcements - only let badge handle them
  const handleNewAnnouncement = useCallback((rawAnnouncement: any) => {
    try {
      console.log('New announcement received in App (for badge only):', rawAnnouncement);

      // Basic validation
      if (!rawAnnouncement) {
        console.warn('Received empty announcement data');
        return;
      }

      // Create a unique ID for deduplication
      const announcementId = rawAnnouncement.corp_id ||
        rawAnnouncement.id ||
        `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Check if we've already processed this announcement
      if (processedAnnouncementIds.current.has(announcementId)) {
        console.log(`Announcement ${announcementId} already processed in App, skipping`);
        return;
      }

      // Mark as processed
      processedAnnouncementIds.current.add(announcementId);

      // REMOVED: Auto-merge into announcements state
      // The announcement will only be shown via the notification badge
      // and will only be loaded into the main list when user clicks reload
      
      console.log('New announcement processed for badge only - no auto-merge');
      
    } catch (error) {
      console.error('Error processing new announcement:', error);
    }
  }, []);

  // Function to handle reload from notification badge
  const handleReloadAnnouncements = useCallback(() => {
    console.log('Reloading announcements from notification badge');
    
    // Clear processed announcement IDs to allow fresh data
    processedAnnouncementIds.current.clear();
    
    // Trigger a reload by incrementing the reload trigger
    setReloadTrigger(prev => prev + 1);
    
    // Show a brief success message
    toast.success('Announcements reloaded!', {
      duration: 2000,
      position: 'bottom-right'
    });
  }, []);

  // REMOVED: Cleanup effect for newAnnouncements since we don't store them anymore

  // We only want to use socket connections when user is authenticated
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/*" element={<AuthRouter />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // Add debugging logs to help understand the state
  console.log("Active page:", activePage);
  console.log("Watchlist params:", watchlistParams);

  // Return fully configured app
  return (
    <SocketProvider onNewAnnouncement={handleNewAnnouncement}>
      <Router>
        <FilterProvider>
          <WatchlistProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth/*" element={<AuthRouter />} />

              {/* Protected App Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  {activePage === 'dashboard' ? (
                    <Dashboard
                      onNavigate={handleNavigate}
                      onCompanySelect={handleCompanyClick}
                      // REMOVED: newAnnouncements prop - no auto-merge
                      reloadTrigger={reloadTrigger}
                    />
                  ) : activePage === 'watchlist' ? (
                    <WatchlistPage
                      onViewAnnouncements={handleViewAnnouncements}
                      onNavigate={handleNavigate}
                      watchlistParams={watchlistParams}
                      // REMOVED: newAnnouncements prop
                    />
                  ) : (
                    selectedCompany && (
                      <CompanyPage
                        company={selectedCompany}
                        onNavigate={handleNavigate}
                        onBack={() => setActivePage('dashboard')}
                        // REMOVED: newAnnouncements prop
                      />
                    )
                  )}
                </ProtectedRoute>
              } />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* REMOVED: Existing notification indicator - using only badge now */}
            
            {/* Simple notification badge for reloading */}
            <NewAnnouncementBadge onReload={handleReloadAnnouncements} />
            
          </WatchlistProvider>
        </FilterProvider>
      </Router>
      {/* Toast container for notifications */}
      <Toaster />
    </SocketProvider>
  );
};

// Main component
function App() {
  return (
    <AuthProvider>
      <AppWithSocket />
    </AuthProvider>
  );
}

export default App;