// The house icon set: Phosphor duotone throughout, under the names the app already
// used, so call sites stay `<MapPin className="size-4" />`. The duotone layer picks up
// the lagoon tint from `.gr-icon` in globals.css. Marks (check, cross, plus, minus,
// menu) usually sit in a chip of their own, so they drop Phosphor's back square.
import type { ComponentProps, ComponentType } from "react";
import { ICON_PATHS } from "./icon-paths";
import { cn } from "@/lib/utils";

type Weight = "duotone" | "bold" | "fill" | "regular" | "light" | "thin";
type Props = Omit<ComponentProps<"svg">, "ref" | "children" | "dangerouslySetInnerHTML"> & {
  size?: number | string;
  color?: string;
  mirrored?: boolean;
  alt?: string;
  weight?: Weight;
  /** lucide-only; Phosphor sets its weight instead. */
  strokeWidth?: number;
};
export type LucideIcon = ComponentType<Props>;

const escapeText = (t: string) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);

/**
 * One icon, drawn from just the paths it uses (icon-paths.ts, generated from Phosphor by
 * scripts/build-icons.mjs). Same markup as Phosphor's: a 256-unit viewBox, filled with
 * currentColor, the duotone layer at opacity 0.2 (tinted by `.gr-icon` in globals.css).
 */
function make(icon: string, weight: Weight, name: string, mark = false): LucideIcon {
  const paths = ICON_PATHS[`${icon}:${weight}`] ?? "";
  function GrIcon({ className, strokeWidth: _strokeWidth, size = 24, color = "currentColor", mirrored = false, alt, weight: _weight, ...rest }: Props) {
    void _strokeWidth;
    void _weight;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        fill={color}
        viewBox="0 0 256 256"
        transform={mirrored ? "scale(-1, 1)" : undefined}
        aria-hidden
        {...rest}
        className={cn("gr-icon shrink-0", mark && "gr-mark", className)}
        dangerouslySetInnerHTML={{ __html: (alt ? `<title>${escapeText(alt)}</title>` : "") + paths }}
      />
    );
  }
  GrIcon.displayName = name;
  return GrIcon;
}

