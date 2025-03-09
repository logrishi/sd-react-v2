import { useNavigate, useLocation, type FC } from "@/lib/vendors";
import { Button } from "@/components/common/ui/button";
import { ChevronLeft, ShieldUser } from "@/assets/icons";
import { headerIcons } from "@/lib/config/header-icons.config";
import { cn } from "@/lib/utils/utils";
import { store } from "@/services/store";
import * as Icons from "@/assets/icons";

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  rightIcons?: string[];
  className?: string;
}

export const Header: FC<HeaderProps> = ({
  showBackButton = true,
  title = "Saraighat Digital",
  rightIcons = ["bookmarks", "cart", "notifications", "profile"],
  className,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="app-container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {rightIcons.map((iconId) => {
            const icon = headerIcons.find((i) => i.id === iconId);
            if (!icon) return null;

            // Skip admin icon if user is not an admin
            if (icon.id === "admin" && !store.auth.get().isAdmin) {
              return null;
            }

            return (
              <Button
                key={icon.id}
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (icon.onClick) {
                    icon.onClick();
                  } else if (icon.href && location.pathname !== icon.href) {
                    navigate(icon.href);
                  }
                }}
              >
                {icon.id === "admin" ? (
                  <ShieldUser className="h-6 w-6 text-red-500" />
                ) : (
                  <icon.icon className="h-5 w-5" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
