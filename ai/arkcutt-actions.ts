import { generateUUID } from "@/lib/utils";

// Tipos para Arkcutt
export interface DXFAnalysis {
  fileName: string;
  dimensions: {
    width: number;
    height: number;
    units: string;
  };
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedCutLength: number;
  materialUsage: number;
}

export interface QuoteRequest {
  material: string;
  thickness: number;
  quantity: number;
  dxfAnalysis: DXFAnalysis;
  urgency: 'standard' | 'express' | 'urgent';
}

export interface QuoteResult {
  id: string;
  materialCost: number;
  cuttingCost: number;
  setupCost: number;
  totalCost: number;
  deliveryTime: string;
  specifications: {
    material: string;
    thickness: number;
    cutLength: number;
    machineTime: number;
  };
}

// Placeholder functions - estas se conectarán con el backend real más tarde
export async function analyzeDXFFile(fileData: any): Promise<DXFAnalysis> {
  // Simulación de análisis DXF
  return {
    fileName: fileData.fileName || "archivo.dxf",
    dimensions: {
      width: 150,
      height: 100,
      units: "mm"
    },
    complexity: 'moderate',
    estimatedCutLength: 450,
    materialUsage: 0.015 // m²
  };
}

export async function generateQuote(request: QuoteRequest): Promise<QuoteResult> {
  // Simulación de cálculo de presupuesto
  const baseCostPerMeter = 2.5; // €/metro
  const materialCostPerM2 = getMaterialCost(request.material, request.thickness);
  const urgencyMultiplier = getUrgencyMultiplier(request.urgency);
  
  const materialCost = materialCostPerM2 * request.dxfAnalysis.materialUsage * request.quantity;
  const cuttingCost = baseCostPerMeter * request.dxfAnalysis.estimatedCutLength * request.quantity * urgencyMultiplier;
  const setupCost = 15; // Coste fijo de configuración
  
  return {
    id: generateUUID(),
    materialCost: Math.round(materialCost * 100) / 100,
    cuttingCost: Math.round(cuttingCost * 100) / 100,
    setupCost,
    totalCost: Math.round((materialCost + cuttingCost + setupCost) * 100) / 100,
    deliveryTime: getDeliveryTime(request.urgency),
    specifications: {
      material: request.material,
      thickness: request.thickness,
      cutLength: request.dxfAnalysis.estimatedCutLength,
      machineTime: Math.ceil(request.dxfAnalysis.estimatedCutLength / 100 * request.quantity) // minutos estimados
    }
  };
}

