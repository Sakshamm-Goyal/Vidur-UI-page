"use client";

import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToastStore } from "@/lib/stores/toast-store";
import { cn } from "@/lib/utils";

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-background animate-in slide-in-from-bottom-5",
            toast.variant === "success" && "border-green-500",
            toast.variant === "error" && "border-red-500",
            toast.variant === "warning" && "border-yellow-500"
          )}
        >
          {toast.variant === "success" && (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          )}
          {toast.variant === "error" && (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          {toast.variant === "warning" && (
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          )}
          {!toast.variant && (
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
          )}

          <div className="flex-1">
            <p className="font-semibold text-sm">{toast.title}</p>
            {toast.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {toast.description}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
