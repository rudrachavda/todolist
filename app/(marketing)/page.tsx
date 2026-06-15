import { Footer } from "./_components/footer";
import { Heading } from "./_components/heading";
import { Heroes } from "./_components/heroes";

const MarketingPage = () => {
  return (
    <div className="min-h-full flex flex-col bg-[#fafafa] dark:bg-[#000000] selection:bg-blue-500/30">
      <div className="flex flex-col items-center justify-start text-center gap-y-12 flex-1 px-6 pb-10 w-full overflow-hidden">
        <Heading />
        <Heroes />
      </div>
      <Footer />
    </div>
  );
}

export default MarketingPage;
