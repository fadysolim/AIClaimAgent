import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDamageAssessmentSchema, insertCostEstimationSchema, insertUploadedImageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get claim by ID
  app.get("/api/claims/:id", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const claim = await storage.getClaim(claimId);
      
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      res.json(claim);
    } catch (error) {
      res.status(500).json({ message: "Failed to get claim" });
    }
  });

  // Get uploaded images for a claim
  app.get("/api/claims/:id/images", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const images = await storage.getUploadedImages(claimId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to get images" });
    }
  });

  // Upload image for a claim
  app.post("/api/claims/:id/images", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const validatedData = insertUploadedImageSchema.parse({
        claimId,
        ...req.body
      });
      
      const image = await storage.createUploadedImage(validatedData);
      res.json(image);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload image" });
    }
  });

  // Delete uploaded image
  app.delete("/api/images/:id", async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const deleted = await storage.deleteUploadedImage(imageId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Analyze damage with AI (simulated)
  app.post("/api/claims/:id/analyze", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create simulated AI damage assessment
      const damageItems = [
        {
          type: "Front Bumper Dent",
          severity: "Moderate",
          location: "Left side",
          confidence: 0.92
        },
        {
          type: "Paint Scratches", 
          severity: "Minor",
          location: "Multiple locations",
          confidence: 0.88
        },
        {
          type: "Headlight Damage",
          severity: "Moderate", 
          location: "Left headlight",
          confidence: 0.95
        }
      ];

      const recommendations = [
        "Recommend professional body shop assessment",
        "Consider OEM parts for headlight replacement", 
        "Paint matching required for optimal results"
      ];

      const validatedAssessment = insertDamageAssessmentSchema.parse({
        claimId,
        confidence: 94,
        damageItems,
        recommendations,
        analysisComplete: true
      });

      const assessment = await storage.createDamageAssessment(validatedAssessment);

      // Create cost estimation
      const validatedEstimation = insertCostEstimationSchema.parse({
        claimId,
        bumperRepair: 485,
        paintwork: 320,
        headlight: 275,
        miscellaneous: 95,
        total: 1175,
        lowEstimate: 1050,
        highEstimate: 1300,
        completionTime: "3-5 business days"
      });

      const estimation = await storage.createCostEstimation(validatedEstimation);

      res.json({ assessment, estimation });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze damage" });
    }
  });

  // Get damage assessment for a claim
  app.get("/api/claims/:id/assessment", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const assessment = await storage.getDamageAssessment(claimId);
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Failed to get assessment" });
    }
  });

  // Get cost estimation for a claim
  app.get("/api/claims/:id/estimation", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const estimation = await storage.getCostEstimation(claimId);
      res.json(estimation);
    } catch (error) {
      res.status(500).json({ message: "Failed to get estimation" });
    }
  });

  // Update claim status
  app.patch("/api/claims/:id", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const updatedClaim = await storage.updateClaim(claimId, req.body);
      
      if (!updatedClaim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      res.json(updatedClaim);
    } catch (error) {
      res.status(500).json({ message: "Failed to update claim" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
