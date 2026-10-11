import { Baby, Car, Heart, Map, Users, User, Wallet, Zap, Route, type LucideIcon } from "@/components/site/icons";

/** An icon for each kind of trip, for cards, the footer and the hub. */
export const USE_CASE_ICON: Record<string, LucideIcon> = {
  couples: Heart,
  family: Baby,
  friends: Users,
  solo: User,
  "road-trip": Car,
  "weekend-getaway": Zap,
  "multi-city": Route,
  budget: Wallet,
};
export const FALLBACK_ICON: LucideIcon = Map;
