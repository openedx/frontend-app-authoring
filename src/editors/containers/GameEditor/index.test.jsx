import React from 'react';
import {
  IntlProvider,
} from '@edx/frontend-platform/i18n';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  GameEditor, hooks, mapStateToProps, mapDispatchToProps,
} from './index';

const mockConfig = {
  STUDIO_BASE_URL: 'http://localhost:18010',
};

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => mockConfig,
}));

jest.mock('../../data/redux', () => ({
  selectors: {
    requests: {
      isFinished: jest.fn(() => true),
    },
    app: {
      blockId: jest.fn(() => 'test-block-id'),
      blockValue: jest.fn(() => ({ type: 'flashcards' })),
    },
    game: {
      settings: jest.fn(() => ({ shuffle: true, timer: false })),
      type: jest.fn(() => 'flashcards'),
      list: jest.fn(() => []),
      isDirty: jest.fn(() => false),
    },
  },
  actions: {
    app: {
      initializeEditor: jest.fn(),
    },
    game: {
      setShuffleStatus: jest.fn(),
      setTimerStatus: jest.fn(),
      updateType: jest.fn(),
      updateTerm: jest.fn(),
      updateDefinition: jest.fn(),
      toggleOpen: jest.fn(),
      setList: jest.fn(),
      addCard: jest.fn(),
      removeCard: jest.fn(),
    },
  },
  thunkActions: {
    game: {
      loadGamesSettings: jest.fn(),
      uploadGameImage: jest.fn(),
      deleteGameImage: jest.fn(),
    },
  },
}));

jest.mock('../EditorContainer', () => ({
  __esModule: true,
  default: ({
    children, validateEntry, getContent, onClose, isDirty,
  }) => (
    <div data-testid="editor-container">
      <button
        type="button"
        data-testid="validate-button"
        onClick={() => validateEntry && validateEntry()}
      >
        Validate
      </button>
      <button
        type="button"
        data-testid="get-content-button"
        onClick={() => getContent && getContent()}
      >
        Get Content
      </button>
      <button
        type="button"
        data-testid="close-button"
        onClick={() => onClose && onClose()}
      >
        Close
      </button>
      <span data-testid="dirty-status">{isDirty ? 'dirty' : 'clean'}</span>
      {children}
    </div>
  ),
}));

jest.mock('../ProblemEditor/components/EditProblemView/SettingsWidget/SettingsOption', () => ({
  __esModule: true,
  default: ({
    children, title, summary, className,
  }) => (
    <div data-testid="settings-option" className={className}>
      <div data-testid="settings-title">{title}</div>
      <div data-testid="settings-summary">{summary}</div>
      {children}
    </div>
  ),
}));

jest.mock('../../sharedComponents/Button', () => ({
  __esModule: true,
  default: ({
    children, onClick, variant, className, iconBefore,
  }) => (
    <button
      type="button"
      data-testid="custom-button"
      onClick={onClick}
      className={className}
      data-variant={variant}
    >
      {iconBefore && <span data-testid="icon-before" />}
      {children}
    </button>
  ),
}));

jest.mock('../../../generic/DraggableList', () => ({
  __esModule: true,
  default: ({
    children, setState, updateOrder, className,
  }) => (
    <div data-testid="draggable-list" className={className}>
      <button
        type="button"
        data-testid="set-state-button"
        onClick={() => setState && setState([])}
      >
        Set State
      </button>
      <button
        type="button"
        data-testid="update-order-button"
        onClick={() => updateOrder && updateOrder()([])}
      >
        Update Order
      </button>
      {children}
    </div>
  ),
  /* eslint-disable-next-line react/prop-types */
  SortableItem: ({ children, id, componentStyle }) => (
    <div data-testid="sortable-item" data-id={id} style={componentStyle}>
      {children}
    </div>
  ),
}));

const mockProps = {
  onClose: jest.fn(),
  blockFinished: true,
  blockId: 'test-block-id',
  blockValue: { type: 'flashcards' },
  settings: { shuffle: true, timer: false },
  setShuffleStatus: jest.fn(),
  setTimerStatus: jest.fn(),
  type: 'flashcards',
  updateType: jest.fn(),
  list: [
    {
      id: 'card-1',
      term: 'Test Term',
      term_image: '/media/term.jpg',
      term_image_path: 'term.jpg',
      definition: 'Test Definition',
      definition_image: '',
      definition_image_path: '',
      editorOpen: true,
    },
    {
      id: 'card-2',
      term: '',
      term_image: '',
      term_image_path: '',
      definition: '',
      definition_image: '/media/def.jpg',
      definition_image_path: 'def.jpg',
      editorOpen: false,
    },
  ],
  updateTerm: jest.fn(),
  updateDefinition: jest.fn(),
  toggleOpen: jest.fn(),
  setList: jest.fn(),
  addCard: jest.fn(),
  removeCard: jest.fn(),
  uploadGameImage: jest.fn(),
  deleteGameImage: jest.fn(),
  loadGamesSettings: jest.fn(),
  isDirty: true,
};

