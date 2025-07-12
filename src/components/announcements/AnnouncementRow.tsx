// src/components/announcements/AnnouncementRow.tsx - FIXED with correct category colors

import React, { useEffect, useState, useRef } from 'react';
import { Star, StarOff, Bell } from 'lucide-react';
import { ProcessedAnnouncement } from '../../api';
import { extractHeadline } from '../../utils/apiUtils';
import { getCategoryColors } from '../../utils/categoryUtils';

interface AnnouncementRowProps {
  announcement: ProcessedAnnouncement;
  isSaved: boolean;
  isViewed: boolean;
  onSave: (id: string) => void;
  onClick: (announcement: ProcessedAnnouncement) => void;
  onCompanyClick: (company: string, e: React.MouseEvent) => void;
  isNew?: boolean;
  onMarkAsRead?: (id: string) => void;
}

const AnnouncementRow: React.FC<AnnouncementRowProps> = ({
  announcement,
  isSaved,
  isViewed,
  onSave,
  onClick,
  onCompanyClick,
  isNew = false,
  onMarkAsRead
}) => {
  // State to manage animation and highlighting
  const [isHighlighted, setIsHighlighted] = useState(isNew);
  const [isPulsing, setIsPulsing] = useState(isNew);
  const [isAnimating, setIsAnimating] = useState(isNew);
  const rowRef = useRef<HTMLDivElement>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add animation and highlighting for new announcements
  useEffect(() => {
    if (isNew) {
      // Set highlight and animation
      setIsHighlighted(true);
      setIsAnimating(true);
      setIsPulsing(true);
      
      // Only stop the pulse animation after 5 seconds, not the highlight
      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
        setIsPulsing(false);
      }, 5000);
      
      // No timer to clear the highlight - it stays until clicked
      
      return () => {
        clearTimeout(animationTimer);
      };
    }
  }, [isNew]);

  const handleRowClick = () => {
    // Mark as read when clicked
    if (onMarkAsRead && isNew) {
      onMarkAsRead(announcement.id);
    }
    
    // Call the original click handler
    onClick(announcement);
    
    // Clear highlight state when clicked
    setIsHighlighted(false);
    setIsPulsing(false);
    setIsAnimating(false);
  };

  // Company display values
  const companyDisplayName = announcement.company || "Unknown Company";
  const companyDisplaySymbol = announcement.ticker || "";

  // Get display values
  const categoryToDisplay = announcement.category || 'Other';
  const headlineToDisplay = extractHeadline(announcement.summary);

  // Use the displayDate if available
  const dateToDisplay = announcement.displayDate || announcement.date;

  // Get the correct colors for this category
  const categoryColors = getCategoryColors(categoryToDisplay);

  // Custom CSS for animation with enhanced gradients
  const animationClass = isAnimating ? 'animate-pulse-slow' : '';
  const highlightClass = isHighlighted ? 'bg-gradient-to-r from-blue-50 to-blue-100/50' : '';
  const viewedClass = isViewed && !isHighlighted ? 'text-gray-600' : 'text-gray-800';
  const pulsingClass = isPulsing ? 'badge-pulse' : '';

  return (
    <div
      ref={rowRef}
      className={`grid grid-cols-12 px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/30 cursor-pointer transition-all duration-200 items-center relative ${viewedClass} ${highlightClass} ${animationClass} announcement-row-transition`}
      onClick={handleRowClick}
      data-announcement-id={announcement.id}
      data-is-new={isNew ? 'true' : 'false'}
    >
      {/* FIXED: Green dot indicator positioned properly within the row */}
      {(!isViewed || isHighlighted) && (
        <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${isHighlighted ? 'bg-blue-500' : 'bg-green-500'} ${pulsingClass}`}></div>
      )}

      {/* Company information - FIXED: Added left padding to account for dot */}
      <div className="col-span-3 pr-4 pl-4">
        <div className="overflow-hidden">
          <div
            className={`text-sm font-bold company-name break-words inline-block relative group ${isHighlighted ? 'text-blue-700' : ''}`}
            onClick={(e) => onCompanyClick(companyDisplayName, e)}
          >
            {companyDisplayName}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black/80 transition-all duration-300 ease-in-out group-hover:w-full opacity-80"></span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1 truncate flex items-center">
          {companyDisplaySymbol}
          {isHighlighted && (
            <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full flex items-center">
              <Bell size={10} className="mr-1" />
              NEW
            </span>
          )}
        </div>
      </div>

      {/* Category with FIXED colors - now uses correct category-specific colors */}
      <div className="col-span-2 pr-2">
        <span 
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium max-w-full truncate block"
          style={{
            backgroundColor: categoryColors.backgroundColor,
            color: categoryColors.textColor
          }}
          title={categoryToDisplay}
        >
          {categoryToDisplay}
        </span>
      </div>

      {/* Summary */}
      <div className="col-span-5 text-sm pr-4">
        <div className={`summary-text line-clamp-2 leading-relaxed overflow-hidden ${
          isViewed && !isHighlighted ? 'text-gray-500' : 'text-gray-700'
        } ${isHighlighted ? 'font-medium' : ''}`}>
          {headlineToDisplay}
        </div>
      </div>

      {/* Sentiment indicator */}
      <div className="col-span-1 flex justify-center items-center">
        <span className={`inline-flex w-2.5 h-2.5 rounded-full ${
          announcement.sentiment === 'Positive' ? 'bg-emerald-500' :
          announcement.sentiment === 'Negative' ? 'bg-rose-500' : 'bg-amber-400'
        } ${isViewed && !isHighlighted ? 'opacity-60' : 'shadow-sm'}`}></span>
      </div>

      {/* Save button */}
      <div className="col-span-1 flex items-center justify-end">
        <div className="text-xs text-gray-400 mr-3">{dateToDisplay}</div>
        <button
          className="text-gray-400 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100/80 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSave(announcement.id);
          }}
          aria-label={isSaved ? "Remove from saved" : "Save announcement"}
        >
          {isSaved ?
            <Star size={16} className="fill-current text-black" /> :
            <StarOff size={16} />}
        </button>
      </div>
    </div>
  );
};

export default AnnouncementRow;