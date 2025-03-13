import { type FC } from "@/lib/vendors";

export const Footer: FC = () => {
  return (
    <footer className="hidden lg:block bg-background border-t border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-xs md:text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Saraighat Digital. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0">
              <nav className="flex space-x-4">
                <a href="/privacy" className="text-xs md:text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-xs md:text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </a>
                <a href="/contact" className="text-xs md:text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </a>
              </nav>
            </div>
          </div>
        </div>
      </footer>
  );
};
