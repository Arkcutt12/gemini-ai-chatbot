'use client';

import { Clock, Package, Ruler, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface QuoteResultProps {
  quote: {
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
  };
}

export function QuoteResult({ quote }: QuoteResultProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="size-5" />
          Presupuesto de Corte Láser
        </CardTitle>
        <Badge variant="outline" className="w-fit">
          ID: {quote.id.slice(0, 8)}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Especificaciones Técnicas */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Ruler className="size-4" />
            Especificaciones Técnicas
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Material:</span>
              <p className="font-medium">{quote.specifications.material}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Espesor:</span>
              <p className="font-medium">{quote.specifications.thickness}mm</p>
            </div>
            <div>
              <span className="text-muted-foreground">Longitud de corte:</span>
              <p className="font-medium">{quote.specifications.cutLength}mm</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tiempo estimado:</span>
              <p className="font-medium flex items-center gap-1">
                <Clock className="size-3" />
                {quote.specifications.machineTime} min
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Desglose de Costos */}
        <div className="space-y-3">
          <h4 className="font-semibold">Desglose de Costos</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Material:</span>
              <span>€{quote.materialCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Corte láser:</span>
              <span>€{quote.cuttingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Configuración:</span>
              <span>€{quote.setupCost.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total:</span>
              <span className="text-green-600">€{quote.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tiempo de Entrega */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-blue-600" />
            <span className="font-medium text-blue-900">Tiempo de entrega:</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {quote.deliveryTime}
          </Badge>
        </div>

        {/* Notas */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Los precios incluyen IVA</p>
          <p>• Válido por 30 días</p>
          <p>• Sujeto a disponibilidad de material</p>
        </div>
      </CardContent>
    </Card>
  );
}