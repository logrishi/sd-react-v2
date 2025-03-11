import { useEffect, useState, type FC } from "@/lib/vendors";
import { Card, CardContent } from "@/components/common/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/common/ui/avatar";
import { BellOff } from "@/assets/icons";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { Loading } from "@/components/common/loading";

interface Notification {
  id: string;
  title: string;
  message: string;
  image: string;
  timestamp: string;
  read: boolean;
  type: string;
}

const Notifications: FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This will be replaced with actual API call in the future
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Empty array - will be populated from API in the future
        setNotifications([]);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "book":
        return "📚";
      case "audio":
        return "🎧";
      case "system":
        return "⚙️";
      case "update":
        return "🔄";
      default:
        return "📣";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <div className="container py-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>

          <section>
            {loading ? (
              <Loading size="md" className="py-8" />
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`overflow-hidden ${!notification.read ? "border-l-4 border-l-primary" : ""}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 rounded-md">
                          <AvatarImage src={notification.image} alt={notification.title} />
                          <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                            {getTypeIcon(notification.type)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{notification.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.timestamp}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <span className="sr-only">Delete</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-x"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {notifications.length === 0 && (
                  <Card className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="rounded-full bg-muted p-6">
                        <BellOff className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-muted-foreground">No notifications yet</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        You don't have any notifications at the moment. We'll notify you when there are updates or
                        important information.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
