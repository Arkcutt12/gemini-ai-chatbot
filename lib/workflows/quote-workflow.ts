import { analyzeDXFFile, DXFAnalysisResult } from '../api/dxf-analysis';
import { calculateQuote, buildQuoteRequest, QuoteResult } from '../api/quote-calculator';
import { calculateDeliveryCost } from '../data/workshops';

export interface ContactInfo {
  nombre: string;
  email: string;
  telefono: string;
}

export interface MaterialInfo {
  material: string;
  grosor: string;
  color: string;
}

export interface DeliveryInfo {
  tipo: 'recogida' | 'envio';
  taller?: string;
  direccion?: {
    calle: string;
    ciudad: string;
    codigo_postal: string;
    provincia: string;
  };
}

export interface QuoteWorkflowData {
  dxfFile: File;
  contact: ContactInfo;
  material: MaterialInfo;
  delivery: DeliveryInfo;
}

export interface QuoteWorkflowResult {
  success: boolean;
  step: 'analysis' | 'calculation' | 'completed';
  dxfAnalysis?: DXFAnalysisResult;
  quote?: QuoteResult;
  error?: string;
  message?: string;
}

export class QuoteWorkflow {
  async processCompleteQuote(data: QuoteWorkflowData): Promise<QuoteWorkflowResult> {
    try {
      // PASO 1: Analizar DXF
      console.log('Step 1: Analyzing DXF file...');
      const dxfAnalysis = await analyzeDXFFile(data.dxfFile);
      
      if (!dxfAnalysis.success) {
        return {
          success: false,
          step: 'analysis',
          dxfAnalysis,
          error: 'Error analyzing DXF file',
          message: dxfAnalysis.message || 'Could not process DXF file'
        };
      }

      // PASO 2: Construir request para calculadora
      console.log('Step 2: Building quote request...');
      const quoteRequest = buildQuoteRequest(
        data.contact,
        data.material,
        dxfAnalysis,
        data.delivery
      );

      // PASO 3: Calcular presupuesto
      console.log('Step 3: Calculating quote...');
      const quote = await calculateQuote(quoteRequest);

      return {
        success: quote.success,
        step: 'completed',
        dxfAnalysis,
        quote,
        message: quote.success ? 'Quote generated successfully' : quote.message
      };

    } catch (error) {
      console.error('Error in quote workflow:', error);
      return {
        success: false,
        step: 'analysis',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to process quote request'
      };
    }
  }

  async analyzeDXFOnly(file: File): Promise<QuoteWorkflowResult> {
    try {
      const dxfAnalysis = await analyzeDXFFile(file);
      
      return {
        success: dxfAnalysis.success,
        step: 'analysis',
        dxfAnalysis,
        message: dxfAnalysis.success ? 
          'DXF file analyzed successfully' : 
          dxfAnalysis.message || 'Failed to analyze DXF file'
      };
    } catch (error) {
      return {
        success: false,
        step: 'analysis',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze DXF file'
      };
    }
  }

  personalizeQuote(quote: QuoteResult, contact: ContactInfo): QuoteResult {
    if (!quote.success || !quote.data) return quote;

    // Personalizar el mensaje basado en el contacto y datos
    const personalizedMessage = this.generatePersonalizedMessage(quote, contact);

    return {
      ...quote,
      data: {
        ...quote.data,
        personalized_message: personalizedMessage
      }
    };
  }

  private generatePersonalizedMessage(quote: QuoteResult, contact: ContactInfo): string {
    if (!quote.data) return '';

    const { breakdown, estimated_time } = quote.data;
    const savings = this.calculatePotentialSavings(breakdown);

    return `Hola ${contact.nombre.split(' ')[0]},

Tu presupuesto personalizado está listo. Con un tiempo estimado de ${estimated_time}, 
ofrecemos una solución completa de corte láser por €${quote.data.total_price}.

${savings ? `💡 Consejo: ${savings}` : ''}

El presupuesto es válido por 30 días. ¿Te gustaría proceder con el pedido?`;
  }

  private calculatePotentialSavings(breakdown: any): string | null {
    // Lógica para sugerir optimizaciones
    if (breakdown.material_cost > 50) {
      return 'Considera materiales alternativos para reducir costos hasta un 20%.';
    }
    
    if (breakdown.cutting_cost > 30) {
      return 'Optimizando el diseño DXF podrías reducir el tiempo de corte.';
    }
    
    return null;
  }
}

// Singleton instance
export const quoteWorkflow = new QuoteWorkflow();