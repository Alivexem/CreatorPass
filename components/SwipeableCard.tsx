import { motion, useAnimation } from 'framer-motion';
import { useState } from 'react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipe?: (direction: 'left' | 'right') => void;
  isMobile?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({ children, onSwipe, isMobile }) => {
  const controls = useAnimation();
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!isMobile) return <>{children}</>;

  const handleDragStart = (event: any) => {
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleDragEnd = (event: any) => {
    const dragEnd = { x: event.clientX, y: event.clientY };
    const dragDiff = dragEnd.x - dragStart.x;

    if (Math.abs(dragDiff) > 100) {
      const direction = dragDiff > 0 ? 'right' : 'left';
      controls.start({
        x: direction === 'right' ? 200 : -200,
        rotate: direction === 'right' ? 20 : -20,
        opacity: 0,
      }).then(() => {
        onSwipe?.(direction);
        controls.set({ x: 0, rotate: 0, opacity: 1 });
      });
    } else {
      controls.start({ x: 0, rotate: 0 });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ x: 0 }}
      className="touch-none"
      style={{
        transformOrigin: 'bottom center'
      }}
    >
      {children}
    </motion.div>
  );
}; 