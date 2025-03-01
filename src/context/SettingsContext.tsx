import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SettingsService, { type SettingsState } from '../services/settingsService';
import toast from 'react-hot-toast';

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (category: keyof SettingsState, setting: string, value: boolean) => void;
  resetSettings: () => void;
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
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
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