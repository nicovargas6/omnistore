// Presets list and initial mock databases for 4 diverse business categories:
// 1. Restaurante & Gastronomía
// 2. Moda & Ropa Online
// 3. Materiales & Ferretería Pro
// 4. Tienda de Objetos & Decoración (Concept Store)

export const BUSINESS_PRESETS = {
  restaurant: {
    id: "restaurant",
    badge: "Gastronomía & Restaurante",
    name: "Aura Bistró & Cantina",
    tagline: "Cocina de autor, ingredientes orgánicos y coctelería artesanal en un ambiente íntimo.",
    heroBadge: "🍴 Menú Degustación & Pedidos en Línea",
    currency: "Bs ",
    accentColor: "amber", // Tailwind amber
    phoneWhatsApp: "+591 78901234",
    address: "Av. Arce #2519, Sopocachi, La Paz, Bolivia",
    deliveryCost: 15.00,
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=180&h=180&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    categories: ["Entradas & Tapas", "Platos Fuertes", "Parrilla & Pastas", "Vinos & Cocteles", "Postres de Autor"],
    orderTypes: ["Mesa / En Salón", "Para Llevar (Take Away)", "Delivery a Domicilio"],
    products: [
      {
        id: "rest-1",
        name: "Ojo de Bife Angus & Papas Trufadas",
        category: "Parrilla & Pastas",
        price: 24.50,
        comparePrice: 28.00,
        costPrice: 11.00,
        stock: 18,
        description: "Corte selecto madurado 28 días (400g), sellado a la parrilla de leña con chimichurri de hierbas frescas y papas rústicas al aceite de trufa blanca.",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        tags: ["Corte Premium", "Recomendado Chef"],
        isFeatured: true,
        optionsLabel: "Término de la carne",
        options: ["Término Medio", "Tres Cuartos", "Bien Cocido", "A Punto"]
      },
      {
        id: "rest-2",
        name: "Risotto Funghi Porcini & Parmigiano",
        category: "Platos Fuertes",
        price: 18.00,
        comparePrice: null,
        costPrice: 7.20,
        stock: 25,
        description: "Arroz carnaroli con caldo de setas silvestres, vino blanco pinot grigio, manteca de hierbas y láminas de Parmigiano Reggiano 24 meses.",
        imageUrl: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
        tags: ["Vegetariano", "Italiano"],
        isFeatured: true,
        optionsLabel: "Opciones extra",
        options: ["Clásico", "Con reducción de trufa negra (+ Bs 20)", "Con burrata cremosa (+ Bs 25)"]
      },
      {
        id: "rest-3",
        name: "Tabla de Quesos Artesanales & Jamón Serrano",
        category: "Entradas & Tapas",
        price: 19.50,
        comparePrice: 22.00,
        costPrice: 8.50,
        stock: 14,
        description: "Selección curada de quesos de oveja y cabra, jamón serrano gran reserva, frutos secos tostados, miel silvestre y focaccia tibia.",
        imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        tags: ["Para Compartir"],
        isFeatured: true,
        optionsLabel: "Porción",
        options: ["Para 2 personas", "Para 4 personas (+ Bs 75)"]
      },
      {
        id: "rest-4",
        name: "Cóctel Ahumado 'Aura Negroni'",
        category: "Vinos & Cocteles",
        price: 10.50,
        comparePrice: 12.00,
        costPrice: 3.50,
        stock: 40,
        description: "Gin macerado en bayas de enebro, Vermouth Rosso carpano, Campari amargo y golpe de humo de romero en mesa.",
        imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
        tags: ["Coctel Insignia"],
        isFeatured: false,
        optionsLabel: "Variante",
        options: ["Ahumado con Romero", "Con toque de naranja amarga"]
      },
      {
        id: "rest-5",
        name: "Tarta Húmeda de Chocolate & Pistacho",
        category: "Postres de Autor",
        price: 9.00,
        comparePrice: null,
        costPrice: 2.80,
        stock: 8,
        description: "Chocolate amargo 70% Callebaut con corazón fluido de praliné de pistacho de Bronte y helado fior di latte.",
        imageUrl: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80",
        tags: ["Postre Favorito", "Pocas unidades"],
        isFeatured: true,
        optionsLabel: "Acompañamiento",
        options: ["Con Helado de Pistacho", "Con Salsa de Frambuesa"]
      },
      {
        id: "rest-6",
        name: "Hamburguesa 'Dry Aged' en Pan Brioche",
        category: "Platos Fuertes",
        price: 16.50,
        comparePrice: 18.00,
        costPrice: 6.00,
        stock: 30,
        description: "Doble blend de carne madurada 200g, queso cheddar inglés derretido, cebolla caramelizada al bourbon y bacon crocante.",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        tags: ["Best Seller"],
        isFeatured: false,
        optionsLabel: "Guarnición",
        options: ["Papas Rústicas", "Batatas Crocantes", "Ensalada Verde"]
      }
    ]
  },

  fashion: {
    id: "fashion",
    badge: "Tienda de Moda & Ropa",
    name: "KULT Studio | Moda Urbana",
    tagline: "Prendas de corte minimalista, siluetas contemporáneas y algodón orgánico de alta densidad.",
    heroBadge: "✨ Colección Otoño / Invierno Drop 04",
    currency: "Bs ",
    accentColor: "zinc", // Tailwind zinc / dark
    phoneWhatsApp: "+5491198765432",
    address: "Showroom: Distrito de Diseño, Calle 48 #102",
    deliveryCost: 5.00,
    logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=180&h=180&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    categories: ["Nuevos Drops", "Oversized Tees", "Pantalones & Denim", "Hoodies & Jackets", "Accesorios"],
    orderTypes: ["Envío Estándar", "Envío Express (24h)", "Retiro en Showroom"],
    products: [
      {
        id: "fash-1",
        name: "Heavyweight Boxy Tee 280gsm 'Nieve'",
        category: "Oversized Tees",
        price: 38.00,
        comparePrice: 45.00,
        costPrice: 14.00,
        stock: 22,
        description: "Camiseta de corte cuadrado amplio (boxy fit) confeccionada en 100% algodón peinado de 280 gramos. Cuello acanalado de 3cm que no pierde forma.",
        imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        tags: ["100% Algodón", "Top Venta"],
        isFeatured: true,
        optionsLabel: "Talle disponible",
        options: ["Talle S", "Talle M", "Talle L", "Talle XL"]
      },
      {
        id: "fash-2",
        name: "Hoodie Francés Oversize 'Carbono'",
        category: "Hoodies & Jackets",
        price: 74.00,
        comparePrice: 85.00,
        costPrice: 28.00,
        stock: 15,
        description: "Buzo con capucha sin cordones para estética limpia, tejido french terry de 450gsm. Interior suave y caída pesada.",
        imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        tags: ["Drop Exclusivo", "Heavyweight"],
        isFeatured: true,
        optionsLabel: "Talle disponible",
        options: ["Talle M", "Talle L", "Talle XL"]
      },
      {
        id: "fash-3",
        name: "Pantalón Parachute Cargo 'Oliva'",
        category: "Pantalones & Denim",
        price: 65.00,
        comparePrice: null,
        costPrice: 22.00,
        stock: 12,
        description: "Pantalón estilo cargo técnico en tela ripstop ligera y resistente. Ajustadores elásticos en tobillos y cintura.",
        imageUrl: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
        tags: ["Tendencia"],
        isFeatured: true,
        optionsLabel: "Talle",
        options: ["28 (Small)", "30 (Medium)", "32 (Large)", "34 (XL)"]
      },
      {
        id: "fash-4",
        name: "Chaqueta Bomber Acolchada 'Matte Black'",
        category: "Hoodies & Jackets",
        price: 110.00,
        comparePrice: 135.00,
        costPrice: 45.00,
        stock: 7,
        description: "Chaqueta resistente al agua con forro térmico satinado y cremalleras YKK en níquel negro. Corte corto contemporáneo.",
        imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80",
        tags: ["Últimas piezas", "Invierno"],
        isFeatured: true,
        optionsLabel: "Talle",
        options: ["Talle M", "Talle L", "Talle XL"]
      },
      {
        id: "fash-5",
        name: "Gorra 'Dad Cap' Bordada Lavada",
        category: "Accesorios",
        price: 26.00,
        comparePrice: 30.00,
        costPrice: 8.00,
        stock: 35,
        description: "Gorra de béisbol de 6 paneles en sarga de algodón lavado a la piedra, hebilla metálica de ajuste trasera y logo tonal.",
        imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
        tags: ["Accesorio"],
        isFeatured: false,
        optionsLabel: "Color",
        options: ["Negro Tonal", "Verde Musgo", "Beige Arena"]
      },
      {
        id: "fash-6",
        name: "Tote Bag Lona Pesada & Cuero",
        category: "Accesorios",
        price: 34.00,
        comparePrice: null,
        costPrice: 11.00,
        stock: 19,
        description: "Bolso utilitario en lona de 18oz con asas de cuero curtido vegetal, bolsillo interno para laptop hasta 15 pulgadas.",
        imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
        tags: ["Unisex"],
        isFeatured: false,
        optionsLabel: "Color",
        options: ["Crudo Natural", "Negro Profundo"]
      }
    ]
  },

  hardware: {
    id: "hardware",
    badge: "Ferretería & Materiales Pro",
    name: "VORTEX Herramientas & Materiales",
    tagline: "Suministros certificados, maquinaria de precisión y materiales para la construcción y talleres.",
    heroBadge: "⚡ Venta Mayorista y Minorista con Envío a Obra",
    currency: "Bs ",
    accentColor: "sky", // Tailwind blue / sky
    phoneWhatsApp: "+5491145678901",
    address: "Parque Industrial Sur, Nave 12",
    deliveryCost: 8.00,
    logoUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=180&h=180&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
    categories: ["Herramientas Eléctricas", "Herramientas Manuales", "Pinturas & Selladores", "Construcción & Fijaciones", "Seguridad Industrial"],
    orderTypes: ["Envío en Camión a Obra", "Envío Paquetería Rápida", "Retiro en Almacén"],
    products: [
      {
        id: "hard-1",
        name: "Taladro Percutor Inalámbrico 20V Max Brushless",
        category: "Herramientas Eléctricas",
        price: 135.00,
        comparePrice: 159.00,
        costPrice: 85.00,
        stock: 20,
        description: "Motor sin escobillas (Brushless) de alto rendimiento, mandril metálico de 13mm, 2 baterías de litio 2.0Ah y cargador rápido incluido en maletín rígido.",
        imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
        tags: ["Garantía 3 Años", "Uso Profesional"],
        isFeatured: true,
        optionsLabel: "Kit de compra",
        options: ["Kit Estándar (2 Baterías 2Ah)", "Kit Extendido (+ 1 Batería 4Ah) (+ Bs 220)"]
      },
      {
        id: "hard-2",
        name: "Sierra Circular de Mano 1800W con Guía Láser",
        category: "Herramientas Eléctricas",
        price: 98.00,
        comparePrice: 115.00,
        costPrice: 60.00,
        stock: 14,
        description: "Capacidad de corte en 90° de 65mm, disco de carburo de tungsteno 24 dientes incluido, base de aluminio extruido y freno eléctrico.",
        imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80",
        tags: ["Potencia Industrial"],
        isFeatured: true,
        optionsLabel: "Disco adicional",
        options: ["Solo disco 24T incluido", "Con disco adicional 40T finos (+ Bs 80)"]
      },
      {
        id: "hard-3",
        name: "Juego de Llaves Combinadas Cromo Vanadio (12 Pzas)",
        category: "Herramientas Manuales",
        price: 42.00,
        comparePrice: null,
        costPrice: 20.00,
        stock: 30,
        description: "Acero Cr-V forjado de grado profesional de 6mm a 22mm. Acabado satinado mate antideslizante con estuche organizador enrollable.",
        imageUrl: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80",
        tags: ["Calidad Taller"],
        isFeatured: true,
        optionsLabel: "Presentación",
        options: ["Juego Métrico (6-22mm)", "Juego Pulgadas SAE (1/4 - 7/8)"]
      },
      {
        id: "hard-4",
        name: "Cubeta Pintura Látex Lavable Mate (4 Galones)",
        category: "Pinturas & Selladores",
        price: 52.00,
        comparePrice: 60.00,
        costPrice: 32.00,
        stock: 25,
        description: "Pintura al agua de alto poder cubritivo, lavable, antihongos y secado al tacto en 45 minutos. Ideal para muros interiores y exteriores.",
        imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80",
        tags: ["Alto Rendimiento"],
        isFeatured: false,
        optionsLabel: "Color",
        options: ["Blanco Puro Mate", "Gris Cemento", "Hueso Marfil"]
      },
      {
        id: "hard-5",
        name: "Casco de Seguridad con Barboquejo & Protector Auditivo",
        category: "Seguridad Industrial",
        price: 28.50,
        comparePrice: 35.00,
        costPrice: 12.00,
        stock: 50,
        description: "Cumple norma ANSI Z89.1 Clase E. Arnés textil de 6 puntos de anclaje con ajuste cremallera, ranuras para visores y orejeras.",
        imageUrl: "https://images.unsplash.com/photo-1578873375969-d6521501784d?auto=format&fit=crop&w=800&q=80",
        tags: ["Certificado IRAM/ANSI"],
        isFeatured: false,
        optionsLabel: "Color del casco",
        options: ["Amarillo Obra", "Blanco Ingeniero", "Azul Eléctrico"]
      },
      {
        id: "hard-6",
        name: "Caja de Tornillos Autoperforantes 1000u",
        category: "Construcción & Fijaciones",
        price: 18.00,
        comparePrice: null,
        costPrice: 9.00,
        stock: 80,
        description: "Tornillos cabeza wafer punta broca zincados para placas de yeso y perfilería metálica Drywall/Steel Frame.",
        imageUrl: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80",
        tags: ["Pack Ahorro"],
        isFeatured: false,
        optionsLabel: "Medida",
        options: ["1/2 pulgada (13mm)", "3/4 pulgada (19mm)", "1 pulgada (25mm)"]
      }
    ]
  },

  objects: {
    id: "objects",
    badge: "Diseño & Objetos de Hogar",
    name: "Forma & Materia | Galería de Objetos",
    tagline: "Piezas utilitarias, cerámica escultórica y objetos atemporales para espacios contemporáneos.",
    heroBadge: "🏺 Edición Limitada Hecha a Mano",
    currency: "Bs ",
    accentColor: "emerald", // Tailwind emerald / sage
    phoneWhatsApp: "+5491133221100",
    address: "Estudio & Galería: Pasaje de los Artesanos 19",
    deliveryCost: 4.00,
    logoUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=180&h=180&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    categories: ["Cerámica & Barro", "Iluminación Escultórica", "Velas & Aromas", "Cristalería & Té", "Textiles Naturales"],
    orderTypes: ["Envío a Todo el País (Embalaje Seguro)", "Retiro en Galería"],
    products: [
      {
        id: "obj-1",
        name: "Jarrón Escultórico 'Duna' Cerámica Cruda",
        category: "Cerámica & Barro",
        price: 68.00,
        comparePrice: 80.00,
        costPrice: 24.00,
        stock: 9,
        description: "Modelado a mano en gres chamotado con textura arenosa exterior e interior esmaltado estanco para flores frescas.",
        imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80",
        tags: ["Pieza Única", "Hecho a mano"],
        isFeatured: true,
        optionsLabel: "Acabado",
        options: ["Tierra Natural", "Blanco Tiza", "Terracota Ahumada"]
      },
      {
        id: "obj-2",
        name: "Lámpara de Mesa Opalina 'Sombra' con Dimmer",
        category: "Iluminación Escultórica",
        price: 125.00,
        comparePrice: 145.00,
        costPrice: 50.00,
        stock: 6,
        description: "Base en madera maciza de nogal torneada y cúpula de vidrio soplado opalino que proyecta una luz cálida difusa de 2700K.",
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
        tags: ["Diseño Escandinavo"],
        isFeatured: true,
        optionsLabel: "Madera de base",
        options: ["Nogal Americano (Oscuro)", "Roble Natural (Claro)"]
      },
      {
        id: "obj-3",
        name: "Set 2 Tazas Cerámica Raku 'Nébula'",
        category: "Cerámica & Barro",
        price: 36.00,
        comparePrice: null,
        costPrice: 12.00,
        stock: 18,
        description: "Cocidas en horno tradicional con esmalte reactivo de cobalto que crea patrones únicos en cada pieza de 250ml.",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
        tags: ["Juego de 2"],
        isFeatured: true,
        optionsLabel: "Volumen",
        options: ["Set Espresso (120ml)", "Set Té/Café (250ml)"]
      },
      {
        id: "obj-4",
        name: "Vela Botánica en Cera de Soja 'Cedro & Higo'",
        category: "Velas & Aromas",
        price: 24.00,
        comparePrice: 28.00,
        costPrice: 7.00,
        stock: 28,
        description: "Vaso de cerámica reutilizable, mecha de madera que crepita al quemar, 60 horas de combustión limpia y aceites esenciales puros.",
        imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
        tags: ["Cera 100% Vegetal"],
        isFeatured: false,
        optionsLabel: "Aroma",
        options: ["Cedro & Higo Silvestre", "Ámbar & Vainilla de Madagascar", "Bergamota & Romero"]
      },
      {
        id: "obj-5",
        name: "Manta de Lino Puro Lavado (150x200cm)",
        category: "Textiles Naturales",
        price: 85.00,
        comparePrice: 99.00,
        costPrice: 35.00,
        stock: 11,
        description: "Tejida en lino europeo de fibra larga, suavizada a la piedra para un drapeado fluido y sensación fresca en verano y cálida en invierno.",
        imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
        tags: ["Textil Natural"],
        isFeatured: true,
        optionsLabel: "Tonalidad",
        options: ["Avena Natural", "Gris Niebla", "Verde Eucalipto"]
      },
      {
        id: "obj-6",
        name: "Tetera de Vidrio Borosilicato con Infusor",
        category: "Cristalería & Té",
        price: 32.00,
        comparePrice: null,
        costPrice: 12.00,
        stock: 22,
        description: "Capacidad de 800ml resistente al choque térmico, tapa en bambú natural con aro de silicona y pico vertedor anti-goteo.",
        imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
        tags: ["Accesorios de Té"],
        isFeatured: false,
        optionsLabel: "Capacidad",
        options: ["600ml (2 Tazas)", "800ml (4 Tazas) (+ Bs 25)"]
      }
    ]
  }
};

