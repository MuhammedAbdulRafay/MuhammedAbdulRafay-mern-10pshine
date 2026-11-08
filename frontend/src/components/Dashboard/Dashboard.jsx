import {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
  Component,
} from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

import {
  LayoutDashboard,
  Plus,
  Pin,
  Trash2,
  Moon,
  Sun,
  LogOut,
  Search,
  Pencil,
  PinOff,
  RotateCcw,
  Tag,
  FileText,
  LayoutGrid,
  List as ListIcon,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
} from "lucide-react";

// TipTap imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapUnderline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";

// ============================================
// STYLES: Rich Text Prose Styles (inline for MERN compatibility)
// ============================================

const proseStyles = `
  .note-content strong,
  .note-content b { font-weight: 700 !important; }
  .note-content em,
  .note-content i { font-style: italic !important; }
  .note-content u { text-decoration: underline !important; }
  .note-content s,
  .note-content del,
  .note-content strike { text-decoration: line-through !important; }
  .note-content mark { background-color: #fef08a !important; padding: 0.125em 0.25em; border-radius: 0.125rem; }
  .note-content h1 { font-size: 1.5em !important; font-weight: 700 !important; margin-bottom: 0.5em; }
  .note-content h2 { font-size: 1.25em !important; font-weight: 600 !important; margin-bottom: 0.5em; }
  .note-content h3 { font-size: 1.125em !important; font-weight: 600 !important; margin-bottom: 0.5em; }
  .note-content ul { list-style-type: disc !important; padding-left: 1.5em !important; margin: 0.5em 0; }
  .note-content ol { list-style-type: decimal !important; padding-left: 1.5em !important; margin: 0.5em 0; }
  .note-content li { margin: 0.25em 0; display: list-item !important; }
  .note-content p { margin: 0.25em 0; }
  .note-content-preview,
  .note-content-preview p {
    font-family: inherit;
    font-size: 13px !important;
    line-height: 1.5 !important;
    font-weight: 500 !important;
    margin: 0 0 0.35em 0;
  }
  .note-content-preview p:last-child { margin-bottom: 0; }
  .note-content-preview h1,
  .note-content-preview h2,
  .note-content-preview h3 {
    font-size: 13px !important;
    font-weight: 500 !important;
    line-height: 1.5 !important;
    margin: 0 0 0.35em 0 !important;
  }
  .note-content-preview em,
  .note-content-preview i { font-style: italic !important; font-weight: 500 !important; }
  .note-content-preview strong,
  .note-content-preview b { font-weight: 600 !important; }
  .note-content hr { border: none; border-top: 1px solid currentColor; opacity: 0.2; margin: 1em 0; }
  .note-content [style*="text-align: center"] { text-align: center !important; }
  .note-content [style*="text-align: right"] { text-align: right !important; }
  .note-content [style*="text-align: justify"] { text-align: justify !important; }
  .note-content.dark-mode mark { background-color: #854d0e !important; color: #fef08a !important; }
  
  /* TipTap editor styles */
  .ProseMirror { outline: none; }
  .ProseMirror p.is-editor-empty:first-child::before {
    color: #9ca3af;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
  .ProseMirror strong { font-weight: 700; }
  .ProseMirror em { font-style: italic; }
  .ProseMirror u { text-decoration: underline; }
  .ProseMirror s { text-decoration: line-through; }
  .ProseMirror mark { background-color: #fef08a; padding: 0.125em 0.25em; border-radius: 0.125rem; }
  .ProseMirror h1 { font-size: 1.5em; font-weight: 700; margin-bottom: 0.5em; }
  .ProseMirror h2 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; }
  .ProseMirror h3 { font-size: 1.125em; font-weight: 600; margin-bottom: 0.5em; }
  .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
  .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
  .ProseMirror li { display: list-item; }
  .ProseMirror hr { border: none; border-top: 1px solid #e5e7eb; margin: 1em 0; }
`;

// ============================================
// CONTEXT: Notes Management
// ============================================

const NotesContext = createContext(null);

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}

function normalizeNote(note) {
  const id = note._id?.toString?.() ?? note.id;
  return {
    ...note,
    id,
    _id: id,
    isPinned: note.isPinned ?? false,
    tags: note.tags ?? [],
    isDeleted: note.isDeleted ?? false,
  };
}

