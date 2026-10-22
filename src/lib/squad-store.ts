import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { matchSquad, readMember, squadDeck } from "@/lib/squad-match";

/** A squad by its share code, with everyone's answers parsed and the match worked out. Server only: it holds budgets. */
export const loadSquad = cache(async (raw: string) => {
  const code = raw.toUpperCase();
  if (!/^[A-Z0-9]{4,10}$/.test(code)) return null;
  const squad = await prisma.squad.findUnique({ where: { code }, include: { members: { orderBy: { createdAt: "asc" } } } }).catch(() => null);
  if (!squad) return null;
  const deck = squadDeck(squad.code, squad.createdAt);
  const members = squad.members.map(readMember);
  return { code: squad.code, name: squad.name, createdAt: squad.createdAt, deck, members, result: matchSquad(deck, members) };
});
