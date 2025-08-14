import React, { useState, useRef, useEffect } from 'react';
import LaTeXPreview from './LaTeXPreview';
import type { RenderConfig } from '../../../lib/latex/types';

interface HoverTooltipProps {
  content: string;
  children: React.ReactNode;
  config?: Partial<RenderConfig>;
  className?: string;
  delay?: number;
  maxWidth?: string;
}

const HoverTooltip: React.FC<HoverTooltipProps> = ({
  content,
  children,
  config = { mode: 'lightweight' },
  className = '',
  delay = 300,
  maxWidth = 'max-w-sm'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      timeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, delay);
    } else {
      setShowTooltip(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, delay]);

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative block w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* 悬浮提示框 */}
      {showTooltip && (
        <div
          className="fixed z-50"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <LaTeXPreview
            content={content}
            config={config}
            maxWidth={maxWidth}
            maxHeight="max-h-64"
            variant="compact"
            showTitle={false}
            className="hover-preview-enhanced"
          />
          
          {/* 小三角形 */}
          <div 
            className="absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-700"
            style={{
              left: '50%',
              top: '100%',
              transform: 'translateX(-50%)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default HoverTooltip; 