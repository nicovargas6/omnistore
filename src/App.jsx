import React from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import StorefrontView from "./components/StorefrontView";
import AdminLayout from "./components/Admin/AdminLayout";
import ThermalReceiptModal from "./components/ThermalReceiptModal";
import OrderTrackingModal from "./components/OrderTrackingModal";
import WhatsAppAiSimulatorModal from "./components/WhatsAppAiSimulatorModal";
import LegalModal from "./components/Legal/LegalModal";
import DataPrivacyCenterModal from "./components/Legal/DataPrivacyCenterModal";
import CookieBanner from "./components/Legal/CookieBanner";
import PrivacyPolicyView from "./components/Legal/PrivacyPolicyView";
import TermsOfServiceView from "./components/Legal/TermsOfServiceView";
import { Toaster } from "sonner";

function AppContent() {
  const { 
    viewMode, 
    legalModalOpen, 
    legalDocType, 
    closeLegalDoc, 
    openLegalDoc,
    isPrivacyCenterOpen, 
    closePrivacyCenter,
    openPrivacyCenter
  } = useStore();

  return (
    <>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        theme="light"
        toastOptions={{
          style: {
            borderRadius: "1rem",
            border: "1px solid #e4e4e7",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)"
          }
        }}
      />
      {/* Global Modals for Modular Features */}
      <ThermalReceiptModal />
      <OrderTrackingModal />
      <WhatsAppAiSimulatorModal />

      {/* Global Compliance & Privacy Modals */}
      <LegalModal
        isOpen={legalModalOpen}
        docType={legalDocType}
        onClose={closeLegalDoc}
        openDataCenter={openPrivacyCenter}
      />
      <DataPrivacyCenterModal
        isOpen={isPrivacyCenterOpen}
        onClose={closePrivacyCenter}
        onOpenPrivacyDoc={() => openLegalDoc("privacy")}
      />

      {/* Floating Cookie Consent Banner */}
      <CookieBanner onOpenPrivacy={() => openLegalDoc("privacy")} />

      {/* View Routing */}
      {viewMode === "admin" ? (
        <AdminLayout />
      ) : viewMode === "privacy" ? (
        <PrivacyPolicyView openDataCenter={openPrivacyCenter} />
      ) : viewMode === "terms" ? (
        <TermsOfServiceView />
      ) : (
        <StorefrontView />
      )}
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
