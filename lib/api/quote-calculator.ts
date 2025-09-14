import { DXFAnalysisResult } from './dxf-analysis';

export interface QuoteRequest {
  Cliente: {
    "Nombre y Apellidos": string;
    "Mail": string;
    "Número de Teléfono": string;
  };
  Pedido: {
    "Material seleccionado": string;
    "Area material": string;
    "¿Quién proporciona el material?": {
      "Material seleccionado": string;
      "Grosor": string;
      "Color": string;
    };
    "Capas": Array<{
      name: string;
      color: string;
      entities_count: number;
    }>;
  };
  Entrega?: {
    tipo: 'recogida' | 'envio';
    taller?: string;
    direccion?: {
      calle: string;
      ciudad: string;
      codigo_postal: string;
      provincia: string;
    };
  };
}

export interface QuoteResult {
  success: boolean;
  data?: {
    total_price: number;
    breakdown: {
      material_cost: number;
      cutting_cost: number;
      setup_cost: number;
      delivery_cost?: number;
    };
    estimated_time: string;
    delivery_info: {
      type: 'pickup' | 'delivery';
      location?: string;
      address?: string;
    };
    quote_id: string;
    valid_until: string;
    personalized_message?: string;
  };
  error?: string;
  message?: string;
}

const QUOTE_CALCULATOR_URL = 'https://calculadora-presupuestos-laser.onrender.com';

export async function calculateQuote(request: QuoteRequest): Promise<QuoteResult> {
  try {
    console.log('Sending quote request:', JSON.stringify(request, null, 2));

    const response = await fetch(`${QUOTE_CALCULATOR_URL}/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error calculating quote');
    }

    return {
      success: true,
      data: {
        ...result.data,
        quote_id: result.data.quote_id || `Q-${Date.now()}`,
        valid_until: result.data.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

  } catch (error) {
    console.error('Error calculating quote:', error);
    
    // Fallback con cálculo simulado para desarrollo
    const simulatedQuote = generateSimulatedQuote(request);
    
    return {
      success: false,
      data: simulatedQuote,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Backend no disponible - usando cálculo simulado'
    };
  }
}

function generateSimulatedQuote(request: QuoteRequest) {
  // Extraer área del material (parseando el string "X mm²")
  const areaMatch = request.Pedido["Area material"].match(/(\d+(?:\.\d+)?)/);
  const area = areaMatch ? parseFloat(areaMatch[1]) : 5000; // fallback 5000 mm²
  
  // Cálculos básicos simulados
  const materialCost = area * 0.012; // €0.012 por mm²
  const setupCost = 15;
  const cuttingCost = area * 0.008; // €0.008 por mm² de corte
  let deliveryCost = 0;
  
  if (request.Entrega?.tipo === 'envio') {
    deliveryCost = 12.50; // Envío estándar
  }
  
  const totalPrice = materialCost + setupCost + cuttingCost + deliveryCost;
  
  return {
    total_price: Math.round(totalPrice * 100) / 100,
    breakdown: {
      material_cost: Math.round(materialCost * 100) / 100,
      cutting_cost: Math.round(cuttingCost * 100) / 100,
      setup_cost: setupCost,
      delivery_cost: deliveryCost > 0 ? deliveryCost : undefined
    },
    estimated_time: '3-5 días laborables',
    delivery_info: {
      type: request.Entrega?.tipo === 'envio' ? 'delivery' as const : 'pickup' as const,
      location: request.Entrega?.taller || undefined,
      address: request.Entrega?.direccion ? 
        `${request.Entrega.direccion.calle}, ${request.Entrega.direccion.ciudad}` : 
        undefined
    },
    quote_id: `SIM-${Date.now()}`,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}

export function buildQuoteRequest(
  contact: { nombre: string; email: string; telefono: string },
  material: { material: string; grosor: string; color: string },
  dxfAnalysis: DXFAnalysisResult,
  delivery?: {
    tipo: 'recogida' | 'envio';
    taller?: string;
    direccion?: {
      calle: string;
      ciudad: string;
      codigo_postal: string;
      provincia: string;
    };
  }
): QuoteRequest {
  return {
    Cliente: {
      "Nombre y Apellidos": contact.nombre,
      "Mail": contact.email,
      "Número de Teléfono": contact.telefono
    },
    Pedido: {
      "Material seleccionado": material.material,
      "Area material": `${dxfAnalysis.bounding_box.area} mm²`,
      "¿Quién proporciona el material?": {
        "Material seleccionado": material.material,
        "Grosor": material.grosor,
        "Color": material.color
      },
      "Capas": dxfAnalysis.layers
    },
    ...(delivery && { Entrega: delivery })
  };
}