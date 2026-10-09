import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, initializeMocks } from '@src/testUtils';
import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import { TextEditorInternal as TextEditor, mapStateToProps, mapDispatchToProps } from '.';

let mockEditorMounts = 0;
let mockEditorContent = 'eDiTablE Text';
jest.mock('../../sharedComponents/TinyMceWidget', () => {
  // eslint-disable-next-line global-require
  const MockReact = require('react');
  return (props: any) => {
    // Side effects, so they live in effects rather than the render body: React
    // may render without committing. The counter tracks commits, which is what a
    // rebuild actually looks like, and the fake ref hands back whatever
    // `mockEditorContent` holds, standing in for the author's unsaved edits.
    MockReact.useEffect(() => {
      mockEditorMounts += 1;
    }, []);
    MockReact.useEffect(() => {
      props.setEditorRef?.({ getContent: () => mockEditorContent });
    });
    return MockReact.createElement('tinymcewidget', props);
  };
});

jest.mock('../EditorContainer', () => 'EditorContainer');

jest.mock('../../data/redux', () => ({
  __esModule: true,
  default: jest.fn(),
  actions: {
    app: {
      initializeEditor: jest.fn().mockName('actions.app.initializeEditor'),
    },
  },
  selectors: {
    app: {
      blockValue: jest.fn(state => ({ blockValue: state })),
      shouldCreateBlock: jest.fn(state => ({ shouldCreateBlock: state })),
      lmsEndpointUrl: jest.fn(state => ({ lmsEndpointUrl: state })),
      studioEndpointUrl: jest.fn(state => ({ studioEndpointUrl: state })),
      showRawEditor: jest.fn(state => ({ showRawEditor: state })),
      images: jest.fn(state => ({ images: state })),
      isLibrary: jest.fn(state => ({ isLibrary: state })),
      blockId: jest.fn(state => ({ blockId: state })),
      learningContextId: jest.fn(state => ({ learningContextId: state })),
    },
    requests: {
      isFailed: jest.fn((state, params) => ({ isFailed: { state, params } })),
      isFinished: jest.fn((state, params) => ({ isFailed: { state, params } })),
    },
  },
  thunkActions: {
    video: {
      importTranscript: jest.fn(),
    },
  },
}));

