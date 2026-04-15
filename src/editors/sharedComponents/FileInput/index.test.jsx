import { fireEvent, render, renderHook } from '@testing-library/react';
import { FileInput, fileInput } from '.';

const mockOnChange = jest.fn();

describe('fileInput hook', () => {
  it('calls onAddFile when no maxBytes is set', () => {
    const onAddFile = jest.fn();
    const { result } = renderHook(() => fileInput({ onAddFile }));
    result.current.addFile({ target: { files: [{ name: 'test.pdf', size: 2_000_000_000 }] } });
    expect(onAddFile).toHaveBeenCalled();
  });

  it('blocks files exceeding maxBytes and calls onSizeFail', () => {
    const onAddFile = jest.fn();
    const onSizeFail = jest.fn();
    const { result } = renderHook(() => fileInput({ onAddFile, maxBytes: 1_000_000, onSizeFail }));
    result.current.addFile({ target: { files: [{ name: 'big.pdf', size: 2_000_000 }] } });
    expect(onSizeFail).toHaveBeenCalled();
    expect(onAddFile).not.toHaveBeenCalled();
  });

  it('allows files within maxBytes', () => {
    const onAddFile = jest.fn();
    const onSizeFail = jest.fn();
    const { result } = renderHook(() => fileInput({ onAddFile, maxBytes: 1_000_000, onSizeFail }));
    result.current.addFile({ target: { files: [{ name: 'small.pdf', size: 500_000 }] } });
    expect(onSizeFail).not.toHaveBeenCalled();
    expect(onAddFile).toHaveBeenCalled();
  });
});

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
