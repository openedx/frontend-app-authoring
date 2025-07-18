import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import ExpandableTextArea from '.';

// Per https://github.com/tinymce/tinymce-react/issues/91 React unit testing in JSDOM is not supported by tinymce.
// Consequently, mock the Editor out.
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'TiNYmCE EDitOR',
  };
});

jest.mock('../TinyMceWidget', () => 'TinyMceWidget');

// Mock the TinyMceWidget
jest.mock('../TinyMceWidget/hooks', () => ({
  prepareEditorRef: jest.fn(() => ({
    editorRef: { current: { value: 'something' } },
    refReady: true,
    setEditorRef: jest.fn().mockName('hooks.prepareEditorRef.setEditorRef'),
  })),
}));

describe('ExpandableTextArea', () => {
  const props = {
    value: 'text',
    setContent: jest.fn(),
    error: false,
    errorMessage: null,
  };
  beforeEach(() => {
    initializeMocks();
  });
  describe('renders', () => {
    test('renders as expected with default behavior', () => {
      const { container } = render(<ExpandableTextArea {...props} />);
      expect(container.querySelector('TinyMceWidget')).toBeInTheDocument();
    });
    test('renders error message', () => {
      render(<ExpandableTextArea {...props} error errorMessage="eRRormeSsaGE" />);
      expect(screen.getByText('eRRormeSsaGE')).toBeInTheDocument();
    });
    test('renders nothing when refReady is null', () => {
      // eslint-disable-next-line global-require
      jest.spyOn(require('../TinyMceWidget/hooks'), 'prepareEditorRef').mockReturnValue({
        editorRef: { current: { value: 'something' } },
        refReady: false,
        setEditorRef: jest.fn().mockName('hooks.prepareEditorRef.setEditorRef'),
      });
      const { container } = render(<ExpandableTextArea {...props} />);
      expect(container.firstChild?.textContent).toBe('');
    });
  });
});
