"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "bg-white border border-slate-200 shadow-lg rounded-xl font-sans",
          title: "text-slate-900 font-medium",
          description: "text-slate-600 text-sm",
          success: "border-emerald-200 bg-emerald-50",
          error: "border-red-200 bg-red-50",
          warning: "border-amber-200 bg-amber-50",
          info: "border-blue-200 bg-blue-50",
        },
      }}
      richColors
      closeButton
      duration={4000}
    />
  );
}
