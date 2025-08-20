import React from 'react';
import { screen } from '@testing-library/react';
import { initializeMocks } from '@src/testUtils';
import { RequestKeys } from '@src/editors/data/constants/requests';
import editorRender from '../../editorTestRender';
import TextEditor from '.';

jest.mock('../../sharedComponents/TinyMceWidget', () => 'TinyMceWidget');
jest.mock('../EditorContainer', () => 'EditorContainer');

// hooks
jest.mock('./hooks', () => ({
  getContent: () => jest.fn(),
  isDirty: () => jest.fn(),
  nullMethod: jest.fn(),
}));

describe('TextEditor', () => {
  const initialState = {
    app: {
      blockValue: { data: { data: 'eDiTablE Text' } },
      shouldCreateBlock: false,
      showRawEditor: false,
      blockId: 'block-123',
      learningContextId: 'course+org+run',
      images: {},
    },
    requests: {
      [RequestKeys.fetchBlock]: {
        status: 'completed',
        error: null,
      },
    },
  };

  const setup = (stateOverrides = {}, propsOverrides = {}) => {
    const state = {
      ...initialState,
      ...stateOverrides,
    };

    return editorRender(<TextEditor onClose={jest.fn()} {...propsOverrides} />, { initialState: state });
  };

  afterEach(() => jest.clearAllMocks());

  describe('renders', () => {
    beforeEach(() => {
      initializeMocks();
    });

    test('renders TinyMceWidget with editable text content', () => {
      const { container } = setup();
      const element = container.querySelector('tinymcewidget');
      expect(element).toBeInTheDocument();
      expect(element?.getAttribute('editorcontenthtml')).toBe('eDiTablE Text');
    });

    test('renders TinyMceWidget with static image src replaced', () => {
      const stateOverrides = {
        app: {
          ...initialState.app,
          blockValue: { data: { data: 'Text with <img src="/static/img.jpg" />' } },
        },
      };
      const { container } = setup(stateOverrides);
      const element = container.querySelector('tinymcewidget');
      expect(element).toBeInTheDocument();
      expect(element?.getAttribute('editorcontenthtml')).toContain('<img src="/asset+org+run+type@asset+block@img.jpg" />');
    });

    test('renders spinner when block is not finished loading', () => {
      const stateOverrides = {
        app: { ...initialState.app },
        requests: {
          ...initialState.requests,
          [RequestKeys.fetchBlock]: {
            status: 'pending',
            error: 'Error: Could Not Load Text Content',
          },
        },
      };
      const { container } = setup(stateOverrides);
      expect(container.querySelector('.pgn__spinner')).toBeInTheDocument();
    });

    test('renders raw editor when showRawEditor is true', () => {
      const stateOverrides = {
        app: {
          ...initialState.app,
          showRawEditor: true,
        },
      };
      setup(stateOverrides);
      expect(screen.getByText('You are using the raw html editor.')).toBeInTheDocument();
    });

    test('renders Toast when blockFailed is true', () => {
      const stateOverrides = {
        app: { ...initialState.app, isLibrary: true },
        requests: {
          ...initialState.requests,
          [RequestKeys.fetchBlock]: {
            status: 'failed',
            error: 'Error: Could Not Load Text Content',
          },
        },
      };
      setup(stateOverrides, { blockFailed: true });
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Error: Could Not Load Text Content')).toBeInTheDocument();
    });
  });
});
