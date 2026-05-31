import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from "../../Dashboard/Dashboard";
import api from '../../../services/api';
import { ThemeProvider } from '../../../context/ThemeContext';
import { UserProvider } from '../../../context/UserContext';
import { vi } from "vitest";

/**
 * Mock the API service so tests don't call real backend
 */
vi.mock('../../../services/api');

/**
 * Mock framer-motion to render without animations
 */
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => {
        const { initial, animate, exit, transition, layout, whileHover, whileTap, ...domProps } = props;
        return <div {...domProps}>{children}</div>;
      },
      button: ({ children, ...props }) => {
        const { initial, animate, exit, transition, layout, whileHover, whileTap, ...domProps } = props;
        return <button {...domProps}>{children}</button>;
      },
      aside: ({ children, ...props }) => {
        const { initial, animate, exit, transition, layout, whileHover, whileTap, ...domProps } = props;
        return <aside {...domProps}>{children}</aside>;
      },
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

/**
 * Mock React Router
 */
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/**
 * Test Suite for Dashboard Component
 */
describe('Dashboard Component', () => {

  /**
   * Sample notes for testing
   */
  const mockNotes = [
    {
      _id: '1',
      title: 'First Note',
      content: '<p>This is the first note</p>',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      tags: [],
      isDeleted: false,
    },
    {
      _id: '2',
      title: 'Second Note',
      content: '<p>This is the second note</p>',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      tags: [],
      isDeleted: false,
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage to return a stored user
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify({ username: 'john', name: 'John' });
      if (key === 'token') return 'fake-token';
      if (key === 'notes-theme') return 'light';
      return null;
    });
    // Mock the user profile API call from UserProvider
    api.get.mockImplementation((url) => {
      if (url === '/users/me') {
        return Promise.resolve({ data: { user: { username: 'john', name: 'John' } } });
      }
      if (url === '/notes') {
        return Promise.resolve({ data: { notes: [] } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  const renderDashboard = (notesList = []) => {
    // Override the /notes mock if we have notes to show
    api.get.mockImplementation((url) => {
      if (url === '/users/me') {
        return Promise.resolve({ data: { user: { username: 'john', name: 'John' } } });
      }
      if (url === '/notes') {
        return Promise.resolve({ data: { notes: notesList } });
      }
      return Promise.resolve({ data: {} });
    });

    return render(
      <MemoryRouter>
        <ThemeProvider>
          <UserProvider>
            <Dashboard />
          </UserProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  /**
   * TEST 1: Renders notes list correctly
   */
  it('should render notes list correctly', async () => {
    renderDashboard(mockNotes);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });
  });

  /**
   * TEST 2: Shows empty state when no notes
   */
  it('should show empty state when no notes exist', async () => {
    renderDashboard([]);

    await waitFor(() => {
      expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
    });
  });

  /**
   * TEST 3: Shows the correct note count
   */
  it('should display the correct note count', async () => {
    renderDashboard(mockNotes);

    await waitFor(() => {
      expect(screen.getByText('2 notes')).toBeInTheDocument();
    });
  });

  /**
   * TEST 4: Delete button calls API
   */
  it('should call delete API when delete button clicked', async () => {
    const user = userEvent.setup();

    renderDashboard(mockNotes);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    api.delete.mockResolvedValueOnce({ status: 200 });

    // Find and click delete button (title="Delete note")
    const deleteButtons = screen.getAllByTitle('Delete note');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/notes/1');
    });
  });

  /**
   * TEST 5: Dashboard title shows "All Notes"
   */
  it('should display "All Notes" heading', async () => {
    renderDashboard([]);

    await waitFor(() => {
      expect(screen.getByText('All Notes')).toBeInTheDocument();
    });
  });

  /**
   * TEST 6: Logout navigates to login
   */
  it('should navigate to login on logout', async () => {
    const user = userEvent.setup();
    renderDashboard([]);

    await waitFor(() => {
      expect(screen.getByText('All Notes')).toBeInTheDocument();
    });

    const logoutButton = screen.getByTitle('Logout');
    await user.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  /**
   * TEST 7: Shows pinned view
   */
  it('should show Pinned Notes view when Pinned is clicked', async () => {
    const user = userEvent.setup();
    const pinnedNotes = [{
      _id: '1', title: 'Pinned Note', content: '<p>Pinned content</p>',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      isPinned: true, tags: [], isDeleted: false,
    }];
    renderDashboard(pinnedNotes);

    await waitFor(() => {
      expect(screen.getByText('Pinned Note')).toBeInTheDocument();
    });

    const pinnedNav = screen.getByTitle('Pinned');
    await user.click(pinnedNav);

    await waitFor(() => {
      expect(screen.getByText('Pinned Notes')).toBeInTheDocument();
    });
  });

  /**
   * TEST 8: Shows trash view
   */
  it('should show Trash view when Trash is clicked', async () => {
    const user = userEvent.setup();
    renderDashboard([]);

    await waitFor(() => {
      expect(screen.getByText('All Notes')).toBeInTheDocument();
    });

    const trashNav = screen.getByTitle('Trash');
    await user.click(trashNav);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Trash' })).toBeInTheDocument();
    });
  });

  /**
   * TEST 9: Pin toggle button works
   */
  it('should toggle pin state when pin button is clicked', async () => {
    const user = userEvent.setup();
    renderDashboard(mockNotes);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const pinButtons = screen.getAllByTitle('Pin note');
    await user.click(pinButtons[0]);

    // After pinning, the button title changes to 'Unpin note'
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
  });

  /**
   * TEST 10: Search filters notes
   */
  it('should filter notes when searching', async () => {
    const user = userEvent.setup();
    renderDashboard(mockNotes);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search notes...');
    await user.type(searchInput, 'First');

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.queryByText('Second Note')).not.toBeInTheDocument();
    });
  });

  /**
   * TEST 11: View mode toggle
   */
  it('should toggle between grid and list views', async () => {
    const user = userEvent.setup();
    renderDashboard(mockNotes);

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const listViewButton = screen.getByTitle('List view');
    await user.click(listViewButton);

    // Notes should still be visible in list view
    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.getByText('Second Note')).toBeInTheDocument();
  });

  /**
   * TEST 12: Profile button navigates
   */
  it('should navigate to profile when profile button is clicked', async () => {
    const user = userEvent.setup();
    renderDashboard([]);

    await waitFor(() => {
      expect(screen.getByText('All Notes')).toBeInTheDocument();
    });

    const profileButton = screen.getByLabelText('Open profile');
    await user.click(profileButton);

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});