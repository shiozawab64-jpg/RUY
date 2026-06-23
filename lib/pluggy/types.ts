export type PortfolioKind = "pessoal" | "holding";

export type PluggyConnector = {
  id: number;
  name: string;
  imageUrl?: string | null;
};

export type PluggyItem = {
  id: string;
  connector: PluggyConnector;
  status: string;
  createdAt?: string;
};

export type PluggyAccount = {
  id: string;
  itemId: string;
  type: string;
  subtype: string;
  name: string;
  marketingName?: string | null;
  balance: number;
  currencyCode: string;
  number?: string | null;
  creditData?: {
    brand?: string | null;
  } | null;
};

export type PluggyTransaction = {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  date: string;
  category?: string | null;
  type?: string | null;
};

export type DashboardAccount = {
  id: string;
  itemId: string;
  bankName: string;
  bankLogoUrl?: string | null;
  accountType: string;
  accountName: string;
  balance: number;
  currencyCode: string;
  portfolio: PortfolioKind;
};

export type DashboardTransaction = {
  id: string;
  accountId: string;
  bankName: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  portfolio: PortfolioKind;
  currencyCode: string;
};

export type StoredConnection = {
  itemId: string;
  bankName: string;
  bankLogoUrl?: string | null;
  connectedAt: string;
  portfolio: PortfolioKind;
  cnpj?: string | null;
};
