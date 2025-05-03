// app/dashboard/layout.tsx
import DashboardFooter from "@/components/DashboardFooter";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
