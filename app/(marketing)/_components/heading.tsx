"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const Heading = () => {
  return (
    <div className="max-w-4xl space-y-8 flex flex-col items-center mt-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        The minimalist task manager
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight font-space"
      >
        Your thoughts, organized. <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Beautifully simple.</span>
      </motion.h1>
      
      <motion.h3 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg sm:text-xl md:text-2xl font-medium text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed"
      >
        A serene workspace for your daily tasks. Designed to help you focus, inspired by the tools you love.
      </motion.h3>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center gap-x-4 pt-4"
      >
        <Button asChild size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/main">
            Get Started Free
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 text-base border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
          <Link href="#features">
            Learn more
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}