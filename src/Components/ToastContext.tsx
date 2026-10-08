import {
  createContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "./ToastContext.css";

export type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export { ToastContext };

const DISMISS_AFTER_MS = 2800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, variant }]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, DISMISS_AFTER_MS);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.variant}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
