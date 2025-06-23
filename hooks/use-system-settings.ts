import { useState, useEffect } from 'react';
import { graphqlClient } from '@/lib/api/graphql-client';
import { 
  GET_SYSTEM_SETTINGS, 
  UPDATE_SYSTEM_SETTINGS, 
  CREATE_SYSTEM_SETTINGS,
  SystemSettings,
  getDefaultSettings 
} from '@/lib/api/queries/system-settings';

interface UseSystemSettingsReturn {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  resetToDefaults: () => Promise<boolean>;
}

export function useSystemSettings(): UseSystemSettingsReturn {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from server
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await graphqlClient.request(GET_SYSTEM_SETTINGS);
      
      if (response.AlromaihSystemSettings && response.AlromaihSystemSettings.length > 0) {
        setSettings(response.AlromaihSystemSettings[0]);
      } else {
        // No settings found, create default settings
        const defaultSettings = getDefaultSettings();
        const createResponse = await graphqlClient.request(CREATE_SYSTEM_SETTINGS, {
          values: defaultSettings
        });
        
        if (createResponse.AlromaihSystemSettings) {
          setSettings(createResponse.AlromaihSystemSettings);
        } else {
          setSettings(defaultSettings);
        }
      }
    } catch (err) {
      console.error('Error loading system settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      // Set default settings as fallback
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = async (updates: Partial<SystemSettings>): Promise<boolean> => {
    try {
      setError(null);
      
      // Merge updates with current settings
      const updatedSettings = { ...settings, ...updates };
      
      // Remove id from updates to avoid GraphQL issues
      const { id, ...settingsWithoutId } = updatedSettings;
      
      const response = await graphqlClient.request(UPDATE_SYSTEM_SETTINGS, {
        values: settingsWithoutId
      });
      
      if (response.AlromaihSystemSettings) {
        setSettings(response.AlromaihSystemSettings);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error updating system settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    }
  };

  // Refresh settings from server
  const refreshSettings = async () => {
    await loadSettings();
  };

  // Reset to default settings
  const resetToDefaults = async (): Promise<boolean> => {
    try {
      const defaultSettings = getDefaultSettings();
      return await updateSettings(defaultSettings);
    } catch (err) {
      console.error('Error resetting to defaults:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
      return false;
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
    resetToDefaults,
  };
} 