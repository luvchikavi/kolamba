import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={40} className="animate-spin text-primary-500 mx-auto mb-4" />
        <p className="text-slate-600">Loading agent dashboard...</p>
      </div>
    </div>
  );
}
