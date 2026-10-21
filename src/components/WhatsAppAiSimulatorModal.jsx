import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  CheckCheck, 
  Phone, 
  ExternalLink, 
  MessageCircle, 
  ToggleLeft, 
  ToggleRight,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  Key,
  Settings,
  Sparkles as SparklesIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function WhatsAppAiSimulatorModal() {
  const { 
    isAiSimulatorOpen, 
    setIsAiSimulatorOpen, 
    storeConfig, 
    products, 
    categories,
    aiAgentConfig,
    features 
  } = useStore();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: `👋 ¡Hola! Soy el asistente virtual inteligente de *${storeConfig.name}* (${storeConfig.phoneWhatsApp}).\n\n¿En qué te puedo asesorar hoy? Conozco todo el catálogo, precios, promociones y zonas de envío.`,
      time: "Ahora",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHumanMode, setIsHumanMode] = useState(false);
  const [pendingCashierApproval, setPendingCashierApproval] = useState(false);
  const [currentOrderEstimate, setCurrentOrderEstimate] = useState(95.0);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem("omnistore_gemini_api_key") || "");
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isAiSimulatorOpen) return null;

  // Smart product and order intent detector
  const analyzeOrderIntent = (userQuestion) => {
    const raw = userQuestion.toLowerCase().trim();
    // Normalize string without accents
    const cleanStr = (s) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const normalizedQ = cleanStr(raw);

    // Stop words that shouldn't alone count as match
    const stopWords = new Set([
      "de", "con", "en", "y", "a", "la", "el", "los", "las", "al", "del",
      "un", "una", "unos", "unas", "por", "para", "quiero", "dame", "porfa",
      "favor", "hola", "pedido", "pedir", "orden", "ordenar", "plato",
      "platos", "traeme", "mandame", "llevar", "comer", "buenas", "buenos"
    ]);

    // Extract quantity from text like "1 Ojo de bife", "2 risottos", "tres cervezas"
    let detectedQty = 1;
    const digitMatch = raw.match(/\b(\d+)\b/);
    if (digitMatch) {
      detectedQty = parseInt(digitMatch[1], 10);
    } else {
      const wordNumMap = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5 };
      for (const [w, n] of Object.entries(wordNumMap)) {
        if (new RegExp(`\\b${w}\\b`).test(normalizedQ)) {
          detectedQty = n;
          break;
        }
      }
    }

    // Normalized query without leading quantity digits for product name substring search
    const queryWithoutDigits = normalizedQ.replace(/^\s*\d+\s*(?:x|de)?\s*/, "").trim();

    const qTokens = queryWithoutDigits
      .split(" ")
      .filter((w) => w.length >= 3 && !stopWords.has(w) && isNaN(w));

    // Match against catalog products
    const scoredProducts = products.map((prod) => {
      const normName = cleanStr(prod.name);
      const nameTokens = normName
        .split(" ")
        .filter((w) => w.length >= 3 && !stopWords.has(w));
      const categoryTokens = cleanStr(prod.category)
        .split(" ")
        .filter((w) => w.length >= 3 && !stopWords.has(w));
      const tagTokens = (prod.tags || [])
        .map((t) => cleanStr(t))
        .filter((t) => t.length >= 3);

      let score = 0;

      // Direct inclusion checks
      if (queryWithoutDigits && normName.includes(queryWithoutDigits)) score += 100;
      if (queryWithoutDigits && queryWithoutDigits.includes(normName)) score += 100;

      // Token overlap
      let tokenOverlap = 0;
      qTokens.forEach((qt) => {
        if (nameTokens.some((nt) => nt === qt || nt.includes(qt) || qt.includes(nt))) {
          tokenOverlap += 1.5;
        } else if (tagTokens.some((tt) => tt === qt || tt.includes(qt))) {
          tokenOverlap += 1.0;
        } else if (categoryTokens.some((ct) => ct === qt)) {
          tokenOverlap += 0.8;
        }
      });

      if (tokenOverlap > 0) {
        score += (tokenOverlap / Math.max(1, qTokens.length)) * 80;
      }

      return { product: prod, score };
    });

    const matches = scoredProducts
      .filter((m) => m.score >= 35)
      .sort((a, b) => b.score - a.score)
      .map((m) => m.product);

    // Also check if user typed an order intent (e.g. "quiero 2 ...", "1 ...", "dame ...")
    const hasOrderAction =
      raw.includes("quiero") ||
      raw.includes("dame") ||
      raw.includes("mandame") ||
      raw.includes("pedir") ||
      raw.includes("ordenar") ||
      raw.includes("traeme") ||
      raw.includes("agrega") ||
      /^\s*\d+[\s\w]/.test(raw);

    return {
      matchedProducts: matches,
      quantity: Math.max(1, detectedQty),
      hasOrderAction,
    };
  };

  // Real Google Gemini AI API Caller (if API key is provided)
  const callGeminiAi = async (userPrompt) => {
    if (!geminiApiKey || geminiApiKey.trim().length < 10) return null;

    const catalogSummary = products
      .slice(0, 16)
      .map((p) => `• ${p.name}: ${storeConfig.currency}${p.price.toFixed(2)} (${p.category}) - ${p.description}`)
      .join("\n");

    const systemPrompt = `Eres el asistente virtual oficial de WhatsApp del restaurante "${storeConfig.name}" en Bolivia.
Giro del negocio: ${storeConfig.badge}.
Dirección física: ${storeConfig.address}.
Horarios de atención: ${storeConfig.businessHours?.days || "Lunes a Domingo"} de ${storeConfig.businessHours?.openTime || "11:00"} a ${storeConfig.businessHours?.closeTime || "23:00"}.
Costo de envío a domicilio (Delivery): ${storeConfig.currency}${storeConfig.deliveryCost?.toFixed(2)} a toda la zona de cobertura habitual.
Métodos de cobro:
1. QR Simple Interoperable oficial (Banca Móvil de Bolivia: BNB, BCP, Banco Unión, Mercantil, etc.) con 0% comisión y verificación instantánea.
2. Efectivo al recibir en mano (contra entrega).
(NO aceptamos tarjetas en línea para evitar comisiones a los clientes).
Menú y catálogo:
${catalogSummary}

REGLAS DE RESPUESTA EN WHATSAPP:
1. Sé muy educado, cálido, ágil y habla en español latinoamericano natural.
2. Usa formato de WhatsApp: negritas con asteriscos (*ejemplo*), viñetas con emojis y saltos de línea ordenados.
3. Respuestas concisas: máximo 2 a 3 párrafos cortos. En WhatsApp los clientes buscan respuestas rápidas.
4. Si el cliente pregunta "¿cuánto cuesta el delivery?", dale directamente el costo exacto (${storeConfig.currency}${storeConfig.deliveryCost?.toFixed(2)}) y la dirección desde donde despachas.
5. Si pregunta por ubicación, horarios o formas de pago, responde directo con los datos oficiales.
6. Si el cliente pide platos específicos o dice qué desea ordenar (ej. "1 ojo de bife angus", "quiero 2 hamburguesas"), toma nota con el total estimado y explícale que su pedido pasará ahora a atención del cajero para confirmar en cocina y emitir su código QR Simple oficial sin comisiones.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n--- MENSAJE DEL CLIENTE EN WHATSAPP ---\n"${userPrompt}"` }]
          }
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 350,
        }
      })
    });

    if (!res.ok) {
      console.warn("Gemini API error status:", res.status);
      throw new Error(`Gemini API error: ${res.status}`);
    }
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Check if the conversation is an order placement
    const lowerReply = (reply || "").toLowerCase();
    const lowerPrompt = userPrompt.toLowerCase();
    if (
      lowerReply.includes("cajero") ||
      lowerReply.includes("confirmación") ||
      lowerReply.includes("confirmacion") ||
      lowerPrompt.includes("quiero") ||
      lowerPrompt.includes("dame") ||
      lowerPrompt.includes("bife") ||
      lowerPrompt.includes("pedido") ||
      lowerPrompt.includes("orden") ||
      /^\s*\d+[\s\w]/.test(lowerPrompt)
    ) {
      setPendingCashierApproval(true);
    }

    return reply || null;
  };

  // Local intelligent simulated AI engine grounded on current store data
  const generateAiResponse = (userQuestion) => {
    const raw = userQuestion.toLowerCase().trim();
    // Normalize string without accents
    const cleanStr = (s) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const q = cleanStr(raw);

    // Question indicators
    const isQuestion =
      userQuestion.includes("?") ||
      q.includes("cuanto") ||
      q.includes("donde") ||
      q.includes("como") ||
      q.includes("que") ||
      q.includes("cual") ||
      q.includes("tienen") ||
      q.includes("hay") ||
      q.includes("costo") ||
      q.includes("precio") ||
      q.includes("horario") ||
      q.includes("abierto");

    // 1. Human intervention request
    if (
      q.includes("humano") ||
      q.includes("caja") ||
      q.includes("cajero") ||
      q.includes("persona") ||
      q.includes("operador") ||
      q.includes("alguien") ||
      q.includes("asesor") ||
      q.includes("dueno")
    ) {
      setIsHumanMode(true);
      setPendingCashierApproval(true);
      return `👨‍💼 *[Atención con Cajero Humano Activada]*\n\n¡Entendido! He pasado esta conversación al cajero humano de turno. El personal ya tiene en pantalla tu chat para atenderte directamente.`;
    }

    // 2. Delivery Cost & Shipping Inquiry (PRIORITY CHECK)
    if (
      q.includes("delivery") ||
      q.includes("envio") ||
      q.includes("flete") ||
      q.includes("despacho")
    ) {
      // If asking about cost, availability, zones, or price
      if (
        isQuestion ||
        q.includes("costo") ||
        q.includes("precio") ||
        q.includes("cuanto") ||
        q.includes("vale") ||
        q.includes("tarifa") ||
        q.includes("cobran") ||
        q.includes("zona") ||
        q.includes("cobertura") ||
        q.includes("hacen") ||
        q.includes("llegan")
      ) {
        return `🛵 *Información y Costo de Delivery:*\n\n• *Costo de envío base:* ${storeConfig.currency}${storeConfig.deliveryCost?.toFixed(2)} a toda nuestra zona de cobertura habitual.\n• *Despacho desde:* ${storeConfig.address}\n• *Giro:* ${storeConfig.badge}\n\n¿Te gustaría que te tome un pedido para delivery a domicilio? Dime qué plato te gustaría ordenar.`;
      }
    }

    // 3. Location / Store Address Inquiry
    if (
      q.includes("donde estan") ||
      q.includes("donde queda") ||
      q.includes("ubicacion") ||
      q.includes("direccion del local") ||
      q.includes("como llego") ||
      q.includes("sucursal") ||
      (q.includes("direccion") && isQuestion)
    ) {
      return `📍 *Ubicación del Local:*\n\n• Nos encontramos en: *${storeConfig.address}*.\n• Contamos con atención para consumo en salón, retiro en caja y servicio de delivery a domicilio.`;
    }

    // 4. Store Hours & Open/Closed Status
    if (
      q.includes("horario") ||
      q.includes("abierto") ||
      q.includes("abren") ||
      q.includes("cierran") ||
      q.includes("a que hora") ||
      q.includes("que dias")
    ) {
      return `⏰ *Horarios de Atención en ${storeConfig.name}:*\n\n• *Días:* ${storeConfig.businessHours?.days || "Lunes a Domingo"}\n• *Horario:* ${storeConfig.businessHours?.openTime || "11:00"} a ${storeConfig.businessHours?.closeTime || "23:00"}\n• 🟢 *Estado actual:* ¡Estamos abiertos y recibiendo pedidos!\n\n¿Qué te gustaría ordenar hoy?`;
    }

    // 5. Inquiries about payment methods & QR Simple
    if (
      q.includes("pago") ||
      q.includes("pagar") ||
      q.includes("metodo") ||
      q.includes("forma de pago") ||
      q.includes("qr") ||
      q.includes("tarjeta") ||
      q.includes("efectivo") ||
      q.includes("transferencia") ||
      q.includes("cuenta") ||
      q.includes("banco")
    ) {
      return `💳 *Métodos de Cobro Disponibles en ${storeConfig.name}:*\n\n1. *QR Simple (Banca Móvil / Interoperable):* Transferencia bancaria directa e inmediata (BNB, BCP, Banco Unión, Mercantil, etc.) con 0% comisión y verificación automática.\n2. *Efectivo:* Pago físico al recibir tu pedido (delivery) o directamente en caja.\n\n⚠️ *Nota:* Por seguridad y rapidez no cobramos con tarjeta en línea. Al confirmar tu comanda, el cajero de turno te autoriza y emite tu código QR Simple directo a tu nombre.`;
    }

    // 6. Menu Recommendations & Specials
    if (
      q.includes("recomiendas") ||
      q.includes("recomendacion") ||
      q.includes("estrella") ||
      q.includes("mas vendido") ||
      q.includes("especialidad") ||
      q.includes("sugerencia") ||
      q.includes("que es rico") ||
      q.includes("que pido")
    ) {
      const sample = products.slice(0, 3).map(p => `• *${p.name}* — ${storeConfig.currency}${p.price.toFixed(2)} (${p.description.slice(0, 45)}...)`).join("\n");
      return `⭐ *Nuestras Especialidades Recomendadas de la Casa:*\n\n${sample}\n\n¿Te gustaría que te tome nota de alguno de estos para tu pedido?`;
    }

    // 7. Category queries (e.g. postres, bebidas, vinos, cervezas, carnes, pastas)
    const matchedCategory = categories.find(cat => q.includes(cleanStr(cat)));
    if (matchedCategory || q.includes("postre") || q.includes("bebida") || q.includes("vino") || q.includes("cerveza") || q.includes("cafe")) {
      const catName = matchedCategory || (q.includes("postre") ? "Postres" : q.includes("bebida") || q.includes("vino") || q.includes("cerveza") ? "Bebidas" : "Especialidades");
      const inCat = products.filter(p => cleanStr(p.category).includes(cleanStr(catName)) || (p.tags && p.tags.some(t => cleanStr(t).includes(q))));
      if (inCat.length > 0) {
        const list = inCat.slice(0, 4).map(p => `• *${p.name}* — ${storeConfig.currency}${p.price.toFixed(2)}`).join("\n");
        return `🍽️ *Opciones disponibles en ${catName}:*\n\n${list}\n\n¿Deseas agregar alguno a tu pedido?`;
      }
    }

    // 8. Special dietary / Vegetarian options
    if (q.includes("vegetariano") || q.includes("vegano") || q.includes("saludable") || q.includes("sin carne") || q.includes("celiaco") || q.includes("sin gluten")) {
      const veg = products.filter(p => p.tags?.some(t => cleanStr(t).includes("vegano") || cleanStr(t).includes("vegetariano")));
      if (veg.length > 0) {
        return `🥗 *Opciones Vegetarianas & Especiales:*\n\n` + veg.map(v => `• *${v.name}* (${storeConfig.currency}${v.price.toFixed(2)}): ${v.description}`).join("\n\n") + `\n\n¿Te gustaría que te anote alguno?`;
      }
      return `Contamos con opciones adaptables en nuestro menú. Indícanos qué ingredientes prefieres omitir y lo coordinamos directamente con cocina.`;
    }

    // 9. Specific Product Order (e.g. "1 Ojo de bife Angus", "bife angus", "dame 2 hamburguesas", "quiero pizza", etc.)
    const { matchedProducts, quantity, hasOrderAction } = analyzeOrderIntent(userQuestion);

    if (matchedProducts.length > 0) {
      const mainProd = matchedProducts[0];
      const itemTotal = mainProd.price * quantity;
      setCurrentOrderEstimate(itemTotal);
      setPendingCashierApproval(true);

      const itemsList = matchedProducts
        .slice(0, 2)
        .map((p, idx) => `• *${idx === 0 ? quantity : 1}x ${p.name}* — ${storeConfig.currency}${(p.price * (idx === 0 ? quantity : 1)).toFixed(2)}`)
        .join("\n");

      return `📝 *¡Anotado! He registrado tu pedido:*\n${itemsList}\n💵 *Total estimado:* ${storeConfig.currency}${itemTotal.toFixed(2)}\n\n👨‍💼 *Tu pedido se pasará ahora a atención del cajero para confirmar el pedido y disponibilidad en cocina.*\n\n⏳ En breves instantes el personal de caja revisará tu comanda y te autorizará el código QR Simple oficial para realizar tu pago.\n\n🛵 ¿Sería para *Delivery a domicilio* o para *Retirar en el local*?`;
    }

    // 10. Generic order attempt with quantity or ordering verb but no exact menu match
    if (hasOrderAction && (q.includes("combo") || q.includes("plato") || q.includes("porfa") || q.match(/\d+/))) {
      setCurrentOrderEstimate(65.0);
      setPendingCashierApproval(true);
      return `📝 *¡Anotado! He registrado tu pedido:*\n• *${userQuestion.trim()}*\n\n👨‍💼 *Tu pedido se pasará ahora a atención del cajero para confirmar el pedido y cotizar el monto exacto.*\n\n⏳ En breves instantes el encargado de caja te confirmará disponibilidad y te autorizará el código QR Simple para el pago.\n\n🛵 ¿Sería para *Delivery a domicilio* o para *Retirar en el local*?`;
    }

    // 11. User provides address / finalizes order details (STRICT CHECK: must NOT be a question)
    const hasAddressKeywords =
      q.includes("calle") ||
      q.includes("av.") ||
      q.includes("avenida") ||
      q.includes("edificio") ||
      q.includes("condominio") ||
      q.includes("piso") ||
      q.includes("a nombre de") ||
      q.includes("calacoto") ||
      q.includes("sopocachi") ||
      q.includes("miraflores") ||
      q.includes("zona sur") ||
      q.includes("eso seria todo") ||
      q.includes("eso es todo") ||
      q.includes("confirmo") ||
      q.includes("confirmar");

    if (hasAddressKeywords && !isQuestion) {
      setPendingCashierApproval(true);
      return `📋 *¡SOLICITUD Y DATOS RECIBIDOS!*\n\nTu pedido se encuentra:\n⏳ *Estado: A la espera de confirmación del cajero.*\n\n👨‍💼 El encargado de caja ya tiene tu comanda y dirección en pantalla para confirmar con cocina.\n\n📲 *En breves instantes el cajero te autorizará el código QR Simple oficial aquí en el chat para realizar tu pago.* (La IA no cobra directamente para evitar errores).\n\n¡Muchas gracias por tu paciencia!`;
    }

    // 12. General Menu / Catalog Overview
    if (q.includes("menu") || q.includes("carta") || q.includes("catalogo") || q.includes("que tienen") || q.includes("que venden") || q.includes("que hay") || q.includes("platos")) {
      const sample = products.slice(0, 4).map(p => `• *${p.name}* — ${storeConfig.currency}${p.price.toFixed(2)} (${p.category})`).join("\n");
      return `📋 *Catálogo Destacado de ${storeConfig.name}:*\n\n${sample}\n\nTenemos ${products.length} productos en categorías como ${categories.slice(0, 3).join(", ")}. Puedes decirme qué deseas pedir (por ejemplo: *"1 Ojo de bife Angus"* o *"1 Risotto"*).`;
    }

    // 13. General price range inquiry
    if (q.includes("precio") || q.includes("costo") || q.includes("cuanto sale") || q.includes("cuanto cuesta")) {
      const first = products[0];
      return `Nuestros precios van desde ${storeConfig.currency}${Math.min(...products.map(p=>p.price)).toFixed(2)} hasta ${storeConfig.currency}${Math.max(...products.map(p=>p.price)).toFixed(2)}. Por ejemplo, nuestro *${first.name}* está a ${storeConfig.currency}${first.price.toFixed(2)}. ¿Deseas consultar por algún plato en particular?`;
    }

    // 14. Polite greetings & Small talk
    if (q.includes("gracias") || q.includes("muchas gracias") || q.includes("agradezco") || q.includes("buenisimo") || q.includes("excelente") || q.includes("chau") || q.includes("adios") || q.includes("hasta luego")) {
      return `😊 ¡Con mucho gusto! Si deseas pedir algún plato o consultar cualquier detalle, aquí estoy para atenderte. ¡En *${storeConfig.name}* estamos para servirte!`;
    }

    if (q.includes("hola") || q.includes("buenos dias") || q.includes("buenas tardes") || q.includes("buenas noches") || q.includes("que tal")) {
      return `👋 ¡Hola! Bienvenido a *${storeConfig.name}*. ¿Cómo te podemos ayudar hoy? Puedes consultar nuestro menú, precios, horarios, costo de envío o decirme directamente qué plato deseas pedir.`;
    }

    // 15. Intelligent Fallback (Never confuses a query with an order)
    return `✨ Gracias por tu mensaje. En *${storeConfig.name}* estoy para ayudarte con cualquier consulta:\n\n• 🍽️ *Menú y Precios:* Escribe *"ver menú"* o el nombre de un plato.\n• 🛵 *Delivery:* Costo base ${storeConfig.currency}${storeConfig.deliveryCost?.toFixed(2)} a toda la zona.\n• ⏰ *Horario:* ${storeConfig.businessHours?.openTime || "11:00"} a ${storeConfig.businessHours?.closeTime || "23:00"}.\n• 💳 *Pagos:* QR Simple interoperable y Efectivo.\n• 👨‍💼 *Cajero:* Escribe *"cajero"* para hablar con el personal.\n\n¿En qué te puedo asesorar hoy?`;
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    if (isHumanMode) {
      setTimeout(() => {
        setIsTyping(false);
        const aiReply = {
          id: Date.now() + 1,
          sender: "human_staff",
          text: "👨‍💼 [Cajero en línea]: Hola, acabo de tomar el control del chat. ¿En qué te ayudo con tu pedido?",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiReply]);
      }, 700);
      return;
    }

    // Try Gemini AI if API key is provided
    let replyText = null;
    if (geminiApiKey && geminiApiKey.trim().length > 10) {
      try {
        replyText = await callGeminiAi(text.trim());
      } catch (err) {
        console.warn("Gemini API error, falling back to local NLP engine:", err);
      }
    }

    // Fallback to our rock-solid local semantic NLP engine
    if (!replyText) {
      replyText = generateAiResponse(text);
    }

    setTimeout(() => {
      setIsTyping(false);
      const aiReply = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 700);
  };

  // Cashier authorizes and sends the QR
  const handleCashierAuthorizeQr = () => {
    setIsHumanMode(true);
    setPendingCashierApproval(false);
    toast.success("Cajero: Pedido autorizado y QR Simple enviado al cliente.");

    const cashierMsg = {
      id: Date.now(),
      sender: "human_staff",
      text: `👨‍💼 *[Cajero de ${storeConfig.name}]*: ¡Hola! He revisado tu pedido y tenemos todo confirmado en cocina.\n\n💵 *Total a pagar:* ${storeConfig.currency}${currentOrderEstimate.toFixed(2)} (Monto exacto sin comisiones)\n🏦 *Banco:* ${storeConfig.bankDetails?.bankName || "Banco Nacional de Bolivia (BNB)"}\n👤 *Titular:* ${storeConfig.bankDetails?.accountHolder || storeConfig.name}\n\n📱 *Aquí tienes el código QR Simple oficial para realizar tu pago.* Al confirmarse la transferencia, tu pedido entra inmediatamente a preparación.`,
      hasQrAction: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, cashierMsg]);
  };

  const handleOpenRealWhatsApp = () => {
    const cleanPhone = storeConfig.phoneWhatsApp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Hola ${storeConfig.name}, quisiera hacer una consulta sobre el catálogo.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAiSimulatorOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window: Smartphone / WhatsApp Chat style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-[#efeae2] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-300 flex flex-col h-[650px] max-h-[92vh]"
        >
          {/* WhatsApp Header: Clean, balanced, native spacing */}
          <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between shadow-xs gap-2 border-b border-[#054c44]">
            {/* Left: Avatar & Identity (flex-1 with truncate so it never squishes) */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 border border-white/30 flex-shrink-0 shadow-2xs">
                <img src={storeConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5 truncate">
                  <span className="truncate">{storeConfig.name}</span>
                </h4>
                <div className="text-[10px] text-emerald-200/90 truncate flex items-center gap-1.5 leading-none mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
                  <span className="truncate">
                    {isHumanMode ? "Cajero en línea" : geminiApiKey ? "Gemini IA activa" : "En línea"}
                  </span>
                  <span className="opacity-60">•</span>
                  <span className="truncate text-[9.5px] opacity-80">{storeConfig.phoneWhatsApp}</span>
                </div>
              </div>
            </div>

            {/* Right: Sleek Action Pills with plenty of breathing room */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTempApiKey(geminiApiKey);
                  setShowApiSettings(!showApiSettings);
                }}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition cursor-pointer flex items-center gap-1 shadow-2xs ${
                  geminiApiKey
                    ? "bg-amber-400 text-neutral-950 font-black hover:bg-amber-300"
                    : "bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50"
                }`}
                title="Configurar IA Real (Google Gemini)"
              >
                <SparklesIcon className={`w-3 h-3 ${geminiApiKey ? "text-neutral-950" : "text-amber-300"}`} />
                <span>{geminiApiKey ? "Gemini" : "IA"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsHumanMode(!isHumanMode)}
                className={`text-[10px] font-bold px-2 py-1 rounded-full transition cursor-pointer flex items-center gap-1 shadow-2xs ${
                  isHumanMode
                    ? "bg-amber-400 text-neutral-950 font-black"
                    : "bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50"
                }`}
                title={isHumanMode ? "Cajero humano atendiendo" : "Asistente automático"}
              >
                <span>{isHumanMode ? "👨‍💼 Cajero" : "🤖 Auto"}</span>
              </button>

              <button
                onClick={() => setIsAiSimulatorOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer ml-0.5"
                title="Cerrar chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Gemini API Key Settings Panel (Collapsible) */}
          {showApiSettings && (
            <div className="p-3 bg-neutral-900 text-white border-b border-neutral-700 text-xs space-y-2 z-20 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>Conectar IA Real (Google Gemini 1.5 Flash)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiSettings(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-neutral-300 leading-tight">
                Ingresa una API Key gratuita de Google AI Studio para que la IA responda con comprensión semántica total a cualquier pregunta. (Si está vacía, se usa el motor local).
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Pega tu Gemini API Key (AIzaSy...)"
                  className="flex-1 bg-neutral-800 border border-neutral-600 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const clean = tempApiKey.trim();
                    setGeminiApiKey(clean);
                    if (clean) {
                      localStorage.setItem("omnistore_gemini_api_key", clean);
                      toast.success("¡Gemini 1.5 Flash activado en el agente!");
                    } else {
                      localStorage.removeItem("omnistore_gemini_api_key");
                      toast.info("Modo IA Local activado.");
                    }
                    setShowApiSettings(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                >
                  Guardar
                </button>
              </div>
              <div className="text-[9px] text-neutral-400 flex items-center justify-between pt-0.5">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Obtener clave gratis en aistudio.google.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                {geminiApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setGeminiApiKey("");
                      setTempApiKey("");
                      localStorage.removeItem("omnistore_gemini_api_key");
                      toast.info("Clave removida. Usando motor local.");
                      setShowApiSettings(false);
                    }}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#d1d7db_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Encryption notice */}
            <div className="text-center">
              <span className="bg-[#ffeecd] text-neutral-700 text-[10px] px-3 py-1 rounded-lg inline-block shadow-2xs">
                🔒 Simulación de Agente IA con datos en vivo de tu tienda
              </span>
            </div>

            {messages.map((m) => {
              const isAi = m.sender === "ai" || m.sender === "human_staff";
              return (
                <div
                  key={m.id}
                  className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-2xs leading-relaxed whitespace-pre-line ${
                      isAi
                        ? "bg-white text-neutral-900 rounded-tl-xs"
                        : "bg-[#d9fdd3] text-neutral-900 rounded-tr-xs"
                    }`}
                  >
                    {m.sender === "human_staff" && (
                      <span className="text-[10px] font-bold text-amber-700 block mb-1">
                        [Operador en Caja]
                      </span>
                    )}
                    <div>{m.text}</div>

                    {m.hasQrAction && (
                      <div className="mt-2.5 p-3 bg-neutral-900 text-white rounded-xl flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                          <div>
                            <div className="font-bold text-[11px] text-white">QR Simple Oficial Acreditado</div>
                            <div className="text-[10px] text-neutral-300">Autorizado y emitido por Caja</div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold flex-shrink-0">
                          Listo para escanear
                        </span>
                      </div>
                    )}

                    <div className="text-[9px] text-neutral-400 text-right mt-1 flex items-center justify-end gap-0.5">
                      <span>{m.time}</span>
                      {!isAi && <CheckCheck className="w-3 h-3 text-blue-500" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-3 py-2 text-xs shadow-2xs text-neutral-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[10px] font-medium ml-1">
                    {isHumanMode ? "Cajero escribiendo..." : "IA escribiendo..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Cashier Authorization Banner (When customer request is awaiting cashier confirmation) */}
          {pendingCashierApproval && (
            <div className="p-3 bg-amber-50 border-t border-amber-200 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 text-xs">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
                </span>
                <span className="font-bold text-[11px] leading-tight">
                  Caja: Pedido en espera de confirmación.
                </span>
              </div>
              <button
                type="button"
                onClick={handleCashierAuthorizeQr}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Autorizar & Enviar QR</span>
              </button>
            </div>
          )}

          {/* Quick Prompts Chips */}
          <div className="p-2 bg-white/90 border-t border-neutral-200 flex gap-1.5 overflow-x-auto scrollbar-none">
            {[
              "¿Cuánto cuesta el delivery?",
              "¿Qué horarios tienen?",
              "¿Dónde están ubicados?",
              "Quiero hacer un pedido",
              "Ver catálogo de productos",
              "¿Tienen opciones vegetarianas?",
              "Hablar con el cajero",
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] rounded-full transition cursor-pointer flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-[#f0f2f5] border-t border-neutral-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={isHumanMode ? "Escribe como cliente al cajero..." : "Hazle una consulta a la IA..."}
              className="flex-1 bg-white px-3.5 py-2 rounded-full text-xs border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center transition cursor-pointer flex-shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Bar: Open real WhatsApp */}
          <div className="p-2 bg-neutral-900 text-white text-center text-[10px] flex items-center justify-center gap-1.5">
            <span>Vinculado al WhatsApp oficial: <strong>{storeConfig.phoneWhatsApp}</strong></span>
            <button
              onClick={handleOpenRealWhatsApp}
              className="underline text-emerald-300 hover:text-emerald-200 font-bold ml-1 cursor-pointer"
            >
              Abrir WhatsApp Real
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
