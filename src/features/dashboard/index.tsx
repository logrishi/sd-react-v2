import { createElement } from 'react';
import { useAuthStore } from '@/core/store/auth.store';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <span className="block text-2xl font-bold text-primary">12</span>
              <span className="text-sm text-muted-foreground">Total Items</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-primary">5</span>
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-primary">7</span>
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <p className="font-medium">Started reading "React Patterns"</p>
                <span className="text-sm text-muted-foreground">2 hours ago</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium">Completed "TypeScript Basics"</p>
                <span className="text-sm text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
              <span className="text-2xl mb-1">➕</span>
              Add New Item
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
              <span className="text-2xl mb-1">🔍</span>
              Browse Library
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
              <span className="text-2xl mb-1">📊</span>
              View Reports
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
              <span className="text-2xl mb-1">⚙️</span>
              Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
