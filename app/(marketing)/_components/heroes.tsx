"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export const Heroes = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl mt-6 mb-8 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="flex items-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:h-[260px] md:w-[260px] z-10"
        >
          <div
             className="w-full h-full relative"
          >
            <Image
              src="/logo.svg"
              fill
              className="object-contain dark:hidden drop-shadow-2xl"
              alt="Documents"
            />
            <Image
              src="/logo-dark.svg"
              fill
              className="object-contain hidden dark:block drop-shadow-2xl"
              alt="Documents"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}