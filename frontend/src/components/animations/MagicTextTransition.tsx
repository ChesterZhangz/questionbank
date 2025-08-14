import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MagicTextTransitionProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

const MagicTextTransition: React.FC<MagicTextTransitionProps> = ({
  children,
  className = '',
  duration = 0.6,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, [children]);

  return (
    <motion.div
      className={`magic-text-transition ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export default MagicTextTransition; 