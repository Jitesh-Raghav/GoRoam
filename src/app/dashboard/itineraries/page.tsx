"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Plus, 
  Eye, 
  Download, 
  Trash2, 
  Loader2,
  Clock,
  Heart
} from "lucide-react";

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  budget: number;
  numberOfPeople: number;
  tripType: string;
  interests: string[];
  status: string;
  createdAt: string;
}

export default function ItinerariesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItineraries = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/itineraries');
          const data = await response.json();
          
          if (data.success) {
            setItineraries(data.data);
          } else {
            setError(data.error || 'Failed to fetch itineraries');
          }
        } catch {
          setError('Failed to fetch itineraries');
        } finally {
          setLoading(false);
        }
      }
    };

    if (session?.user?.email) {
      fetchItineraries();
    }
  }, [session?.user?.email]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Loader2 className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading your itineraries...</p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth");
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewItinerary = (id: string) => {
    router.push(`/dashboard/itinerary/${id}`);
  };

  const handleCreateNew = () => {
    router.push('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12"
          >
            <div className="mb-6 sm:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Your Itineraries
              </h1>
              <p className="text-lg text-gray-600">
                Manage and explore all your travel adventures
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={handleCreateNew}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-300 font-semibold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Trip
              </Button>
            </motion.div>
          </motion.div>

          {/* Error State */}
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-red-500 text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Unable to load itineraries
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {error}
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : itineraries.length === 0 ? (
            
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-gray-200 bg-gray-50/50 backdrop-blur-sm">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="h-10 w-10 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    Start Your Journey
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                    You haven&apos;t created any itineraries yet. Plan your first amazing trip!
                  </p>
                  <Button 
                    onClick={handleCreateNew}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl shadow-lg shadow-orange-500/25 font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Trip
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            
            /* Itineraries Grid */
            <div className="space-y-6">
              {itineraries.map((itinerary, index) => (
                <motion.div
                  key={itinerary.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="group cursor-pointer"
                  onClick={() => handleViewItinerary(itinerary.id)}
                >
                  <Card className="border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <CardTitle className="text-xl font-bold text-gray-900">
                              {itinerary.title}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-gray-600 text-base">
                            {itinerary.numberOfDays} day {itinerary.tripType} adventure
                          </CardDescription>
                        </div>
                        <Badge 
                          className="bg-green-100 text-green-700 border-green-200 capitalize font-medium px-3 py-1"
                        >
                          {itinerary.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Trip Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group-hover:bg-orange-50 transition-colors">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Destination</p>
                            <p className="text-sm font-semibold text-gray-900">{itinerary.destination}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group-hover:bg-orange-50 transition-colors">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Dates</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group-hover:bg-orange-50 transition-colors">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Budget</p>
                            <p className="text-sm font-semibold text-gray-900">${itinerary.budget}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group-hover:bg-orange-50 transition-colors">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Travelers</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {itinerary.numberOfPeople} {itinerary.numberOfPeople === 1 ? 'person' : 'people'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Interests Tags */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-700">Interests</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {itinerary.interests.slice(0, 3).map((interest, idx) => (
                            <Badge 
                              key={idx}
                              className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 transition-colors"
                            >
                              {interest}
                            </Badge>
                          ))}
                          {itinerary.interests.length > 3 && (
                            <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                              +{itinerary.interests.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Created {formatDate(itinerary.createdAt)}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewItinerary(itinerary.id);
                            }}
                            className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => e.stopPropagation()}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 