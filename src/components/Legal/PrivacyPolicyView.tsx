import React from "react";
import { useStore } from "../../context/StoreContext";
import { ShieldCheck, ArrowLeft, Lock, Database, Eye, Trash2, FileCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface PrivacyPolicyViewProps {
  onBack?: () => void;
  openDataCenter?: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack, openDataCenter }) => {
  const { storeConfig, setViewMode } = useStore();

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.pushState(null, "", "/");
      setViewMode("storefront");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden">
        {/* Header Banner */}
        <div className="bg-neutral-900 text-white p-6 sm:p-10 border-b border-neutral-800">
          <button
            onClick={handleReturn}
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2 rounded-xl transition cursor-pointer mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Tienda</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Documento Legal Oficial & Compliance</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Política de Privacidad y Tratamiento de Datos Personales
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            En cumplimiento del régimen normativo de protección de datos personales, garantías constitucionales de Habeas Data y directivas internacionales de privacidad digital (GDPR / LGPD).
          </p>
          <div className="text-[11px] text-neutral-400 mt-4 flex flex-wrap gap-4 pt-4 border-t border-neutral-800">
            <span>Última actualización: <strong>Octubre 2026</strong></span>
            <span>Entidad Responsable: <strong>{storeConfig.name}</strong></span>
            <span>Jurisdicción: <strong>Bolivia / Internacional</strong></span>
          </div>
        </div>

        {/* Action Callout for User Rights */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-emerald-950">
                Tus Datos, Tu Control (Derechos ARCO y Derecho al Olvido)
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Puedes revisar los datos almacenados en este dispositivo, descargarlos en JSON o eliminarlos por completo en cualquier momento.
              </p>
            </div>
          </div>
          {openDataCenter && (
            <button
              onClick={openDataCenter}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              Gestionar Mis Datos
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-neutral-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">1</span>
              <span>Identidad del Responsable del Tratamiento</span>
            </h2>
            <p>
              El presente sitio web, su catálogo interactivo y sus sistemas de gestión de pedidos en línea son operados por <strong>{storeConfig.name}</strong> (en adelante, el "Comercio"), con domicilio comercial público en <strong>{storeConfig.address}</strong> y canal de atención directa vía WhatsApp <strong>{storeConfig.phoneWhatsApp}</strong>.
            </p>
            <p>
              El Comercio asume el compromiso inequívoco de salvaguardar la confidencialidad, integridad y disponibilidad de toda información personal suministrada por los clientes y visitantes.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">2</span>
              <span>Datos Personales Recolectados y Finalidad</span>
            </h2>
            <p>
              Recolectamos exclusivamente la información mínima indispensable para procesar, elaborar y entregar tus pedidos:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600">
              <li>
                <strong>Datos de Identificación y Contacto:</strong> Nombre completo y número de teléfono móvil / WhatsApp, utilizados para confirmar la orden, enviar alertas de preparación y coordinar la entrega.
              </li>
              <li>
                <strong>Datos de Ubicación y Entrega:</strong> Dirección física de entrega, referencias del domicilio y coordenadas geográficas voluntariamente seleccionadas mediante el mapa interactivo de entrega.
              </li>
              <li>
                <strong>Detalles de la Transacción:</strong> Lista de platillos o productos solicitados, especificaciones de cocción/extras, comprobante o número de referencia de pago QR Simple y hora de solicitud.
              </li>
              <li>
                <strong>Datos Técnicos de Navegación:</strong> Preferencias de idioma, identificadores de sesión en almacenamiento local para preservar el carrito de compras y registro de aceptación del banner de cookies.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">3</span>
              <span>Seguridad de Pagos e Información Financiera</span>
            </h2>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Cero Almacenamiento de Credenciales Bancarias</span>
              </div>
              <p>
                Los pagos mediante <strong>QR Simple (Banca Móvil)</strong> son interoperables y se ejecutan directamente dentro de la aplicación móvil de tu banco de preferencia (BNB, BCP, Banco Unión, Mercantil Santa Cruz, etc.). <strong>{storeConfig.name}</strong> NUNCA solicita ni almacena números de tarjetas de crédito/débito, códigos CVV ni contraseñas bancarias.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">4</span>
              <span>Política de Cookies y Almacenamiento Local</span>
            </h2>
            <p>
              Este sitio utiliza almacenamiento local (<code>localStorage</code>) y cookies técnicas estrictamente necesarias para el correcto funcionamiento del carrito de compras, la personalización del tema visual y el registro de tu consentimiento de privacidad. No comercializamos perfiles de navegación con redes publicitarias de terceros.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">5</span>
              <span>Ejercicio de Derechos ARCO y Derecho al Olvido</span>
            </h2>
            <p>
              Como titular de tus datos personales, tienes garantizados por ley los derechos de:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-xs text-neutral-900 block">Acceso y Portabilidad</span>
                <span className="text-xs text-neutral-500">Conocer qué datos están registrados y exportar una copia estructurada en formato JSON.</span>
              </div>
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-xs text-neutral-900 block">Rectificación</span>
                <span className="text-xs text-neutral-500">Actualizar o corregir información desactualizada o errónea en tus pedidos.</span>
              </div>
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-xs text-neutral-900 block">Cancelación (Derecho al Olvido)</span>
                <span className="text-xs text-neutral-500">Exigir la purga y eliminación definitiva de tus registros personales y pedidos.</span>
              </div>
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-xs text-neutral-900 block">Oposición</span>
                <span className="text-xs text-neutral-500">Revocar tu consentimiento para comunicaciones informativas o de marketing.</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500 pt-2">
              Puedes ejercer estos derechos de manera inmediata mediante el <strong>Centro de Privacidad</strong> accesible en el pie de página o escribiendo a nuestro WhatsApp oficial de atención.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">6</span>
              <span>Medidas de Seguridad y Cifrado</span>
            </h2>
            <p>
              Implementamos protocolos de seguridad estándar de la industria, incluyendo transmisión encriptada bajo protocolo <strong>HTTPS (TLS 1.3)</strong>, aislamiento de credenciales en variables de entorno de servidor protegidas y políticas de sanitización estricta de entradas para prevenir ataques XSS o inyecciones de código.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 p-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <span>© {new Date().getFullYear()} {storeConfig.name}. Todos los derechos reservados.</span>
          <button
            onClick={handleReturn}
            className="text-neutral-800 font-bold hover:underline cursor-pointer"
          >
            ← Volver a la Tienda
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;