export async function getArkcuttKnowledge(query: string): Promise<string> {
  // Base de conocimiento completa de Arkcutt con materiales REALES disponibles
  const knowledge = {
    materiales: {
      content: `**MATERIALES DISPONIBLES EN ARKCUTT:**

🌳 **DM (Fibra de Madera)**:
  • 2.5mm - 60x100cm - Madera Natural - €4.80/plancha
  • 3mm - 60x100cm - Madera Natural - €6.00/plancha
  • 4mm - 60x100cm - Madera Natural - €11.66/plancha
  • 5mm - 60x100cm - Madera Natural - €13.48/plancha
  • 7mm - 60x100cm - Madera Natural - €15.88/plancha
  • 10mm - 60x100cm - Madera Natural - €22.93/plancha

🪵 **CONTRACHAPADO**:
  • 4mm - 60x100cm - Madera Clara - €18.13/plancha
  • 5mm - 60x100cm - Madera Clara - €20.68/plancha

🌿 **MADERA BALSA**:
  • 1mm - 10x100cm - Madera Clara - €3.69/plancha
  • 2mm - 10x100cm - Madera Clara - €5.00/plancha
  • 3mm - 10x100cm - Madera Clara - €4.85/plancha
  • 4mm - 10x100cm - Madera Clara - €7.40/plancha
  • 8mm - 10x100cm - Madera Clara - €12.25/plancha

✨ **METACRILATO**:
  **Transparente**:
  • 2mm - 60x100cm - €30.33/plancha
  • 3mm - 60x100cm - €38.07/plancha
  • 4mm - 60x100cm - €47.53/plancha
  • 5mm - 60x100cm - €58.80/plancha
  • 6mm - 60x100cm - €69.63/plancha
  • 8mm - 60x100cm - €82.91/plancha

  **Blanco**:
  • 2mm - 60x100cm - €32.39/plancha
  • 3mm - 60x100cm - €41.60/plancha
  • 4mm - 60x100cm - €53.46/plancha
  • 5mm - 60x100cm - €65.37/plancha
  • 6mm - 60x100cm - €76.10/plancha

  **Lila**:
  • 3mm - 60x100cm - €41.60/plancha

📦 **CARTÓN GRIS**:
  • 2mm - 75x105cm - Gris - €6.32/plancha

*Todos los precios incluyen IVA. Stock sujeto a disponibilidad.*`,
      keywords: ['material', 'dm', 'contrachapado', 'balsa', 'metacrilato', 'carton', 'grosor', 'espesor', 'precio', 'plancha', 'disponible']
    },

    servicios: {
      content: `**SERVICIOS ARKCUTT:**

🔥 **Corte láser de precisión**:
  • Corte de todas las formas y geometrías
  • Optimización automática de trayectorias
  • Acabado de alta calidad sin rebabas
  • Compatible con todos nuestros materiales

📐 **Análisis automático de DXF**:
  • Cálculo de longitudes de corte
  • Optimización de material
  • Detección de problemas en archivos
  • Presupuestación instantánea

🎯 **Especialidades**:
  • Prototipos únicos
  • Pequeñas series personalizadas  
  • Piezas de alta precisión
  • Proyectos de makers y diseñadores

📦 **Modalidades de servicio**:
  • Presupuesto online instantáneo
  • Subida de archivos DXF
  • Recogida en talleres (Barcelona, Madrid, Málaga)
  • Envío a domicilio en toda España`,
      keywords: ['servicio', 'corte', 'laser', 'que hace', 'como funciona', 'especialidad', 'prototipo']
    },

    precios: {
      content: `**ESTRUCTURA DE PRECIOS:**

💰 **Cálculo automático**:
  • **Material**: Según tabla de precios por plancha
  • **Corte**: Calculado por metros lineales según velocidad
  • **Optimización**: Aprovechamiento automático de material
  • **Todo incluido**: Sin sorpresas ni costes ocultos

⚡ **Factores que influyen**:
  • Longitud total de corte
  • Tipo y grosor de material
  • Complejidad de las formas
  • Aprovechamiento del material

🎯 **Ventajas**:
  • Presupuesto instantáneo online
  • Sin mínimos de pedido
  • Precios transparentes
  • Material incluido en precio final

📱 **Cómo obtener precio**:
  1. Sube tu archivo DXF
  2. Selecciona material y grosor
  3. Recibe presupuesto al instante
  4. Elige recogida o envío`,
      keywords: ['precio', 'coste', 'cuesta', 'tarifa', 'presupuesto', 'calculadora', 'cuanto']
    },

    talleres: {
      content: `**NUESTRAS UBICACIONES:**

📍 **Taller Barcelona**:
  • Disponible para recogida gratuita
  • Contacta para coordinar recogida

📍 **Taller Madrid**:
  • Disponible para recogida gratuita
  • Contacta para coordinar recogida

📍 **Taller Málaga**:
  • Disponible para recogida gratuita
  • Contacta para coordinar recogida

🚚 **Recogida GRATIS**:
  • Sin coste adicional
  • Coordina tu recogida al finalizar pedido
  • Horarios flexibles

📦 **Envío a domicilio**:
  • Alternativa si no puedes recoger
  • Coste calculado según destino
  • Empaquetado profesional incluido`,
      keywords: ['taller', 'direccion', 'donde', 'barcelona', 'madrid', 'malaga', 'recogida', 'ubicacion', 'recoger']
    },

    presupuestacion: {
      content: `**CÓMO OBTENER TU PRESUPUESTO:**

🔄 **Proceso automatizado**:
  1. **Sube tu archivo DXF** - Sistema lo analiza automáticamente
  2. **Selecciona material** - Elige de nuestro catálogo disponible
  3. **Elige entrega** - Recogida gratis o envío a domicilio
  4. **Datos de contacto** - Para coordinar la entrega
  5. **Presupuesto instantáneo** - Precio final sin sorpresas

⚡ **Ventajas del sistema**:
  • Análisis automático de archivos DXF
  • Cálculo preciso de material necesario
  • Optimización automática de cortes
  • Sin esperas ni llamadas telefónicas

🎯 **Información incluida**:
  • Longitud total de corte
  • Material optimizado necesario
  • Precio desglosado completo
  • Tiempo estimado de entrega

📱 **¡Pruébalo ahora!**:
  Simplemente dime "quiero un presupuesto" y te guío paso a paso.`,
      keywords: ['presupuesto', 'cotizacion', 'precio', 'como', 'proceso', 'quiero presupuesto', 'calcular']
    }
  };

  // Búsqueda inteligente por palabras clave
  const lowerQuery = query.toLowerCase();

  // Buscar la categoría más relevante
  for (const [category, data] of Object.entries(knowledge)) {
    if (data.keywords.some(keyword => lowerQuery.includes(keyword))) {
      return data.content;
    }
  }

  // Respuesta general si no encuentra categoría específica
  return `**¡Hola! Soy tu especialista en corte láser Arkcutt** 🔥

Puedo ayudarte con información detallada sobre:

🔄 **Presupuestos** - Sube tu DXF y obtén precio al instante
📋 **Materiales** - DM, Contrachapado, Balsa, Metacrilato, Cartón
⚙️ **Servicios** - Corte láser de precisión para todas las formas
💰 **Precios** - Estructura transparente de costes
📍 **Talleres** - Barcelona, Madrid y Málaga (recogida gratis)

**¿Quieres un presupuesto?** Simplemente dime "quiero un presupuesto" y te guío paso a paso.

¿En qué específicamente te puedo ayudar?`;
}

