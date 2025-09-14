-- Crear extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS "User" (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(64) NOT NULL,
    password VARCHAR(64)
);

-- Tabla de chats
CREATE TABLE IF NOT EXISTS "Chat" (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    messages JSONB NOT NULL,
    "userId" UUID NOT NULL REFERENCES "User"(id)
);

-- Tabla de presupuestos
CREATE TABLE IF NOT EXISTS "Quote" (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    
    -- Información del cliente
    "customerName" VARCHAR(100) NOT NULL,
    "customerEmail" VARCHAR(100) NOT NULL,
    "customerPhone" VARCHAR(20) NOT NULL,
    
    -- Detalles técnicos
    "dxfFileName" VARCHAR(255),
    "dxfAnalysis" JSONB,
    material VARCHAR(50) NOT NULL,
    thickness VARCHAR(10) NOT NULL,
    color VARCHAR(30) NOT NULL,
    
    -- Precios y cálculos
    "materialCost" VARCHAR(20) NOT NULL,
    "cuttingCost" VARCHAR(20) NOT NULL,
    "setupCost" VARCHAR(20) NOT NULL,
    "deliveryCost" VARCHAR(20),
    "totalCost" VARCHAR(20) NOT NULL,
    
    -- Entrega
    "deliveryType" VARCHAR(20) NOT NULL,
    "deliveryLocation" VARCHAR(50),
    "deliveryAddress" JSONB,
    
    -- Validez y notas
    "validUntil" TIMESTAMP NOT NULL,
    notes VARCHAR(500),
    
    -- Referencia al usuario
    "userId" UUID REFERENCES "User"(id)
);

-- Tabla de archivos DXF
CREATE TABLE IF NOT EXISTS "DxfFile" (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    
    "fileName" VARCHAR(255) NOT NULL,
    "originalFileName" VARCHAR(255) NOT NULL,
    "fileSize" VARCHAR(20) NOT NULL,
    "mimeType" VARCHAR(50) NOT NULL,
    
    -- Análisis del archivo
    "analysisResult" JSONB,
    "analysisStatus" VARCHAR(20) NOT NULL DEFAULT 'pending',
    
    -- Storage
    "storageUrl" VARCHAR(500),
    
    -- Relaciones
    "quoteId" UUID REFERENCES "Quote"(id),
    "userId" UUID REFERENCES "User"(id)
);

-- Tabla de reservas (compatibilidad)
CREATE TABLE IF NOT EXISTS "Reservation" (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    details JSONB NOT NULL,
    "hasCompletedPayment" BOOLEAN NOT NULL DEFAULT FALSE,
    "userId" UUID NOT NULL REFERENCES "User"(id)
);