import { get, post } from "./http";

export const createRule = (payload: { dsl: string; channels: string[]; active: boolean; name: string; scope_org?: boolean }) =>
  post<{ id: string }>(`/alerts/rules`, payload);

export const testRule = (payload: { dsl: string; from?: string; to?: string }) =>
  post<{ matches: any[] }>(`/alerts/test`, payload);

export const listHistory = (q: { rule_id?: string; from?: string; to?: string }) =>
  get<{ items: any[] }>(`/alerts/history?` + new URLSearchParams(Object(q as any)));