export async function generateDXFFromSpecs(specifications: {
  shape: string;
  dimensions: Record<string, number>;
  features?: string[];
}): Promise<{ fileName: string; content: string; preview: string }> {
  // Simulación de generación DXF - se reemplazará con generador real
  const fileName = `generated_${Date.now()}.dxf`;
  
  // DXF simplificado para demostración
  const dxfContent = `
0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
0
10
0.0
20
0.0
11
${specifications.dimensions.width || 100}
21
0.0
0
LINE
8
0
10
${specifications.dimensions.width || 100}
20
0.0
11
${specifications.dimensions.width || 100}
21
${specifications.dimensions.height || 50}
0
LINE
8
0
10
${specifications.dimensions.width || 100}
20
${specifications.dimensions.height || 50}
11
0.0
21
${specifications.dimensions.height || 50}
0
LINE
8
0
10
0.0
20
${specifications.dimensions.height || 50}
11
0.0
21
0.0
0
ENDSEC
0
EOF`;
  
  return {
    fileName,
    content: dxfContent.trim(),
    preview: `Generado: ${specifications.shape} de ${specifications.dimensions.width}x${specifications.dimensions.height}mm`
  };
}

// Funciones auxiliares
function getMaterialCost(material: string, thickness: number): number {
  const costs: Record<string, number> = {
    'acero': 8.5,
    'acero inoxidable': 12.0,
    'aluminio': 15.0,
    'latón': 18.0,
    'acrílico': 25.0,
    'mdf': 5.0
  };
  
  const baseCost = costs[material.toLowerCase()] || 10.0;
  const thicknessMultiplier = 1 + (thickness - 1) * 0.1;
  
  return baseCost * thicknessMultiplier;
}

function getUrgencyMultiplier(urgency: string): number {
  switch (urgency) {
    case 'urgent': return 2.0;
    case 'express': return 1.5;
    default: return 1.0;
  }
}

function getDeliveryTime(urgency: string): string {
  switch (urgency) {
    case 'urgent': return '24-48 horas';
    case 'express': return '2-3 días laborables';
    default: return '5-7 días laborables';
  }
}