import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import NoteCard from "./NoteCard";
import { splitIntoColumns, useColumnCount } from "./hooks/useColumnCount";

function NotesGrid({ notes, onEditNote, loading }) {
  const count = notes.length;
  const columnCount = useColumnCount();

  const columns = useMemo(
    () => splitIntoColumns(notes, columnCount),
    [notes, columnCount],
  );

  return (
    <section className="w-full min-w-0 pt-8 md:pt-10">
      <div className="mb-10 flex w-full min-w-0 items-start justify-between gap-4 pb-1 sm:mb-12">
        <div className="min-w-0 pr-6">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            All Notes
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {loading ? "Loading…" : `${count} Note${count === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex shrink-0 items-center gap-1 pt-1 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          See All
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-600 dark:border-t-white" />
          <p className="mt-4 text-sm">Loading your notes…</p>
        </div>
      ) : count === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-400/65 bg-[#F3F4F6] py-24 dark:border-neutral-600 dark:bg-neutral-800/80">
          <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200">
            No notes yet
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Create your first note with the + button
          </p>
        </div>
      ) : (
        <div
          className="grid w-full min-w-0 gap-5"
          style={{
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((columnNotes, columnIndex) => (
            <div
              key={`masonry-col-${columnIndex}`}
              className="flex min-w-0 flex-col gap-5"
            >
              {columnNotes.map((note) => (
                <NoteCard
                  key={note.id || note._id}
                  note={note}
                  onEdit={onEditNote}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default NotesGrid;
