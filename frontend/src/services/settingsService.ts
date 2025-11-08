export interface SettingsState {
  display: {
    darkMode: boolean;
    compactView: boolean;
    showCharts: boolean;
  };
  notifications: {
    priceAlerts: boolean;
    newsAlerts: boolean;
    marketAlerts: boolean;
    emailNotifications: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    dataCollection: boolean;
  };
  stockRecommendations: {
    riskTolerance: 'low' | 'medium' | 'high' | null;
    investmentHorizon: 'short' | 'medium' | 'long' | null;
    marketCaps: ('small' | 'medium' | 'large')[];
    sectors: string[];
  };
}

class SettingsService {
  static STORAGE_KEY = 'tennant-ticker-settings';

  private static defaultSettings: SettingsState = {
    display: {
      darkMode: false,
      compactView: false,
      showCharts: true,
    },
    notifications: {
      priceAlerts: true,
      newsAlerts: true,
      marketAlerts: true,
      emailNotifications: false,
    },
    privacy: {
      analytics: true,
      crashReports: true,
      dataCollection: false,
    },
    stockRecommendations: {
      riskTolerance: null,
      investmentHorizon: null,
      marketCaps: [],
      sectors: [],
    },
  };

  static getSettings(): SettingsState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return this.mergeWithDefaults(parsedSettings);
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    return { ...this.defaultSettings };
  }

  static updateSettings(category: keyof SettingsState, setting: string, value: boolean): SettingsState {
    const currentSettings = this.getSettings();
    const updatedSettings = {
      ...currentSettings,
      [category]: {
        ...currentSettings[category],
        [setting]: value,
      },
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSettings));
    return updatedSettings;
  }

  static resetSettings(): SettingsState {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultSettings));
    return { ...this.defaultSettings };
  }

  private static mergeWithDefaults(stored: Partial<SettingsState>): SettingsState {
    return {
      display: { ...this.defaultSettings.display, ...stored.display },
      notifications: { ...this.defaultSettings.notifications, ...stored.notifications },
      privacy: { ...this.defaultSettings.privacy, ...stored.privacy },
      stockRecommendations: { ...this.defaultSettings.stockRecommendations, ...stored.stockRecommendations },
    };
  }
}

export default SettingsService;