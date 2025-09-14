export interface Workshop {
  id: string;
  name: string;
  city: string;
  address: string;
  deliveryTime: string;
  cost: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contact: {
    phone: string;
    email: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

export const WORKSHOPS: Workshop[] = [
  {
    id: 'bcn',
    name: 'Taller Barcelona',
    city: 'Barcelona',
    address: 'Carrer de la Indústria, 123, 08025 Barcelona',
    deliveryTime: '2-3 días laborables',
    cost: 0,
    coordinates: {
      lat: 41.3851,
      lng: 2.1734
    },
    contact: {
      phone: '+34 934 567 890',
      email: 'barcelona@arkcutt.com'
    },
    hours: {
      weekdays: '9:00 - 18:00',
      saturday: '9:00 - 14:00',
      sunday: 'Cerrado'
    }
  },
  {
    id: 'mad',
    name: 'Taller Madrid',
    city: 'Madrid',
    address: 'Calle de la Manufactura, 456, 28045 Madrid',
    deliveryTime: '2-3 días laborables',
    cost: 0,
    coordinates: {
      lat: 40.4168,
      lng: -3.7038
    },
    contact: {
      phone: '+34 915 678 901',
      email: 'madrid@arkcutt.com'
    },
    hours: {
      weekdays: '8:30 - 18:30',
      saturday: '9:00 - 14:00',
      sunday: 'Cerrado'
    }
  },
  {
    id: 'mlg',
    name: 'Taller Málaga',
    city: 'Málaga',
    address: 'Polígono Industrial San Luis, Nave 12, 29006 Málaga',
    deliveryTime: '2-3 días laborables',
    cost: 0,
    coordinates: {
      lat: 36.7213,
      lng: -4.4214
    },
    contact: {
      phone: '+34 952 345 678',
      email: 'malaga@arkcutt.com'
    },
    hours: {
      weekdays: '8:00 - 17:00',
      saturday: '9:00 - 13:00',
      sunday: 'Cerrado'
    }
  }
];

export function getWorkshopById(id: string): Workshop | undefined {
  return WORKSHOPS.find(workshop => workshop.id === id);
}

export function getWorkshopsByCity(city: string): Workshop[] {
  return WORKSHOPS.filter(workshop => 
    workshop.city.toLowerCase().includes(city.toLowerCase())
  );
}

export const DELIVERY_COSTS = {
  'peninsula': 12.50,
  'baleares': 25.00,
  'canarias': 35.00,
  'ceuta-melilla': 30.00
} as const;

export function calculateDeliveryCost(postalCode: string): number {
  // Simplificado - en producción se usaría un API de geolocalización
  const code = parseInt(postalCode);
  
  if (code >= 7000 && code <= 7999) return DELIVERY_COSTS.baleares; // Baleares
  if (code >= 35000 && code <= 35999) return DELIVERY_COSTS.canarias; // Las Palmas
  if (code >= 38000 && code <= 38999) return DELIVERY_COSTS.canarias; // Tenerife
  if (code >= 51000 && code <= 52999) return DELIVERY_COSTS['ceuta-melilla']; // Ceuta/Melilla
  
  return DELIVERY_COSTS.peninsula; // Península
}