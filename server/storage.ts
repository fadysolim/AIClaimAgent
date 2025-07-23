import { 
  users, claims, damageAssessments, costEstimations, uploadedImages,
  type User, type InsertUser, type Claim, type InsertClaim,
  type DamageAssessment, type InsertDamageAssessment,
  type CostEstimation, type InsertCostEstimation,
  type UploadedImage, type InsertUploadedImage
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getClaim(id: number): Promise<Claim | undefined>;
  getClaimByNumber(claimNumber: string): Promise<Claim | undefined>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: number, updates: Partial<Claim>): Promise<Claim | undefined>;
  
  getDamageAssessment(claimId: number): Promise<DamageAssessment | undefined>;
  createDamageAssessment(assessment: InsertDamageAssessment): Promise<DamageAssessment>;
  
  getCostEstimation(claimId: number): Promise<CostEstimation | undefined>;
  createCostEstimation(estimation: InsertCostEstimation): Promise<CostEstimation>;
  
  getUploadedImages(claimId: number): Promise<UploadedImage[]>;
  createUploadedImage(image: InsertUploadedImage): Promise<UploadedImage>;
  deleteUploadedImage(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private claims: Map<number, Claim>;
  private damageAssessments: Map<number, DamageAssessment>;
  private costEstimations: Map<number, CostEstimation>;
  private uploadedImages: Map<number, UploadedImage>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.claims = new Map();
    this.damageAssessments = new Map();
    this.costEstimations = new Map();
    this.uploadedImages = new Map();
    this.currentId = 1;

    // Initialize with sample claim data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleClaim: Claim = {
      id: 1,
      claimNumber: "CLM-2024-001537",
      policyholder: "Michael Chen",
      policyNumber: "POL-789456123",
      vehicle: "2021 Honda Accord",
      status: "in_progress",
      agentName: "Sarah Johnson",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.claims.set(1, sampleClaim);
    this.currentId = 2;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getClaim(id: number): Promise<Claim | undefined> {
    return this.claims.get(id);
  }

  async getClaimByNumber(claimNumber: string): Promise<Claim | undefined> {
    return Array.from(this.claims.values()).find(
      (claim) => claim.claimNumber === claimNumber,
    );
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = this.currentId++;
    const claim: Claim = {
      ...insertClaim,
      id,
      status: insertClaim.status || "initiated",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.claims.set(id, claim);
    return claim;
  }

  async updateClaim(id: number, updates: Partial<Claim>): Promise<Claim | undefined> {
    const claim = this.claims.get(id);
    if (!claim) return undefined;
    
    const updatedClaim = { ...claim, ...updates, updatedAt: new Date() };
    this.claims.set(id, updatedClaim);
    return updatedClaim;
  }

  async getDamageAssessment(claimId: number): Promise<DamageAssessment | undefined> {
    return Array.from(this.damageAssessments.values()).find(
      (assessment) => assessment.claimId === claimId,
    );
  }

  async createDamageAssessment(insertAssessment: InsertDamageAssessment): Promise<DamageAssessment> {
    const id = this.currentId++;
    const assessment: DamageAssessment = {
      ...insertAssessment,
      id,
      analysisComplete: insertAssessment.analysisComplete || false,
      createdAt: new Date(),
    };
    this.damageAssessments.set(id, assessment);
    return assessment;
  }

  async getCostEstimation(claimId: number): Promise<CostEstimation | undefined> {
    return Array.from(this.costEstimations.values()).find(
      (estimation) => estimation.claimId === claimId,
    );
  }

  async createCostEstimation(insertEstimation: InsertCostEstimation): Promise<CostEstimation> {
    const id = this.currentId++;
    const estimation: CostEstimation = {
      ...insertEstimation,
      id,
      createdAt: new Date(),
    };
    this.costEstimations.set(id, estimation);
    return estimation;
  }

  async getUploadedImages(claimId: number): Promise<UploadedImage[]> {
    return Array.from(this.uploadedImages.values()).filter(
      (image) => image.claimId === claimId,
    );
  }

  async createUploadedImage(insertImage: InsertUploadedImage): Promise<UploadedImage> {
    const id = this.currentId++;
    const image: UploadedImage = {
      ...insertImage,
      id,
      uploadedAt: new Date(),
    };
    this.uploadedImages.set(id, image);
    return image;
  }

  async deleteUploadedImage(id: number): Promise<boolean> {
    return this.uploadedImages.delete(id);
  }
}

export const storage = new MemStorage();
