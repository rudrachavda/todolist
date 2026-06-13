import { Database, Zap, Shield, Smartphone } from "lucide-react";

export const Heroes = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mt-16 px-6 pb-20">

      {/* App Window Mockup */}
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-800 bg-[#1c1c1e] shadow-2xl shadow-blue-900/20 mb-32">
        <div className="flex h-12 w-full items-center gap-x-2 border-b border-neutral-800 bg-[#2c2c2e] px-4">
          <div className="h-3 w-3 rounded-full bg-[#ff453a]" />
          <div className="h-3 w-3 rounded-full bg-[#ffd60a]" />
          <div className="h-3 w-3 rounded-full bg-[#30d158]" />
        </div>
        <div className="flex h-[300px] md:h-[450px]">
          <div className="hidden h-full w-1/3 border-r border-neutral-800 bg-[#1c1c1e] p-6 md:block">
            <div className="mb-4 h-4 w-2/3 rounded bg-neutral-800" />
            <div className="mb-2 h-4 w-full rounded bg-neutral-800/50" />
            <div className="h-4 w-4/5 rounded bg-neutral-800/50" />
          </div>
          <div className="flex-1 p-8 text-left">
            <div className="mb-8 h-8 w-1/3 rounded bg-neutral-800" />
            <div className="space-y-4">
              <div className="h-12 w-full rounded-xl bg-neutral-800/40" />
              <div className="h-12 w-full rounded-xl bg-neutral-800/40" />
              <div className="h-12 w-3/4 rounded-xl bg-neutral-800/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Features */}
      <div className="mb-12 text-center w-full">
        <h2 className="text-3xl font-bold text-white md:text-4xl">Engineered for speed.</h2>
        <p className="mt-4 text-neutral-400">Everything you need to manage your day, built on a modern stack.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 text-left w-full">
        <div className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#1c1c1e] p-8 md:col-span-2">
          <Database className="mb-4 h-8 w-8 text-blue-500" />
          <h3 className="mb-2 text-xl font-bold text-white">Local-First SQLite</h3>
          <p className="text-sm text-neutral-400">
            Powered by Drizzle ORM and SQLite, your tasks are saved instantly to your local machine. Zero loading spinners.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#1c1c1e] p-8">
          <Zap className="mb-4 h-8 w-8 text-orange-500" />
          <h3 className="mb-2 text-xl font-bold text-white">Server Actions</h3>
          <p className="text-sm text-neutral-400">
            Next.js server actions handle data mutations smoothly without heavy client-side Javascript.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#1c1c1e] p-8">
          <Shield className="mb-4 h-8 w-8 text-green-500" />
          <h3 className="mb-2 text-xl font-bold text-white">Type-Safe</h3>
          <p className="text-sm text-neutral-400">
            End-to-end type safety with TypeScript ensures your task logic never breaks in production.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#1c1c1e] p-8 md:col-span-2">
          <Smartphone className="mb-4 h-8 w-8 text-purple-500" />
          <h3 className="mb-2 text-xl font-bold text-white">Responsive Design</h3>
          <p className="text-sm text-neutral-400">
            A fluid, resizable sidebar looks perfect on desktop, tablet, and mobile browsers.
          </p>
        </div>
      </div>

    </div>
  );
};