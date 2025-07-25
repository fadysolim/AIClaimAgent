import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Wrench,
  DollarSign,
  Clock
} from "lucide-react";
import type { DamageAssessment, CostEstimation } from "@shared/schema";

interface AIAssistantProps {
  assessment?: DamageAssessment;
  estimation?: CostEstimation;
  onAction: (action: string) => void;
}

export function AIAssistant({ assessment, estimation, onAction }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!assessment || !estimation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 text-primary w-5 h-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Upload images and run analysis to get AI recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const damageItems = assessment.damageItems as any[];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Brain className="mr-2 text-primary w-5 h-5" />
            AI Assistant
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Analysis Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Summary</h4>
              <p className="text-sm text-blue-800 mt-1">
                Detected {damageItems.length} damage areas with {assessment.confidence}% confidence. 
                Estimated repair cost: ${estimation.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Damage Assessment */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
            Damage Assessment
          </h4>
          <div className="space-y-2">
            {damageItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{item.type}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.location} • {item.severity} damage
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(item.confidence * 100)}% confident
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-green-500" />
            Cost Estimate
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bumper Corner Repair</span>
              <span className="font-medium">${estimation.bumperRepair}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Body Panel & Paint</span>
              <span className="font-medium">${estimation.paintwork}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Headlight Assembly</span>
              <span className="font-medium">${estimation.headlight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Labor & Miscellaneous</span>
              <span className="font-medium">${estimation.miscellaneous}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total Estimate</span>
              <span>${estimation.total.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Range: ${estimation.lowEstimate.toLocaleString()} - ${estimation.highEstimate.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            Recommendations
          </h4>
          <div className="space-y-2">
            {assessment.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Wrench className="w-4 h-4 mr-2 text-gray-500" />
            Suggested Actions
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => onAction('schedule_inspection')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Schedule In-Person Inspection
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => onAction('request_additional_photos')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Request Additional Photos
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => onAction('get_shop_estimates')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Get Shop Estimates
            </Button>
          </div>
        </div>

        {/* Database References */}
        <div className="pt-4 border-t">
          <div className="text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Completion Time</span>
              <span className="font-medium">{estimation.completionTime}</span>
            </div>
            <div className="mt-2">
              References: Mitchell RepairCenter, CCC Database, OEM Parts Catalog
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}