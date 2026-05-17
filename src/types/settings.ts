export interface ShopSettings {
  acceptPushPull: boolean;
  acceptHalfFrame: boolean;
  disabledProcesses: string[];
  disabledScanTypes: string[];
  disabledResolutions: string[];
  blockedFilms: string[];
  filmNotices: Record<string, string>;
  orderNotice: string | null;
}

export const DEFAULT_SETTINGS: ShopSettings = {
  acceptPushPull: true,
  acceptHalfFrame: true,
  disabledProcesses: [],
  disabledScanTypes: [],
  disabledResolutions: [],
  blockedFilms: [],
  filmNotices: {},
  orderNotice: null,
};
