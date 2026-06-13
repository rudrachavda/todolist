import { Sidebar } from "./_components/sidebar";
import { Navbar } from "./_components/navbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#191919] text-neutral-200">
            <Sidebar />

            {/* Right side container */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}