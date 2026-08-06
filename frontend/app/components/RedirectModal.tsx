"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ExternalLink, X } from "lucide-react";

interface RedirectModalProps {
  open: boolean;
  onClose: () => void;
  storeName: string;
  redirectFailed: boolean;
  onRetry: () => void;
}

/**
 * Confirmare AFTER-THE-FACT pt "buton inteligent" — nu blocheaza fluxul de
 * copy+redirect (deja pornit sincron in useCopyCod), doar confirma ce s-a intamplat.
 * Auto-dismiss ~4s, sau Esc/click in exterior. Daca redirectFailed (popup blocat de
 * browser — semnal real din window.open() === null), arata buton de retry (click
 * nou, genuin, nu mai e blocat).
 */
export default function RedirectModal({ open, onClose, storeName, redirectFailed, onRetry }: RedirectModalProps) {
  useEffect(() => {
    if (!open) return;
    if (redirectFailed) return; // nu auto-inchide cand userul are nevoie sa actioneze
    const t = setTimeout(onClose, 4000);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open, redirectFailed, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 max-w-sm w-full shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[#f1f5f9] font-bold text-sm">Cod copiat!</p>
                <p className="text-[#94a3b8] text-xs mt-1">
                  {redirectFailed
                    ? "Browserul a blocat tab-ul nou."
                    : `Te-am redirecționat la ${storeName} într-un tab nou.`}
                </p>
              </div>
              <button onClick={onClose} className="text-[#64748b] hover:text-[#f1f5f9] transition-colors" aria-label="Închide">
                <X className="w-4 h-4" />
              </button>
            </div>
            {redirectFailed && (
              <button
                onClick={onRetry}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold py-2 rounded-xl text-sm"
              >
                Mergi la {storeName} <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
