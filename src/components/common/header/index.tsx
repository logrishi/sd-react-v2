import { createElement, type FC } from "@/lib/vendors";
// import { useAuthStore } from "@/store/auth.store";
// import { Button } from "@/components/ui/button";
import { Button, ButtonGroup } from "@heroui/button";

export const Header: FC = () => {
  // const { user, isAuthenticated, logout } = useAuthStore();
  const isAuthenticated = true;
  const user = {
    name: "John Doe",
  };

  const handleLogout = async () => {
    try {
      // await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a href="/" className="text-xl font-bold text-primary">
            Saraighat Digital
          </a>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">Welcome, {user?.name || "User"}</span>
              <Button variant="ghost" onPress={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" onPress={() => (window.location.href = "/login")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
