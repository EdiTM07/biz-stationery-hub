import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:pl-64">
        <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
