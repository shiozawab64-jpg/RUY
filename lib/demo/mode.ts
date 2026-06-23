import { getItemIds } from "@/lib/session/connections";

export const isUsingDemoData = (): boolean => getItemIds().length === 0;
