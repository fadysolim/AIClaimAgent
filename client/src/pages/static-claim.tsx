import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  User, 
  Clock, 
  ArrowLeft,
  CheckCircle,
  Calendar,
  FileText,
  AlertCircle
} from "lucide-react";

export default function StaticClaim() {
  const params = useParams();
  const claimId = parseInt(params.id || "2");

  // Static claim data based on ID
  const getClaimData = (id: number) => {
    const claims = {
      2: {
        claimNumber: "CLM-2024-001523",
        policyholder: "Emma Rodriguez",
        policyNumber: "POL-654321987",
        vehicle: "2020 Toyota Camry",
        status: "approved",
        agentName: "Sarah Johnson",
        createdAt: "2024-01-12",
        updatedAt: "2024-01-18",
        description: "Minor rear-end collision with cosmetic damage to rear bumper and trunk lid.",
        estimatedCost: "$2,450",
        completionTime: "2-3 business days"
      },
      3: {
        claimNumber: "CLM-2024-001498",
        policyholder: "David Kim",
        policyNumber: "POL-111222333",
        vehicle: "2019 BMW 320i",
        status: "reviewed",
        agentName: "Sarah Johnson",
        createdAt: "2024-01-08",
        updatedAt: "2024-01-15",
        description: "Side-impact collision resulting in door panel and mirror damage on driver's side.",
        estimatedCost: "$4,200",
        completionTime: "5-7 business days"
      }
    };
    return claims[id as keyof typeof claims] || claims[2];
  };

  const claim = getClaimData(claimId);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-800";
      case "reviewed": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "reviewed": return <FileText className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

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
                  <p className="text-xs text-gray-500">Claims Management System</p>
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
                  <h2 className="text-2xl font-semibold text-gray-900">Claim Details</h2>
                  <p className="text-gray-600 mt-1">Claim #{claim.claimNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(claim.status)}>
                  {getStatusIcon(claim.status)}
                  <span className="ml-1 capitalize">
                    {claim.status}
                  </span>
                </Badge>
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

        {/* Claim Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Claim Summary */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Incident Description</h4>
                  <p className="text-sm text-gray-600">{claim.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Estimated Cost</h4>
                    <p className="text-lg font-semibold text-primary">{claim.estimatedCost}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Completion Time</h4>
                    <p className="text-sm text-gray-600">{claim.completionTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Date Created:</span>
                    <div className="font-medium">{new Date(claim.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <div className="font-medium">{new Date(claim.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
              
              <div className="space-y-4">
                {claim.status === "approved" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-green-900">Claim Approved</h4>
                        <p className="text-sm text-green-700 mt-1">
                          This claim has been reviewed and approved for processing. 
                          The policyholder has been notified and repair work can proceed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {claim.status === "reviewed" && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-purple-900">Under Review</h4>
                        <p className="text-sm text-purple-700 mt-1">
                          This claim is currently under review by senior claims adjusters. 
                          Additional documentation may be requested.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Processing Priority:</span>
                    <span className="font-medium">Standard</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Adjuster Assigned:</span>
                    <span className="font-medium">{claim.agentName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Next Review Date:</span>
                    <span className="font-medium">
                      {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Note for Demo */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Demo Note</h4>
                <p className="text-sm text-gray-600 mt-1">
                  This is a static view for claims that have already been processed. 
                  For the full interactive damage assessment experience with AI analysis, 
                  please return to the claims list and select claim #{" "}
                  <Link href="/claims/1" className="text-primary hover:underline">
                    CLM-2024-001537
                  </Link>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}