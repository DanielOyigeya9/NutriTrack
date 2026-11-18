import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Plus, Settings } from "lucide-react";
import { AddFoodSheet } from "@/components/food/AddFoodSheet";
import { LevelUpOverlay } from "@/components/game/LevelUpOverlay";
import { LevelBadge, ThemeToggle } from "@/components/layout/LevelBadge";
import { BottomNav, TopNav } from "@/components/layout/TopNav";
import { ToastStack } from "@/components/ui/ToastStack";
import { useUiStore } from "@/store/useUiStore";

export function AppShell({ children }: { children: ReactNode }) {
  const openAddFood = useUiStore((state) => state.openAddFood);

  return (
    <div className="relative z-10 min-h-screen pb-28 lg:pb-10">
      <header className="sticky top-0 z-40 border-b-[3px] border-edge bg-canvas/95 backdrop-blur-none">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-3 py-2.5 lg:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-pixel border-[3px] border-edge bg-forest text-lg text-[#FFFBF1] shadow-pixel-sm">
              ✳
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-pixel text-sm font-bold tracking-tight">NutriTrack</span>
              <span className="pixel-label hidden text-[8px] text-muted sm:block">
                Food &amp; habit quest
              </span>
            </span>
          </Link>

          <TopNav />

          <div className="flex items-center gap-2">
            <LevelBadge compact />
            <ThemeToggle />
            <Link
              to="/settings"
              aria-label="Settings"
              title="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface shadow-pixel-sm transition-transform hover:bg-surface-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-none"
            >
              <Settings size={15} className="text-body" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-3 py-5 lg:px-6 lg:py-7">{children}</main>

      <button
        type="button"
        onClick={() => openAddFood()}
        className="fixed bottom-24 right-4 z-40 hidden items-center gap-2 rounded-pixel border-[3px] border-edge bg-amber px-4 py-3 font-pixel text-sm font-bold text-ink shadow-pixel transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-pixel-none lg:bottom-8 lg:right-8 lg:flex"
      >
        <Plus size={16} strokeWidth={3} />
        Log food
      </button>

      <BottomNav onLog={() => openAddFood()} />
      <AddFoodSheet />
      <ToastStack />
      <LevelUpOverlay />
    </div>
  );
}
