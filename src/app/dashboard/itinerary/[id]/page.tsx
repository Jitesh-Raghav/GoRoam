'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  ExternalLink, 
  Sunrise,
  Sun,
  Moon,
  Star,
  Heart,
  Download,
  ArrowLeft
} from 'lucide-react';

interface PlaceDetails {
  name: string;
  description: string;
  googleMapsLink: string;
}

interface ActivitySlot {
  time: string;
  place: PlaceDetails;
  duration: string;
  estimatedCost: number;
}

interface DayItinerary {
  day: number;
  date: string;
  theme: string;
  morning: ActivitySlot;
  afternoon: ActivitySlot;
  evening: ActivitySlot;
  totalDayCost: number;
}

interface ItineraryData {
  itinerary: DayItinerary[];
  summary: {
    totalCost: number;
    totalDays: number;
    destination: string;
    highlights: string[];
  };
}

interface ItineraryDetails {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  budget: number;
  numberOfPeople: number;
  tripType: string;
  interests: string[];
  itineraryData: ItineraryData;
  createdAt: string;
}

const timeOfDayIcons = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon
};

const timeOfDayColors = {
  morning: "from-orange-300 to-orange-500",
  afternoon: "from-orange-400 to-orange-600", 
  evening: "from-orange-500 to-orange-700"
};

export default function ItineraryPage() {
  const params = useParams();
  const [itinerary, setItinerary] = useState<ItineraryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch(`/api/itinerary/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setItinerary(data.data);
        } else {
          setError(data.error || 'Failed to fetch itinerary');
        }
      } catch (err) {
        setError('Failed to fetch itinerary');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchItinerary();
    }
  }, [params.id]);

  if (loading) {
        return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-orange-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"
          />
          <motion.p 
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent"
          >
            Loading your amazing adventure...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
              <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-orange-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-4">
            Itinerary Not Found
          </h1>
          <p className="text-gray-600 mb-8 text-lg">{error || 'The requested itinerary could not be found.'}</p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white px-8 py-3 rounded-2xl shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-orange-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-10 rounded-3xl" />
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-orange-500/20 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-gradient-to-r from-orange-500 to-orange-700 text-white border-0 px-3 py-1">
                      {itinerary.tripType.charAt(0).toUpperCase() + itinerary.tripType.slice(1)} Trip
                    </Badge>
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-700 to-orange-900 bg-clip-text text-transparent mb-6 p-3"
                  >
                    Your {itinerary.destination} Adventure
                  </motion.h1>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm"
                  >
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-blue-900">Duration</div>
                        <div className="text-blue-700">{itinerary.numberOfDays} days</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <Users className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-green-900">Travelers</div>
                        <div className="text-green-700">{itinerary.numberOfPeople} {itinerary.numberOfPeople === 1 ? 'person' : 'people'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-semibold text-yellow-900">Budget</div>
                        <div className="text-yellow-700">${itinerary.budget}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                      <Heart className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-semibold text-orange-900">Interests</div>
                        <div className="text-orange-700">{itinerary.interests.length} selected</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 lg:mt-0 text-center"
                >
                  
                  <div className="text-sm font-semibold text-gray-800">
                    {formatDate(itinerary.startDate)}
                  </div>
                  <div className="text-gray-400 text-sm">to</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {formatDate(itinerary.endDate)}
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trip Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-orange-500/20 rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-700 text-white p-6">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Star className="w-7 h-7" />
                Trip Summary & Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">${itinerary.itineraryData.summary.totalCost}</div>
                  <div className="text-gray-600 font-medium">Total Cost</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{itinerary.itineraryData.summary.totalDays}</div>
                  <div className="text-gray-600 font-medium">Amazing Days</div>
                </motion.div>
                
                                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-1">{itinerary.interests.length}</div>
                    <div className="text-gray-600 font-medium">Interests</div>
                  </motion.div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-orange-500" />
                    Your Interests
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {itinerary.interests.map((interest, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Badge className="bg-gradient-to-r from-orange-500 to-orange-700 text-white border-0 px-4 py-2 text-sm rounded-xl shadow-lg">
                          {interest}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Trip Highlights
                  </h3>
                  <div className="space-y-3">
                    {itinerary.itineraryData.summary.highlights.map((highlight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-700 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{highlight}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Itinerary */}
        <div className="space-y-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-center bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent"
          >
            Your Daily Adventure
          </motion.h2>
          
          {itinerary.itineraryData.itinerary.map((day, dayIndex) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + dayIndex * 0.1 }}
            >
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-orange-500/20 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-700 text-white p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="text-xl font-bold">{day.day}</span>
                      </div>
                      Day {day.day}: {day.theme}
                    </CardTitle>
                    <div className="mt-3 sm:mt-0 flex gap-3">
                      <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                        {day.date}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                        ${day.totalDayCost} budget
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    {(['morning', 'afternoon', 'evening'] as const).map((timeOfDay, timeIndex) => {
                      const activity = day[timeOfDay];
                      const Icon = timeOfDayIcons[timeOfDay];
                      const gradientColor = timeOfDayColors[timeOfDay];
                      
                      return (
                        <motion.div
                          key={timeOfDay}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + dayIndex * 0.1 + timeIndex * 0.1 }}
                          className="p-8 border-b lg:border-b-0 lg:border-r last:border-r-0 last:border-b-0 hover:bg-gray-50/50 transition-colors duration-300"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${gradientColor} rounded-2xl flex items-center justify-center shadow-lg`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 capitalize text-lg">{timeOfDay}</div>
                              <div className="text-sm text-gray-500 font-medium">{activity.time}</div>
                            </div>
                          </div>
                          
                          <h4 className="font-bold text-gray-900 mb-3 text-lg">{activity.place.name}</h4>
                          <p className="text-gray-600 mb-4 leading-relaxed">{activity.place.description}</p>
                          
                          <div className="flex items-center justify-between text-sm mb-4 p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600 font-medium">{activity.duration}</span>
                            </div>
                            <div className={`font-bold text-lg bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent`}>
                              ${activity.estimatedCost}
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-2 hover:scale-105 transition-all duration-200 rounded-xl"
                            onClick={() => window.open(activity.place.googleMapsLink, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on Maps
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 pt-8"
        >
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="flex-1 h-14 text-lg font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-600 rounded-2xl transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => window.print()}
            className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white rounded-2xl shadow-2xl shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Itinerary
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 