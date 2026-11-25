import React from 'react';
import {
  fireEvent,
  initializeMocks,
  render,
  userEvent,
} from '@src/testUtils';

import { FileInput, fileInput } from '.';

const mockOnChange = jest.fn();

describe('FileInput component', () => {
  let el;
  let container;
  let props;
  beforeEach(() => {
    initializeMocks();
    container = {};
    props = {
      acceptedFiles: '.srt',
      fileInput: {
        addFile: () => mockOnChange(),
        ref: (input) => {
          container.ref = input;
        },
      },
    };
    el = render(<FileInput {...props} />);
  });
  test('renders component', () => {
    expect(el.container.querySelector('input[type="file"]')).toBeInTheDocument();
  });
  test('only accepts allowed file types', () => {
    expect(el.container.querySelector('input').accept).toEqual('.srt');
  });
  test('calls fileInput.addFile onChange', () => {
    fireEvent.change(el.container.querySelector('input'));
    expect(mockOnChange).toHaveBeenCalled();
  });
  test('loads ref from fileInput.ref', () => {
    expect(container.ref).toEqual(el.container.querySelector('input'));
  });
});

describe('fileInput hook with FileInput', () => {
  const FileInputHarness = ({ onAddFile }) => {
    const input = fileInput({ onAddFile });
    return <FileInput fileInput={input} acceptedFiles=".srt" />;
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('clears the input after a file is selected, so the same file can be picked again', async () => {
    const user = userEvent.setup();
    const onAddFile = jest.fn();
    const { container } = render(<FileInputHarness onAddFile={onAddFile} />);
    const input = container.querySelector('input[type="file"]');
    const file = new File(['content'], 'captions.srt', { type: 'text/plain' });

    await user.upload(input, file);
    expect(onAddFile).toHaveBeenCalledWith(file);
    expect(input.value).toBe('');

    await user.upload(input, file);
    expect(onAddFile).toHaveBeenCalledTimes(2);
  });
});
