import { useAppStore } from "@/store/useAppStore";

export function useTheme() {
  const theme = useAppStore((state) => state.settings.theme);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const toggleTheme = () => {
    updateSettings({ theme: theme === "light" ? "dark" : "light" });
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };
}