import { get, post } from "./http";
import type { Watchlist } from "@/types/api";

export async function listWatchlists(): Promise<Watchlist[]> {
  return get<Watchlist[]>("/watchlists");
}

export async function addCompaniesToWatchlist(watchlistId: string, companyIds: string[]): Promise<void> {
  if (!watchlistId) throw { status: 400, message: "Missing watchlist id" };
  await post<void>(`/watchlists/${encodeURIComponent(watchlistId)}/companies`, { companyIds });
}
