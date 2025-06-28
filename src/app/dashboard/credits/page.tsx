"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardLayout, useCredits } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, Star, Zap, Crown } from "lucide-react";

export default function CreditsPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth");
  }

  return (
    <DashboardLayout>
      <CreditsPageContent />
    </DashboardLayout>
  );
}

function CreditsPageContent() {
  const { credits } = useCredits();

  const plans = [
    {
      name: "Starter",
      credits: 50,
      price: 9.99,
      description: "Perfect for occasional travelers",
      icon: Zap,
      features: [
        "50 AI-generated itineraries",
        "Basic customization",
        "PDF downloads",
        "Email support"
      ],
      popular: false,
      color: "blue"
    },
    {
      name: "Explorer",
      credits: 150,
      price: 24.99,
      description: "Great for frequent travelers",
      icon: Star,
      features: [
        "150 AI-generated itineraries",
        "Advanced customization",
        "PDF & Excel downloads",
        "Priority support",
        "Save favorite locations",
        "Trip sharing"
      ],
      popular: true,
      color: "orange"
    },
    {
      name: "Adventurer",
      credits: 500,
      price: 69.99,
      description: "For travel enthusiasts",
      icon: Crown,
      features: [
        "500 AI-generated itineraries",
        "Premium customization",
        "All download formats",
        "24/7 priority support",
        "Advanced trip analytics",
        "Unlimited trip sharing",
        "Custom branding",
        "API access"
      ],
      popular: false,
      color: "purple"
    }
  ];

  return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Credit Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get more credits to unlock unlimited AI-powered travel planning. 
            Each credit generates one complete itinerary with personalized recommendations.
          </p>
        </div>

        {/* Current Credits Status */}
        <Card className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-800/50 rounded-full">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                    Current Balance
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    You have {credits} credits remaining
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {credits}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  Credits
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden ${
                  plan.popular 
                    ? "ring-2 ring-orange-500 shadow-lg scale-105" 
                    : "hover:shadow-lg"
                } transition-all duration-200`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={plan.popular ? "pt-12" : ""}>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-full ${
                      plan.color === "orange" ? "bg-orange-100 text-orange-600" :
                      plan.color === "blue" ? "bg-blue-100 text-blue-600" :
                      "bg-purple-100 text-purple-600"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {plan.popular && (
                      <Badge className="bg-orange-100 text-orange-800">Popular</Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="pt-4">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        one-time
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {plan.credits} credits included
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button 
                    className={`w-full mb-6 ${
                      plan.popular 
                        ? "bg-orange-500 hover:bg-orange-600" 
                        : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                    }`}
                  >
                    Purchase Credits
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do credits work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Each credit allows you to generate one complete AI-powered travel itinerary. 
                  Credits don't expire and can be used anytime.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I get a refund?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  We offer a 30-day money-back guarantee if you're not satisfied with our service. 
                  Contact support for assistance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do credits expire?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  No! Your credits never expire. Use them whenever you're ready to plan your next adventure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need more credits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Contact our sales team for custom enterprise plans with bulk pricing and additional features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
} 