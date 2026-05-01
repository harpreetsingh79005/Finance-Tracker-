import React from 'react';
import { motion } from 'framer-motion';

export function WaveBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
      <motion.svg
        className="absolute w-[200%] h-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        initial={{ x: "-50%" }}
        animate={{ x: "0%" }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 15,
          ease: "linear"
        }}
      >
        <path
          fill="currentColor"
          d="M0,160L48,170.7C96,181,192,203,288,213.3C384,224,480,224,576,197.3C672,171,768,117,864,106.7C960,96,1056,128,1152,149.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </motion.svg>
      <motion.svg
        className="absolute w-[200%] h-full top-[10%]"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        initial={{ x: "0%" }}
        animate={{ x: "-50%" }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 20,
          ease: "linear"
        }}
      >
        <path
          fill="currentColor"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </motion.svg>
    </div>
  );
}
