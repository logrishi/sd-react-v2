import { type FC } from "@/lib/vendors";
import { Card } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { useNavigate } from "react-router-dom";
import Pay from "@/features/pay";

interface AccessMessageProps {
  isLoggedIn: boolean;
  isSubscribed: boolean;
  isSubscriptionExpired: boolean;
  showFreeOnly?: boolean;
  compact?: boolean;
}

const AccessMessage: FC<AccessMessageProps> = ({
  isLoggedIn,
  isSubscribed,
  isSubscriptionExpired,
  showFreeOnly = false,
  compact = false,
}) => {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      compact ? (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Login to access</p>
          <Button size="sm" onClick={() => navigate("/login")} variant="default">
            Login
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3">
          <p className="text-muted-foreground text-sm">Login to access our collection of e-books and audio books</p>
          <Button onClick={() => navigate("/login")} variant="default" size="sm">
            Login Now
          </Button>
        </div>
      )
    );
  }

  if (!isSubscribed && !showFreeOnly) {
    return (
      compact ? (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Subscribe to access</p>
          <Button size="sm" onClick={() => navigate("/pay")} variant="default">
            Subscribe
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3">
          <h3 className="text-lg font-semibold text-muted-foreground">Subscribe to Access All Content</h3>
          <p className="text-muted-foreground text-sm">
            Get unlimited access to our complete collection of e-books and audio books.
          </p>
          <Pay />
        </div>
      )
    );
  }

  if (isSubscriptionExpired && !showFreeOnly) {
    return (
      compact ? (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Renew subscription</p>
          <Button size="sm" onClick={() => navigate("/pay")} variant="default">
            Renew
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3">
          <h3 className="text-lg font-semibold text-muted-foreground">Renew Your Subscription</h3>
          <p className="text-muted-foreground text-sm">
            Your subscription has expired. Renew to continue enjoying our content.
          </p>
          <Pay />
        </div>
      )
    );
  }

  return null;
};

export default AccessMessage;
