import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/helpers";

/**
 * Clean and accessible Modal / Dialog component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-lg",
}) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "surface-card relative z-10 w-full overflow-hidden shadow-[var(--shadow-float)] transition-all animate-in fade-in zoom-in-95",
          maxWidth,
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            {title && (
              <h3 id="modal-title" className="font-display text-lg font-bold text-foreground">
                {title}
              </h3>
            )}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-secondary/30 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
