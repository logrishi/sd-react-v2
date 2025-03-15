import { type FC } from "@/lib/vendors";
import { Card } from "@/components/common/ui/card";
import { useEffect, useState } from "react";
import { getUsers } from "@/services/backend/actions";
import { Badge } from "@/components/common/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/common/ui/dialog";
import { X } from "lucide-react";
import dayjs from "dayjs";
import { getEnvVar } from "@/lib/utils/env-vars";
import { Button } from "@/components/common/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  expiry_date: string;
  last_login: string;
  is_subscribed: boolean;
}

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers();
        if (!response.err) {
          setUsers(response.result || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getUserStatus = (user: User) => {
    if (!user.is_subscribed) {
      return { label: "Not Subscribed", variant: "secondary" as const };
    }
    const isExpired = new Date(user.expiry_date) <= new Date();
    return isExpired
      ? { label: "Expired", variant: "destructive" as const }
      : { label: "Active", variant: "success" as const };
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage and view user details</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-6 space-y-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const status = getUserStatus(user);
            return (
              <Card
                key={user.id}
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors relative"
                onClick={() => setSelectedUser(user)}
              >
                <Badge variant={status.variant} className="absolute top-2 right-2">
                  {status.label}
                </Badge>
                <div className="flex items-center space-x-4 pr-16 pt-4">
                  <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {user.image && (
                      <img
                        src={`${getEnvVar("VITE_IMAGE_URL")}/${user.image}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-medium truncate">{user.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogClose className="absolute right-4 top-4" asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-muted overflow-hidden">
                  {selectedUser.image && (
                    <img
                      src={`${getEnvVar("VITE_IMAGE_URL")}/${selectedUser.image}`}
                      alt={selectedUser.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subscription Status</label>
                  <div className="mt-1">
                    <Badge variant={getUserStatus(selectedUser).variant}>{getUserStatus(selectedUser).label}</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Expiry Date</label>
                  <p className="mt-1 text-muted-foreground">
                    {selectedUser.expiry_date
                      ? dayjs(selectedUser.expiry_date).format("MMMM D, YYYY")
                      : "Not Subscribed"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Last Login</label>
                  <p className="mt-1 text-muted-foreground">
                    {selectedUser.last_login ? dayjs(selectedUser.last_login).format("MMMM D, YYYY") : "Never"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
