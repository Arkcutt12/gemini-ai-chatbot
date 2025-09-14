import { convertToCoreMessages, Message, streamText, tool } from "ai";
import { z } from "zod";

import { chatGpt4oModel } from "@/ai";
import { quoteWorkflow } from "@/lib/workflows/quote-workflow";
import { getArkcuttKnowledge } from "@/ai/arkcutt-actions";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

function parseShapeDescription(description: string) {
  const lowerDesc = description.toLowerCase();
  
  // Detectar tipo de forma
  let shape = 'custom';
  if (lowerDesc.includes('rectang') || lowerDesc.includes('cuadrado')) {
    shape = 'rectangle';
  } else if (lowerDesc.includes('circ') || lowerDesc.includes('redond')) {
    shape = 'circle';
  } else if (lowerDesc.includes('oval') || lowerDesc.includes('elipse')) {
    shape = 'ellipse';
  }
  
  // Extraer dimensiones usando regex
  const dimensions: any = {};
  
  // Buscar patrones como "100x50", "100 x 50", "ancho 100", "alto 50", etc.
  const dimensionPatterns = [
    /(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i, // "100x50"
    /ancho\s*:?\s*(\d+(?:\.\d+)?)/i, // "ancho: 100"
    /alto\s*:?\s*(\d+(?:\.\d+)?)/i, // "alto: 50"
    /width\s*:?\s*(\d+(?:\.\d+)?)/i, // "width: 100"
    /height\s*:?\s*(\d+(?:\.\d+)?)/i, // "height: 50"
    /diámetro\s*:?\s*(\d+(?:\.\d+)?)/i, // "diámetro: 50"
    /diameter\s*:?\s*(\d+(?:\.\d+)?)/i, // "diameter: 50"
    /radio\s*:?\s*(\d+(?:\.\d+)?)/i, // "radio: 25"
    /radius\s*:?\s*(\d+(?:\.\d+)?)/i, // "radius: 25"
  ];
  
  // Aplicar patrones
  const xyMatch = description.match(dimensionPatterns[0]);
  if (xyMatch) {
    dimensions.width = parseFloat(xyMatch[1]);
    dimensions.height = parseFloat(xyMatch[2]);
  }
  
  const widthMatch = description.match(dimensionPatterns[2]) || description.match(dimensionPatterns[4]);
  if (widthMatch) dimensions.width = parseFloat(widthMatch[1]);
  
  const heightMatch = description.match(dimensionPatterns[3]) || description.match(dimensionPatterns[5]);
  if (heightMatch) dimensions.height = parseFloat(heightMatch[1]);
  
  const diameterMatch = description.match(dimensionPatterns[6]) || description.match(dimensionPatterns[7]);
  if (diameterMatch) {
    dimensions.diameter = parseFloat(diameterMatch[1]);
    dimensions.radius = dimensions.diameter / 2;
  }
  
  const radiusMatch = description.match(dimensionPatterns[8]) || description.match(dimensionPatterns[9]);
  if (radiusMatch) {
    dimensions.radius = parseFloat(radiusMatch[1]);
    dimensions.diameter = dimensions.radius * 2;
  }
  
  // Detectar características adicionales
  const features = [];
  if (lowerDesc.includes('agujero') || lowerDesc.includes('hole')) {
    features.push('hole');
  }
  if (lowerDesc.includes('ranura') || lowerDesc.includes('slot')) {
    features.push('slot');
  }
  if (lowerDesc.includes('redondeo') || lowerDesc.includes('fillet')) {
    features.push('fillet');
  }
  
  // Valores por defecto si no se detectan dimensiones
  if (Object.keys(dimensions).length === 0) {
    if (shape === 'circle') {
      dimensions.diameter = 50;
      dimensions.radius = 25;
    } else {
      dimensions.width = 100;
      dimensions.height = 50;
    }
  }
  
  return {
    shape,
    dimensions,
    features,
    originalDescription: description
  };
}

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: chatGpt4oModel,
    system: `
        Eres el Agente Arkcutt, especialista en servicios de corte láser y fabricación digital.
        
        MATERIALES DISPONIBLES (REALES):
        - DM (Fibra de Madera): 2.5-10mm | €4.80-€22.93/plancha
        - Contrachapado: 4-5mm | €18.13-€20.68/plancha  
        - Madera Balsa: 1-8mm | €3.69-€12.25/plancha
        - Metacrilato (Transparente/Blanco/Lila): 2-8mm | €30.33-€82.91/plancha
        - Cartón Gris: 2mm | €6.32/plancha
        
        HERRAMIENTAS DISPONIBLES:
        - generate_quote: Para iniciar presupuestación con wizard interactivo
        - arkcuttKnowledge: Para consultas sobre materiales, servicios, precios
        - create_dxf: Para generar archivos DXF desde descripciones
        
        ESPECIALIDADES:
        - Presupuestación automática con análisis DXF
        - Corte láser de precisión en maderas y metacrilatos
        - Generación de archivos DXF personalizados
        - Optimización de material y costes
        
        FLUJO PARA PRESUPUESTOS:
        1. Usuario menciona "presupuesto" → Usar generate_quote con step: 'start'
        2. Guiar through wizard: DXF upload → Material → Contacto → Entrega
        3. Conectar con backends reales para análisis y cálculo
        
        TALLERES: Barcelona, Madrid, Málaga (recogida GRATIS)
        
        PERSONALIDAD: Técnico, preciso, enfocado en soluciones prácticas
        
        Fecha actual: ${new Date().toLocaleDateString()}
        `,
    messages: coreMessages,
    tools: {
      generate_quote: tool({
        description: "Inicia el proceso de presupuestación de corte láser con wizard interactivo",
        parameters: z.object({
          step: z.enum(['start']).describe("Iniciar el proceso de presupuestación")
        }),
        execute: async ({ step }) => {
          if (step === 'start') {
            return {
              type: 'ui',
              component: 'QuoteWizard',
              message: '¡Perfecto! Te voy a ayudar a generar un presupuesto de corte láser. Empezamos subiendo tu archivo DXF para analizarlo.',
              data: {
                step: 'upload',
                instructions: [
                  'Sube tu archivo DXF (formato .dxf o .dwg)',
                  'El sistema analizará automáticamente las dimensiones y complejidad',
                  'Después podrás seleccionar el material y método de entrega',
                  'Obtendrás un presupuesto detallado al instante'
                ]
              }
            };
          }
          return { error: 'Invalid step' };
        },
      }),
      arkcuttKnowledge: tool({
        description: "Consultar base de conocimiento de Arkcutt (servicios, materiales, capacidades)",
        parameters: z.object({
          query: z.string().describe("Pregunta o consulta sobre Arkcutt"),
        }),
        execute: async ({ query }) => {
          const knowledge = await getArkcuttKnowledge(query);
          return { response: knowledge };
        },
      }),
      create_dxf: tool({
        description: "Genera archivos DXF desde especificaciones técnicas o descripción de formas",
        parameters: z.object({
          input_type: z.enum(['description']).describe("Tipo de entrada para generar DXF"),
          specifications: z.string().describe("Descripción detallada de la forma a crear (ej: 'rectángulo de 100x50mm con agujero de 10mm en el centro')"),
        }),
        execute: async ({ input_type, specifications }) => {
          if (input_type === 'description') {
            // Analizar la descripción y extraer parámetros
            const parsedSpecs = parseShapeDescription(specifications);
            return {
              type: 'dxf_generated',
              message: 'He generado un archivo DXF basado en tu descripcion: ' + specifications,
              data: {
                fileName: 'generated_' + Date.now() + '.dxf',
                specifications: parsedSpecs,
                preview: 'Forma generada: ' + parsedSpecs.shape + ' con dimensiones ' + (parsedSpecs.dimensions.width || parsedSpecs.dimensions.diameter) + 'mm',
                downloadUrl: '/api/dxf/download/' + Date.now(), // Placeholder
                instructions: [
                  'El archivo DXF ha sido generado segun tus especificaciones',
                  'Puedes descargarlo directamente o usarlo para obtener un presupuesto',
                  'Te gustaria generar un presupuesto con este archivo?'
                ]
              }
            };
          }
          return { error: 'Tipo de entrada no soportado' };
        },
      }),
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
