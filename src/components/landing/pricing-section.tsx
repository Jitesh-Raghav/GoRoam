"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    credits: "3 credits",
    description: "Perfect for trying out GoRoam",
    features: [
      "3 AI-generated itineraries",
      "Basic map integration",
      "PDF export",
      "Email support",
      "Community access"
    ],
    popular: false,
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const
  },
  {
    name: "Pro",
    price: "₹299",
    period: "one-time",
    credits: "20 credits",
    description: "Great for regular travelers",
    features: [
      "20 AI-generated itineraries",
      "Real-time interactive maps",
      "Premium PDF templates",
      "Priority email support",
      "Advanced customization",
      "Travel recommendations"
    ],
    popular: true,
    buttonText: "Choose Pro",
    buttonVariant: "default" as const
  },
  {
    name: "Premium",
    price: "₹599",
    period: "one-time",
    credits: "50 credits",
    description: "For travel enthusiasts and agencies",
    features: [
      "50 AI-generated itineraries",
      "Advanced map features",
      "Custom PDF branding",
      "24/7 priority support",
      "Team collaboration",
      "API access",
      "White-label options"
    ],
    popular: false,
    buttonText: "Choose Premium",
    buttonVariant: "outline" as const
  }
];

export function PricingSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your travel needs. No hidden fees, no subscriptions - just pay once and use your credits whenever you want.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-1">
                  Most Popular
                </Badge>
              )}
              
              <Card className={`h-full ${plan.popular ? 'border-orange-500 border-2 shadow-lg' : 'border-gray-100'} hover:border-orange-200 transition-colors duration-300 shadow-sm hover:shadow-md`}>
                <CardHeader className="text-center pb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {plan.period}
                    </span>
                  </div>
                  <div className="text-orange-500 font-semibold text-lg mb-2">
                    {plan.credits}
                  </div>
                  <p className="text-gray-600">
                    {plan.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button 
                    className={`w-full mb-8 ${plan.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-orange-500 text-orange-500 hover:bg-orange-50'}`}
                    variant={plan.buttonVariant}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                  
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-4">
            All plans include a 30-day money-back guarantee
          </p>
          <p className="text-sm text-gray-500">
            Need a custom plan for your business? <a href="#" className="text-orange-500 hover:underline">Contact us</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
} 