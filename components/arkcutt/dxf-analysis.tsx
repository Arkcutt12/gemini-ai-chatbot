'use client';

import { FileText, Ruler, Activity, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DXFAnalysisProps {
  analysis: {
    fileName: string;
    dimensions: {
      width: number;
      height: number;
      units: string;
    };
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedCutLength: number;
    materialUsage: number;
  };
}

export function DXFAnalysis({ analysis }: DXFAnalysisProps) {
  const complexityConfig = {
    simple: { color: 'bg-green-500', label: 'Simple', percentage: 30 },
    moderate: { color: 'bg-yellow-500', label: 'Moderada', percentage: 60 },
    complex: { color: 'bg-red-500', label: 'Compleja', percentage: 90 }
  };

  const config = complexityConfig[analysis.complexity];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          Análisis de Archivo DXF
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {analysis.fileName}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Dimensiones */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Ruler className="size-4" />
            Dimensiones
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Ancho</div>
              <div className="text-lg font-semibold">
                {analysis.dimensions.width}{analysis.dimensions.units}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Alto</div>
              <div className="text-lg font-semibold">
                {analysis.dimensions.height}{analysis.dimensions.units}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Área</div>
              <div className="text-lg font-semibold">
                {(analysis.dimensions.width * analysis.dimensions.height / 1000000).toFixed(3)}m²
              </div>
            </div>
          </div>
        </div>

        {/* Complejidad */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Activity className="size-4" />
            Complejidad del Corte
          </h4>
          <div className="flex items-center gap-4">
            <Badge className={`${config.color} text-white`}>
              {config.label}
            </Badge>
            <div className="flex-1">
              <Progress value={config.percentage} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground">
              {config.percentage}%
            </span>
          </div>
        </div>

        {/* Métricas de Corte */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Square className="size-4" />
            Métricas de Corte
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600">Longitud de corte</div>
              <div className="text-xl font-semibold text-blue-900">
                {analysis.estimatedCutLength}mm
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600">Material necesario</div>
              <div className="text-xl font-semibold text-green-900">
                {analysis.materialUsage.toFixed(3)}m²
              </div>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="text-green-800 font-semibold">✓ Archivo analizado correctamente</div>
            <div className="text-sm text-green-600 mt-1">
              Listo para generar presupuesto
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}