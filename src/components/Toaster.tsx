import { Check } from 'lucide-react';

export function Toaster({ toast }: { toast: { id: number; message: string } | null }) {
  return (
    <div className="toaster" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className="toast">
          <Check />
          {toast.message}
        </div>
      )}
    </div>
  );
}
