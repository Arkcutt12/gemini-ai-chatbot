'use client';

import {
  Upload,
  FileText,
  Settings,
  Truck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download
} from "lucide-react";
import { useState, useCallback } from 'react';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { quoteWorkflow, QuoteWorkflowResult } from '@/lib/workflows/quote-workflow';

import { DeliverySelector } from './DeliverySelector';
import { DXFUpload } from './DXFUpload';
import { QuoteResult } from './quote-result';

interface QuoteWizardProps {
  onComplete?: (result: QuoteWorkflowResult) => void;
}

type Step = 'upload' | 'material' | 'contact' | 'delivery' | 'result';

const MATERIALS = [
  { id: 'acero', name: 'Acero al carbono', thicknesses: ['1', '2', '3', '4', '5'] },
  { id: 'acero-inox', name: 'Acero inoxidable', thicknesses: ['1', '2', '3', '4', '5'] },
  { id: 'aluminio', name: 'Aluminio', thicknesses: ['1', '2', '3', '4', '5', '6'] },
  { id: 'latón', name: 'Latón', thicknesses: ['1', '2', '3'] },
  { id: 'cobre', name: 'Cobre', thicknesses: ['1', '2', '3'] },
  { id: 'acrilico', name: 'Acrílico', thicknesses: ['3', '5', '8', '10'] }
];

const COLORS = ['Natural', 'Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Amarillo'];

