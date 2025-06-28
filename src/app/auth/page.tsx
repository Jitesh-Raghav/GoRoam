"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { GradientBackground } from "@/components/ui/noisy-gradient-backgrounds";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function AuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Noisy Gradient Background */}
      <GradientBackground
        gradientOrigin="bottom-middle"
        gradientSize="150% 150%"
        colors={[
          { color: 'rgba(245,87,2,1)', stop: '10.5%' },
          { color: 'rgba(245,120,2,1)', stop: '16%' },
          { color: 'rgba(245,140,2,1)', stop: '17.5%' },
          { color: 'rgba(245,170,100,1)', stop: '25%' },
          { color: 'rgba(238,174,202,1)', stop: '40%' },
          { color: 'rgba(202,179,214,1)', stop: '65%' },
          { color: 'rgba(148,201,233,1)', stop: '100%' }
        ]}
        noiseIntensity={0.6}
        noisePatternSize={100}
        noisePatternRefreshInterval={2}
        noisePatternAlpha={30}
        className="z-0"
      />

      <div className="relative z-10 max-w-md w-full mx-4">
        <Card className="backdrop-blur-md bg-gray-900/20 border-white/20 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
            <Image
                            src="/logo.png"
                            alt="GoRoam Logo"
                            width={40}
                            height={40}
                            className="w-12 h-12"
                        />
              <h1 className="text-2xl font-bold text-white">GoRoam</h1>
            </div>
            <CardTitle className="text-xl text-white">
              {session ? `Welcome back, ${session.user?.name}!` : "Welcome to GoRoam"}
            </CardTitle>
            <CardDescription className="text-gray-200">
              {session 
                ? "You're signed in and ready to plan amazing trips!" 
                : "Sign in to start planning your perfect trip with AI-powered itineraries"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!session ? (
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="rounded-full mx-auto mb-2 border-2 border-white/30"
                    />
                  )}
                  <p className="text-white font-medium">{session.user?.email}</p>
                </div>
                <Button 
                  onClick={() => router.push("/dashboard")}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/20"
                  size="lg"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 