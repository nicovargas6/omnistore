import React from "react";
import { useStore } from "../../context/StoreContext";
import { Scale, ArrowLeft, ShieldCheck, Clock, Truck, QrCode, AlertTriangle } from "lucide-react";

interface TermsOfServiceViewProps {
  onBack?: () => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onBack }) => {
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
            <Scale className="w-4 h-4" />
            <span>Marco Contractual & Condiciones de Uso</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Reglas, derechos y responsabilidades que rigen el uso del catálogo digital, pedidos en línea y servicios de entrega de <strong>{storeConfig.name}</strong>.
          </p>
          <div className="text-[11px] text-neutral-400 mt-4 flex flex-wrap gap-4 pt-4 border-t border-neutral-800">
            <span>Vigencia: <strong>2026</strong></span>
            <span>Régimen Comercial: <strong>Venta Directa & Delivery</strong></span>
            <span>Jurisdicción: <strong>Tribunales Competentes del Estado Plurinacional de Bolivia</strong></span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-neutral-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">1</span>
              <span>Aceptación de los Términos</span>
            </h2>
            <p>
              Al acceder a este sitio web, explorar el catálogo, agregar artículos al carrito o confirmar una comanda a través de la pasarela digital o WhatsApp, el usuario declara ser mayor de edad legal o contar con la debida autorización de sus tutores, y acepta de manera expresa y sin reservas los presentes Términos y Condiciones.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">2</span>
              <span>Catálogo, Precios y Disponibilidad</span>
            </h2>
            <p>
              Todos los precios exhibidos están expresados en moneda nacional ({storeConfig.currency || "Bs"}) e incluyen los impuestos de ley aplicables según el régimen tributario del comercio.
            </p>
            <p>
              Nos esforzamos por mantener la disponibilidad en tiempo real. No obstante, por tratarse de alimentos frescos e insumos de producción diaria, en caso de agotamiento imprevisto de algún ingrediente o plato, el equipo de cocina o el operador de despacho se comunicará de inmediato al teléfono registrado para coordinar una sustitución equivalente o la devolución del importe abonado.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">3</span>
              <span>Modalidades de Pago y Cobro por QR Simple</span>
            </h2>
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Cobro Digital Interbancario (0% Comisión para el Cliente)</span>
              </div>
              <p>
                Los pagos por <strong>QR Simple</strong> se realizan escaneando el código dinámico generado con el monto exacto de la orden desde la aplicación bancaria del usuario. El pedido ingresa a preparación una vez validada la acreditación de la transferencia.
              </p>
              <p>
                En caso de seleccionar <strong>Pago en Efectivo contra Entrega</strong>, el cliente se compromete a contar con el monto acordado al momento de recibir la comanda.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">4</span>
              <span>Políticas de Entrega a Domicilio y Retiro en Local</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600">
              <li>
                <strong>Tiempos Estimados:</strong> Los tiempos de preparación y entrega (usualmente entre 25 a 45 minutos) son referenciales y pueden variar por condiciones climatológicas o tráfico vehicular.
              </li>
              <li>
                <strong>Exactitud de la Dirección:</strong> El cliente es responsable de proveer referencias claras y mantener el número de contacto activo para que el repartidor pueda comunicarse a su llegada.
              </li>
              <li>
                <strong>Costo de Delivery:</strong> El costo de transporte se calcula en base a la zona de cobertura o distancia fijada al momento del checkout.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">5</span>
              <span>Cancelaciones y Reclamaciones</span>
            </h2>
            <p>
              Dado el carácter perecedero de los alimentos preparados, <strong>no se admiten cancelaciones una vez que la orden ha ingresado a la etapa de cocción en cocina</strong>.
            </p>
            <p>
              Si el pedido recibido presenta daños imputables al transporte, faltantes o discrepancias con la orden solicitada, el cliente debe reportarlo inmediatamente por WhatsApp adjuntando fotografía para gestionar la reposición prioritaria sin costo o el reembolso pertinente.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">6</span>
              <span>Protección al Consumidor (Ley N° 453) y Control de Alcohol (Ley N° 259)</span>
            </h2>
            <p>
              El Comercio operado formalmente por <strong>{storeConfig.legalName || storeConfig.name}</strong> ({storeConfig.taxId || "NIT Registrado"}) cumple rigurosamente con la <strong>Ley General de los Derechos de las Usuarias y los Usuarios y de las Consumidoras y los Consumidores (Ley N° 453)</strong> del Estado Plurinacional de Bolivia.
            </p>
            <p>
              En estricto apego a la <strong>Ley N° 259 (Control al Expendio y Consumo de Bebidas Alcohólicas)</strong>, queda terminantemente prohibida la venta, despacho o entrega de bebidas con graduación alcohólica a menores de 18 años. El repartidor o personal de salón está legalmente facultado para requerir la Cédula de Identidad del receptor.
            </p>
            <p>
              Para atención directa de quejas, reclamaciones o solicitudes de sustitución, el usuario dispone del canal oficial de WhatsApp <strong>{storeConfig.phoneWhatsApp}</strong> o de forma presencial en <strong>{storeConfig.address}</strong> con plazo de respuesta preferente.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 p-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <span>© {new Date().getFullYear()} {storeConfig.name}. Términos y Condiciones Oficiales.</span>
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

export default TermsOfServiceView;
