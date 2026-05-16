import {
  LogOut,
  Moon,
  NotepadText,
  Pin,
  SquarePen,
  Sun,
  Trash2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const navButtonClass =
  "flex h-11 w-11 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-white/10 hover:text-white dark:text-neutral-500 dark:hover:bg-black/10 dark:hover:text-black";

function Sidebar({ onNewNote, onPinned, onTrash, onLogout }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside className="box-border row-span-2 flex w-20 min-w-20 max-w-20 shrink-0 flex-col items-center justify-between self-stretch rounded-[28px] bg-black px-2 py-6 dark:bg-white">
      <nav className="flex flex-col items-center gap-2">
        <button
          type="button"
          className={`${navButtonClass} bg-white/10 text-white dark:bg-black/10 dark:text-black`}
          aria-label="Notes home"
        >
          <NotepadText className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          className={navButtonClass}
          aria-label="New note"
          onClick={onNewNote}
        >
          <SquarePen className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          className={navButtonClass}
          aria-label="Pinned notes"
          onClick={onPinned}
        >
          <Pin className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          className={navButtonClass}
          aria-label="Trash"
          onClick={onTrash}
        >
          <Trash2 className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </nav>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          className={`${navButtonClass} ${isDark ? "text-amber-400 dark:text-amber-500" : ""}`}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
        >
          {isDark ? (
            <Sun className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Moon className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>

        <button
          type="button"
          className={navButtonClass}
          aria-label="Log out"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
