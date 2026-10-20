import React from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import StorefrontView from "./components/StorefrontView";
import AdminLayout from "./components/Admin/AdminLayout";
import ThermalReceiptModal from "./components/ThermalReceiptModal";
import OrderTrackingModal from "./components/OrderTrackingModal";
import WhatsAppAiSimulatorModal from "./components/WhatsAppAiSimulatorModal";
import { Toaster } from "sonner";

function AppContent() {
  const { viewMode } = useStore();

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

      {viewMode === "admin" ? <AdminLayout /> : <StorefrontView />}
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
