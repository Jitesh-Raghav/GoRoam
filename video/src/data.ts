import { Drama, Landmark, ShoppingBag, TrainFront, Trees, UtensilsCrossed, type LucideIcon } from "lucide-react";

/**
 * The trip on screen: GoRoam's own "Tokyo & Kyoto in 5 days" package
 * (src/data/packages/japan-5-days.json), lightly trimmed to fit a frame.
 */

export type Category = "sight" | "food" | "culture" | "shopping" | "activity" | "nature";

export const CATEGORY: Record<Category, { icon: LucideIcon; color: string; label: string }> = {
  sight: { icon: Landmark, color: "#0b8278", label: "Sight" },
  food: { icon: UtensilsCrossed, color: "#d9822b", label: "Food" },
  culture: { icon: Drama, color: "#7a5cc2", label: "Culture" },
  shopping: { icon: ShoppingBag, color: "#d45d84", label: "Shopping" },
  activity: { icon: TrainFront, color: "#16324a", label: "Transit" },
  nature: { icon: Trees, color: "#3f8a6c", label: "Nature" },
};

export interface Stop {
  name: string;
  area: string;
  cat: Category;
  cost: number;
  time: string;
  lat: number;
  lng: number;
}

export interface Day {
  day: number;
  date: string;
  city: string;
  theme: string;
  stops: [Stop, Stop, Stop];
}

const T = ["9:00 AM", "1:00 PM", "6:00 PM"] as const;
const s = (i: 0 | 1 | 2, name: string, area: string, cat: Category, cost: number, lat: number, lng: number): Stop => ({ name, area, cat, cost, time: T[i], lat, lng });

export const DAYS: Day[] = [
  {
    day: 1,
    date: "Thu, Apr 2",
    city: "Tokyo",
    theme: "Arrival & first impressions",
    stops: [
      s(0, "Senso-ji Temple", "Asakusa", "sight", 0, 35.7148, 139.7967),
      s(1, "Tsukiji Outer Market", "Tsukiji", "food", 60, 35.6654, 139.7701),
      s(2, "Shibuya Crossing", "Shibuya", "culture", 80, 35.6595, 139.7005),
    ],
  },
  {
    day: 2,
    date: "Fri, Apr 3",
    city: "Tokyo",
    theme: "Shrines & side streets",
    stops: [
      s(0, "Meiji Shrine", "Shibuya", "sight", 0, 35.6764, 139.6993),
      s(1, "Takeshita Street", "Harajuku", "shopping", 40, 35.6703, 139.702),
      s(2, "Omoide Yokocho", "Shinjuku", "food", 100, 35.693, 139.7006),
    ],
  },
  {
    day: 3,
    date: "Sat, Apr 4",
    city: "Kyoto",
    theme: "Tokyo to Kyoto",
    stops: [
      s(0, "Shinkansen to Kyoto", "Tokyo Station", "activity", 250, 35.6812, 139.7671),
      s(1, "Kinkaku-ji", "Kita", "sight", 20, 35.0394, 135.7292),
      s(2, "Pontocho Alley", "Gion", "food", 150, 35.0049, 135.7788),
    ],
  },
  {
    day: 4,
    date: "Sun, Apr 5",
    city: "Kyoto",
    theme: "Temples & traditions",
    stops: [
      s(0, "Fushimi Inari Taisha", "Fushimi", "sight", 0, 34.9671, 135.7727),
      s(1, "Arashiyama Bamboo Grove", "Arashiyama", "nature", 30, 35.017, 135.6713),
      s(2, "Kaiseki at Gion Karyo", "Gion", "food", 200, 35.0033, 135.7783),
    ],
  },
  {
    day: 5,
    date: "Mon, Apr 6",
    city: "Kyoto",
    theme: "A last slow morning",
    stops: [
      s(0, "Nijo Castle", "Nijo", "sight", 20, 35.0142, 135.7481),
      s(1, "Nishiki Market", "Nakagyo", "food", 50, 35.005, 135.7649),
      s(2, "Gion Corner", "Gion", "culture", 60, 35.0045, 135.7786),
    ],
  },
];

export const BUDGET = 2400;
export const STAY = { name: "Hotel Gracery Shinjuku", area: "Shinjuku", perNight: 140, nights: 4 };
export const dayCost = (d: Day) => d.stops.reduce((a, x) => a + x.cost, 0);
export const ACTIVITIES = DAYS.reduce((a, d) => a + dayCost(d), 0);
export const TOTAL = ACTIVITIES + STAY.perNight * STAY.nights;

export const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
