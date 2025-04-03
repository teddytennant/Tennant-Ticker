import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SettingsService, { type SettingsState } from '../services/settingsService';
import toast from 'react-hot-toast';

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (category: keyof SettingsState, setting: string, value: boolean) => void;
  resetSettings: () => void;
  updateStockRecommendationPreferences: (preferences: {
    riskTolerance?: 'low' | 'medium' | 'high' | null;
    investmentHorizon?: 'short' | 'medium' | 'long' | null;
    marketCaps?: ('small' | 'medium' | 'large')[];
    sectors?: string[];
  }) => void;
  resetStockRecommendationPreferences: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(SettingsService.getSettings());

  useEffect(() => {
    // Apply initial settings
    SettingsService.updateSettings('display', 'darkMode', settings.display.darkMode);
  }, []);

  const updateSettings = (category: keyof SettingsState, setting: string, value: boolean) => {
    try {
      const updatedSettings = SettingsService.updateSettings(category, setting, value);
      setSettings(updatedSettings);
      
      // Show success toast for specific settings
      if (category === 'notifications') {
        toast.success(`${setting} notifications ${value ? 'enabled' : 'disabled'}`);
      } else if (category === 'display') {
        toast.success(`Display setting updated`);
      } else if (category === 'privacy') {
        toast.success(`Privacy setting updated`);
      }
    } catch (error) {
      toast.error('Failed to update settings');
      console.error('Error updating settings:', error);
    }
  };

  const updateStockRecommendationPreferences = (preferences: {
    riskTolerance?: 'low' | 'medium' | 'high' | null;
    investmentHorizon?: 'short' | 'medium' | 'long' | null;
    marketCaps?: ('small' | 'medium' | 'large')[];
    sectors?: string[];
  }) => {
    try {
      const currentSettings = SettingsService.getSettings();
      const updatedStockRecommendations = {
        ...currentSettings.stockRecommendations,
        ...preferences
      };
      
      const updatedSettings = {
        ...currentSettings,
        stockRecommendations: updatedStockRecommendations
      };
      
      localStorage.setItem(SettingsService.STORAGE_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      toast.success('Investment preferences saved');
    } catch (error) {
      toast.error('Failed to save investment preferences');
      console.error('Error saving investment preferences:', error);
    }
  };
  
  const resetStockRecommendationPreferences = () => {
    try {
      const currentSettings = SettingsService.getSettings();
      const updatedSettings = {
        ...currentSettings,
        stockRecommendations: {
          riskTolerance: null,
          investmentHorizon: null,
          marketCaps: [],
          sectors: []
        }
      };
      
      localStorage.setItem(SettingsService.STORAGE_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      toast.success('Investment preferences reset');
    } catch (error) {
      toast.error('Failed to reset investment preferences');
      console.error('Error resetting investment preferences:', error);
    }
  };

  const resetSettings = () => {
    try {
      const defaultSettings = SettingsService.resetSettings();
      setSettings(defaultSettings);
      toast.success('Settings reset to default');
    } catch (error) {
      toast.error('Failed to reset settings');
      console.error('Error resetting settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetSettings,
      updateStockRecommendationPreferences,
      resetStockRecommendationPreferences
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 