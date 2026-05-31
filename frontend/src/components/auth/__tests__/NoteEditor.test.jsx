import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteEditor } from '../../Dashboard/Dashboard';
import { vi } from "vitest";

/**
 * Mock the API service
 */
vi.mock('../../../services/api');

/**
 * Mock framer-motion so it renders without animations
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
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

/**
 * Mock TipTap editor hooks
 * NoteEditor uses @tiptap/react which is heavy — we mock it for unit testing
 */
const mockSetContent = vi.fn();
const mockGetHTML = vi.fn(() => '<p>Test content</p>');
const mockChain = vi.fn(() => ({
  focus: vi.fn(() => ({
    toggleBold: vi.fn(() => ({ run: vi.fn() })),
    toggleItalic: vi.fn(() => ({ run: vi.fn() })),
    toggleUnderline: vi.fn(() => ({ run: vi.fn() })),
    toggleStrike: vi.fn(() => ({ run: vi.fn() })),
    toggleHighlight: vi.fn(() => ({ run: vi.fn() })),
    toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
    toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
    toggleHeading: vi.fn(() => ({ run: vi.fn() })),
    setHorizontalRule: vi.fn(() => ({ run: vi.fn() })),
    setTextAlign: vi.fn(() => ({ run: vi.fn() })),
    undo: vi.fn(() => ({ run: vi.fn() })),
    redo: vi.fn(() => ({ run: vi.fn() })),
  })),
}));

const mockEditor = {
  commands: { setContent: mockSetContent },
  getHTML: mockGetHTML,
  chain: mockChain,
  isActive: vi.fn(() => false),
  can: vi.fn(() => ({ undo: vi.fn(() => false), redo: vi.fn(() => false) })),
};

vi.mock('@tiptap/react', async () => {
  const actual = await vi.importActual('@tiptap/react');
  return {
    ...actual,
    useEditor: () => mockEditor,
    EditorContent: ({ editor, ...props }) => (
      <div data-testid="editor-content" {...props}>
        Editor area
      </div>
    ),
  };
});

vi.mock('@tiptap/starter-kit', () => ({
  default: { configure: vi.fn(() => ({})) },
}));

vi.mock('@tiptap/extension-underline', () => ({
  default: {},
}));

vi.mock('@tiptap/extension-text-align', () => ({
  default: { configure: vi.fn(() => ({})) },
}));

vi.mock('@tiptap/extension-placeholder', () => ({
  default: { configure: vi.fn(() => ({})) },
}));

vi.mock('@tiptap/extension-highlight', () => ({
  default: { configure: vi.fn(() => ({})) },
}));

/**
 * Test Suite for NoteEditor Component
 * NoteEditor is a modal that takes props: isOpen, onClose, onSave, initialNote, mode, isDarkMode
 */
describe('NoteEditor Component', () => {

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderEditor = (props = {}) => {
    return render(
      <NoteEditor
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialNote={null}
        mode="create"
        isDarkMode={false}
        {...props}
      />
    );
  };

  /**
   * TEST 1: Renders editor correctly when open
   */
  it('should render editor correctly when isOpen is true', () => {
    renderEditor();

    // Check if title input exists with "Untitled Note" placeholder
    expect(screen.getByPlaceholderText(/untitled note/i)).toBeInTheDocument();

    // Check if Save Note button exists (create mode)
    expect(screen.getByRole('button', { name: /save note/i })).toBeInTheDocument();

    // Check if Cancel button exists
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

    // Check if editor area exists
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  /**
   * TEST 2: Does not render when isOpen is false
   */
  it('should not render when isOpen is false', () => {
    renderEditor({ isOpen: false });

    expect(screen.queryByPlaceholderText(/untitled note/i)).not.toBeInTheDocument();
  });

  /**
   * TEST 3: Save button is disabled when title is empty
   */
  it('should have save button disabled when title is empty', () => {
    renderEditor();

    const saveButton = screen.getByRole('button', { name: /save note/i });
    expect(saveButton).toBeDisabled();
  });

  /**
   * TEST 4: Save button triggers onSave callback
   */
  it('should call onSave when save button is clicked with a title', async () => {
    renderEditor();

    const titleInput = screen.getByPlaceholderText(/untitled note/i);

    // Type a title
    fireEvent.change(titleInput, { target: { value: 'My Note' } });

    // Now save button should be enabled
    const saveButton = screen.getByRole('button', { name: /save note/i });
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);

    // onSave is called after a 300ms timeout in the component
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'My Note',
        })
      );
    }, { timeout: 2000 });
  });

  /**
   * TEST 5: Cancel button triggers onClose callback
   */
  it('should call onClose when cancel button is clicked', () => {
    renderEditor();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  /**
   * TEST 6: Shows "Save Changes" in edit mode
   */
  it('should show "Save Changes" button in edit mode', () => {
    renderEditor({
      mode: 'edit',
      initialNote: { title: 'Existing Note', content: '<p>Content</p>', tags: [] }
    });

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});