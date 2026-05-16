import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "../../context/ThemeContext";
import api from "../../services/api";
import FloatingActionButton from "./FloatingActionButton";
import Header from "./Header";
import NotesGrid from "./NotesGrid";
import Sidebar from "./Sidebar";
import { filterNotes, resolveDisplayNotes } from "./utils/noteMappers";

function DashboardShell() {
  const [apiNotes, setApiNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const userName =
    storedUser?.name || storedUser?.username || "Mahdi Jalili";

  useEffect(() => {
    let cancelled = false;

    async function fetchNotes() {
      try {
        setLoading(true);
        const response = await api.get("/notes");
        if (!cancelled) {
          setApiNotes(response.data.notes || []);
        }
      } catch {
        if (!cancelled) {
          setApiNotes([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNotes();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayNotes = useMemo(
    () => resolveDisplayNotes(apiNotes),
    [apiNotes],
  );

  const filteredNotes = useMemo(
    () => filterNotes(displayNotes, searchQuery),
    [displayNotes, searchQuery],
  );

  const handleCreateNote = () => navigate("/notes/new");
  const handleEditNote = (noteId) => navigate(`/notes/${noteId}/edit`);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      className="box-border flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-neutral-100 font-sans dark:bg-neutral-950"
      style={{
        paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        paddingLeft: "calc(1rem + env(safe-area-inset-left, 0px))",
        paddingRight: "calc(1rem + env(safe-area-inset-right, 0px))",
      }}
    >
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[5rem_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-4">
        <Sidebar
          onNewNote={handleCreateNote}
          onPinned={() => {}}
          onTrash={() => {}}
          onLogout={handleLogout}
        />

        <Header
          userName={userName}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="relative min-h-0 min-w-0 overflow-x-hidden overflow-y-auto rounded-[28px] bg-[#E8EAEF] p-4 shadow-sm [scrollbar-gutter:stable] sm:p-5 dark:bg-neutral-900 dark:shadow-none">
          <div className="flex w-full min-w-0 justify-center pb-28 pt-1">
            <div className="w-full max-w-7xl min-w-0">
              <NotesGrid
                notes={filteredNotes}
                loading={loading}
                onEditNote={handleEditNote}
              />
            </div>
          </div>
          <FloatingActionButton onClick={handleCreateNote} />
        </main>
      </div>
    </div>
  );
}
function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardShell />
    </ThemeProvider>
  );
}

export default Dashboard;
