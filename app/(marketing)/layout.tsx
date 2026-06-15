import { Navbar } from "./_components/navbar";

const MarketingLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full bg-[#fafafa] dark:bg-[#000000]">
      <Navbar />
      <main className="h-full pt-20">
        {children}
      </main>
    </div>
  );
}

export default MarketingLayout;