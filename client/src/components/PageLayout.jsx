// ===================================================================================
// FILE: src/components/PageLayout.jsx (CREATE THIS NEW FILE)
// This component wraps your pages to provide smooth animations.
// ===================================================================================
import React from 'react';
import { motion } from 'framer-motion';

// Defines the animation variants for the page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    x: "-50vw", // Start off-screen to the left
    scale: 0.9,
  },
  in: {
    opacity: 1,
    x: 0, // Animate to the center
    scale: 1,
  },
  out: {
    opacity: 0,
    x: "50vw", // Animate off-screen to the right
    scale: 0.9,
  }
};

// Defines the duration and type of the animation
const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.6
};

export const PageLayout = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    style={{ width: '100%' }} // Ensure the motion div takes up full width
  >
    {children}
  </motion.div>
);
