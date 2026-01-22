import { Loader2 } from "lucide-react";

export default function AdminDashboardLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    </div>
  );
}
