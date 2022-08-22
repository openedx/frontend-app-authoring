import React from 'react';

import * as module from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

describe('SourceCodeModal hooks', () => {
  const mockContent = 'sOmEMockHtML';
  const mockSetContent = jest.fn();
  const mockEditorRef = {
    current:
          {
            setContent: mockSetContent,
            getContent: jest.fn(() => mockContent),
          },
  };
  const mockClose = jest.fn();
  test('getSaveBtnProps', () => {
    const mockRef = {
      current: {
        state: {
          doc: mockContent,
        },
      },
    };
    const input = {
      ref: mockRef,
      editorRef: mockEditorRef,
      close: mockClose,
    };
    const resultProps = module.getSaveBtnProps(input);
    resultProps.onClick();
    expect(mockSetContent).toHaveBeenCalledWith(mockContent);
    expect(mockClose).toHaveBeenCalled();
  });

  test('prepareSourceCodeModal', () => {
    const props = {
      close: mockClose,
      editorRef: mockEditorRef,
    };
    const mockRef = { current: 'rEf' };
    const spyRef = jest.spyOn(React, 'useRef').mockReturnValueOnce(mockRef);
    const mockButton = 'mOcKBuTton';

    const spyButtons = jest.spyOn(module, 'getSaveBtnProps').mockImplementation(
      () => mockButton,
    );

    const result = module.prepareSourceCodeModal(props);
    expect(spyRef).toHaveBeenCalled();
    expect(spyButtons).toHaveBeenCalled();
    expect(result).toStrictEqual({ saveBtnProps: mockButton, value: mockEditorRef.current.getContent(), ref: mockRef });
  });
});