export function QuoteWizard({ onComplete }: QuoteWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State para cada paso
  const [dxfFile, setDxfFile] = useState<File | null>(null);
  const [dxfAnalysis, setDxfAnalysis] = useState<any>(null);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedThickness, setSelectedThickness] = useState('');
  const [selectedColor, setSelectedColor] = useState('Natural');
  const [contact, setContact] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [delivery, setDelivery] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<QuoteWorkflowResult | null>(null);

  const handleFileUploaded = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await quoteWorkflow.analyzeDXFOnly(file);
      
      if (result.success && result.dxfAnalysis) {
        setDxfFile(file);
        setDxfAnalysis(result.dxfAnalysis);
        setCurrentStep('material');
      } else {
        setError(result.message || 'Error analyzing DXF file');
      }
    } catch (err) {
      setError('Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleMaterialNext = () => {
    if (selectedMaterial && selectedThickness) {
      setCurrentStep('contact');
    }
  };

  const handleContactNext = () => {
    if (contact.nombre && contact.email && contact.telefono) {
      setCurrentStep('delivery');
    }
  };

  const handleDeliveryNext = (deliveryData: any) => {
    setDelivery(deliveryData);
    processCompleteQuote(deliveryData);
  };

  const processCompleteQuote = async (deliveryData: any) => {
    if (!dxfFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await quoteWorkflow.processCompleteQuote({
        dxfFile,
        contact,
        material: {
          material: MATERIALS.find(m => m.id === selectedMaterial)?.name || selectedMaterial,
          grosor: `${selectedThickness}mm`,
          color: selectedColor
        },
        delivery: deliveryData
      });
      
      setFinalResult(result);
      setCurrentStep('result');
      onComplete?.(result);
      
    } catch (err) {
      setError('Failed to generate quote');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepIcon = (step: Step) => {
    switch (step) {
      case 'upload': return <Upload className="size-4" />;
      case 'material': return <Settings className="size-4" />;
      case 'contact': return <FileText className="size-4" />;
      case 'delivery': return <Truck className="size-4" />;
      case 'result': return <CheckCircle className="size-4" />;
    }
  };

  const getStepStatus = (step: Step) => {
    const steps: Step[] = ['upload', 'material', 'contact', 'delivery', 'result'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {(['upload', 'material', 'contact', 'delivery', 'result'] as Step[]).map((step, index) => {
          const status = getStepStatus(step);
          return (
            <div key={step} className="flex items-center">
              <div className={`
                flex items-center justify-center size-10 rounded-full border-2 
                ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  status === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-400'}
              `}>
                {getStepIcon(step)}
              </div>
              {index < 4 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="size-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isProcessing && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="size-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Procesando solicitud...</p>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {!isProcessing && (
        <>
          {currentStep === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle>1. Subir archivo DXF</CardTitle>
              </CardHeader>
              <CardContent>
                <DXFUpload onFileUploaded={handleFileUploaded} />
              </CardContent>
            </Card>
          )}

          {currentStep === 'material' && dxfAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>2. Seleccionar material</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* DXF Analysis Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Análisis del archivo</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dimensiones:</span>
                      <p>{dxfAnalysis.dimensions.width} x {dxfAnalysis.dimensions.height} mm</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Área:</span>
                      <p>{(dxfAnalysis.bounding_box.area / 100).toFixed(2)} cm²</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Complejidad:</span>
                      <Badge variant={dxfAnalysis.complexity === 'simple' ? 'default' : 'secondary'}>
                        {dxfAnalysis.complexity}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Material Selection */}
                <div className="space-y-4">
                  <Label>Material</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {MATERIALS.map((material) => (
                      <Button
                        key={material.id}
                        variant={selectedMaterial === material.id ? "default" : "outline"}
                        onClick={() => {
                          setSelectedMaterial(material.id);
                          setSelectedThickness(''); // Reset thickness when material changes
                        }}
                        className="justify-start h-auto p-4"
                      >
                        <div>
                          <div className="font-medium">{material.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Espesores: {material.thicknesses.join(', ')}mm
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Thickness Selection */}
                {selectedMaterial && (
                  <div className="space-y-4">
                    <Label>Espesor (mm)</Label>
                    <div className="flex flex-wrap gap-2">
                      {MATERIALS.find(m => m.id === selectedMaterial)?.thicknesses.map((thickness) => (
                        <Button
                          key={thickness}
                          variant={selectedThickness === thickness ? "default" : "outline"}
                          onClick={() => setSelectedThickness(thickness)}
                          size="sm"
                        >
                          {thickness}mm
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {selectedMaterial && selectedThickness && (
                  <div className="space-y-4">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((color) => (
                        <Button
                          key={color}
                          variant={selectedColor === color ? "default" : "outline"}
                          onClick={() => setSelectedColor(color)}
                          size="sm"
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    onClick={handleMaterialNext}
                    disabled={!selectedMaterial || !selectedThickness}
                  >
                    Siguiente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'contact' && (
            <Card>
              <CardHeader>
                <CardTitle>3. Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre y apellidos</Label>
                  <Input
                    id="nombre"
                    value={contact.nombre}
                    onChange={(e) => setContact({...contact, nombre: e.target.value})}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({...contact, email: e.target.value})}
                    placeholder="juan@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={contact.telefono}
                    onChange={(e) => setContact({...contact, telefono: e.target.value})}
                    placeholder="+34 600 000 000"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleContactNext}
                    disabled={!contact.nombre || !contact.email || !contact.telefono}
                  >
                    Siguiente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'delivery' && (
            <Card>
              <CardHeader>
                <CardTitle>4. Método de entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliverySelector onSelect={handleDeliveryNext} />
              </CardContent>
            </Card>
          )}

          {currentStep === 'result' && finalResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="size-5 text-green-500" />
                    ¡Presupuesto generado!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {finalResult.quote && finalResult.quote.data && (
                    <QuoteResult quote={{
                      id: finalResult.quote.data.quote_id,
                      materialCost: finalResult.quote.data.breakdown.material_cost,
                      cuttingCost: finalResult.quote.data.breakdown.cutting_cost,
                      setupCost: finalResult.quote.data.breakdown.setup_cost,
                      totalCost: finalResult.quote.data.total_price,
                      deliveryTime: finalResult.quote.data.estimated_time,
                      specifications: {
                        material: MATERIALS.find(m => m.id === selectedMaterial)?.name || selectedMaterial,
                        thickness: parseInt(selectedThickness),
                        cutLength: dxfAnalysis?.total_length || 0,
                        machineTime: dxfAnalysis?.cutting_time || 0
                      }
                    }} />
                  )}
                  
                  <div className="mt-6 flex gap-3">
                    <Button className="flex-1">
                      Confirmar pedido
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="size-4" />
                      Descargar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}