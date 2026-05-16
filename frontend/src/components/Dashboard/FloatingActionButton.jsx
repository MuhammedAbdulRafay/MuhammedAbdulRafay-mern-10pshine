import { Plus } from "lucide-react";

function FloatingActionButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Create new note"
      className="pointer-events-auto absolute right-6 bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 to-black text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-110 active:scale-95 dark:from-white dark:to-neutral-200 dark:text-black dark:shadow-[0_8px_30px_rgba(255,255,255,0.15)] md:right-8 md:bottom-8"
    >
      <Plus className="h-6 w-6" strokeWidth={2.25} />
    </button>
  );
}

export default FloatingActionButton;
