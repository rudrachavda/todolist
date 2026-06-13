import { Navbar } from "./_components/navbar";

const MarketingLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="h-full dark:bg-[#000000]">
            <Navbar />
            <main className="h-full">
                {children}
            </main>
        </div>
    );
}

export default MarketingLayout;