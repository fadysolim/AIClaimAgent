import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageViewer } from "@/components/image-viewer";
import { AIAssistant } from "@/components/ai-assistant";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  User, 
  Clock, 
  Camera, 
  Calculator, 
  CheckCircle,
  Upload,
  CloudUpload,
  Image as ImageIcon,
  Check,
  Trash2,
  Brain,
  Loader2,
  TriangleAlert,
  Lightbulb,
  CheckCircle2,
  Eye,
  Save,
  AlertCircle,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  FileText,
  Search,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Bot
} from "lucide-react";
import type { Claim, DamageAssessment, CostEstimation, UploadedImage } from "@shared/schema";

// Import attached assets
import hondaFrontImage from "@assets/honda front new_1753478515810.webp";
import hondaBackImage from "@assets/honda new 2_1753478515819.jpg";

export default function ClaimsDashboard() {
  const params = useParams();
  const claimId = parseInt(params.id || "1");
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);
  const [damageReviewState, setDamageReviewState] = useState<{[key: string]: 'accepted' | 'rejected' | 'pending'}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [customDamageItems, setCustomDamageItems] = useState<Array<{type: string; severity: string; location: string; cost: number}>>([]);

  // Common damage types for search
  const commonDamageTypes = [
    { type: "Door Panel Dent", cost: 380 },
    { type: "Rear Bumper Scrape", cost: 250 },
    { type: "Mirror Replacement", cost: 180 },
    { type: "Windshield Crack", cost: 425 },
    { type: "Tire Replacement", cost: 200 },
    { type: "Rim Damage", cost: 350 },
    { type: "Trunk Lid Dent", cost: 450 },
    { type: "Hood Scratches", cost: 320 },
    { type: "Tail Light Crack", cost: 150 }
  ];

  const filteredDamageTypes = commonDamageTypes.filter(item =>
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle damage item acceptance/rejection
  const handleDamageReview = (itemType: string, action: 'accepted' | 'rejected') => {
    setDamageReviewState(prev => ({
      ...prev,
      [itemType]: action
    }));
    
    toast({
      title: action === 'accepted' ? "Item Accepted" : "Item Rejected",
      description: `${itemType} has been ${action}`,
    });
  };

  // Add custom damage item
  const addCustomDamageItem = (type: string, cost: number) => {
    const newItem = {
      type,
      severity: "Moderate",
      location: "To be specified",
      cost
    };
    
    setCustomDamageItems(prev => [...prev, newItem]);
    setSearchTerm("");
    
    toast({
      title: "Damage Item Added",
      description: `${type} added to assessment`,
    });
  };

  // Calculate updated total cost
  const getUpdatedCost = (originalEstimation: CostEstimation) => {
    if (!assessment || !assessment.damageItems) return originalEstimation;
    
    const damageItems = assessment.damageItems as Array<{type: string; severity: string; location: string; confidence: number}>;
    const acceptedItems = damageItems.filter((item: any) => 
      damageReviewState[item.type] !== 'rejected'
    );
    
    const customItemsCost = customDamageItems.reduce((sum, item) => sum + item.cost, 0);
    const rejectedItemsCount = damageItems.filter((item: any) => 
      damageReviewState[item.type] === 'rejected'
    ).length;
    
    // Estimate reduction for rejected items (rough calculation)
    const rejectionReduction = rejectedItemsCount * 200;
    const newTotal = Math.max(
      originalEstimation.total - rejectionReduction + customItemsCost,
      0
    );
    
    return {
      ...originalEstimation,
      total: newTotal,
      lowEstimate: Math.round(newTotal * 0.9),
      highEstimate: Math.round(newTotal * 1.1)
    };
  };

  // Sample images for the prototype
  const sampleImages = [
    { src: hondaFrontImage, title: "Front Right Side Damage - Honda Accord", filename: "honda_front_damage.webp" },
    { src: hondaBackImage, title: "Vehicle Overview - Honda Accord", filename: "honda_overview.jpg" },
  ];

  // Fetch claim data
  const { data: claim, isLoading: claimLoading } = useQuery<Claim>({
    queryKey: ["/api/claims", claimId],
  });

  // Fetch uploaded images
  const { data: images = [], isLoading: imagesLoading } = useQuery<UploadedImage[]>({
    queryKey: ["/api/claims", claimId, "images"],
  });

  // Fetch damage assessment
  const { data: assessment, isLoading: assessmentLoading } = useQuery<DamageAssessment>({
    queryKey: ["/api/claims", claimId, "assessment"],
  });

  // Fetch cost estimation
  const { data: estimation, isLoading: estimationLoading } = useQuery<CostEstimation>({
    queryKey: ["/api/claims", claimId, "estimation"],
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (imageData: { filename: string; fileSize: string }) => {
      return apiRequest("POST", `/api/claims/${claimId}/images`, imageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims", claimId, "images"] });
      toast({
        title: "Image uploaded successfully",
        description: "Your damage photo has been uploaded.",
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return apiRequest("DELETE", `/api/images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims", claimId, "images"] });
      toast({
        title: "Image deleted",
        description: "The image has been removed.",
      });
    },
  });

  // Analyze damage mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/claims/${claimId}/analyze`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims", claimId, "assessment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/claims", claimId, "estimation"] });
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete",
        description: "AI damage assessment has been generated.",
      });
    },
    onError: () => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze damage. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update claim status mutation
  const updateClaimMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PATCH", `/api/claims/${claimId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims", claimId] });
      toast({
        title: "Claim updated",
        description: "Claim status has been updated successfully.",
      });
    },
  });

  const handleFileUpload = () => {
    // For the prototype, upload one of the provided images
    const imageToUpload = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    uploadImageMutation.mutate({
      filename: imageToUpload.filename,
      fileSize: "2.4 MB"
    });
  };

  const handleAIAction = (action: string) => {
    switch (action) {
      case 'schedule_inspection':
        toast({
          title: "Inspection Scheduled",
          description: "In-person inspection scheduled for next business day.",
        });
        break;
      case 'request_additional_photos':
        toast({
          title: "Photo Request Sent",
          description: "Additional photo request sent to policyholder via SMS and email.",
        });
        break;
      case 'get_shop_estimates':
        toast({
          title: "Shop Estimates Retrieved",
          description: "Estimates from certified repair shops have been requested.",
        });
        break;
      case 'consult_databases':
        toast({
          title: "Database Consultation Complete",
          description: "AI consulted Mitchell RepairCenter, CCC Database, and OEM parts catalogs for accurate cost estimates.",
        });
        break;
      default:
        toast({
          title: "Action Triggered",
          description: `AI Assistant action: ${action.replace('_', ' ')}`,
        });
    }
  };

  const handleAnalyze = () => {
    if (images.length === 0) {
      toast({
        title: "No images to analyze",
        description: "Please upload damage photos first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    analyzeMutation.mutate();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "minor": return "bg-yellow-100 text-yellow-800";
      case "moderate": return "bg-orange-100 text-orange-800";
      case "severe": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "minor": return <TriangleAlert className="w-4 h-4" />;
      case "moderate": return <AlertCircle className="w-4 h-4" />;
      case "severe": return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (claimLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Claim Not Found</h1>
            <p className="text-gray-600">The requested claim could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="text-primary-foreground w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">SecureGuard Insurance</h1>
                  <p className="text-xs text-gray-500">AI Claims Assessment System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Agent: {claim.agentName}</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="text-gray-600 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Claim Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Claims
                  </Button>
                </Link>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Damage Assessment</h2>
                  <p className="text-gray-600 mt-1">Claim #{claim.claimNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  {claim.status === "in_progress" ? "In Progress" : claim.status}
                </Badge>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="text-white w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Claim Initiated</span>
              </div>
              <div className="flex-1 h-0.5 bg-green-500"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Camera className="text-primary-foreground w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-primary">Damage Assessment</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Calculator className="text-gray-400 w-4 h-4" />
                </div>
                <span className="ml-2 text-sm text-gray-500">Cost Estimation</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-gray-400 w-4 h-4" />
                </div>
                <span className="ml-2 text-sm text-gray-500">Approval</span>
              </div>
            </div>

            {/* Claim Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Policyholder:</span>
                <span className="ml-2 font-medium">{claim.policyholder}</span>
              </div>
              <div>
                <span className="text-gray-500">Policy Number:</span>
                <span className="ml-2 font-medium">{claim.policyNumber}</span>
              </div>
              <div>
                <span className="text-gray-500">Vehicle:</span>
                <span className="ml-2 font-medium">{claim.vehicle}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Upload */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="mr-2 text-primary w-5 h-5" />
                Vehicle Damage Photos
              </h3>
              
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={handleFileUpload}
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <CloudUpload className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg text-gray-600">Drop damage photos here</p>
                    <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    disabled={uploadImageMutation.isPending}
                  >
                    {uploadImageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Select Photos
                  </Button>
                  <p className="text-xs text-gray-400">Supports: JPG, PNG, HEIC (Max 10MB per file)</p>
                </div>
              </div>

              {/* Sample Images Gallery */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Damage Photos</h4>
                <div className="grid grid-cols-2 gap-4">
                  {sampleImages.map((img, index) => (
                    <div 
                      key={index} 
                      className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
                      onClick={() => setSelectedImage({ src: img.src, title: img.title })}
                    >
                      <img
                        src={img.src}
                        alt={img.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs text-white font-medium drop-shadow-md">{img.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Images */}
              {images.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Recently Uploaded</h4>
                  {images.map((image) => (
                    <div key={image.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{image.filename}</p>
                          <p className="text-xs text-gray-500">
                            {image.fileSize} • Uploaded {new Date(image.uploadedAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteImageMutation.mutate(image.id)}
                          disabled={deleteImageMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || analyzeMutation.isPending || images.length === 0}
                >
                  {isAnalyzing || analyzeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  Analyze Damage with AI
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    toast({
                      title: "Image Request Sent",
                      description: "Request for additional photos sent to policyholder via SMS and email.",
                    });
                  }}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Request Additional Images from Policyholder
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant with Agent Review */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="mr-2 text-primary w-5 h-5" />
                Agent Review & Override
              </h3>
              
              {assessment && assessment.damageItems ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Review AI damage detection and modify as needed. Changes will automatically update cost estimates.
                  </p>
                  
                  {/* AI Assessment Items with Review */}
                  <div className="space-y-3">
                    {(assessment.damageItems as any[]).map((item, index) => (
                      <div key={index} className={`p-3 rounded-lg border-2 transition-colors ${
                        damageReviewState[item.type] === 'accepted' ? 'bg-green-50 border-green-200' :
                        damageReviewState[item.type] === 'rejected' ? 'bg-red-50 border-red-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-medium text-gray-900">{item.type}</h5>
                              <Badge 
                                variant={item.severity === "Severe" ? "destructive" : item.severity === "Moderate" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {item.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{item.location}</p>
                            <div className="flex items-center mb-3">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                                <div 
                                  className="bg-primary h-1.5 rounded-full" 
                                  style={{ width: `${item.confidence * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{Math.round(item.confidence * 100)}% confidence</span>
                            </div>
                            
                            {/* Review Actions */}
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant={damageReviewState[item.type] === 'accepted' ? "default" : "outline"}
                                onClick={() => handleDamageReview(item.type, 'accepted')}
                                className="text-xs px-2 py-1 h-auto"
                              >
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant={damageReviewState[item.type] === 'rejected' ? "destructive" : "outline"}
                                onClick={() => handleDamageReview(item.type, 'rejected')}
                                className="text-xs px-2 py-1 h-auto"
                              >
                                <ThumbsDown className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                              {damageReviewState[item.type] && (
                                <span className="text-xs font-medium text-gray-600">
                                  ✓ {damageReviewState[item.type]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Custom damage items */}
                    {customDamageItems.map((item, index) => (
                      <div key={`custom-${index}`} className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-medium text-gray-900">{item.type}</h5>
                              <Badge variant="outline" className="text-xs">
                                Agent Added
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{item.location}</p>
                            <p className="text-xs text-blue-600 font-medium">Est. Cost: ${item.cost}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add missing damage items */}
                    <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Search & Add Missing Damage</h5>
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <div className="flex-1 relative">
                            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search for damage type..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>
                        
                        {searchTerm && filteredDamageTypes.length > 0 && (
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {filteredDamageTypes.slice(0, 5).map((damageType, index) => (
                              <div key={index} 
                                className="flex items-center justify-between p-2 bg-white border rounded cursor-pointer hover:bg-gray-50"
                                onClick={() => addCustomDamageItem(damageType.type, damageType.cost)}
                              >
                                <span className="text-sm text-gray-900">{damageType.type}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">~${damageType.cost}</span>
                                  <Plus className="w-3 h-3 text-gray-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Upload images and run analysis to review AI assessment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Original AI Assistant */}
          <AIAssistant 
            assessment={assessment} 
            estimation={estimation} 
            onAction={handleAIAction} 
          />
        </div>

        {/* Cost Estimation with Agent Review */}
        {estimation && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calculator className="mr-2 text-primary w-5 h-5" />
                  Repair Cost Estimation - Agent Review
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                  {(Object.keys(damageReviewState).length > 0 || customDamageItems.length > 0) && (
                    <Badge className="bg-blue-100 text-blue-800">
                      Agent Reviewed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cost Breakdown */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Bumper Corner Repair</p>
                        <p className="text-xs text-gray-500">Minor impact repair</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">${estimation.bumperRepair}</span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Body Panel & Paint</p>
                        <p className="text-xs text-gray-500">Panel repair + color matching</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">${estimation.paintwork}</span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Headlight Assembly</p>
                        <p className="text-xs text-gray-500">OEM replacement + installation</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">${estimation.headlight}</span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Labor & Miscellaneous</p>
                        <p className="text-xs text-gray-500">Shop supplies, labor fees</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">${estimation.miscellaneous}</span>
                    </div>

                    {/* Custom damage items */}
                    {customDamageItems.map((item, index) => (
                      <div key={`custom-cost-${index}`} className="flex items-center justify-between py-2 border-b border-blue-200 bg-blue-50 px-3 rounded">
                        <div>
                          <p className="text-sm font-medium text-blue-900">{item.type}</p>
                          <p className="text-xs text-blue-600">Agent added</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-900">+${item.cost}</span>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="flex items-center justify-between py-3 pt-4 border-t-2 border-gray-200">
                      <p className="text-base font-semibold text-gray-900">
                        Total Estimated Cost
                        {(Object.keys(damageReviewState).length > 0 || customDamageItems.length > 0) && (
                          <span className="text-xs text-blue-600 block">Updated by agent</span>
                        )}
                      </p>
                      <span className="text-lg font-bold text-primary">
                        ${getUpdatedCost(estimation).total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Estimation Details</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Confidence Range</h5>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Low estimate:</span>
                        <span className="font-medium">${getUpdatedCost(estimation).lowEstimate.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">High estimate:</span>
                        <span className="font-medium">${getUpdatedCost(estimation).highEstimate.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                        <TriangleAlert className="w-4 h-4 mr-2" />
                        Important Notes
                      </h5>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Final cost may vary after physical inspection</li>
                        <li>• Additional damage may be discovered during repair</li>
                        <li>• Prices based on regional averages</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estimated completion time:</span>
                        <span className="font-medium">{estimation.completionTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Preferred repair shops:</span>
                        <span className="font-medium text-blue-600 cursor-pointer hover:underline">View list (12)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Submit</h3>
            
            {/* PDF Review Button */}
            <div className="mb-6">
              <Button 
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => {
                  toast({
                    title: "Generating Report",
                    description: "PDF report with all claim details is being prepared...",
                  });
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Review Complete Assessment Report (PDF)
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                View comprehensive report including AI analysis, cost estimates, and recommendations
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => updateClaimMutation.mutate("pending_approval")}
                disabled={updateClaimMutation.isPending}
              >
                <Eye className="w-4 h-4 mr-2" />
                Send for Senior Approval
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => updateClaimMutation.mutate("draft")}
                disabled={updateClaimMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <AlertCircle className="w-4 h-4 mr-2 inline" />
                <strong>AI Integration Note:</strong> This assessment was generated using computer vision AI trained on thousands of vehicle damage images. The system can detect damage types, severity levels, and provide cost estimates with 94% accuracy based on historical repair data.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Image Viewer Modal */}
        {selectedImage && (
          <ImageViewer
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            imageSrc={selectedImage.src}
            imageTitle={selectedImage.title}
          />
        )}
      </div>
    </div>
  );
}
