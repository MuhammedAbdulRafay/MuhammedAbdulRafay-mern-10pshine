import { Check, Pencil, X } from "lucide-react";

function NoteCard({ note, onEdit }) {
  const noteId = note.id || note._id;

  return (
    <article
      className="group relative w-full shrink-0 rounded-3xl border border-neutral-400/35 bg-[#F3F4F6] p-6 shadow-[0_1px_4px_rgba(15,23,42,0.07)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:border-white/[0.08] dark:bg-neutral-800 dark:shadow-[0_1px_3px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
    >
      <h3 className="mb-3 text-[15px] leading-snug font-semibold text-neutral-900 dark:text-neutral-50">
        {note.title}
      </h3>

      {note.preview && !note.link && (
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {note.preview}
        </p>
      )}

      {note.link && (
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {note.preview}{" "}
          <a
            href={note.link.href}
            className="font-medium text-neutral-900 underline decoration-neutral-400 underline-offset-2 dark:text-neutral-200"
          >
            {note.link.label}
          </a>
        </p>
      )}

      {note.bullets && note.bullets.length > 0 && (
        <ul className="space-y-2">
          {note.bullets.map((item, index) => (
            <li
              key={`${noteId}-bullet-${index}`}
              className="flex items-start gap-2.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {note.checklist && note.checklist.length > 0 && (
        <ul className="space-y-2.5">
          {note.checklist.map((item, index) => (
            <li
              key={`${noteId}-check-${index}`}
              className="flex items-start gap-2.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              {item.checked ? (
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                  strokeWidth={2.5}
                />
              ) : (
                <X
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                  strokeWidth={2.5}
                />
              )}
              <span
                className={
                  item.checked ? "text-neutral-500 line-through dark:text-neutral-500" : ""
                }
              >
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      )}

      {note.listItems && note.listItems.length > 0 && (
        <ul className="space-y-2">
          {note.listItems.map((item, index) => (
            <li
              key={`${noteId}-list-${index}`}
              className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onEdit?.(noteId)}
        className="absolute right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-black/5 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
        aria-label={`Edit ${note.title}`}
      >
        <Pencil className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </article>
  );
}

export default NoteCard;
