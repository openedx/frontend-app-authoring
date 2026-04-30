import { render, initializeMocks } from '@src/testUtils';
import JsonInput from './JsonInput';

/**
 * Captures the blur handler registered by CodeMirror during mount.
 *
 * JsonInput initializes CodeMirror once (useEffect with [] deps). The blur
 * handler is registered at that point and never replaced. The bug that was
 * fixed is: without refs, the blur handler captures `onBlur` from the FIRST
 * render and never updates it. After the user types (triggering re-renders
 * with a new `handleCommit` that closes over the latest `newValue`), the
 * stale handler would still commit the ORIGINAL value, discarding all edits.
 *
 * With the fix (onBlurRef), the registered handler always calls
 * `onBlurRef.current`, which is kept up-to-date on every render.
 */
let registeredBlurHandler: (() => void) | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedUpdateListener: ((update: any) => void) | null = null;

jest.mock('codemirror', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const EditorViewMock: any = jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    dispatch: jest.fn(),
    state: { doc: { length: 0, toString: () => '' } },
  }));
  EditorViewMock.theme = jest.fn(() => ({}));
  EditorViewMock.updateListener = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    of: jest.fn((cb: (update: any) => void) => {
      capturedUpdateListener = cb;
      return {};
    }),
  };
  EditorViewMock.domEventHandlers = jest.fn((handlers: { blur: () => void; }) => {
    registeredBlurHandler = handlers.blur;
    return {};
  });
  return { minimalSetup: [], EditorView: EditorViewMock };
});

jest.mock('@codemirror/state', () => ({
  EditorState: {
    create: jest.fn(({ doc, extensions }: { doc: string; extensions: unknown[]; }) => ({ doc, extensions })),
  },
  Annotation: {
    define: jest.fn(() => ({ of: jest.fn((val: boolean) => ({ type: 'programmatic', val })) })),
  },
}));

jest.mock('@codemirror/lang-json', () => ({ json: jest.fn(() => ({})) }));

describe('<JsonInput />', () => {
  beforeEach(() => {
    initializeMocks();
    registeredBlurHandler = null;
    capturedUpdateListener = null;
  });

  it('calls the latest onBlur after re-renders, not the stale initial one', () => {
    /**
     * Regression test for the stale closure bug.
     *
     * Scenario that was broken:
     *   1. JsonInput mounts → CodeMirror registers `blur: () => onBlur()`
     *      with `onBlur` captured from the FIRST render (= initial handleCommit,
     *      which closes over newValue = initialValue).
     *   2. User types → parent re-renders with a new `onBlur` (new handleCommit
     *      that closes over the updated newValue).
     *   3. User blurs → the stale handler fires the FIRST onBlur → commits
     *      initialValue → changes are lost on save.
     *
     * After the fix (using onBlurRef):
     *   The registered handler calls `onBlurRef.current()`, which is updated
     *   on every render via useEffect. Blur always calls the latest onBlur.
     */
    const onBlurInitial = jest.fn(); // onBlur from the first render (stale)
    const onBlurUpdated = jest.fn(); // onBlur from a subsequent render (latest)
    const onChange = jest.fn();

    // First render — CodeMirror mounts and registers the blur handler
    const { rerender } = render(
      <JsonInput
        initialValue='["module_a"]'
        onChange={onChange}
        onBlur={onBlurInitial}
        isEditableState={false}
      />,
    );

    // Simulate parent re-render after the user has typed (new handleCommit
    // that closes over the updated newValue is passed as onBlur)
    rerender(
      <JsonInput
        initialValue='["module_a"]'
        onChange={onChange}
        onBlur={onBlurUpdated}
        isEditableState={false}
      />,
    );

    // Trigger the blur handler that was registered by CodeMirror on mount —
    // this is the exact handler that fires when the user clicks away from the editor
    expect(registeredBlurHandler).not.toBeNull();
    registeredBlurHandler!();

    // The LATEST onBlur must be called so the current newValue gets committed
    expect(onBlurUpdated).toHaveBeenCalledTimes(1);
    // The stale initial onBlur must NOT be called (that would commit initialValue)
    expect(onBlurInitial).not.toHaveBeenCalled();
  });

  it('calls onChange when a user-driven document change occurs', () => {
    const onChange = jest.fn();
    render(
      <JsonInput
        initialValue="[]"
        onChange={onChange}
        onBlur={jest.fn()}
        isEditableState={false}
      />,
    );
    expect(capturedUpdateListener).not.toBeNull();
    // Simulate a user-driven change: docChanged=true, no programmatic annotation
    capturedUpdateListener!({
      docChanged: true,
      transactions: [{ annotation: jest.fn().mockReturnValue(undefined) }],
      state: { doc: { toString: () => '["new"]' } },
    });
    expect(onChange).toHaveBeenCalledWith('["new"]');
  });

  it('does not call onChange for programmatic dispatches', () => {
    const onChange = jest.fn();
    render(
      <JsonInput
        initialValue="[]"
        onChange={onChange}
        onBlur={jest.fn()}
        isEditableState={false}
      />,
    );
    expect(capturedUpdateListener).not.toBeNull();
    // Simulate a programmatic dispatch (e.g. reset after cancel)
    capturedUpdateListener!({
      docChanged: true,
      transactions: [{ annotation: jest.fn().mockReturnValue(true) }],
      state: { doc: { toString: () => '["reset"]' } },
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