// Curated library of high-quality Unsplash image presets by business category for the Admin Image Picker
export const IMAGE_LIBRARY_PRESETS = [
  {
    category: "Gastronomía & Platos",
    images: [
      { url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80", label: "Carne a la parrilla con papas" },
      { url: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80", label: "Pasta / Risotto gourmet" },
      { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", label: "Hamburguesa artesanal brioche" },
      { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80", label: "Pizza rústica al horno de leña" },
      { url: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80", label: "Postre de chocolate y helado" },
      { url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80", label: "Cóctel artesanal" },
      { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80", label: "Café latte art" },
      { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", label: "Salón de restaurante cálido" }
    ]
  },
  {
    category: "Moda & Indumentaria",
    images: [
      { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", label: "Remera blanca boxy fit" },
      { url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", label: "Hoodie negro minimalista" },
      { url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80", label: "Campera bomber urbana" },
      { url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80", label: "Pantalón streetwear" },
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", label: "Zapatilla sneaker deportiva" },
      { url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80", label: "Gorra urbana de sarga" },
      { url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", label: "Bolso tote de tela" },
      { url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80", label: "Banner editorial moda" }
    ]
  },
  {
    category: "Ferretería & Materiales",
    images: [
      { url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80", label: "Taladro percutor a batería" },
      { url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80", label: "Sierra circular de mano" },
      { url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", label: "Juego de llaves y herramientas" },
      { url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80", label: "Pintura y brocha" },
      { url: "https://images.unsplash.com/photo-1578873375969-d6521501784d?auto=format&fit=crop&w=800&q=80", label: "Casco de seguridad industrial" },
      { url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80", label: "Tornillos y tuercas fijación" },
      { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80", label: "Taller industrial y maquinaria" }
    ]
  },
  {
    category: "Decoración & Objetos",
    images: [
      { url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80", label: "Jarrón de cerámica orgánica" },
      { url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80", label: "Lámpara minimalista moderna" },
      { url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80", label: "Taza de cerámica café" },
      { url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80", label: "Vela aromática de soja" },
      { url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80", label: "Manta y almohadones lino" },
      { url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80", label: "Tetera de cristal para infusión" },
      { url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80", label: "Ambiente cálido interior" }
    ]
  }
];

// Initial mock orders to simulate real-world store sales and history
export const INITIAL_ORDERS = [
  {
    id: "ord-101",
    code: "#ORD-9102",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    customerName: "Camila Fernández",
    customerPhone: "+54 9 11 5544-3322",
    customerAddress: "Calle Libertad 1045, Depto 4B",
    orderType: "Delivery a Domicilio",
    paymentMethod: "Efectivo al recibir",
    status: "completado",
    items: [
      { id: "rest-1", name: "Ojo de Bife Angus & Papas Trufadas", price: 24.50, quantity: 2, option: "A Punto" },
      { id: "rest-4", name: "Cóctel Ahumado 'Aura Negroni'", price: 10.50, quantity: 2, option: "Ahumado con Romero" }
    ],
    subtotal: 70.00,
    deliveryFee: 2.50,
    total: 72.50,
    notes: "Tocar timbre 4B por favor."
  },
  {
    id: "ord-102",
    code: "#ORD-9103",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
    customerName: "Lucas Benítez",
    customerPhone: "+54 9 11 6677-8899",
    customerAddress: "Mesa 6 (Terraza)",
    orderType: "Mesa / En Salón",
    paymentMethod: "Transferencia / QR",
    status: "preparando",
    items: [
      { id: "rest-2", name: "Risotto Funghi Porcini & Parmigiano", price: 18.00, quantity: 1, option: "Con reducción de trufa negra (+ Bs 20)" },
      { id: "rest-5", name: "Tarta Húmeda de Chocolate & Pistacho", price: 9.00, quantity: 1, option: "Con Helado de Pistacho" }
    ],
    subtotal: 30.00,
    deliveryFee: 0,
    total: 30.00,
    notes: "Sin pimienta en el risotto."
  },
  {
    id: "ord-103",
    code: "#ORD-9104",
    createdAt: new Date(Date.now() - 60000 * 15).toISOString(), // 15 mins ago
    customerName: "Sofía Martínez",
    customerPhone: "+54 9 11 2233-4455",
    customerAddress: "Av. Santa Fe 2890, 8A",
    orderType: "Delivery a Domicilio",
    paymentMethod: "QR Simple (Banca Móvil / Interoperable)",
    status: "pendiente",
    items: [
      { id: "rest-3", name: "Tabla de Quesos Artesanales & Jamón Serrano", price: 19.50, quantity: 1, option: "Para 2 personas" },
      { id: "rest-6", name: "Hamburguesa 'Dry Aged' en Pan Brioche", price: 16.50, quantity: 2, option: "Papas Rústicas" }
    ],
    subtotal: 52.50,
    deliveryFee: 2.50,
    total: 55.00,
    notes: "Dejar en conserjería."
  }
];

// Optional Modules / Feature flags (can be enabled or disabled by admin per client)
export const DEFAULT_FEATURES = {
  coupons: true,          // Habilitar cupones de descuento
  thermalReceipts: true,  // Habilitar impresión de ticket térmico / comanda (80mm)
  orderTracking: true,    // Habilitar seguimiento de pedidos en vivo para el cliente
  whatsappAiAgent: true,  // Habilitar Agente IA de WhatsApp vinculado al número de la tienda
};

// Initial mock coupons for testing the coupon engine
export const INITIAL_COUPONS = [
  {
    code: "BIENVENIDA10",
    discountType: "percent", // 'percent' | 'fixed' | 'free_shipping'
    value: 10, // 10%
    minPurchase: 0,
    maxUsesPerDevice: 1, // Límite de uso por dispositivo
    description: "10% de descuento en tu compra",
    active: true
  },
  {
    code: "PROMO5",
    discountType: "fixed",
    value: 5.00,
    minPurchase: 20.00,
    maxUsesPerDevice: 2,
    description: "Bs 5.00 de descuento en compras mayores a Bs 20",
    active: true
  },
  {
    code: "ENVIOGRATIS",
    discountType: "free_shipping",
    value: 0,
    minPurchase: 15.00,
    maxUsesPerDevice: 1,
    description: "Envío bonificado al 100% en compras mayores a Bs 15",
    active: true
  }
];

