import Link from "next/link";
import { Logo } from "./logo";

export const Navbar = () => {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-neutral-800 bg-[#000000]/80 p-6 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Logo />

        {/* Center Links - Hidden on smaller screens for a cleaner mobile layout */}
        <nav className="hidden items-center gap-x-8 text-sm font-medium text-neutral-400 md:flex">
          <Link href="#" className="transition hover:text-white">Features</Link>
          <Link href="#" className="transition hover:text-white">Performance</Link>
          <Link href="#" className="transition hover:text-white">Security</Link>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-x-4">
          <Link
            href="/today"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            Enter Workspace
          </Link>
        </div>
      </div>
    </header>
  );
};