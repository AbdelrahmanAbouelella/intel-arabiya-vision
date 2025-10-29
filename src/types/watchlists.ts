export type Watchlist = {
  id: string;
  name: string;
  companyIds: string[];
};

export type WatchlistRollups = {
  count: number;
  topRisk: { id:string; name:string; risk:number }[];
  lowRisk: { id:string; name:string; risk:number }[];
  topRevenue: { id:string; name:string; revenue:number }[];
};

