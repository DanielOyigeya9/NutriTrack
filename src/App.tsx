import { useEffect, useSyncExternalStore } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Achievements from "@/pages/Achievements";
import Diary from "@/pages/Diary";
import Foods from "@/pages/Foods";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import Progress from "@/pages/Progress";
import Settings from "@/pages/Settings";
import Today from "@/pages/Today";
import { getPersistenceStatus, subscribePersistenceStatus } from "@/lib/persistenceStatus";
import { useAppStore } from "@/store/useAppStore";

function ProtectedLayout() {
  const onboarded = useAppStore((state) => state.profile.onboarded);

  if (!onboarded) return <Navigate to="/onboarding" replace />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  const persistenceStatus = useSyncExternalStore(
    subscribePersistenceStatus,
    getPersistenceStatus,
    getPersistenceStatus,
  );
  const theme = useAppStore((state) => state.settings.theme);
  const refreshStreaks = useAppStore((state) => state.refreshStreaks);

  useEffect(() => {
    if (persistenceStatus.state !== "ready") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, persistenceStatus.state]);

  useEffect(() => {
    if (persistenceStatus.state === "ready") refreshStreaks();
  }, [persistenceStatus.state, refreshStreaks]);

  if (persistenceStatus.state === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="font-pixel text-sm text-muted">Loading your saved tracker…</p>
      </main>
    );
  }

  if (persistenceStatus.state === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <section className="pixel-frame max-w-md space-y-4 p-6 text-center">
          <h1 className="text-xl">Your saved data could not be opened</h1>
          <p className="text-body">{persistenceStatus.message}</p>
          <button
            type="button"
            className="pixel-btn"
            onClick={() => void useAppStore.persist.rehydrate()}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Today />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
