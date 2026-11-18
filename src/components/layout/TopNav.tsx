import { NavLink } from "react-router-dom";
import { BookOpen, CalendarDays, Home, Salad, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Today", icon: Home, end: true },
  { to: "/diary", label: "Diary", icon: BookOpen, end: false },
  { to: "/foods", label: "Foods", icon: Salad, end: false },
  { to: "/progress", label: "Progress", icon: CalendarDays, end: false },
  { to: "/achievements", label: "Awards", icon: Trophy, end: false },
];

export function TopNav() {
  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-1.5 rounded-pixel border-[3px] px-3 py-1.5 font-pixel text-xs font-bold transition-transform",
              isActive
                ? "border-edge bg-forest text-[#FFFBF1] shadow-pixel-sm"
                : "border-transparent text-muted hover:border-edge hover:bg-surface-2 hover:text-body",
            )
          }
        >
          <item.icon size={14} />
          {item.label}
        </NavLink>
      ))}
      <NavLink
        to="/achievements"
        className="ml-1 hidden xl:flex"
        aria-hidden="true"
        tabIndex={-1}
      >
        <Sparkles size={14} className="text-amber" />
      </NavLink>
    </nav>
  );
}

export function BottomNav({ onLog }: { onLog: () => void }) {
  const left = NAV_ITEMS.slice(0, 2);
  const right = NAV_ITEMS.slice(2);

  const renderItem = (item: (typeof NAV_ITEMS)[number]) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "flex flex-1 flex-col items-center gap-0.5 rounded-pixel border-[3px] py-1.5 text-2xs font-bold transition-colors",
          isActive ? "border-edge bg-forest text-[#FFFBF1]" : "border-transparent text-muted",
        )
      }
    >
      <item.icon size={16} />
      <span className="font-pixel text-[9px]">{item.label}</span>
    </NavLink>
  );

  return (
    <nav className="safe-area-bottom fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-edge bg-surface px-2 pt-2 shadow-pixel lg:hidden">
      <div className="flex items-end gap-1">
        {left.map(renderItem)}
        <button
          type="button"
          onClick={onLog}
          aria-label="Log food"
          className="-mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-pixel border-[3px] border-edge bg-amber text-2xl font-black text-ink shadow-pixel active:translate-x-[3px] active:translate-y-[3px] active:shadow-pixel-none"
        >
          +
        </button>
        {right.map(renderItem)}
      </div>
    </nav>
  );
}
