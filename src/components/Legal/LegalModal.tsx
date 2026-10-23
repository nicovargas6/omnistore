import React from "react";
import { X, ShieldCheck, Scale, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PrivacyPolicyView from "./PrivacyPolicyView";
import TermsOfServiceView from "./TermsOfServiceView";
import { LegalDocType } from "./types";

interface LegalModalProps {
  isOpen: boolean;
  docType: LegalDocType;
  onClose: () => void;
  openDataCenter?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  docType,
  onClose,
  openDataCenter,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col"
        >
          {/* Top Bar */}
          <div className="px-5 py-3.5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
              {docType === "privacy" ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Política de Privacidad</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>Términos y Condiciones</span>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Cerrar documento"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Scroll Content */}
          <div className="overflow-y-auto flex-1 p-2 sm:p-4 bg-neutral-50">
            {docType === "privacy" ? (
              <PrivacyPolicyView onBack={onClose} openDataCenter={openDataCenter} />
            ) : (
              <TermsOfServiceView onBack={onClose} />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LegalModal;
