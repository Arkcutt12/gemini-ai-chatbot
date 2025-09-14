'use client';

import { useState } from 'react';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  MapPin,
  Truck,
  Clock,
  Euro,
  Phone,
  Mail
} from "lucide-react";

import { WORKSHOPS, calculateDeliveryCost, type Workshop } from '@/lib/data/workshops';

interface DeliverySelectorProps {
  onSelect: (deliveryData: any) => void;
}

type DeliveryType = 'pickup' | 'shipping';

export function DeliverySelector({ onSelect }: DeliverySelectorProps) {
  const [selectedType, setSelectedType] = useState<DeliveryType>('pickup');
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState({
    calle: '',
    ciudad: '',
    codigo_postal: '',
    provincia: ''
  });
  const [shippingCost, setShippingCost] = useState<number>(0);

  const handlePostalCodeChange = (code: string) => {
    setShippingAddress(prev => ({ ...prev, codigo_postal: code }));
    if (code.length === 5) {
      const cost = calculateDeliveryCost(code);
      setShippingCost(cost);
    }
  };

  const handleSubmit = () => {
    if (selectedType === 'pickup') {
      if (!selectedWorkshop) return;
      
      const workshop = WORKSHOPS.find(w => w.id === selectedWorkshop);
      onSelect({
        tipo: 'recogida',
        taller: selectedWorkshop,
        workshop_info: workshop,
        cost: 0
      });
    } else {
      if (!shippingAddress.calle || !shippingAddress.ciudad || 
          !shippingAddress.codigo_postal || !shippingAddress.provincia) {
        return;
      }
      
      onSelect({
        tipo: 'envio',
        direccion: shippingAddress,
        cost: shippingCost
      });
    }
  };

  const isFormValid = selectedType === 'pickup' ? 
    selectedWorkshop !== '' :
    shippingAddress.calle && shippingAddress.ciudad && 
    shippingAddress.codigo_postal && shippingAddress.provincia;

  return (
    <div className="space-y-6">
      {/* Delivery Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${
            selectedType === 'pickup' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => setSelectedType('pickup')}
        >
          <CardContent className="p-6 text-center">
            <MapPin className={`mx-auto size-8 mb-3 ${
              selectedType === 'pickup' ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <h3 className="font-semibold mb-2">Recogida en taller</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="flex items-center justify-center gap-1">
                <Euro className="size-3" />
                Gratis
              </p>
              <p className="flex items-center justify-center gap-1">
                <Clock className="size-3" />
                2-3 días
              </p>
            </div>
            <Badge 
              variant={selectedType === 'pickup' ? 'default' : 'secondary'}
              className="mt-2"
            >
              Recomendado
            </Badge>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${
            selectedType === 'shipping' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => setSelectedType('shipping')}
        >
          <CardContent className="p-6 text-center">
            <Truck className={`mx-auto size-8 mb-3 ${
              selectedType === 'shipping' ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <h3 className="font-semibold mb-2">Envío a domicilio</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="flex items-center justify-center gap-1">
                <Euro className="size-3" />
                Desde €12.50
              </p>
              <p className="flex items-center justify-center gap-1">
                <Clock className="size-3" />
                4-6 días
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workshop Selection */}
      {selectedType === 'pickup' && (
        <div className="space-y-4">
          <h4 className="font-semibold">Selecciona un taller</h4>
          <div className="space-y-3">
            {WORKSHOPS.map((workshop) => (
              <Card 
                key={workshop.id}
                className={`cursor-pointer transition-colors ${
                  selectedWorkshop === workshop.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedWorkshop(workshop.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold">{workshop.name}</h5>
                        <Badge variant="outline">{workshop.city}</Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <MapPin className="size-3" />
                          {workshop.address}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="size-3" />
                          {workshop.contact.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="size-3" />
                          {workshop.contact.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm">
                      <Badge variant="secondary" className="mb-2">
                        {workshop.deliveryTime}
                      </Badge>
                      <div className="text-muted-foreground">
                        <p>L-V: {workshop.hours.weekdays}</p>
                        <p>Sáb: {workshop.hours.saturday}</p>
                        <p>Dom: {workshop.hours.sunday}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Address */}
      {selectedType === 'shipping' && (
        <div className="space-y-4">
          <h4 className="font-semibold">Dirección de envío</h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="calle">Dirección completa</Label>
              <Input
                id="calle"
                value={shippingAddress.calle}
                onChange={(e) => setShippingAddress(prev => ({ 
                  ...prev, 
                  calle: e.target.value 
                }))}
                placeholder="Calle, número, piso, puerta..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo_postal">Código postal</Label>
                <Input
                  id="codigo_postal"
                  value={shippingAddress.codigo_postal}
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  placeholder="28001"
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={shippingAddress.ciudad}
                  onChange={(e) => setShippingAddress(prev => ({ 
                    ...prev, 
                    ciudad: e.target.value 
                  }))}
                  placeholder="Madrid"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="provincia">Provincia</Label>
              <Input
                id="provincia"
                value={shippingAddress.provincia}
                onChange={(e) => setShippingAddress(prev => ({ 
                  ...prev, 
                  provincia: e.target.value 
                }))}
                placeholder="Madrid"
              />
            </div>
          </div>

          {/* Shipping Cost Display */}
          {shippingAddress.codigo_postal && shippingCost > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-green-800">Coste de envío calculado</h5>
                    <p className="text-sm text-green-700">Entrega en 4-6 días laborables</p>
                  </div>
                  <Badge className="bg-green-500">
                    €{shippingCost.toFixed(2)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSubmit}
          disabled={!isFormValid}
          size="lg"
        >
          {selectedType === 'pickup' ? 'Confirmar recogida' : 'Confirmar envío'}
        </Button>
      </div>
    </div>
  );
}