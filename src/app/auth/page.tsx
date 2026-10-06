"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Scene } from "@/components/scenes/scene";
import { ScrambleText } from "@/components/motion/scramble-text";
import { SplitText } from "@/components/motion/split-text";
import { Logo } from "@/components/site/logo";
import { UserAvatar } from "@/components/site/user-avatar";
import { destinationBySlug, formatCoords } from "@/lib/destinations";

const SLIDES = ["santorini", "mount-fuji", "taj-mahal", "christ-the-redeemer", "eiffel-tower"].map((s) => destinationBySlug(s)!);

const ERRORS: Record<string, string> = {
  OAuthSignin: "We couldn't start the Google sign-in. Please try again.",
  OAuthCallback: "Google didn't complete the sign-in. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method.",
  AccessDenied: "Access was denied. Please try another account.",
  Configuration: "Sign-in is temporarily unavailable. Please try again shortly.",
};

function safeCallback(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

function GoogleMark() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function Slideshow() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((v) => (v + 1) % SLIDES.length), 6500);
    return () => window.clearInterval(t);
  }, []);
  const d = SLIDES[i];
  return (
    <div className="relative h-full overflow-hidden bg-ink">
      <AnimatePresence initial={false}>
        <motion.div
          key={d.slug}
          className="absolute inset-0"
          initial={{ opacity: 0, zIndex: 2 }}
          animate={{ opacity: 1, zIndex: 2, transition: { duration: 1.2 } }}
          exit={{ opacity: 1, zIndex: 1, transition: { duration: 1.3 } }}
        >
          <Scene id={d.scene} intro interactive title={`${d.name}, ${d.place}`} />
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
      <div className="absolute inset-x-0 bottom-0 z-20 p-6 text-paper sm:p-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <ScrambleText text={formatCoords(d.lat, d.lng)} className="block font-mono text-[11px] tracking-wide text-paper/70" />
            <AnimatePresence mode="wait">
              <motion.p
                key={d.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="display mt-3 text-3xl leading-none sm:text-5xl"
              >
                {d.name}
              </motion.p>
            </AnimatePresence>
            <p className="mt-2 text-sm text-paper/70">{d.place}</p>
          </div>
          <div className="hidden gap-1.5 sm:flex">
            {SLIDES.map((s, k) => (
              <button
                key={s.slug}
                type="button"
                aria-label={`Show ${s.name}`}
                onClick={() => setI(k)}
                className={`h-1 rounded-full transition-all duration-500 ${k === i ? "w-8 bg-paper" : "w-3 bg-paper/40 hover:bg-paper/70"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallback(params.get("callbackUrl"));
  const errorCode = params.get("error");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    try {
      setPending(true);
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Sign-in error:", error);
      setPending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <div className="flex min-h-full flex-col px-6 py-8 sm:px-12 lg:px-16">
      <div className="flex items-center justify-between">
        <Logo />
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone transition-colors hover:text-ink">
          <ArrowLeft className="size-4" /> Back home
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14">
        {status === "loading" ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="size-7 animate-spin text-brand" />
          </div>
        ) : session ? (
          <div>
            <p className="eyebrow text-stone">Signed in</p>
            <h1 className="display mt-4 text-4xl leading-[0.95] text-ink">
              Welcome back,
              <br />
              <span className="italic text-brand">{session.user?.name?.split(" ")[0] ?? "traveller"}.</span>
            </h1>
            <div className="mt-8 flex items-center gap-4 rounded-2xl bg-white/80 p-4 ring-1 ring-line">
              <UserAvatar user={session.user} className="size-12" />
              <p className="text-sm text-ink">{session.user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push(callbackUrl)}
              className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-brand"
            >
              Go to dashboard
            </button>
            <button type="button" onClick={handleSignOut} className="mt-3 h-12 w-full rounded-full text-sm text-stone transition-colors hover:bg-paper-2 hover:text-ink">
              Sign out
            </button>
          </div>
        ) : (
          <div>
            <p className="eyebrow text-stone">Welcome to GoRoam</p>
            <h1 className="display mt-4 text-[clamp(2.55rem,5.1vw,3.74rem)] leading-[0.92] text-ink">
              <SplitText text="Your next trip" trigger="mount" className="block" />
              <SplitText segments={[{ text: "starts here.", className: "italic text-brand" }]} trigger="mount" delay={0.12} className="block" />
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone">Sign in to start planning your perfect trip with AI-powered itineraries.</p>

            {errorCode && (
              <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl bg-destructive/[0.06] p-4 text-sm text-destructive ring-1 ring-destructive/20">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {ERRORS[errorCode] ?? "Something went wrong while signing in. Please try again."}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={pending}
              className="group mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-white text-[0.95rem] font-medium text-ink shadow-[0_20px_40px_-24px_rgba(10,30,44,0.45)] ring-1 ring-line transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-24px_rgba(10,30,44,0.5)] disabled:pointer-events-none disabled:opacity-70"
            >
              {pending ? <Loader2 className="size-5 animate-spin text-brand" /> : <GoogleMark />}
              {pending ? "Redirecting to Google…" : "Continue with Google"}
            </button>

            <ul className="mt-10 space-y-3 border-t border-line pt-8">
              {["Your first itinerary, on us", "Day-by-day plans with real places", "Print-ready PDFs for the road"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-ink/80">
                  <span className="grid size-5 place-items-center rounded-full bg-brand-soft text-brand">
                    <Check className="size-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-stone-2">© {new Date().getFullYear()} GoRoam · Made for the curious</p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="grid min-h-svh bg-paper lg:grid-cols-[1.15fr_1fr]">
      <div className="relative h-[42svh] lg:sticky lg:top-0 lg:h-svh lg:p-3">
        <div className="h-full overflow-hidden lg:rounded-[28px]">
          <Slideshow />
        </div>
      </div>
      <Suspense
        fallback={
          <div className="grid place-items-center">
            <Loader2 className="size-7 animate-spin text-brand" />
          </div>
        }
      >
        <AuthPanel />
      </Suspense>
    </div>
  );
}
