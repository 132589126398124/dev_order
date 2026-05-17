export interface PricingConfig {
  processes: Partial<Record<string, number>>;
  scanTypes: Partial<Record<string, number>>;
  scanHighExtra: number;
  halfFrameExtra: number;
  note: string;
}

export interface ShopSettings {
  acceptPushPull: boolean;
  acceptHalfFrame: boolean;
  disabledProcesses: string[];
  disabledScanTypes: string[];
  disabledResolutions: string[];
  blockedFilms: string[];
  filmNotices: Record<string, string>;
  orderNotice: string | null;
  pricing: PricingConfig;
}

export const DEFAULT_PRICING: PricingConfig = {
  processes: {},
  scanTypes: {},
  scanHighExtra: 0,
  halfFrameExtra: 0,
  note: "",
};

export const DEFAULT_SETTINGS: ShopSettings = {
  acceptPushPull: true,
  acceptHalfFrame: true,
  disabledProcesses: [],
  disabledScanTypes: [],
  disabledResolutions: [],
  blockedFilms: [],
  filmNotices: {},
  orderNotice: null,
  pricing: DEFAULT_PRICING,
};
