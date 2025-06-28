"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  CalendarIcon, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Plane,
  TreePine,
  UtensilsCrossed,
  Building2,
  Mountain,
  ShoppingBag,
  Moon,
  Waves,
  Camera
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCredits } from "@/components/dashboard/dashboard-layout";
import { cn } from "@/lib/utils";

const interestOptions = [
  { id: "nature", label: "Nature", icon: TreePine },
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "culture", label: "Culture", icon: Building2 },
  { id: "adventure", label: "Adventure", icon: Mountain },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "nightlife", label: "Nightlife", icon: Moon },
  { id: "relaxation", label: "Relaxation", icon: Waves },
  { id: "photography", label: "Photography", icon: Camera },
];

interface TripFormProps {
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

export function TripForm({ onSubmit, isLoading: externalLoading = false }: TripFormProps) {
  const router = useRouter();
  const { refreshCredits } = useCredits();
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    startDate: "",
    numberOfDays: 3,
    budget: 1000,
    numberOfPeople: 1,
    tripType: "national" as const,
    interests: [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.source || formData.source.length < 2) {
      newErrors.source = "Source must be at least 2 characters.";
    }
    if (!formData.destination || formData.destination.length < 2) {
      newErrors.destination = "Destination must be at least 2 characters.";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Please select a start date.";
    }
    if (formData.numberOfDays < 1 || formData.numberOfDays > 30) {
      newErrors.numberOfDays = "Number of days must be between 1 and 30.";
    }
    if (formData.budget < 100) {
      newErrors.budget = "Budget must be at least $100.";
    }
    if (formData.numberOfPeople < 1 || formData.numberOfPeople > 20) {
      newErrors.numberOfPeople = "Number of people must be between 1 and 20.";
    }
    if (formData.interests.length === 0) {
      newErrors.interests = "You have to select at least one interest.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setErrors({});
      try {
        const response = await fetch('/api/generate-itinerary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        
        if (result.success) {
          // Refresh credits after successful itinerary generation
          await refreshCredits();
          router.push(`/dashboard/itinerary/${result.data.itineraryId}`);
          onSubmit?.(result.data);
        } else {
          setErrors({ submit: result.error });
        }
      } catch (error) {
        setErrors({ submit: "Network error. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-3xl mb-6 shadow-2xl">
          <MapPin className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300 mb-3">
          Plan Your Perfect Trip
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Tell us about your dream destination and we'll create a personalized itinerary just for you
        </p>
      </div>

      <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border-0 shadow-2xl shadow-orange-500/10 rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-0">
            
            {/* Location Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Where to?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Tell us your starting point and dream destination</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <span>Starting From</span>
                  </label>
                  <Input 
                    placeholder="e.g., New York, NY" 
                    value={formData.source}
                    onChange={(e) => handleInputChange("source", e.target.value)}
                    className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-2xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-300"
                  />
                  {errors.source && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2 bg-red-50 p-2 rounded-lg"
                    >
                      <span className="text-red-500">⚠</span> {errors.source}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                      <Plane className="h-5 w-5 text-white" />
                    </div>
                    <span>Destination</span>
                  </label>
                  <Input 
                    placeholder="e.g., Paris, France" 
                    value={formData.destination}
                    onChange={(e) => handleInputChange("destination", e.target.value)}
                    className="h-14 border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-2xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-300"
                  />
                  {errors.destination && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2 bg-red-50 p-2 rounded-lg"
                    >
                      <span className="text-red-500">⚠</span> {errors.destination}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Date and Duration Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  When & How Long?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Choose your travel dates and duration</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <span>Start Date</span>
                  </label>
                  <Input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="h-14 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 rounded-2xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-300"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.startDate && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2 bg-red-50 p-2 rounded-lg"
                    >
                      <span className="text-red-500">⚠</span> {errors.startDate}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <span>Number of Days</span>
                  </label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={30}
                    value={formData.numberOfDays}
                    onChange={(e) => handleInputChange("numberOfDays", Number(e.target.value))}
                    className="h-14 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-2xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-300"
                  />
                  {errors.numberOfDays && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2 bg-red-50 p-2 rounded-lg"
                    >
                      <span className="text-red-500">⚠</span> {errors.numberOfDays}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Budget and People Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Budget & Group Size
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Set your spending limit and group details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <span>Budget (USD)</span>
                  </label>
                  <Input 
                    type="number" 
                    min={100}
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", Number(e.target.value))}
                    className="h-14 border-2 border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 rounded-2xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-300"
                  />
                  <p className="text-sm text-gray-500 bg-white/60 p-2 rounded-lg">Total budget for the entire trip</p>
                  {errors.budget && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2 bg-red-50 p-2 rounded-lg"
                    >
                      <span className="text-red-500">⚠</span> {errors.budget}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <span>Number of People</span>
                  </label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={20}
                    value={formData.numberOfPeople}
                    onChange={(e) => handleInputChange("numberOfPeople", Number(e.target.value))}
                    className="h-14 border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 rounded-2xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-300"
                  />
                  {errors.numberOfPeople && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2 bg-red-50 p-2 rounded-lg"
                    >
                      <span className="text-red-500">⚠</span> {errors.numberOfPeople}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Trip Type Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Trip Type
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Choose your travel scope</p>
              </div>
              
              <div className="flex justify-center space-x-6 max-w-2xl mx-auto">
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center space-x-3 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex-1",
                    formData.tripType === "national"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/25"
                      : "bg-white/80 border-gray-200 hover:border-blue-300 hover:shadow-lg"
                  )}
                >
                  <input 
                    type="radio" 
                    name="tripType"
                    value="national"
                    checked={formData.tripType === "national"}
                    onChange={(e) => handleInputChange("tripType", e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center flex-1">
                    <div className="text-lg font-semibold">National</div>
                    <div className="text-sm opacity-90">Within your country</div>
                  </div>
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center space-x-3 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex-1",
                    formData.tripType === "international"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 text-white shadow-xl shadow-orange-500/25"
                      : "bg-white/80 border-gray-200 hover:border-orange-300 hover:shadow-lg"
                  )}
                >
                  <input 
                    type="radio" 
                    name="tripType"
                    value="international"
                    checked={formData.tripType === "international"}
                    onChange={(e) => handleInputChange("tripType", e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center flex-1">
                    <div className="text-lg font-semibold">International</div>
                    <div className="text-sm opacity-90">Across borders</div>
                  </div>
                </motion.label>
              </div>
            </motion.div>

            {/* Interests Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-8 bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  What interests you?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Select activities and experiences you'd love to include</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {interestOptions.map((interest) => {
                  const IconComponent = interest.icon;
                  const isSelected = formData.interests.includes(interest.id);
                  
                  return (
                    <motion.div
                      key={interest.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex flex-col items-center space-y-3 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                        isSelected
                          ? "bg-gradient-to-br from-orange-500 to-red-500 border-orange-500 text-white shadow-xl shadow-orange-500/25"
                          : "bg-white/80 border-gray-200 hover:border-orange-300 hover:shadow-lg text-gray-700"
                      )}
                      onClick={() => handleInterestToggle(interest.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleInterestToggle(interest.id)}
                        className="sr-only"
                      />
                      <div className={cn(
                        "p-3 rounded-2xl transition-all duration-300",
                        isSelected ? "bg-white/20" : "bg-gray-100"
                      )}>
                        <IconComponent className={cn(
                          "h-8 w-8 transition-all duration-300",
                          isSelected ? "text-white" : "text-orange-500"
                        )} />
                      </div>
                      <span className="text-sm font-semibold text-center">{interest.label}</span>
                    </motion.div>
                  );
                })}
              </div>
              
              {errors.interests && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 flex items-center justify-center gap-2 bg-red-50 p-3 rounded-lg mt-4 max-w-md mx-auto"
                >
                  <span className="text-red-500">⚠</span> {errors.interests}
                </motion.p>
              )}

              {/* Selected Interests Display */}
              {formData.interests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-200 max-w-4xl mx-auto"
                >
                  <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                    Selected Interests:
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {formData.interests.map((interestId) => {
                      const interest = interestOptions.find((opt) => opt.id === interestId);
                      if (!interest) return null;
                      const IconComponent = interest.icon;
                      return (
                        <Badge 
                          key={interestId} 
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-3 py-2 text-sm font-medium flex items-center gap-2 rounded-xl"
                        >
                          <IconComponent className="h-4 w-4" />
                          {interest.label}
                        </Badge>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Submit Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
            >
              {/* Error Display */}
              {errors.submit && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl max-w-md mx-auto"
                >
                  <p className="text-sm text-red-600 text-center flex items-center justify-center gap-2">
                    <span className="text-red-500">⚠</span> {errors.submit}
                  </p>
                </motion.div>
              )}
              
              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-2xl shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                  disabled={isSubmitting || externalLoading}
                >
                  {isSubmitting || externalLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                      />
                      Generating Your Perfect Itinerary...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-6 h-6 mr-3" />
                      Generate My Perfect Itinerary
                    </>
                  )}
                </Button>
                
                <p className="text-gray-500 text-sm mt-4 max-w-md mx-auto">
                  Our AI will create a personalized itinerary based on your preferences in just a few seconds
                </p>
              </div>
            </motion.div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
} 