import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

function generateColorVars(hex: string, prefix: string = 'primary') {
  return {
    [`--${prefix}`]: hex,
  };
}

interface CustomBackground {
  type: 'image' | 'video';
  path: string;
}

export interface ThemeConfig {
  name?: string;
  colors?: Record<string, string>;
  background?: {
    image?: string;
    video?: string;
  };
  style?: {
    border_radius?: string;
    blur?: string;
    shadow?: string;
    app_opacity?: string;
  };
  logo?: {
    image?: string;
    opacity?: string;
  };
}

export interface CustomLogo {
  image?: string;
  opacity?: string;
}

interface ThemeContextType {
  accentColor: string;
  setAccentColor: (hex: string) => void;
  customBackground: CustomBackground | null;
  setCustomBackground: (bg: CustomBackground | null) => void;
  customLogo: CustomLogo | null;
  loadThemeFromJson: (jsonString: string) => boolean;
  clearCustomTheme: () => void;
  themeMode: string;
  setThemeMode: (mode: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  accentColor: '#10b981',
  setAccentColor: () => {},
  customBackground: null,
  setCustomBackground: () => {},
  customLogo: null,
  loadThemeFromJson: () => false,
  clearCustomTheme: () => {},
  themeMode: 'dark',
  setThemeMode: () => {},
});

const canUseDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const getStoredValue = (key: string) => (canUseDOM() ? window.localStorage.getItem(key) : null);
const setStoredValue = (key: string, value: string) => {
  if (canUseDOM()) window.localStorage.setItem(key, value);
};
const removeStoredValue = (key: string) => {
  if (canUseDOM()) window.localStorage.removeItem(key);
};

