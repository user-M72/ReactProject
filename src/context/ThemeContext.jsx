import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  default: {
    name: 'Default Blue',
    icon: '🔵',
    gradient: 'from-blue-50 via-indigo-50 to-purple-50',
    primary: 'from-blue-600 to-indigo-600',
    primaryHover: 'from-blue-700 to-indigo-700',
    secondary: 'from-green-500 to-emerald-600',
    secondaryHover: 'from-green-600 to-emerald-700',
    accent: 'indigo',
    sidebarBg: 'bg-white',
    navbarBg: 'bg-white/80',
  },
  dark: {
    name: 'Dark Mode',
    icon: '🌙',
    gradient: 'from-gray-900 via-slate-900 to-zinc-900',
    primary: 'from-purple-600 to-pink-600',
    primaryHover: 'from-purple-700 to-pink-700',
    secondary: 'from-cyan-500 to-blue-600',
    secondaryHover: 'from-cyan-600 to-blue-700',
    accent: 'purple',
    sidebarBg: 'bg-gray-800',
    navbarBg: 'bg-gray-800/80',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-400',
    cardBg: 'bg-gray-800',
    borderColor: 'border-gray-700',
    hoverBg: 'hover:bg-gray-700',
    isDark: true,
  },
  ocean: {
    name: 'Ocean Breeze',
    icon: '🌊',
    gradient: 'from-cyan-50 via-blue-50 to-teal-50',
    primary: 'from-cyan-600 to-blue-600',
    primaryHover: 'from-cyan-700 to-blue-700',
    secondary: 'from-teal-500 to-emerald-600',
    secondaryHover: 'from-teal-600 to-emerald-700',
    accent: 'cyan',
    sidebarBg: 'bg-white',
    navbarBg: 'bg-white/80',
  },
  sunset: {
    name: 'Sunset Glow',
    icon: '🌅',
    gradient: 'from-orange-50 via-rose-50 to-pink-50',
    primary: 'from-orange-600 to-rose-600',
    primaryHover: 'from-orange-700 to-rose-700',
    secondary: 'from-pink-500 to-purple-600',
    secondaryHover: 'from-pink-600 to-purple-700',
    accent: 'rose',
    sidebarBg: 'bg-white',
    navbarBg: 'bg-white/80',
  },
  forest: {
    name: 'Forest Green',
    icon: '🌲',
    gradient: 'from-emerald-50 via-green-50 to-lime-50',
    primary: 'from-emerald-600 to-green-600',
    primaryHover: 'from-emerald-700 to-green-700',
    secondary: 'from-lime-500 to-green-600',
    secondaryHover: 'from-lime-600 to-green-700',
    accent: 'emerald',
    sidebarBg: 'bg-white',
    navbarBg: 'bg-white/80',
  },
  midnight: {
    name: 'Midnight Purple',
    icon: '🌃',
    gradient: 'from-slate-900 via-purple-900 to-slate-900',
    primary: 'from-purple-500 to-indigo-500',
    primaryHover: 'from-purple-600 to-indigo-600',
    secondary: 'from-pink-500 to-purple-500',
    secondaryHover: 'from-pink-600 to-purple-600',
    accent: 'purple',
    sidebarBg: 'bg-slate-800',
    navbarBg: 'bg-slate-800/80',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-400',
    cardBg: 'bg-slate-800',
    borderColor: 'border-slate-700',
    hoverBg: 'hover:bg-slate-700',
    isDark: true,
  },
  lavender: {
    name: 'Lavender Dream',
    icon: '💜',
    gradient: 'from-purple-50 via-violet-50 to-fuchsia-50',
    primary: 'from-purple-600 to-violet-600',
    primaryHover: 'from-purple-700 to-violet-700',
    secondary: 'from-fuchsia-500 to-pink-600',
    secondaryHover: 'from-fuchsia-600 to-pink-700',
    accent: 'purple',
    sidebarBg: 'bg-white',
    navbarBg: 'bg-white/80',
  },
  autumn: {
    name: 'Autumn Leaves',
    icon: '🍂',
    gradient: 'from-amber-50 via-orange-50 to-red-50',
    primary: 'from-amber-600 to-orange-600',
    primaryHover: 'from-amber-700 to-orange-700',
    secondary: 'from-red-500 to-pink-600',
    secondaryHover: 'from-red-600 to-pink-700',
    accent: 'amber',
    sidebarBg: 'bg-white',
    navbarBg: 'bg-white/80',
  },
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('appTheme', themeName);
  };

  const theme = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
