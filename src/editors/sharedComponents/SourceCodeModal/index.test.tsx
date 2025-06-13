import React from 'react';
import { useWindowSize } from '@openedx/paragon';
import { render, screen, initializeMocks } from '../../../testUtils';
import SourceCodeModal from './index';
import * as hooks from './hooks';

jest.mock('../BaseModal', () => jest.fn(({ children, ...props }) => (
  <div data-base-modal {...props}>{children}</div>
)));
jest.mock('../CodeEditor', () => jest.fn(({ innerRef, value, lang }) => (
  <div data-code-editor data-lang={lang} data-value={value} ref={innerRef}>CodeEditor</div>
)));
jest.mock('./hooks', () => ({
  prepareSourceCodeModal: jest.fn().mockReturnValue({
    saveBtnProps: { onClick: jest.fn() },
    value: '<p>test</p>',
    ref: React.createRef(),
  }),
}));
jest.mock('@openedx/paragon', () => ({
  useWindowSize: jest.fn().mockReturnValue({ height: 800 }),
}));

describe('SourceCodeModal', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders component', () => {
    const mockEditorRef = React.createRef();
    const mockClose = jest.fn();
    render(
      <SourceCodeModal isOpen close={mockClose} editorRef={mockEditorRef} />,
    );
    const modal = screen.getByTitle('Edit Source Code');
    expect(modal).toBeInTheDocument();
    expect(hooks.prepareSourceCodeModal).toHaveBeenCalledWith({ editorRef: mockEditorRef, close: mockClose });
    expect(useWindowSize).toHaveBeenCalled();
  });
});