const setRootProperty = (key: string, value: string) => {
  if (canUseDOM()) document.documentElement.style.setProperty(key, value);
};
const removeRootProperty = (key: string) => {
  if (canUseDOM()) document.documentElement.style.removeProperty(key);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [accentColor, setAccentColorState] = useState<string>('#10b981');
  const [customBackground, setCustomBackgroundState] = useState<CustomBackground | null>(null);
  const [customLogoState, setCustomLogoState] = useState<CustomLogo | null>(null);
  const [themeMode, setThemeModeState] = useState<string>(() => getStoredValue('theme') || 'dark');

  const setCustomBackground = (bg: CustomBackground | null) => {
    setCustomBackgroundState(bg);
    if (bg) {
      setStoredValue('custom_bg', JSON.stringify(bg));
    } else {
      removeStoredValue('custom_bg');
    }
  };

  const applyColorVars = (hex: string) => {
    const vars = generateColorVars(hex);
    Object.entries(vars).forEach(([key, value]) => {
      setRootProperty(key, value);
    });
  };

  const setAccentColor = (hex: string) => {
    if (/^#[0-9A-F]{3,8}$/i.test(hex)) {
      applyColorVars(hex);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setAccentColorState(hex);
        setStoredValue('accent_color', hex);

        const activeMode = getStoredValue('theme');
        if (activeMode === 'custom') {
          const savedThemeJson = getStoredValue('active_custom_theme_json');
          if (savedThemeJson) {
            try {
              const parsed = JSON.parse(savedThemeJson);
              if (!parsed.colors) parsed.colors = {};
              parsed.colors.primary = hex;
              setStoredValue('active_custom_theme_json', JSON.stringify(parsed, null, 2));
            } catch (e) {}
          }
        }
      }, 50);
    }
  };

  // Parses a raw JSON theme object and applies all the custom colors and radii as CSS variables to the root.
  const loadThemeFromJson = (jsonString: string): boolean => {
    try {
      const config: ThemeConfig = JSON.parse(jsonString);
      if (!config.colors) return false;

      const v3Colors: Record<string, string | undefined> = {
        '--bg-base': config.colors.background || config.colors['bg-color'],
        '--background': config.colors.background || config.colors['bg-color'],
        '--text-primary': config.colors.foreground || config.colors['text-color'],
        '--foreground': config.colors.foreground || config.colors['text-color'],
        '--bg-surface': config.colors.content1 || config.colors['sidebar-bg'],
        '--content1': config.colors.content1 || config.colors['sidebar-bg'],
        '--bg-elevated': config.colors.content2 || config.colors['bg-secondary'],
        '--content2': config.colors.content2 || config.colors['bg-secondary'],
        '--border-subtle': config.colors.content3 || config.colors['input-bg'],
        '--content3': config.colors.content3 || config.colors['input-bg'],
      };

      if (config.colors.border) {
        v3Colors['--border-strong'] = config.colors.border;
        v3Colors['--content4'] = config.colors.border;
      }

      Object.entries(v3Colors).forEach(([key, hex]) => {
        if (hex && /^#[0-9A-F]{3,8}$/i.test(hex)) {
          setRootProperty(key, hex);
        }
      });

      const semanticColors = ['primary', 'secondary', 'success', 'warning', 'danger', 'default'];
      semanticColors.forEach((colorName) => {
        const hex = config.colors![colorName];
        if (hex && /^#[0-9A-F]{3,8}$/i.test(hex)) {
          const vars = generateColorVars(hex, colorName);
          Object.entries(vars).forEach(([k, v]) => {
            setRootProperty(k, v);
          });
          if (colorName === 'primary') {
            setAccentColorState(hex);
            setStoredValue('accent_color', hex);
          }
        }
      });

      if (config.style) {
        if (config.style.border_radius) {
          setRootProperty('--radius-sm', config.style.border_radius);
          setRootProperty('--radius-md', config.style.border_radius);
          setRootProperty('--radius-lg', config.style.border_radius);
        }
        if (config.style.blur) {
          setRootProperty('--glass-blur', config.style.blur);
        }
        if (config.style.shadow) {
          setRootProperty('--shadow-elevated', config.style.shadow);
        }
        if (config.style.app_opacity) {
          setRootProperty('--app-opacity', config.style.app_opacity);
        }
      }

      if (config.background) {
        const bgUrl = config.background.video || config.background.image;
        if (bgUrl) {
          const type = config.background.video ? 'video' : 'image';
          setCustomBackground({ type, path: bgUrl });
        } else {
          setCustomBackground(null);
        }
      } else {
        setCustomBackground(null);
      }

      if (config.logo) {
        setCustomLogoState(config.logo);
      } else {
        setCustomLogoState(null);
      }

      setStoredValue('active_custom_theme_json', jsonString);
      return true;
    } catch (err) {
      console.error('Failed to parse theme JSON:', err);
      return false;
    }
  };

  const clearCustomTheme = () => {
    removeStoredValue('active_custom_theme_json');
    const keys = [
      '--bg-base',
      '--background',
      '--text-primary',
      '--foreground',
      '--bg-surface',
      '--content1',
      '--bg-elevated',
      '--content2',
      '--border-subtle',
      '--content3',
      '--border-strong',
      '--content4',
      '--radius-sm',
      '--radius-md',
      '--radius-lg',
      '--glass-blur',
      '--shadow-elevated',
      '--app-opacity',
    ];
    keys.forEach((k) => removeRootProperty(k));
    setCustomBackground(null);
    setCustomLogoState(null);
  };

  const setThemeMode = (mode: string) => {
    setThemeModeState(mode);
    setStoredValue('theme', mode);

    if (mode === 'custom') return;

    if (mode === 'light') {
      if (canUseDOM()) document.documentElement.classList.remove('dark');
      clearCustomTheme();
    } else {
      if (canUseDOM()) document.documentElement.classList.add('dark');
      clearCustomTheme();
    }
  };

  useEffect(() => {
    if (!canUseDOM()) return;

    const savedThemeJson = getStoredValue('active_custom_theme_json');
    if (savedThemeJson) {
      loadThemeFromJson(savedThemeJson);
    } else {
      const savedColor = getStoredValue('accent_color');
      if (savedColor && /^#[0-9A-F]{3,8}$/i.test(savedColor)) {
        setAccentColorState(savedColor);
        applyColorVars(savedColor);
      } else {
        setAccentColorState('#10b981');
        applyColorVars('#10b981');
      }
    }

    const savedBg = getStoredValue('custom_bg');
    if (savedBg) {
      try {
        setCustomBackgroundState(JSON.parse(savedBg));
      } catch (e) {
        removeStoredValue('custom_bg');
      }
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        accentColor,
        setAccentColor,
        customBackground,
        setCustomBackground,
        customLogo: customLogoState,
        loadThemeFromJson,
        clearCustomTheme,
        themeMode,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeAccent = () => useContext(ThemeContext);
