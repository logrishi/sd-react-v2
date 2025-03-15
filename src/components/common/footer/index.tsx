import { type FC } from "@/lib/vendors";

export const Footer: FC = () => {
  return (
    <footer className="hidden lg:block bg-background border-t border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="text-xs md:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Saraighat Digital. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
