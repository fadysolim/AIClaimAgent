import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  claimNumber: text("claim_number").notNull().unique(),
  policyholder: text("policyholder").notNull(),
  policyNumber: text("policy_number").notNull(),
  vehicle: text("vehicle").notNull(),
  status: text("status").notNull().default("initiated"),
  agentName: text("agent_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const damageAssessments = pgTable("damage_assessments", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").references(() => claims.id).notNull(),
  confidence: integer("confidence").notNull(),
  damageItems: jsonb("damage_items").notNull(),
  recommendations: text("recommendations").array().notNull(),
  analysisComplete: boolean("analysis_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const costEstimations = pgTable("cost_estimations", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").references(() => claims.id).notNull(),
  bumperRepair: integer("bumper_repair").notNull(),
  paintwork: integer("paintwork").notNull(),
  headlight: integer("headlight").notNull(),
  miscellaneous: integer("miscellaneous").notNull(),
  total: integer("total").notNull(),
  lowEstimate: integer("low_estimate").notNull(),
  highEstimate: integer("high_estimate").notNull(),
  completionTime: text("completion_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const uploadedImages = pgTable("uploaded_images", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").references(() => claims.id).notNull(),
  filename: text("filename").notNull(),
  fileSize: text("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDamageAssessmentSchema = createInsertSchema(damageAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertCostEstimationSchema = createInsertSchema(costEstimations).omit({
  id: true,
  createdAt: true,
});

export const insertUploadedImageSchema = createInsertSchema(uploadedImages).omit({
  id: true,
  uploadedAt: true,
});

export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertDamageAssessment = z.infer<typeof insertDamageAssessmentSchema>;
export type DamageAssessment = typeof damageAssessments.$inferSelect;
export type InsertCostEstimation = z.infer<typeof insertCostEstimationSchema>;
export type CostEstimation = typeof costEstimations.$inferSelect;
export type InsertUploadedImage = z.infer<typeof insertUploadedImageSchema>;
export type UploadedImage = typeof uploadedImages.$inferSelect;
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
