"use client";

import { useConvexAuth } from "@/hooks/use-convex-shim";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-4xl space-y-6 mx-auto px-4 mt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium text-sm mb-4">
          <Sparkles className="h-4 w-4" />
          <span>The new standard for tasks</span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          Your tasks, beautifully <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">unified.</span>
        </h1>
        <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mt-6">
          Reminders is the beautifully simple workspace for your everyday tasks, designed for focus and clarity.
        </h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-center pt-8"
      >
        {isLoading && (
          <div className="w-full flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
        {isAuthenticated && !isLoading && (
          <Button asChild size="lg" className="px-8 py-6 text-lg font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95">
            <Link href="/documents">
              Enter Reminders
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        )}
        {!isAuthenticated && !isLoading && (
          <Button asChild size="lg" className="px-8 py-6 text-lg font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95">
            <Link href="/sign-in">
              Get Started for Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        )}
      </motion.div>
    </div>
  )
}