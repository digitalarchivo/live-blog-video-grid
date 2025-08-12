import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentTheme, setCurrentTheme] = useState({
    // Default theme
    name: 'Default',
    colors: {
      primary: '#61dafb',
      secondary: '#282c34',
      background: '#ffffff',
      text: '#000000',
      accent: '#ff6b6b',
      surface: '#f8f9fa',
      border: '#dee2e6',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8'
    },
    fonts: {
      heading: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      code: 'Fira Code, Monaco, Consolas, monospace',
      headingSize: '2rem',
      bodySize: '1rem'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      xl: '1.5rem'
    },
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.12)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
      xl: '0 20px 25px rgba(0,0,0,0.15)'
    },
    darkMode: false
  });

  const [availableThemes, setAvailableThemes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user's themes from database
  const loadUserThemes = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setAvailableThemes(data);
        // Load the most recent theme
        setCurrentTheme(data[0].theme_data);
      }
    } catch (error) {
      console.error('Error loading themes:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserThemes();
    }
  }, [isAuthenticated, user, loadUserThemes]);

  const saveTheme = async (themeData, themeName = null) => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to save themes');
    }

    try {
      const themeToSave = {
        user_id: user?.id,
        name: themeName || themeData.name || 'Custom Theme',
        theme_data: themeData,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('themes')
        .insert([themeToSave])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAvailableThemes(prev => [data, ...prev]);
      setCurrentTheme(themeData);

      return data;
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  };

  const updateTheme = async (updates) => {
    const newTheme = { ...currentTheme, ...updates };
    setCurrentTheme(newTheme);
    
    // Auto-save after a delay
    clearTimeout(window.themeSaveTimeout);
    window.themeSaveTimeout = setTimeout(() => {
      saveTheme(newTheme);
    }, 1000);
  };

  const applyTheme = (theme) => {
    setCurrentTheme(theme);
    
    // Apply CSS custom properties
    const root = document.documentElement;
    
    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Fonts
    Object.entries(theme.fonts).forEach(([key, value]) => {
      if (key === 'headingSize' || key === 'bodySize') {
        root.style.setProperty(`--font-size-${key.replace('Size', '')}`, value);
      } else {
        root.style.setProperty(`--font-${key}`, value);
      }
    });
    
    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
    
    // Shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Dark mode
    if (theme.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const deleteTheme = async (themeId) => {
    try {
      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', themeId);

      if (error) throw error;

      // Update local state
      setAvailableThemes(prev => prev.filter(theme => theme.id !== themeId));
      
      // If we deleted the current theme, load the next available one
      if (availableThemes.find(t => t.id === themeId)?.theme_data === currentTheme) {
        const nextTheme = availableThemes.find(t => t.id !== themeId);
        if (nextTheme) {
          setCurrentTheme(nextTheme.theme_data);
        }
      }
    } catch (error) {
      console.error('Error deleting theme:', error);
      throw error;
    }
  };

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Apply initial theme on mount
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const value = {
    currentTheme,
    availableThemes,
    loading,
    updateTheme,
    saveTheme,
    applyTheme,
    deleteTheme,
    loadUserThemes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 