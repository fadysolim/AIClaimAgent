import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDamageAssessmentSchema, insertCostEstimationSchema, insertUploadedImageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all claims
  app.get("/api/claims", async (req, res) => {
    try {
      // For demo purposes, return sample claims
      const sampleClaims = [
        {
          id: 1,
          claimNumber: "CLM-2024-001537",
          policyholder: "Michael Chen",
          policyNumber: "POL-789456123",
          vehicle: "2021 Honda Accord",
          status: "in_progress",
          agentName: "Sarah Johnson",
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-20"),
        },
        {
          id: 2,
          claimNumber: "CLM-2024-001523",
          policyholder: "Emma Rodriguez",
          policyNumber: "POL-654321987",
          vehicle: "2020 Toyota Camry",
          status: "approved",
          agentName: "Sarah Johnson",
          createdAt: new Date("2024-01-12"),
          updatedAt: new Date("2024-01-18"),
        },
        {
          id: 3,
          claimNumber: "CLM-2024-001498",
          policyholder: "David Kim",
          policyNumber: "POL-111222333",
          vehicle: "2019 BMW 320i",
          status: "reviewed",
          agentName: "Sarah Johnson",
          createdAt: new Date("2024-01-08"),
          updatedAt: new Date("2024-01-15"),
        }
      ];
      res.json(sampleClaims);
    } catch (error) {
      res.status(500).json({ message: "Failed to get claims" });
    }
  });

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
      
      // Create simulated AI damage assessment for front right side damage
      const damageItems = [
        {
          type: "Front Right Headlight Housing",
          severity: "Severe",
          location: "Right front headlight assembly",
          confidence: 0.97
        },
        {
          type: "Front Right Body Panel", 
          severity: "Moderate",
          location: "Right front quarter panel",
          confidence: 0.94
        },
        {
          type: "Front Bumper Corner",
          severity: "Minor", 
          location: "Right front bumper corner",
          confidence: 0.89
        }
      ];

      const recommendations = [
        "Replace right front headlight assembly with OEM parts",
        "Professional body panel repair and paint matching required", 
        "Minor bumper corner repair can be completed with existing work"
      ];

      const validatedAssessment = insertDamageAssessmentSchema.parse({
        claimId,
        confidence: 94,
        damageItems,
        recommendations,
        analysisComplete: true
      });

      const assessment = await storage.createDamageAssessment(validatedAssessment);

      // Create cost estimation for front right side damage
      const validatedEstimation = insertCostEstimationSchema.parse({
        claimId,
        bumperRepair: 320,
        paintwork: 650,
        headlight: 480,
        miscellaneous: 150,
        total: 1600,
        lowEstimate: 1450,
        highEstimate: 1750,
        completionTime: "4-6 business days"
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
