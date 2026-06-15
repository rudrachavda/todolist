import { Button } from "@/components/ui/button"
import { Logo } from "./logo"

export const Footer = () => {
  return (
    <div className="flex items-center w-full p-6 bg-transparent z-50 mt-auto border-t border-black/5 dark:border-white/5">
      <Logo />
      <div className="md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-2 text-muted-foreground">
        <Button variant="ghost" size="sm" className="hover:bg-transparent hover:text-primary transition-colors">
          Privacy Policy
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-transparent hover:text-primary transition-colors">
          Terms & Conditions
        </Button>
      </div>
    </div>
  )
}