import { Button } from "@/components/ui/button"

import { Logo } from "./logo"

export const Footer = () => {
  return (
    <div className="flex items-center w-full p-6 bg-background z-50">
      <div className="md:ml-auto w-full justify-center md:justify-end flex items-center gap-x-2 text-neutral-500 dark:text-neutral-500">
        <Button variant="secondary" size="sm">
          Privacy Policy
        </Button>
        <Button variant="secondary" size="sm">
          Terms & Conditions
        </Button>
      </div>
    </div>
  )
}