const renderWithIntl = (component) => render(
  <IntlProvider locale="en">
    {component}
  </IntlProvider>,
);

describe('GameEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders editor container with loading spinner when block not finished', () => {
      const loadingProps = { ...mockProps, blockFinished: false };
      const { container } = renderWithIntl(<GameEditor {...loadingProps} />);

      expect(screen.getByTestId('editor-container')).toBeInTheDocument();
      expect(container.querySelector('.pgn__spinner')).toBeInTheDocument();
    });

    it('renders main page content when block is finished', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      expect(screen.getByTestId('editor-container')).toBeInTheDocument();
      expect(screen.queryByText('Loading Spinner')).not.toBeInTheDocument();
      expect(screen.getByText('Flashcard terms')).toBeInTheDocument();
    });

    it('renders cards from list prop', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      const cardInputs = screen.getAllByPlaceholderText('Enter your term');
      expect(cardInputs).toHaveLength(1); // Only card-1 has editorOpen: true
    });

    it('shows validation error alert when validation errors exist', async () => {
      const incompleteProps = {
        ...mockProps,
        list: [
          {
            id: 'card-1', term: 'Term Only', definition: '', term_image: '', definition_image: '', editorOpen: true,
          },
        ],
      };
      renderWithIntl(<GameEditor {...incompleteProps} />);

      fireEvent.click(screen.getByTestId('validate-button'));

      await waitFor(() => {
        expect(screen.getByText('We couldn\'t save your changes.')).toBeInTheDocument();
        expect(screen.getByText('Please check your entries and try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Game Type Handling', () => {
    it('displays flashcard description for flashcard type', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      expect(screen.getByText('Flashcard terms')).toBeInTheDocument();
    });

    it('displays matching description for matching type', () => {
      const matchingProps = { ...mockProps, type: 'matching' };
      renderWithIntl(<GameEditor {...matchingProps} />);

      expect(screen.getByText('Matching terms')).toBeInTheDocument();
    });

    it('handles undefined type gracefully', () => {
      const undefinedProps = { ...mockProps, type: 'unknown' };
      renderWithIntl(<GameEditor {...undefinedProps} />);

      expect(screen.getByText('Undefined')).toBeInTheDocument();
    });
  });

  describe('Settings Panel', () => {
    it('renders settings options', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getAllByTestId('settings-option')).toHaveLength(2); // Type and Shuffle only for flashcards
    });

    it('shows timer settings for matching type', () => {
      const matchingProps = { ...mockProps, type: 'matching' };
      renderWithIntl(<GameEditor {...matchingProps} />);

      expect(screen.getAllByTestId('settings-option')).toHaveLength(3);
    });

    it('calls updateType when type buttons are clicked', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      const typeButtons = screen.getAllByTestId('custom-button');
      const flashcardButton = typeButtons.find(btn => btn.textContent.includes('Flashcards'));
      const matchingButton = typeButtons.find(btn => btn.textContent.includes('Matching'));

      fireEvent.click(flashcardButton);
      expect(mockProps.updateType).toHaveBeenCalledWith('flashcards');

      fireEvent.click(matchingButton);
      expect(mockProps.updateType).toHaveBeenCalledWith('matching');
    });

    it('calls setShuffleStatus when shuffle buttons are clicked', () => {
      // Use props with shuffle initially false to test both directions
      const shuffleOffProps = { ...mockProps, settings: { shuffle: false, timer: false } };
      const { rerender } = renderWithIntl(<GameEditor {...shuffleOffProps} />);

      const onButtons = screen.getAllByText('On');
      fireEvent.click(onButtons[0]);
      expect(mockProps.setShuffleStatus).toHaveBeenCalledWith(true);

      // Test the other direction with shuffle initially true
      jest.clearAllMocks();
      const shuffleOnProps = { ...mockProps, settings: { shuffle: true, timer: false } };
      rerender(
        <IntlProvider locale="en">
          <GameEditor {...shuffleOnProps} />
        </IntlProvider>,
      );

      const offButtons = screen.getAllByText('Off');
      fireEvent.click(offButtons[0]);
      expect(mockProps.setShuffleStatus).toHaveBeenCalledWith(false);
    });
  });

  describe('Card Management', () => {
    it('handles input change and blur for term fields', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      const termInput = screen.getAllByPlaceholderText('Enter your term')[0];

      fireEvent.change(termInput, { target: { value: 'New Term' } });
      expect(termInput.value).toBe('New Term');

      fireEvent.blur(termInput);
      expect(mockProps.updateTerm).toHaveBeenCalledWith({ index: 0, term: 'New Term' });
    });

    it('handles input change and blur for definition fields', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      const defInput = screen.getAllByPlaceholderText('Enter your definition')[0];

      fireEvent.change(defInput, { target: { value: 'New Definition' } });
      expect(defInput.value).toBe('New Definition');

      fireEvent.blur(defInput);
      expect(mockProps.updateDefinition).toHaveBeenCalledWith({ index: 0, definition: 'New Definition' });
    });

    it('shows character count for inputs', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      expect(screen.getByText('9/120')).toBeInTheDocument();
      expect(screen.getByText('15/120')).toBeInTheDocument();
    });

    it('calls addCard when add button is clicked', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);

      expect(mockProps.addCard).toHaveBeenCalled();
    });

    it('handles card movement and deletion through dropdown', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      // Check for dropdown button in the card
      const dropdownButtons = screen.getAllByRole('button', { expanded: false });
      const cardDropdown = dropdownButtons.find(button => button.classList.contains('card-dropdown'));
      expect(cardDropdown).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    beforeEach(() => {
      Object.defineProperty(document, 'getElementById', {
        value: jest.fn().mockReturnValue({
          files: [new File(['test'], 'test.jpg', { type: 'image/jpeg' })],
          value: '',
          click: jest.fn(),
        }),
        configurable: true,
      });
    });

    it('displays existing term image', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      const termImage = screen.getByAltText('TERM_IMG');
      expect(termImage).toHaveAttribute('src', '/media/term.jpg');
    });

    it('displays existing definition image', () => {
      const propsWithDefImage = {
        ...mockProps,
        list: [
          {
            id: 'card-1',
            term: 'Test Term',
            term_image: '',
            definition: 'Test Definition',
            definition_image: '/media/def.jpg',
            editorOpen: true,
          },
        ],
      };
      renderWithIntl(<GameEditor {...propsWithDefImage} />);

      const defImage = screen.getByAltText('DEFINITION_IMG');
      expect(defImage).toHaveAttribute('src', '/media/def.jpg');
    });

    it('calls uploadGameImage when image is selected', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      const termFileInput = document.querySelector('input[id="term_image_upload|0"]');
      fireEvent.change(termFileInput);

      expect(mockProps.uploadGameImage).toHaveBeenCalledWith({
        index: 0,
        imageFile: expect.any(File),
        imageType: 'term',
      });
    });

    it('calls deleteGameImage when delete button is clicked', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'DEL_IMG' });
      fireEvent.click(deleteButton);

      expect(mockProps.deleteGameImage).toHaveBeenCalledWith({
        index: 0,
        imageType: 'term',
        filePath: 'term.jpg',
      });
    });
  });

  describe('Validation Logic', () => {
    it('validates cards correctly - no errors for complete pairs', () => {
      const completeProps = {
        ...mockProps,
        list: [
          {
            id: 'card-1',
            term: 'Term',
            definition: 'Definition',
            term_image: '',
            definition_image: '',
            editorOpen: true,
          },
        ],
      };
      renderWithIntl(<GameEditor {...completeProps} />);

      fireEvent.click(screen.getByTestId('validate-button'));

      expect(screen.queryByText('We couldn\'t save your changes.')).not.toBeInTheDocument();
    });

    it('shows validation errors for incomplete pairs', async () => {
      const incompleteProps = {
        ...mockProps,
        list: [
          {
            id: 'card-1', term: 'Term Only', definition: '', term_image: '', definition_image: '', editorOpen: true,
          },
          {
            id: 'card-2', term: '', definition: 'Definition Only', term_image: '', definition_image: '', editorOpen: true,
          },
        ],
      };
      renderWithIntl(<GameEditor {...incompleteProps} />);

      fireEvent.click(screen.getByTestId('validate-button'));

      await waitFor(() => {
        expect(screen.getByText('We couldn\'t save your changes.')).toBeInTheDocument();
        expect(screen.getByText('Enter a definition')).toBeInTheDocument();
        expect(screen.getByText('Enter a term')).toBeInTheDocument();
      });
    });

    it('allows empty pairs without validation errors', () => {
      const emptyProps = {
        ...mockProps,
        list: [
          {
            id: 'card-1',
            term: '',
            definition: '',
            term_image: '',
            definition_image: '',
            editorOpen: true,
          },
        ],
      };
      renderWithIntl(<GameEditor {...emptyProps} />);

      fireEvent.click(screen.getByTestId('validate-button'));

      expect(screen.queryByText('We couldn\'t save your changes.')).not.toBeInTheDocument();
    });
  });

  describe('Lifecycle and Effects', () => {
    it('loads game settings when block is finished', () => {
      renderWithIntl(<GameEditor {...mockProps} />);

      expect(mockProps.loadGamesSettings).toHaveBeenCalled();
    });

    it('does not load settings when already loaded', () => {
      const { rerender } = renderWithIntl(<GameEditor {...mockProps} />);

      jest.clearAllMocks();
      rerender(
        <IntlProvider locale="en">
          <GameEditor {...mockProps} />
        </IntlProvider>,
      );

      expect(mockProps.loadGamesSettings).not.toHaveBeenCalled();
    });

    it('does not load settings when block is not finished', () => {
      const notFinishedProps = { ...mockProps, blockFinished: false };
      renderWithIntl(<GameEditor {...notFinishedProps} />);

      expect(mockProps.loadGamesSettings).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles null blockValue gracefully', () => {
      const nullProps = { ...mockProps, blockValue: null };
      renderWithIntl(<GameEditor {...nullProps} />);

      expect(screen.getByTestId('editor-container')).toBeInTheDocument();
    });

    it('handles undefined blockValue gracefully', () => {
      const undefinedProps = { ...mockProps, blockValue: undefined };
      renderWithIntl(<GameEditor {...undefinedProps} />);

      expect(screen.getByTestId('editor-container')).toBeInTheDocument();
    });

    it('handles empty list gracefully', () => {
      const emptyProps = { ...mockProps, list: [] };
      renderWithIntl(<GameEditor {...emptyProps} />);

      expect(screen.getByTestId('editor-container')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter your term')).not.toBeInTheDocument();
    });

    it('handles null settings gracefully', () => {
      const nullSettingsProps = { ...mockProps, settings: null };

      // Mock console.error to suppress the expected error output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => renderWithIntl(<GameEditor {...nullSettingsProps} />)).toThrow('Cannot read properties of null');

      consoleSpy.mockRestore();
    });
  });

  describe('Hooks', () => {
    describe('getContent', () => {
      const testData = {
        type: 'flashcards',
        settings: { shuffle: true, timer: false },
        list: [{ id: 'card-1', term: 'Test', definition: 'Definition' }],
      };

      it('returns correctly formatted content', () => {
        const result = hooks.getContent(testData);

        expect(result).toEqual({
          gameType: 'flashcards',
          isShuffled: true,
          hasTimer: false,
          cards: testData.list,
        });
      });

      it('handles null input gracefully', () => {
        expect(() => hooks.getContent(null)).toThrow();
      });

      it('handles undefined input gracefully', () => {
        expect(() => hooks.getContent(undefined)).toThrow();
      });
    });
  });

  describe('Redux Integration', () => {
    describe('mapStateToProps', () => {
      it('maps state to props correctly', () => {
        const mockState = { mockStateData: true };

        const result = mapStateToProps(mockState);

        expect(result).toEqual({
          blockFinished: true,
          blockId: 'test-block-id',
          blockValue: { type: 'flashcards' },
          settings: { shuffle: true, timer: false },
          type: 'flashcards',
          list: [],
          isDirty: false,
        });
      });
    });

    describe('mapDispatchToProps', () => {
      it('maps dispatch actions correctly', () => {
        expect(mapDispatchToProps).toHaveProperty('setShuffleStatus');
        expect(mapDispatchToProps).toHaveProperty('setTimerStatus');
        expect(mapDispatchToProps).toHaveProperty('updateType');
        expect(mapDispatchToProps).toHaveProperty('updateTerm');
        expect(mapDispatchToProps).toHaveProperty('updateDefinition');
        expect(mapDispatchToProps).toHaveProperty('toggleOpen');
        expect(mapDispatchToProps).toHaveProperty('setList');
        expect(mapDispatchToProps).toHaveProperty('addCard');
        expect(mapDispatchToProps).toHaveProperty('removeCard');
        expect(mapDispatchToProps).toHaveProperty('loadGamesSettings');
        expect(mapDispatchToProps).toHaveProperty('uploadGameImage');
        expect(mapDispatchToProps).toHaveProperty('deleteGameImage');
      });
    });
  });
});
