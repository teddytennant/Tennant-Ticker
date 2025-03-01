interface SettingsState {
  notifications: {
    priceAlerts: boolean;
    newsAlerts: boolean;
    marketOpenClose: boolean;
    emailUpdates: boolean;
  };
  display: {
    darkMode: boolean;
    compactView: boolean;
    showTradingHours: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    publicProfile: boolean;
  };
}

const DEFAULT_SETTINGS: SettingsState = {
  notifications: {
    priceAlerts: true,
    newsAlerts: true,
    marketOpenClose: true,
    emailUpdates: true,
  },
  display: {
    darkMode: true,
    compactView: false,
    showTradingHours: true,
  },
  privacy: {
    shareAnalytics: true,
    publicProfile: false,
  },
};

class SettingsService {
  private static STORAGE_KEY = 'user_settings';

  static getSettings(): SettingsState {
    try {
      const savedSettings = localStorage.getItem(this.STORAGE_KEY);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static updateSettings(
    category: keyof SettingsState,
    setting: string,
    value: boolean
  ): SettingsState {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = {
        ...currentSettings,
        [category]: {
          ...currentSettings[category],
          [setting]: value,
        },
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSettings));

      // Apply settings changes
      this.applySettings(updatedSettings);

      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      return this.getSettings();
    }
  }

  private static applySettings(settings: SettingsState) {
    // Apply dark mode
    if (settings.display.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply compact view
    if (settings.display.compactView) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }

    // Apply notification settings
    if ('Notification' in window) {
      if (settings.notifications.priceAlerts || 
          settings.notifications.newsAlerts || 
          settings.notifications.marketOpenClose) {
        Notification.requestPermission();
      }
    }
  }

  static resetSettings(): SettingsState {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    this.applySettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
}

export default SettingsService;
export type { SettingsState }; 