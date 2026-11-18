import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="checker flex h-28 w-28 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface text-6xl shadow-pixel">
          <span className="sprite animate-bob">🧭</span>
        </div>
        <span className="absolute -bottom-2 -right-2 rounded-pixel border-[3px] border-edge bg-coral px-2 py-0.5 font-pixel text-xs font-bold text-white shadow-pixel-sm">
          404
        </span>
      </div>

      <p className="pixel-label text-muted">Off the map</p>
      <h1 className="mt-1 text-3xl sm:text-4xl">Page Not Found</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Looks like you wandered into uncharted pixel wilderness. There are no snacks or quests here!
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <PixelButton variant="primary" size="md">
            <Home size={15} /> Back to Today
          </PixelButton>
        </Link>
        <Link to="/diary">
          <PixelButton variant="ghost" size="md">
            <Compass size={15} /> Go to Diary
          </PixelButton>
        </Link>
      </div>
    </div>
  );
}
