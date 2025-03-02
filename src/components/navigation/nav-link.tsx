import { type FC } from "@/lib/vendors";
import { Link } from "@/lib/vendors";
import { cn } from "@/lib/utils/utils";
import * as Icons from "@/assets/icons";

interface NavLinkProps {
  href: string;
  icon?: string;
  isActive?: boolean;
  variant?: "side" | "bottom";
  onClick?: () => void;
  children: React.ReactNode;
}

export const NavLink: FC<NavLinkProps> = ({ href, icon, isActive = false, variant = "side", onClick, children }) => {
  const baseStyles = "flex items-center transition-colors duration-200";
  const variantStyles = {
    side: "px-4 py-3 text-sm w-full hover:bg-accent",
    bottom: "flex-col justify-center h-full text-xs w-full",
  };
  const activeStyles = isActive ? "text-primary font-medium" : "text-muted-foreground";

  // Dynamically get icon component
  const IconComponent = icon ? Icons[icon as keyof typeof Icons] : null;

  const handleClick = (e: React.MouseEvent) => {
    onClick?.();
  };

  return (
    <Link to={href} className={cn(baseStyles, variantStyles[variant], activeStyles)} onClick={handleClick}>
      {IconComponent && (
        <div
          className={cn("flex items-center justify-center", variant === "bottom" ? "text-2xl mb-1" : "mr-3 text-xl")}
        >
          <IconComponent className="h-5 w-5" />
        </div>
      )}
      <span className={cn("truncate", variant === "bottom" && "text-[10px]")}>{children}</span>
    </Link>
  );
};