describe('TextEditor', () => {
  // Mirrors what the block fetch puts in the store: an AxiosResponse whose
  // `data` holds the HTML body and the settings-scoped `metadata`.
  const blockValue = (includeTheme?: boolean) => ({
    data: {
      id: 'block-id-123',
      display_name: 'Text',
      category: 'html',
      data: 'eDiTablE Text',
      metadata: {
        display_name: 'Text',
        ...(includeTheme ? { include_theme: includeTheme } : {}),
      },
    },
  });

  const props = {
    onClose: jest.fn().mockName('props.onClose'),
    // redux
    blockValue: blockValue(),
    blockId: 'block-id-123',
    blockFailed: false,
    initializeEditor: jest.fn().mockName('args.intializeEditor'),
    showRawEditor: false,
    blockFinished: true,
    learningContextId: 'course+org+run',
    images: {},
    isLibrary: false,
  };

  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    mockEditorMounts = 0;
    mockEditorContent = 'eDiTablE Text';
  });

  describe('renders', () => {
    beforeEach(() => {
      initializeMocks();
    });

    test('renders as expected with default behavior', () => {
      const { container } = render(<TextEditor {...props} />);
      const element = container.querySelector('tinymcewidget');
      expect(element).toBeInTheDocument();
      expect(element?.getAttribute('editorcontenthtml')).toBe('eDiTablE Text');
    });

    test('renders static images with relative paths', () => {
      const updatedProps = {
        ...props,
        blockValue: {
          data: { ...blockValue().data, data: 'eDiTablE Text with <img src="/static/img.jpg" />' },
        },
      };
      const { container } = render(<TextEditor {...updatedProps} />);
      const element = container.querySelector('tinymcewidget');
      expect(element).toBeInTheDocument();
      expect(element?.getAttribute('editorcontenthtml')).toBe(
        'eDiTablE Text with <img src="/asset+org+run+type@asset+block@img.jpg" />',
      );
    });
    test('not yet loaded, Spinner appears', () => {
      const { container } = render(<TextEditor {...props} blockFinished={false} />);
      expect(container.querySelector('.pgn__spinner')).toBeInTheDocument();
    });
    test('loaded, raw editor', () => {
      render(<TextEditor {...props} showRawEditor />);
      expect(screen.getByText('You are using the raw html editor.')).toBeInTheDocument();
    });
    test('block failed to load, Toast is shown', () => {
      render(<TextEditor {...props} blockFailed isLibrary />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Error: Could Not Load Text Content')).toBeInTheDocument();
    });
  });

  describe('include_theme toggle', () => {
    beforeEach(() => {
      initializeMocks();
    });

    test('is unchecked for an existing block with no stored value', () => {
      render(<TextEditor {...props} />);
      expect(screen.getByRole('switch', { name: /use mfe theme/i })).not.toBeChecked();
    });

    test('reflects the value stored in block metadata', () => {
      render(<TextEditor {...props} blockValue={blockValue(true)} />);
      expect(screen.getByRole('switch', { name: /use mfe theme/i })).toBeChecked();
    });

    test('defaults to unchecked when there is no block value yet', () => {
      // The create workflow renders with `blockFinished` already true and no
      // blockValue -- there is no fetch to wait for.
      render(<TextEditor {...props} blockValue={null} />);
      expect(screen.getByRole('switch', { name: /use mfe theme/i })).not.toBeChecked();
    });

    test('can be toggled by the author', async () => {
      const user = userEvent.setup();
      render(<TextEditor {...props} />);
      const checkbox = screen.getByRole('switch', { name: /use mfe theme/i });
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('editor rebuild on toggle', () => {
    beforeEach(() => {
      initializeMocks();
    });

    // `content_style` is only read when the editor initializes, so without a
    // rebuild the preview keeps whatever the block was opened with.
    test('rebuilds the editor when the toggle is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<TextEditor {...props} />);
      expect(mockEditorMounts).toEqual(1);

      await user.click(screen.getByRole('switch', { name: /use mfe theme/i }));

      expect(mockEditorMounts).toEqual(2);
      expect(container.querySelector('tinymcewidget')).toBeInTheDocument();
    });

    test('hands the rebuilt editor the unsaved content', async () => {
      mockEditorContent = 'unsaved edits';
      const user = userEvent.setup();
      const { container } = render(<TextEditor {...props} />);

      await user.click(screen.getByRole('switch', { name: /use mfe theme/i }));

      expect(container.querySelector('tinymcewidget')?.getAttribute('editorcontenthtml'))
        .toEqual('unsaved edits');
    });

    test('does not snapshot in raw editor mode', async () => {
      // In raw mode the content lives in the RawEditor, not in a TinyMCE
      // instance, and the rebuild does not touch it.
      mockEditorContent = 'unsaved edits';
      const user = userEvent.setup();
      const { container } = render(<TextEditor {...props} showRawEditor />);

      await user.click(screen.getByRole('switch', { name: /use mfe theme/i }));

      expect(container.querySelector('tinymcewidget')).toBeNull();
    });
  });

  describe('mapStateToProps', () => {
    // type set to any to prevent warning on not matchig expected type on the selectors
    const testState: any = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('blockValue from app.blockValue', () => {
      expect(
        mapStateToProps(testState).blockValue,
      ).toEqual(selectors.app.blockValue(testState));
    });
    test('blockFailed from requests.isFailed', () => {
      expect(
        mapStateToProps(testState).blockFailed,
      ).toEqual(selectors.requests.isFailed(testState, { requestKey: RequestKeys.fetchBlock }));
    });
    test('blockFinished from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).blockFinished,
      ).toEqual(
        selectors.app.shouldCreateBlock(testState)
          || selectors.requests.isFinished(testState, { requestKey: RequestKeys.fetchBlock }),
      );
    });
    test('learningContextId from app.learningContextId', () => {
      expect(
        mapStateToProps(testState).learningContextId,
      ).toEqual(selectors.app.learningContextId(testState));
    });
    test('images from app.images', () => {
      expect(
        mapStateToProps(testState).images,
      ).toEqual(selectors.app.images(testState));
    });
  });

  describe('mapDispatchToProps', () => {
    test('initializeEditor from actions.app.initializeEditor', () => {
      expect(mapDispatchToProps.initializeEditor).toEqual(actions.app.initializeEditor);
    });
  });
});
