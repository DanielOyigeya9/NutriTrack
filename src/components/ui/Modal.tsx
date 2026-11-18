import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "animate-slide-up flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[10px] border-[3px] border-edge bg-surface shadow-pixel-lg sm:animate-pop sm:rounded-pixel",
          size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b-[3px] border-edge bg-surface-2 px-4 py-3">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl leading-none">{icon}</span>}
            <div>
              <h2 className="text-base leading-tight">{title}</h2>
              {subtitle && <p className="text-xs font-semibold text-muted">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-none"
          >
            <X size={15} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {footer && (
          <footer className="border-t-[3px] border-edge bg-surface-2 px-4 py-3">{footer}</footer>
        )}
      </div>
    </div>
  );
}
