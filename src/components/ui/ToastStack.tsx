import { useEffect } from "react";
import { Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { Toast } from "@/types";

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, toast.kind === "achievement" ? 5200 : 3200);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.kind]);

  const tone =
    toast.kind === "achievement"
      ? "bg-amber/25"
      : toast.kind === "error"
        ? "bg-coral/20"
        : toast.kind === "success"
          ? "bg-forest/15"
          : "bg-surface";

  return (
    <div
      role="status"
      className={cn(
        "animate-slide-in relative w-[280px] overflow-hidden rounded-pixel border-[3px] border-edge shadow-pixel",
        tone,
      )}
    >
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <span className="text-xl leading-none">{toast.emoji ?? (toast.kind === "achievement" ? "🏅" : "✨")}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {toast.kind === "achievement" && <Trophy size={12} className="text-amber-dark" />}
            <p className="truncate font-pixel text-xs font-bold">{toast.title}</p>
          </div>
          {toast.message && <p className="mt-0.5 text-xs text-muted">{toast.message}</p>}
          {typeof toast.xp === "number" && toast.xp > 0 && (
            <p className="mt-1 inline-block rounded-[4px] border-[2px] border-edge bg-amber px-1.5 py-0.5 font-pixel text-2xs font-bold text-ink">
              +{toast.xp} XP
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="text-muted hover:text-body"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

export function ToastStack() {
  const toasts = useAppStore((state) => state.toasts);
  const dismissToast = useAppStore((state) => state.dismissToast);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} onDismiss={() => dismissToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}
