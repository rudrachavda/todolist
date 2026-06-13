import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const Heading = () => {
  return (
    <div className="max-w-3xl space-y-4 mt-32">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
        Your life's work, <br className="hidden md:block" />
        <span className="text-blue-500">beautifully organized.</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium text-neutral-400 mt-6 mb-10">
        TaskFlow is a production-grade, local-first task manager built for speed, focus, and seamless productivity.
      </h3>

      <div className="pt-8 flex items-center justify-center">
        <Link
          href="/today"
          className="group flex items-center gap-x-2 bg-blue-600 text-white px-8 py-4 rounded-full text-sm font-semibold hover:bg-blue-700 transition"
        >
          Enter Workspace
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};