export const AlertCircle = make("WarningCircle", "duotone", "AlertCircle");
export const ArrowDownUp = make("ArrowsDownUp", "duotone", "ArrowDownUp");
export const ArrowLeft = make("ArrowLeft", "duotone", "ArrowLeft");
export const ArrowLeftRight = make("ArrowsLeftRight", "duotone", "ArrowLeftRight");
export const ArrowRight = make("ArrowRight", "duotone", "ArrowRight");
export const ArrowRightLeft = make("ArrowsLeftRight", "duotone", "ArrowRightLeft");
export const ArrowUp = make("ArrowUp", "duotone", "ArrowUp");
export const ArrowUpRight = make("ArrowUpRight", "duotone", "ArrowUpRight");
export const Baby = make("Baby", "duotone", "Baby");
export const BedDouble = make("Bed", "duotone", "BedDouble");
export const Bell = make("Bell", "duotone", "Bell");
export const Bus = make("Bus", "duotone", "Bus");
export const CalendarDays = make("CalendarDots", "duotone", "CalendarDays");
export const CalendarHeart = make("CalendarHeart", "duotone", "CalendarHeart");
export const Camera = make("Camera", "duotone", "Camera");
export const Car = make("Car", "duotone", "Car");
export const Check = make("Check", "duotone", "Check", true);
export const CheckCircle2 = make("CheckCircle", "duotone", "CheckCircle2");
export const CheckIcon = make("Check", "duotone", "CheckIcon", true);
export const ChevronLeft = make("CaretLeft", "duotone", "ChevronLeft");
export const ChevronUp = make("CaretUp", "duotone", "ChevronUp");
export const ChevronDown = make("CaretDown", "duotone", "ChevronDown");
export const GripVertical = make("DotsSixVertical", "bold", "GripVertical");
export const Mic = make("Microphone", "duotone", "Mic");
export const MoreHorizontal = make("DotsThree", "bold", "MoreHorizontal");
export const ChevronRight = make("CaretRight", "duotone", "ChevronRight");
export const CircleIcon = make("Circle", "fill", "CircleIcon");
export const Clock3 = make("Clock", "duotone", "Clock3");
export const Cloud = make("Cloud", "duotone", "Cloud");
export const CloudDrizzle = make("CloudRain", "duotone", "CloudDrizzle");
export const CloudFog = make("CloudFog", "duotone", "CloudFog");
export const CloudLightning = make("CloudLightning", "duotone", "CloudLightning");
export const CloudRain = make("CloudRain", "duotone", "CloudRain");
export const CloudSnow = make("CloudSnow", "duotone", "CloudSnow");
export const CloudSun = make("CloudSun", "duotone", "CloudSun");
export const Coins = make("Coins", "duotone", "Coins");
export const Compass = make("Compass", "duotone", "Compass");
export const Copy = make("Copy", "duotone", "Copy");
export const CreditCard = make("CreditCard", "duotone", "CreditCard");
export const Crown = make("Crown", "duotone", "Crown");
export const Download = make("DownloadSimple", "duotone", "Download");
export const Dumbbell = make("Barbell", "duotone", "Dumbbell");
export const FileText = make("FileText", "duotone", "FileText");
export const Gift = make("Gift", "duotone", "Gift");
export const Github = make("GithubLogo", "duotone", "Github");
export const GraduationCap = make("GraduationCap", "duotone", "GraduationCap");
export const Heart = make("Heart", "duotone", "Heart");
export const Info = make("Info", "duotone", "Info");
export const Instagram = make("InstagramLogo", "duotone", "Instagram");
export const Languages = make("Translate", "duotone", "Languages");
export const Lightbulb = make("Lightbulb", "duotone", "Lightbulb");
export const Link2 = make("LinkSimple", "duotone", "Link2");
export const Linkedin = make("LinkedinLogo", "duotone", "Linkedin");
export const Loader2 = make("SpinnerGap", "duotone", "Loader2");
export const LogOut = make("SignOut", "duotone", "LogOut");
export const Luggage = make("SuitcaseRolling", "duotone", "Luggage");
export const Mail = make("EnvelopeSimple", "duotone", "Mail");
export const Map = make("MapTrifold", "duotone", "Map");
export const MapPin = make("MapPin", "duotone", "MapPin");
export const Menu = make("List", "duotone", "Menu", true);
export const MessageCircle = make("ChatCircleDots", "duotone", "MessageCircle");
export const MessageCircleQuestion = make("Question", "duotone", "MessageCircleQuestion");
export const Moon = make("Moon", "duotone", "Moon");
export const Mountain = make("Mountains", "duotone", "Mountain");
export const Navigation = make("NavigationArrow", "duotone", "Navigation");
export const Palette = make("Palette", "duotone", "Palette");
export const Plane = make("AirplaneTilt", "duotone", "Plane");
export const Play = make("Play", "fill", "Play");
export const PlayCircle = make("PlayCircle", "duotone", "PlayCircle");
export const Plus = make("Plus", "duotone", "Plus", true);
export const Printer = make("Printer", "duotone", "Printer");
export const Receipt = make("Receipt", "duotone", "Receipt");
export const RefreshCw = make("ArrowsClockwise", "duotone", "RefreshCw");
export const RotateCcw = make("ArrowCounterClockwise", "duotone", "RotateCcw");
export const Save = make("FloppyDisk", "duotone", "Save");
export const Search = make("MagnifyingGlass", "duotone", "Search");
export const Settings = make("GearSix", "duotone", "Settings");
export const Share2 = make("ShareNetwork", "duotone", "Share2");
export const Shield = make("Shield", "duotone", "Shield");
export const ShieldCheck = make("ShieldCheck", "duotone", "ShieldCheck");
export const ShoppingBag = make("ShoppingBag", "duotone", "ShoppingBag");
export const Shuffle = make("Shuffle", "duotone", "Shuffle");
export const Sparkles = make("Sparkle", "duotone", "Sparkles");
export const Star = make("Star", "duotone", "Star");
export const Sun = make("Sun", "duotone", "Sun");
export const Sunrise = make("SunHorizon", "duotone", "Sunrise");
export const ThumbsDown = make("ThumbsDown", "duotone", "ThumbsDown");
export const ThumbsUp = make("ThumbsUp", "duotone", "ThumbsUp");
export const Ticket = make("Ticket", "duotone", "Ticket");
export const TrainFront = make("Train", "duotone", "TrainFront");
export const Trash2 = make("Trash", "duotone", "Trash2");
export const Twitter = make("XLogo", "duotone", "Twitter");
export const Umbrella = make("Umbrella", "duotone", "Umbrella");
export const User = make("User", "duotone", "User");
export const UserPlus = make("UserPlus", "duotone", "UserPlus");
export const UserRound = make("UserCircle", "duotone", "UserRound");
export const Users = make("UsersThree", "duotone", "Users");
export const UtensilsCrossed = make("ForkKnife", "duotone", "UtensilsCrossed");
export const Wallet = make("Wallet", "duotone", "Wallet");
export const WifiOff = make("WifiSlash", "duotone", "WifiOff");
export const X = make("X", "duotone", "X", true);
export const Youtube = make("YoutubeLogo", "duotone", "Youtube");
export const Zap = make("Lightning", "duotone", "Zap");
export const Banknote = make("Money", "duotone", "Banknote");
export const Bike = make("Bicycle", "duotone", "Bike");
export const Motorcycle = make("Motorcycle", "duotone", "Motorcycle");
export const Scooter = make("Scooter", "duotone", "Scooter");
export const Fuel = make("GasPump", "duotone", "Fuel");
export const Building = make("Buildings", "duotone", "Building");
export const Building2 = make("BuildingOffice", "duotone", "Building2");
export const CalendarPlus = make("CalendarPlus", "duotone", "CalendarPlus");
export const Droplets = make("Drop", "duotone", "Droplets");
export const ExternalLink = make("ArrowSquareOut", "duotone", "ExternalLink");
export const Flower2 = make("FlowerLotus", "duotone", "Flower2");
export const Footprints = make("Footprints", "duotone", "Footprints");
export const Gem = make("Diamond", "duotone", "Gem");
export const Hand = make("HandWaving", "duotone", "Hand");
export const HandCoins = make("HandCoins", "duotone", "HandCoins");
export const HandHeart = make("HandHeart", "duotone", "HandHeart");
export const HeartPulse = make("Heartbeat", "duotone", "HeartPulse");
export const Hotel = make("BuildingApartment", "duotone", "Hotel");
export const Landmark = make("Bank", "duotone", "Landmark");
export const Leaf = make("Leaf", "duotone", "Leaf");
export const Martini = make("Martini", "duotone", "Martini");
export const MessageSquareQuote = make("Quotes", "duotone", "MessageSquareQuote");
export const Minus = make("Minus", "duotone", "Minus", true);
export const Palmtree = make("TreePalm", "duotone", "Palmtree");
export const PenLine = make("PencilSimpleLine", "duotone", "PenLine");
export const Phone = make("Phone", "duotone", "Phone");
export const WhatsApp = make("WhatsappLogo", "duotone", "WhatsApp");
export const Pill = make("Pill", "duotone", "Pill");
export const PlaneLanding = make("AirplaneLanding", "duotone", "PlaneLanding");
export const Plug = make("Plug", "duotone", "Plug");
export const Repeat = make("Repeat", "duotone", "Repeat");
export const Route = make("Path", "duotone", "Route");
export const Sailboat = make("Sailboat", "duotone", "Sailboat");
export const Siren = make("Siren", "duotone", "Siren");
export const Sofa = make("Couch", "duotone", "Sofa");
export const Stamp = make("Stamp", "duotone", "Stamp");
export const Syringe = make("Syringe", "duotone", "Syringe");
export const Tent = make("Tent", "duotone", "Tent");
export const TramFront = make("Tram", "duotone", "TramFront");
export const TreePine = make("TreeEvergreen", "duotone", "TreePine");
export const TriangleAlert = make("Warning", "duotone", "TriangleAlert");
export const Volume2 = make("SpeakerHigh", "duotone", "Volume2");
export const Wand2 = make("MagicWand", "duotone", "Wand2");
export const Waves = make("Waves", "duotone", "Waves");
export const Wifi = make("WifiHigh", "duotone", "Wifi");
export const Send = make("PaperPlaneTilt", "duotone", "Send");
export const Lock = make("LockSimple", "duotone", "Lock");
