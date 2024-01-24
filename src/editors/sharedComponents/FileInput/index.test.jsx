import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { FileInput } from '.';

const mockOnChange = jest.fn();

describe('FileInput component', () => {
  let el;
  let container;
  let props;
  beforeEach(() => {
    container = {};
    props = {
      acceptedFiles: '.srt',
      fileInput: {
        addFile: () => mockOnChange(),
        ref: (input) => { container.ref = input; },
      },
    };
    el = render(<FileInput {...props} />);
  });
  test('snapshot', () => {
    expect(el.container).toMatchSnapshot();
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
