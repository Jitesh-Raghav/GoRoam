/**
 * Who runs GoRoam and where to find us: one place for the footer, the About page,
 * the founder's note and the structured data, so the details never drift apart.
 */
export const COMPANY = {
  name: "GoRoam",
  operator: "Jitesh Raghav",
  location: "Gurgaon, Haryana, India",
  email: "jitesh@goroam.world",
  founder: {
    name: "Jitesh Raghav",
    role: "Founder",
    initials: "JR",
    /** A square photo in /public (e.g. "/founder.jpg"). Until there is one, the note shows the initials. */
    photo: null as string | null,
  },
};

export type SocialId = "x" | "instagram" | "youtube" | "linkedin";

/** GoRoam's social accounts. An account with no link simply isn't shown. */
export const SOCIALS: { id: SocialId; label: string; handle: string; href: string }[] = [
  { id: "x", label: "X", handle: "@okayjitesh", href: "https://x.com/okayjitesh" },
  { id: "instagram", label: "Instagram", handle: "", href: "" },
  { id: "youtube", label: "YouTube", handle: "", href: "" },
  { id: "linkedin", label: "LinkedIn", handle: "", href: "" },
];

export const activeSocials = () => SOCIALS.filter((s) => s.href);
