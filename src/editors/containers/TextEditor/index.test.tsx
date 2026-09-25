import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, initializeMocks } from '@src/testUtils';
import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import { TextEditorInternal as TextEditor, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('../../sharedComponents/TinyMceWidget', () => 'TinyMceWidget');

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
      metadata: includeTheme === undefined
        ? { display_name: 'Text' }
        : { display_name: 'Text', include_theme: includeTheme },
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
    isCreateWorkflow: false,
    learningContextId: 'course+org+run',
    images: {},
    isLibrary: false,
  };

  afterAll(() => jest.restoreAllMocks());
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
      expect(screen.getByRole('checkbox', { name: /use mfe theme/i })).not.toBeChecked();
    });

    test('reflects the value stored in block metadata', () => {
      render(<TextEditor {...props} blockValue={blockValue(true)} />);
      expect(screen.getByRole('checkbox', { name: /use mfe theme/i })).toBeChecked();
    });

    test('defaults to checked for newly created blocks', () => {
      render(<TextEditor {...props} isCreateWorkflow />);
      expect(screen.getByRole('checkbox', { name: /use mfe theme/i })).toBeChecked();
    });

    test('can be toggled by the author', async () => {
      const user = userEvent.setup();
      render(<TextEditor {...props} />);
      const checkbox = screen.getByRole('checkbox', { name: /use mfe theme/i });
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
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
