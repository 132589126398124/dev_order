export interface ProcessPricing {
  develop: number;
  jpgScan: number;
  tiffScan: number;
}

export interface PricingConfig {
  processes: Partial<Record<string, ProcessPricing>>;
  scanHighExtra: number;
  scanUltraExtra: number;
  halfFrameExtra: number;
  pushPullPerStop: number;
  note: string;
}

export interface ResolutionOption {
  enabled: boolean;
  description: string;
}

export interface ResolutionConfig {
  standard: ResolutionOption;
  high: ResolutionOption;
  ultra: ResolutionOption;
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
  adminEmail: string | null;
  resolutionConfig: ResolutionConfig;
}

export const DEFAULT_PRICING: PricingConfig = {
  processes: {},
  scanHighExtra: 0,
  scanUltraExtra: 0,
  halfFrameExtra: 0,
  pushPullPerStop: 0,
  note: "",
};

export const DEFAULT_RESOLUTION_CONFIG: ResolutionConfig = {
  standard: { enabled: true, description: "" },
  high: { enabled: true, description: "" },
  ultra: { enabled: false, description: "" },
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
  adminEmail: null,
  resolutionConfig: DEFAULT_RESOLUTION_CONFIG,
};
