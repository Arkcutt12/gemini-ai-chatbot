import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

// Tabla para presupuestos de Arkcutt
export const quote = pgTable("Quote", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"), // pending, confirmed, completed, cancelled
  
  // Información del cliente
  customerName: varchar("customerName", { length: 100 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 100 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  
  // Detalles técnicos
  dxfFileName: varchar("dxfFileName", { length: 255 }),
  dxfAnalysis: json("dxfAnalysis"), // Resultado del análisis DXF
  material: varchar("material", { length: 50 }).notNull(),
  thickness: varchar("thickness", { length: 10 }).notNull(),
  color: varchar("color", { length: 30 }).notNull(),
  
  // Precios y cálculos
  materialCost: varchar("materialCost", { length: 20 }).notNull(),
  cuttingCost: varchar("cuttingCost", { length: 20 }).notNull(),
  setupCost: varchar("setupCost", { length: 20 }).notNull(),
  deliveryCost: varchar("deliveryCost", { length: 20 }),
  totalCost: varchar("totalCost", { length: 20 }).notNull(),
  
  // Entrega
  deliveryType: varchar("deliveryType", { length: 20 }).notNull(), // pickup, shipping
  deliveryLocation: varchar("deliveryLocation", { length: 50 }), // taller o dirección
  deliveryAddress: json("deliveryAddress"), // para envíos
  
  // Validez y notas
  validUntil: timestamp("validUntil").notNull(),
  notes: varchar("notes", { length: 500 }),
  
  // Referencia al usuario (opcional, para usuarios registrados)
  userId: uuid("userId").references(() => user.id),
});

export type Quote = InferSelectModel<typeof quote>;

// Tabla para archivos DXF subidos
export const dxfFile = pgTable("DxfFile", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  
  fileName: varchar("fileName", { length: 255 }).notNull(),
  originalFileName: varchar("originalFileName", { length: 255 }).notNull(),
  fileSize: varchar("fileSize", { length: 20 }).notNull(),
  mimeType: varchar("mimeType", { length: 50 }).notNull(),
  
  // Análisis del archivo
  analysisResult: json("analysisResult"),
  analysisStatus: varchar("analysisStatus", { length: 20 }).notNull().default("pending"), // pending, completed, failed
  
  // Storage
  storageUrl: varchar("storageUrl", { length: 500 }),
  
  // Relaciones
  quoteId: uuid("quoteId").references(() => quote.id),
  userId: uuid("userId").references(() => user.id),
});

export type DxfFile = InferSelectModel<typeof dxfFile>;

// Mantener reservation para compatibilidad con el template original
export const reservation = pgTable("Reservation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  details: json("details").notNull(),
  hasCompletedPayment: boolean("hasCompletedPayment").notNull().default(false),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Reservation = InferSelectModel<typeof reservation>;
