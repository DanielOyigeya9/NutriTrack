import type { Avatar } from "@/types";

export const AVATARS: Avatar[] = [
  {
    id: "sprout",
    name: "Sprout",
    emoji: "🌱",
    blurb: "A tiny shoot that grows with every meal you log.",
    accent: "green",
  },
  {
    id: "spud",
    name: "Spud",
    emoji: "🥔",
    blurb: "A cheerful spud who loves a steady breakfast.",
    accent: "amber",
  },
  {
    id: "splash",
    name: "Splash",
    emoji: "💧",
    blurb: "A water droplet that cheers when you hydrate.",
    accent: "sky",
  },
  {
    id: "pepper",
    name: "Pepper",
    emoji: "🌶️",
    blurb: "Spicy little friend with a taste for bold flavour.",
    accent: "coral",
  },
  {
    id: "berry",
    name: "Berry",
    emoji: "🫐",
    blurb: "A plump berry who adores colourful plates.",
    accent: "plum",
  },
  {
    id: "avocado",
    name: "Avocado",
    emoji: "🥑",
    blurb: "Calm, creamy and always rooting for your goals.",
    accent: "teal",
  },
];

export const AVATAR_BY_ID: Record<string, Avatar> = AVATARS.reduce(
  (acc, avatar) => ({ ...acc, [avatar.id]: avatar }),
  {} as Record<string, Avatar>,
);

export function getAvatar(id: string): Avatar {
  return AVATAR_BY_ID[id] ?? AVATARS[0];
}
