import Navbar from "@/app/(marketing)/_components/Navbar"

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    )
}
