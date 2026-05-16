import { DEMO_NOTES } from "../data/demoNotes";

export function mapApiNoteToCard(note) {
  const content =
    typeof note.content === "string"
      ? note.content
      : note.content?.text || "";

  const preview =
    content.length > 220 ? `${content.slice(0, 220).trim()}…` : content.trim();

  return {
    id: note._id,
    _id: note._id,
    title: note.title || "Untitled",
    preview: preview || undefined,
  };
}

export function resolveDisplayNotes(apiNotes, useDemoFallback = true) {
  if (apiNotes?.length > 0) {
    return apiNotes.map(mapApiNoteToCard);
  }
  return useDemoFallback ? DEMO_NOTES : [];
}

export function filterNotes(notes, query) {
  const q = query.trim().toLowerCase();
  if (!q) return notes;

  return notes.filter((note) => {
    const haystack = [
      note.title,
      note.preview,
      ...(note.bullets || []),
      ...(note.listItems || []),
      ...(note.checklist || []).map((item) => item.text),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
