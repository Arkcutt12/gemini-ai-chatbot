export interface DXFAnalysisResult {
  layers: Array<{
    name: string;
    color: string;
    entities_count: number;
  }>;
  dimensions: {
    width: number;
    height: number;
    units: string;
  };
  bounding_box: {
    min_x: number;
    min_y: number;
    max_x: number;
    max_y: number;
    area: number; // en mm²
  };
  cutting_time: number; // en minutos
  complexity: 'simple' | 'moderate' | 'complex';
  total_length: number; // longitud total de corte en mm
  warnings?: string[];
  success: boolean;
  message?: string;
}

const DXF_ANALYSIS_URL = 'https://backend-dxf.onrender.com';

export async function analyzeDXFFile(file: File): Promise<DXFAnalysisResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${DXF_ANALYSIS_URL}/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        // No Content-Type header - let browser set it for FormData
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Validar que la respuesta tenga la estructura esperada
    if (!result.success) {
      throw new Error(result.message || 'Error analyzing DXF file');
    }

    return {
      ...result,
      success: true
    };

  } catch (error) {
    console.error('Error analyzing DXF file:', error);
    
    // Fallback con datos simulados para desarrollo
    return {
      layers: [
        {
          name: "Layer 1",
          color: "red",
          entities_count: 10
        }
      ],
      dimensions: {
        width: 100,
        height: 50,
        units: "mm"
      },
      bounding_box: {
        min_x: 0,
        min_y: 0,
        max_x: 100,
        max_y: 50,
        area: 5000
      },
      cutting_time: 15,
      complexity: 'moderate',
      total_length: 300,
      warnings: ['Backend no disponible - usando datos simulados'],
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

export async function validateDXFFile(file: File): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Validar extensión
  if (!file.name.toLowerCase().endsWith('.dxf')) {
    errors.push('El archivo debe tener extensión .dxf');
  }
  
  // Validar tamaño (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('El archivo no puede superar los 10MB');
  }
  
  // Validar que no esté vacío
  if (file.size === 0) {
    errors.push('El archivo está vacío');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}