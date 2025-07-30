import { WatchList } from "@/components/ui/watchlist/watchlist"

export default function WatchPage() {
  return (
    <div className="h-full">
      {/* Only show title on desktop since mobile shows full watchlist */}
      <div className="hidden lg:block mb-4">
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="text-sm text-muted-foreground">
          Monitor your favorite stocks and symbols
        </p>
      </div>
      {/* On mobile, the watchlist is already displayed by LayoutWrapper */}
      {/* No additional content needed */}
    </div>
  );
} 