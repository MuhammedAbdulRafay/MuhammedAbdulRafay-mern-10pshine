import { MessageCircle, Plus, Search, Sparkles } from "lucide-react";

const pillButtonClass =
  "inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-black dark:text-white";

function Header({ userName, userInitial, searchQuery, onSearchChange }) {
  const displayName = userName || "Guest User";
  const initial =
    userInitial ||
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <header className="box-border flex min-h-[5.75rem] w-full min-w-0 shrink-0 items-center rounded-[28px] bg-black px-5 py-5 dark:bg-white sm:min-h-[6rem] sm:px-6 md:py-6 md:px-8">
      <div className="relative flex w-full min-w-0 items-center justify-between">
        {/* Left */}
        <div className="relative z-10 flex min-w-0 max-w-[40%] shrink-0 items-center gap-3 sm:max-w-none">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black dark:bg-black dark:text-white"
            aria-hidden
          >
            {initial}
          </div>
          <span className="hidden min-w-0 truncate text-sm font-medium text-white sm:inline dark:text-black md:text-base">
            {displayName}
          </span>
        </div>

        {/* Search: true viewport center of header */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1] w-[min(420px,calc(100%-10rem))] min-w-[10rem] -translate-x-1/2 -translate-y-1/2 sm:w-[min(420px,calc(100%-14rem))] md:w-[min(420px,calc(100%-18rem))]">
          <div className="pointer-events-auto relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400"
              strokeWidth={2}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search anything..."
              className="h-11 w-full rounded-full border border-neutral-200/80 bg-white pr-4 pl-11 text-sm text-neutral-800 placeholder:text-neutral-400 shadow-sm outline-none transition-shadow focus:border-neutral-300 focus:ring-2 focus:ring-neutral-200/60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* Right — flush toward header trailing edge */}
        <div className="relative z-10 flex shrink-0 items-center justify-end gap-2">
          <button type="button" className={pillButtonClass}>
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button type="button" className={pillButtonClass}>
            <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            <Sparkles
              className="h-3.5 w-3.5 shrink-0 text-amber-500"
              strokeWidth={2}
            />
            <span className="hidden lg:inline">Ask Your Notes</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