function NotesProvider({ children, initialNotes = [] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  useEffect(() => {
    if (initialNotes && initialNotes.length > 0) {
      setNotes(initialNotes.map(normalizeNote));
    }
  }, [initialNotes]);

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoadingNotes(true);
      try {
        const response = await api.get("/notes");
        const list = response.data.notes ?? [];
        setNotes(list.map(normalizeNote));
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setIsLoadingNotes(false);
      }
    };
    fetchNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    let result = notes.filter((note) => !note.isDeleted);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query)
      );
    }

    return [...result].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const dateA = new Date(a.createdAt || a.updatedAt || 0);
      const dateB = new Date(b.createdAt || b.updatedAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [notes, searchQuery]);

  const addNote = useCallback(async (noteData) => {
    try {
      const response = await api.post("/notes", {
        title: noteData.title,
        content: noteData.content,
      });
      const created = normalizeNote(response.data.note);
      const withExtras = {
        ...created,
        tags: noteData.tags || [],
        isPinned: noteData.isPinned || false,
      };
      setNotes((prev) => [withExtras, ...prev]);
      return withExtras;
    } catch (error) {
      console.error("Failed to add note:", error);
      throw error;
    }
  }, []);

  const updateNote = useCallback(async (id, noteData) => {
    try {
      const response = await api.put(`/notes/${id}`, {
        title: noteData.title,
        content: noteData.content,
      });
      const updated = normalizeNote(response.data.note);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id || n._id === id
            ? {
                ...n,
                ...updated,
                tags: noteData.tags ?? n.tags,
                isPinned: noteData.isPinned ?? n.isPinned,
              }
            : n
        )
      );
    } catch (error) {
      console.error("Failed to update note:", error);
      throw error;
    }
  }, []);

  const deleteNote = useCallback(
    async (id) => {
      try {
        await api.delete(`/notes/${id}`);
        const noteToDelete = notes.find((n) => n.id === id || n._id === id);
        if (noteToDelete) {
          setTrashedNotes((trashed) => {
            if (trashed.some((n) => n.id === id || n._id === id)) {
              return trashed;
            }
            return [{ ...noteToDelete, isDeleted: true }, ...trashed];
          });
          setNotes((prev) => prev.filter((n) => n.id !== id && n._id !== id));
        }
      } catch (error) {
        console.error("Failed to delete note:", error);
        throw error;
      }
    },
    [notes]
  );

  const togglePin = useCallback((id) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id || n._id === id ? { ...n, isPinned: !n.isPinned } : n
      )
    );
  }, []);

  const restoreNote = useCallback(
    (id) => {
      const noteToRestore = trashedNotes.find(
        (n) => n.id === id || n._id === id
      );
      if (noteToRestore) {
        setNotes((prev) => {
          if (prev.some((n) => n.id === id || n._id === id)) {
            return prev;
          }
          return [{ ...noteToRestore, isDeleted: false }, ...prev];
        });
        setTrashedNotes((trashed) =>
          trashed.filter((n) => n.id !== id && n._id !== id)
        );
      }
    },
    [trashedNotes]
  );

  const permanentlyDeleteNote = useCallback((id) => {
    setTrashedNotes((prev) => prev.filter((n) => n.id !== id && n._id !== id));
  }, []);

  const getNoteById = useCallback(
    (id) => notes.find((n) => n.id === id || n._id === id),
    [notes]
  );

  const getPinnedNotes = useCallback(
    () => notes.filter((n) => n.isPinned && !n.isDeleted),
    [notes]
  );

  return (
    <NotesContext.Provider
      value={{
        notes,
        trashedNotes,
        searchQuery,
        setSearchQuery,
        filteredNotes,
        addNote,
        updateNote,
        deleteNote,
        togglePin,
        restoreNote,
        permanentlyDeleteNote,
        getNoteById,
        getPinnedNotes,
        setNotes,
        isLoadingNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

// ============================================
// UTILITY: Safe Date Formatter
// ============================================

function formatDate(dateValue) {
  if (!dateValue) return "No date";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "No date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "No date";
  }
}

// ============================================
// COMPONENT: Sidebar
// ============================================

function Sidebar({
  isDarkMode,
  onToggleDarkMode,
  onCreateNote,
  currentView,
  onNavigate,
  onLogout,
}) {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "pinned", icon: Pin, label: "Pinned" },
    { id: "trash", icon: Trash2, label: "Trash" },
  ];

  const shellBg = isDarkMode ? "bg-white" : "bg-[#070707]";
  const accentBg = isDarkMode ? "bg-[#070707]" : "bg-white";
  const accentText = isDarkMode ? "text-white" : "text-[#070707]";
  const mutedIcon = isDarkMode
    ? "text-neutral-500 hover:bg-neutral-100 hover:text-[#070707]"
    : "text-white/60 hover:bg-white/10 hover:text-white";

  return (
    <aside
      className={`flex h-full w-50 flex-shrink-0 flex-col justify-between rounded-2xl px-4 pt-3 pb-4 ${shellBg}`}
    >
      {/* Top: Logo, New Note, Navigation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-center py-1">
          <img
            src="/logo.png"
            alt="Draft"
            className="h-30 w-30 shrink-0 object-contain brightness-0 invert dark:invert-0"
          />
        </div>

        {/* Create Note Button */}
        <motion.button
          onClick={onCreateNote}
          className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 transition-all duration-200 ${accentBg} ${accentText} hover:opacity-90`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title="New Note"
        >
          <Plus className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">New Note</span>
        </motion.button>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex h-11 w-full items-center gap-3 rounded-xl px-3 transition-all duration-200 ${
                  isActive ? `${accentBg} ${accentText}` : mutedIcon
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title={item.label}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2">
        <motion.button
          onClick={onToggleDarkMode}
          className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 transition-all duration-200 ${mutedIcon}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title={isDarkMode ? "Light mode" : "Dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 shrink-0" />
          ) : (
            <Moon className="h-5 w-5 shrink-0" />
          )}
          <span className="text-sm font-medium">
            {isDarkMode ? "Light mode" : "Dark mode"}
          </span>
        </motion.button>

        <motion.button
          onClick={onLogout}
          className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 transition-all duration-200 ${mutedIcon}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title="Logout"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}

// ============================================
// COMPONENT: Header
// ============================================

function Header({ username, avatarUrl, isDarkMode, onProfileClick }) {
  const { searchQuery, setSearchQuery } = useNotes();

  const shellBg = isDarkMode ? "bg-white" : "bg-[#070707]";
  const labelText = isDarkMode ? "text-[#070707]" : "text-white";
  const avatarBg = isDarkMode ? "bg-black text-white" : "bg-white text-[#070707]";
  const searchBg = isDarkMode ? "bg-[#070707] text-white" : "bg-white text-slate-900";
  const searchPlaceholder = isDarkMode
    ? "placeholder:text-white/50"
    : "placeholder:text-slate-400";
  const searchIcon = isDarkMode ? "text-white/50" : "text-slate-400";
  const searchRing = isDarkMode
    ? "focus:ring-[#070707]/20"
    : "focus:ring-white/20";

  return (
    <header
      className={`flex h-20 flex-shrink-0 items-center rounded-2xl px-6 ${shellBg}`}
    >
      {/* User Info */}
      <button
        type="button"
        onClick={onProfileClick}
        className="flex items-center gap-3 rounded-xl transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current"
        aria-label="Open profile"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${avatarBg}`}
          >
            {username ? username.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <span className={`text-sm font-medium ${labelText}`}>
          {username || "User"}
        </span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search Bar */}
      <div className="relative w-full max-w-xl">
        <Search
          className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${searchIcon}`}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className={`h-11 w-full rounded-lg pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:ring-2 ${searchBg} ${searchPlaceholder} ${searchRing}`}
        />
      </div>
    </header>
  );
}

// ============================================
// COMPONENT: NoteCard
// ============================================

function NoteCard({
  note,
  onEdit,
  onPin,
  onDelete,
  onRestore,
  isTrash = false,
  isListView = false,
  isDarkMode = false,
}) {
  const noteDate = note.createdAt || note.updatedAt || note.date;

  const cardBg = isDarkMode
    ? "bg-note-card-dark border-note-card-dark-border hover:border-note-card-dark-border"
    : "bg-note-card border-note-card-border hover:border-note-card-border";
  const titleColor = isDarkMode ? "text-white" : "text-slate-900";
  const previewColor = isDarkMode ? "text-neutral-300" : "text-[#686868]";
  const dateColor = isDarkMode ? "text-neutral-500" : "text-neutral-400";
  const tagBg = isDarkMode
    ? "bg-note-card-dark-tag text-neutral-200"
    : "bg-note-card-tag text-stone-600";
  const buttonBg = isDarkMode
    ? "bg-white text-neutral-900 hover:bg-white/90"
    : "bg-slate-900 text-white hover:bg-slate-700";

  if (isListView) {
    return (
      <motion.div
        className={`group relative flex w-full min-w-0 items-center gap-4 rounded-3xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${cardBg}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 2 }}
        layout
      >
        {note.isPinned && !isTrash && (
          <div className="flex-shrink-0">
            <Pin
              className={`h-4 w-4 ${
                isDarkMode
                  ? "fill-neutral-600 text-neutral-400"
                  : "fill-slate-200 text-slate-500"
              }`}
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3
            className={`truncate font-sans text-base font-bold tracking-tight ${titleColor}`}
          >
            {note.title || "Untitled"}
          </h3>
          <div
            className={`note-content note-content-preview line-clamp-2 font-sans text-[13px] font-medium leading-normal ${previewColor} ${
              isDarkMode ? "dark-mode" : ""
            }`}
            dangerouslySetInnerHTML={{
              __html: note.content || "<p>No content</p>",
            }}
          />
          {note.tags && note.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {note.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${tagBg}`}
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <span className={`flex-shrink-0 text-xs ${dateColor}`}>
          {formatDate(noteDate)}
        </span>

        <div className="flex flex-shrink-0 items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {isTrash ? (
            <>
              <motion.button
                onClick={() => onRestore?.(note)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${buttonBg}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Restore note"
              >
                <RotateCcw className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={() => onDelete?.(note)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${buttonBg} hover:bg-red-500`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Delete permanently"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={() => onEdit?.(note)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${buttonBg}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Edit note"
              >
                <Pencil className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={() => onPin?.(note)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${buttonBg}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={note.isPinned ? "Unpin note" : "Pin note"}
              >
                {note.isPinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </motion.button>
              <motion.button
                onClick={() => onDelete?.(note)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${buttonBg} hover:bg-red-500`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      className={`group relative flex h-full min-h-[70px] flex-col rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md ${cardBg}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      layout
    >
      {note.isPinned && !isTrash && (
        <div className="absolute right-4 top-4">
          <Pin
            className={`h-4 w-4 ${
              isDarkMode
                ? "fill-neutral-600 text-neutral-400"
                : "fill-slate-200 text-slate-500"
            }`}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2">
        <h3
          className={`line-clamp-2 font-sans text-lg font-bold tracking-tight ${titleColor}`}
        >
          {note.title || "Untitled"}
        </h3>
        <div
          className={`note-content note-content-preview line-clamp-8 flex-1 font-sans text-[13px] font-medium leading-normal ${previewColor} ${
            isDarkMode ? "dark-mode" : ""
          }`}
          dangerouslySetInnerHTML={{
            __html: note.content || "<p>No content</p>",
          }}
        />
        {note.tags && note.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {note.tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${tagBg}`}
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className={`text-xs ${dateColor}`}>{formatDate(noteDate)}</span>

        <div className="flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {isTrash ? (
            <>
              <motion.button
                onClick={() => onRestore?.(note)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${buttonBg}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Restore note"
              >
                <RotateCcw className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={() => onDelete?.(note)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${buttonBg} hover:bg-red-500`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Delete permanently"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={() => onEdit?.(note)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${buttonBg}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Edit note"
              >
                <Pencil className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={() => onPin?.(note)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${buttonBg}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={note.isPinned ? "Unpin note" : "Pin note"}
              >
                {note.isPinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </motion.button>
              <motion.button
                onClick={() => onDelete?.(note)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${buttonBg} hover:bg-red-500`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// COMPONENT: NotesGrid
// ============================================

function NotesGrid({
  notes,
  onEdit,
  onPin,
  onDelete,
  onRestore,
  isTrash = false,
  viewMode = "grid",
  emptyMessage = "No notes yet",
  emptyIcon,
  isDarkMode = false,
}) {
  if (!notes || notes.length === 0) {
    return (
      <div
        className={`flex h-64 flex-col items-center justify-center ${
          isDarkMode ? "text-neutral-500" : "text-slate-400"
        }`}
      >
        {emptyIcon}
        <p className="mt-4 text-center text-sm">{emptyMessage}</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex w-full flex-col gap-4">
        {notes.map((note, index) => (
          <motion.div
            key={note.id || note._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            className="w-full min-w-0"
          >
            <NoteCard
              note={note}
              onEdit={onEdit}
              onPin={onPin}
              onDelete={onDelete}
              onRestore={onRestore}
              isTrash={isTrash}
              isListView={true}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {notes.map((note, index) => (
        <motion.div
          key={note.id || note._id || index}
          className="h-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
        >
          <NoteCard
            note={note}
            onEdit={onEdit}
            onPin={onPin}
            onDelete={onDelete}
            onRestore={onRestore}
            isTrash={isTrash}
            isListView={false}
            isDarkMode={isDarkMode}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// COMPONENT: FloatingActionButton
// ============================================

function FloatingActionButton({ onClick, isDarkMode }) {
  return (
    <motion.button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors ${
        isDarkMode
          ? "bg-white text-neutral-900 hover:bg-white/90"
          : "bg-slate-900 text-white hover:bg-slate-700"
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      title="Create new note"
    >
      <Plus className="h-6 w-6" />
    </motion.button>
  );
}

// ============================================
// COMPONENT: Toolbar Button (for TipTap)
// ============================================

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
  isDarkMode = false,
}) {
  const activeClass = isDarkMode
    ? "rounded-lg bg-white text-neutral-900"
    : "rounded-lg bg-slate-900 text-white";
  const inactiveClass = isDarkMode
    ? "rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-white"
    : "rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 w-7 items-center justify-center transition-all duration-150 ${
        isActive ? activeClass : inactiveClass
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
    >
      {children}
    </motion.button>
  );
}

function ToolbarDivider({ isDarkMode }) {
  return (
    <div
      className={`mx-1.5 h-5 w-px ${
        isDarkMode ? "bg-neutral-600" : "bg-slate-200"
      }`}
    />
  );
}

// ============================================
// COMPONENT: NoteEditor with TipTap
// ============================================

class NoteEditorErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/60 p-6">
          <p className="text-center text-sm text-white">
            Could not open the note editor. Please refresh and try again.
          </p>
          <button
            type="button"
            onClick={this.props.onClose}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900"
          >
            Close
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NoteEditor({
  isOpen,
  onClose,
  onSave,
  initialNote,
  mode = "create",
  isDarkMode = false,
}) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [lastEdited, setLastEdited] = useState(null);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        underline: false,
      }),
      TiptapUnderline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      Highlight.configure({ multicolor: true }),
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: "",
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[280px] leading-relaxed ${
          isDarkMode ? "prose-invert" : ""
        }`,
      },
    },
    onUpdate: () => {
      setLastEdited(new Date());
    },
  });

  useEffect(() => {
    if (isOpen && initialNote) {
      setTitle(initialNote.title || "");
      editor?.commands.setContent(initialNote.content || "");
      setTags(initialNote.tags || []);
    } else if (isOpen && !initialNote) {
      setTitle("");
      editor?.commands.setContent("");
      setTags([]);
    }
  }, [isOpen, initialNote, editor]);

  const handleClose = useCallback(() => {
    setTitle("");
    editor?.commands.setContent("");
    setTags([]);
    setSaveStatus("idle");
    onClose();
  }, [editor, onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  const handleSave = useCallback(() => {
    if (!title.trim()) return;
    setSaveStatus("saving");
    const content = editor?.getHTML() || "";
    setTimeout(() => {
      onSave({ title: title.trim(), content, tags });
      setSaveStatus("saved");
      setTimeout(() => {
        setTitle("");
        editor?.commands.setContent("");
        setTags([]);
        setSaveStatus("idle");
        onClose();
      }, 500);
    }, 300);
  }, [title, editor, onSave, onClose, tags]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const formatLastEdited = () => {
    if (!lastEdited) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastEdited.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    return `${Math.floor(diff / 3600)} hours ago`;
  };

  if (!isOpen) return null;

  if (!editor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <p className="text-white">Loading editor...</p>
      </div>
    );
  }

  const modalBg = isDarkMode ? "bg-neutral-800" : "bg-white";
  const inputBg = isDarkMode
    ? "bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-400"
    : "bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400";
  const toolbarBg = isDarkMode
    ? "bg-neutral-800 border-neutral-700"
    : "bg-white border-slate-200";
  const textColor = isDarkMode ? "text-white" : "text-slate-900";
  const mutedText = isDarkMode ? "text-neutral-400" : "text-slate-500";
  const tagBg = isDarkMode
    ? "bg-neutral-700 text-neutral-200"
    : "bg-slate-100 text-slate-700";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={`fixed inset-0 z-50 backdrop-blur-sm ${
              isDarkMode ? "bg-black/60" : "bg-black/50"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className={`fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg shadow-2xl ${modalBg}`}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
          >
            {/* Close button */}
            <motion.button
              onClick={handleClose}
              className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md transition-colors ${mutedText} hover:bg-slate-100 hover:text-slate-900 ${
                isDarkMode ? "hover:bg-neutral-700 hover:text-white" : ""
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-4 w-4" />
            </motion.button>

            {/* Title Input */}
            <div className="px-6 pb-3 pt-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Note"
                className={`w-full rounded-md border px-4 py-3 text-base font-medium outline-none transition-all focus:ring-1 ${inputBg}`}
                autoFocus
              />
            </div>

            {/* Toolbar */}
            <div
              className={`sticky top-0 z-10 border-b px-4 py-2.5 ${toolbarBg}`}
            >
              {/* Row 1 */}
              <div className="mb-2 flex flex-wrap items-center gap-0.5">
                {/* Headings */}
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  isActive={editor.isActive("heading", { level: 1 })}
                  title="Heading 1"
                  isDarkMode={isDarkMode}
                >
                  <span className="text-[10px] font-bold">H₁</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  isActive={editor.isActive("heading", { level: 2 })}
                  title="Heading 2"
                  isDarkMode={isDarkMode}
                >
                  <span className="text-[10px] font-bold">H₂</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  isActive={editor.isActive("heading", { level: 3 })}
                  title="Heading 3"
                  isDarkMode={isDarkMode}
                >
                  <span className="text-[10px] font-bold">H₃</span>
                </ToolbarButton>

                <ToolbarDivider isDarkMode={isDarkMode} />

                {/* Text Formatting */}
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  isActive={editor.isActive("bold")}
                  title="Bold"
                  isDarkMode={isDarkMode}
                >
                  <Bold className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive("italic")}
                  title="Italic"
                  isDarkMode={isDarkMode}
                >
                  <Italic className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  isActive={editor.isActive("underline")}
                  title="Underline"
                  isDarkMode={isDarkMode}
                >
                  <Underline className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  isActive={editor.isActive("strike")}
                  title="Strikethrough"
                  isDarkMode={isDarkMode}
                >
                  <Strikethrough className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarDivider isDarkMode={isDarkMode} />

                {/* Highlighter */}
                <ToolbarButton
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .toggleHighlight({ color: "#fef08a" })
                      .run()
                  }
                  isActive={editor.isActive("highlight")}
                  title="Highlighter"
                  isDarkMode={isDarkMode}
                >
                  <Highlighter className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarDivider isDarkMode={isDarkMode} />

                {/* Lists */}
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  isActive={editor.isActive("bulletList")}
                  title="Bullet List"
                  isDarkMode={isDarkMode}
                >
                  <List className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  isActive={editor.isActive("orderedList")}
                  title="Numbered List"
                  isDarkMode={isDarkMode}
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                </ToolbarButton>
              </div>

              {/* Row 2 */}
              <div className="flex flex-wrap items-center gap-0.5">
                {/* Divider */}
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                  title="Horizontal Line"
                  isDarkMode={isDarkMode}
                >
                  <Minus className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarDivider isDarkMode={isDarkMode} />

                {/* Alignment */}
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                  isActive={editor.isActive({ textAlign: "left" })}
                  title="Align Left"
                  isDarkMode={isDarkMode}
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                  }
                  isActive={editor.isActive({ textAlign: "center" })}
                  title="Align Center"
                  isDarkMode={isDarkMode}
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                  }
                  isActive={editor.isActive({ textAlign: "right" })}
                  title="Align Right"
                  isDarkMode={isDarkMode}
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("justify").run()
                  }
                  isActive={editor.isActive({ textAlign: "justify" })}
                  title="Justify"
                  isDarkMode={isDarkMode}
                >
                  <AlignJustify className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarDivider isDarkMode={isDarkMode} />

                {/* History */}
                <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  title="Undo"
                  isDarkMode={isDarkMode}
                >
                  <Undo className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  title="Redo"
                  isDarkMode={isDarkMode}
                >
                  <Redo className="h-3.5 w-3.5" />
                </ToolbarButton>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mx-auto max-w-xl">
                <EditorContent
                  editor={editor}
                  className={`min-h-[250px] ${textColor}`}
                />
              </div>
            </div>

            {/* Footer */}
            <div className={`border-t px-6 py-4 ${toolbarBg}`}>
              {/* Tags */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${tagBg}`}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className={`ml-1 ${mutedText} hover:${textColor}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag..."
                  className={`bg-transparent text-sm outline-none ${mutedText}`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className={`text-xs ${mutedText}`}>
                  {saveStatus === "saving" && "Saving..."}
                  {saveStatus === "saved" && "Saved"}
                  {saveStatus === "idle" &&
                    lastEdited &&
                    `Last edited ${formatLastEdited()}`}
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={handleClose}
                    className={`h-9 rounded-md border px-4 text-sm font-medium transition-colors ${
                      isDarkMode
                        ? "border-neutral-600 text-white hover:bg-neutral-700"
                        : "border-slate-200 text-slate-900 hover:bg-slate-100"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSave}
                    disabled={!title.trim() || saveStatus === "saving"}
                    className={`h-9 rounded-md px-4 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDarkMode
                        ? "bg-white text-neutral-900 hover:bg-white/90"
                        : "bg-slate-900 text-white hover:bg-slate-700"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {saveStatus === "saving"
                      ? "Saving..."
                      : mode === "create"
                      ? "Save Note"
                      : "Save Changes"}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// MAIN COMPONENT: Dashboard
// ============================================

export default function Dashboard({
  notes = [],
  onLogout = () => {},
  onNoteSave = () => {},
  onNoteDelete = () => {},
  onNoteUpdate = () => {},
  onTogglePin = () => {},
  initialView = "dashboard",
  onNavigate = () => {},
}) {
  const navigate = useNavigate();
  const { isDark: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const { user, clearUser } = useUser();
  const [currentView, setCurrentView] = useState(initialView);
  const [viewMode, setViewMode] = useState("grid");
  const [editingNote, setEditingNote] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleNavigate = (view) => {
    setCurrentView(view);
    onNavigate(view);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearUser();
    onLogout();
    navigate("/login");
  };

  const handleOpenProfile = () => {
    navigate("/profile");
  };

  const displayName = user?.name || user?.username || "User";
  const avatarUrl = user?.avatarUrl || user?.avatar;

  return (
    <NotesProvider initialNotes={notes}>
      <style dangerouslySetInnerHTML={{ __html: proseStyles }} />
      <DashboardContent
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        currentView={currentView}
        handleNavigate={handleNavigate}
        onLogout={handleLogout}
        displayName={displayName}
        avatarUrl={avatarUrl}
        viewMode={viewMode}
        setViewMode={setViewMode}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        isEditorOpen={isEditorOpen}
        setIsEditorOpen={setIsEditorOpen}
        onNoteSave={onNoteSave}
        onNoteUpdate={onNoteUpdate}
        onNoteDelete={onNoteDelete}
        onTogglePin={onTogglePin}
        onOpenProfile={handleOpenProfile}
      />
    </NotesProvider>
  );
}

function DashboardContent({
  isDarkMode,
  toggleDarkMode,
  currentView,
  handleNavigate,
  onLogout,
  displayName,
  avatarUrl,
  viewMode,
  setViewMode,
  editingNote,
  setEditingNote,
  isEditorOpen,
  setIsEditorOpen,
  onNoteSave,
  onNoteUpdate,
  onNoteDelete,
  onTogglePin,
  onOpenProfile,
}) {
  const {
    filteredNotes,
    trashedNotes,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    restoreNote,
    permanentlyDeleteNote,
    getPinnedNotes,
  } = useNotes();

  const handleCreateNote = async (noteData) => {
    try {
      const newNote = await addNote(noteData);
      onNoteSave(newNote, noteData);
    } catch {
      alert("Failed to save note. Please try again.");
    }
  };

  const handleEditNote = (note) => {
    setEditorMounted(true);
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleSaveEdit = async (noteData) => {
    if (!editingNote) return;
    const noteId = editingNote.id || editingNote._id;
    try {
      await updateNote(noteId, noteData);
      onNoteUpdate(noteId, noteData);
      setEditingNote(null);
    } catch {
      alert("Failed to update note. Please try again.");
    }
  };

  const handlePinNote = (note) => {
    const noteId = note.id || note._id;
    togglePin(noteId);
    onTogglePin(noteId, !note.isPinned);
  };

  const handleDeleteNote = async (note) => {
    const noteId = note.id || note._id;
    try {
      await deleteNote(noteId);
      onNoteDelete(noteId);
    } catch {
      alert("Failed to delete note. Please try again.");
    }
  };

  const handleRestoreNote = (note) => {
    const noteId = note.id || note._id;
    restoreNote(noteId);
  };

  const handlePermanentDelete = (note) => {
    const noteId = note.id || note._id;
    permanentlyDeleteNote(noteId);
  };

  const [editorMounted, setEditorMounted] = useState(false);

  const handleOpenEditor = () => {
    setEditorMounted(true);
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const getCurrentNotes = () => {
    switch (currentView) {
      case "pinned":
        return getPinnedNotes();
      case "trash":
        return trashedNotes;
      default:
        return filteredNotes;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case "pinned":
        return "Pinned Notes";
      case "trash":
        return "Trash";
      default:
        return "All Notes";
    }
  };

  const currentNotes = getCurrentNotes();
  const isTrashView = currentView === "trash";

  const mainBg = isDarkMode ? "bg-neutral-900" : "bg-white";
  const contentBg = isDarkMode ? "bg-neutral-900" : "bg-white";
  const titleColor = isDarkMode ? "text-white" : "text-slate-900";
  const subtitleColor = isDarkMode ? "text-neutral-400" : "text-slate-500";
  const buttonActiveBg = isDarkMode
    ? "bg-white text-neutral-900"
    : "bg-slate-900 text-white";
  const buttonInactiveBg = isDarkMode
    ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
    : "bg-white text-slate-500 hover:bg-slate-50";

  return (
    <div className={`flex h-screen w-full gap-4 p-4 ${mainBg}`}>
      {/* Sidebar */}
      <Sidebar
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onCreateNote={handleOpenEditor}
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        {/* Header */}
        <Header
          username={displayName}
          avatarUrl={avatarUrl}
          isDarkMode={isDarkMode}
          onProfileClick={onOpenProfile}
        />

        {/* Content Area */}
        <main
          className={`flex flex-1 flex-col gap-8 overflow-auto rounded-2xl p-6 ${contentBg}`}
        >
          {/* View Header */}
          <div className="flex shrink-0 items-start justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <h1 className={`text-2xl font-bold ${titleColor}`}>
                {getViewTitle()}
              </h1>
              <p className={`text-sm ${subtitleColor}`}>
                {currentNotes.length}{" "}
                {currentNotes.length === 1 ? "note" : "notes"}
              </p>
            </div>

            {!isTrashView && (
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setViewMode("grid")}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    viewMode === "grid" ? buttonActiveBg : buttonInactiveBg
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode("list")}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    viewMode === "list" ? buttonActiveBg : buttonInactiveBg
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="List view"
                >
                  <ListIcon className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="w-full min-w-0">
          <NotesGrid
            notes={currentNotes}
            onEdit={handleEditNote}
            onPin={handlePinNote}
            onDelete={isTrashView ? handlePermanentDelete : handleDeleteNote}
            onRestore={handleRestoreNote}
            isTrash={isTrashView}
            viewMode={viewMode}
            isDarkMode={isDarkMode}
            emptyMessage={
              isTrashView
                ? "Trash is empty"
                : currentView === "pinned"
                ? "No pinned notes"
                : "No notes yet. Click the + button to create your first note."
            }
            emptyIcon={
              isTrashView ? (
                <Trash2
                  className={`h-12 w-12 ${
                    isDarkMode ? "text-neutral-600" : "text-slate-300"
                  }`}
                />
              ) : currentView === "pinned" ? (
                <Pin
                  className={`h-12 w-12 ${
                    isDarkMode ? "text-neutral-600" : "text-slate-300"
                  }`}
                />
              ) : (
                <FileText
                  className={`h-12 w-12 ${
                    isDarkMode ? "text-neutral-600" : "text-slate-300"
                  }`}
                />
              )
            }
          />
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      {!isTrashView && (
        <FloatingActionButton onClick={handleOpenEditor} isDarkMode={isDarkMode} />
      )}

      {/* Note Editor Modal — mount once on first open so TipTap hooks stay stable */}
      {editorMounted && (
        <NoteEditorErrorBoundary onClose={handleCloseEditor}>
          <NoteEditor
            isOpen={isEditorOpen}
            onClose={handleCloseEditor}
            onSave={editingNote ? handleSaveEdit : handleCreateNote}
            initialNote={editingNote}
            mode={editingNote ? "edit" : "create"}
            isDarkMode={isDarkMode}
          />
        </NoteEditorErrorBoundary>
      )}
    </div>
  );
}

// Export individual components for flexibility
export {
  Sidebar,
  Header,
  NoteCard,
  NotesGrid,
  FloatingActionButton,
  NoteEditor,
  NotesProvider,
  formatDate,
};
