import { Provider } from 'react-redux';

import { act } from '@testing-library/react';
import {
  render,
  screen,
  fireEvent,
  initializeMocks,
  waitFor,
  within,
} from '@src/testUtils';
import editorStore from '@src/editors/data/store';
import { EditorContextProvider } from '@src/editors/EditorContext';
import EditorContainer, { EditorModalWrapper } from '.';
import TitleHeader from './components/TitleHeader';
import * as hooks from './hooks';

// The built-in save. Stubbed so we can tell whether the container fell back to
// it or honoured the `onSave` override.
const builtInSave = jest.fn();
// The cancel flow's first step. Shared so tests can assert it was, or was not,
// reached.
const openCancelConfirmModal = jest.fn();

// TitleHeader truncates the block title from the editor store, which is null
// until a block has been fetched. Stubbed, and a jest.fn so the props the
// container hands it can be asserted.
jest.mock('./components/TitleHeader', () => ({ __esModule: true, default: jest.fn(() => null) }));

jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  isInitialized: () => true,
  saveFailed: () => false,
  createFailed: () => ({ createFailed: false, createFailedError: null }),
  handleCancel: () => jest.fn(),
  cancelConfirmModalToggle: () => ({
    isCancelConfirmOpen: false,
    openCancelConfirmModal,
    closeCancelConfirmModal: jest.fn(),
  }),
  handleSaveClicked: jest.fn(() => builtInSave),
}));

// The container reads the editors' own redux slice, so wrap it the way
// EditorPage does rather than relying on the app-wide test store.
const renderContainer = (props: Partial<React.ComponentProps<typeof EditorContainer>> = {}) =>
  render(
    <Provider store={editorStore}>
      <EditorContextProvider learningContextId="course-v1:Org+TS100+24">
        <EditorContainer
          getContent={() => ({})}
          isDirty={() => false}
          onClose={jest.fn()}
          {...props}
        >
          <div>editor body</div>
        </EditorContainer>
      </EditorContextProvider>
    </Provider>,
  );

describe('EditorContainer onSave override', () => {
  beforeEach(() => {
    initializeMocks();
    builtInSave.mockClear();
    openCancelConfirmModal.mockClear();
    (hooks.handleSaveClicked as jest.Mock).mockClear();
  });

  it('uses the built-in save when no override is given', () => {
    renderContainer();
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(builtInSave).toHaveBeenCalledTimes(1);
  });

  it('calls the override instead of the built-in save', () => {
    const onSave = jest.fn();
    renderContainer({ onSave });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(builtInSave).not.toHaveBeenCalled();
  });

  it('still runs validateEntry first and blocks the override when it fails', () => {
    const onSave = jest.fn();
    const validateEntry = jest.fn(() => false);
    renderContainer({ onSave, validateEntry });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(validateEntry).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
    expect(builtInSave).not.toHaveBeenCalled();
  });

  it('lets the override through when validateEntry passes', () => {
    const onSave = jest.fn();
    const validateEntry = jest.fn(() => true);
    renderContainer({ onSave, validateEntry });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(validateEntry).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  // The plugin can be waiting on an upload for a while before it sends
  // anything. Leaving the page in that window must still warn.
  it('keeps the leave-page warning armed until the override has resolved', async () => {
    let finish;
    const onSave = jest.fn(() =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
    );
    renderContainer({ onSave, isDirty: () => true });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    const leaving = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(leaving);
    expect(leaving.defaultPrevented).toBe(true);

    await act(async () => {
      finish();
    });
    const leavingAfter = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(leavingAfter);
    expect(leavingAfter.defaultPrevented).toBe(false);
  });

  it('shows the save-failed message and keeps the editor dirty when the override rejects', async () => {
    const onSave = jest.fn(() => Promise.reject(new Error('handler said no')));
    renderContainer({ onSave, isDirty: () => true });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText(/Content save failed/)).toBeInTheDocument();
    expect(builtInSave).not.toHaveBeenCalled();
  });

  // A second request would race the first: one failing re-enables the form
  // while the other can still succeed and close the editor.
  it('ignores further Save clicks while the override is still saving', async () => {
    let finish;
    const onSave = jest.fn(() =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
    );
    renderContainer({ onSave });
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    // Two clicks before React has re-rendered, as a double-click delivers them.
    act(() => {
      saveButton.click();
      saveButton.click();
    });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(saveButton).toBeDisabled();

    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(1);

    await act(async () => {
      finish();
    });
  });

  // The request is out; it cannot be taken back. Cancelling now would let
  // the author discard an editor whose content is about to be persisted.
  it('refuses Cancel and the close icon while the override is still saving', async () => {
    let finish;
    const onSave = jest.fn(() =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
    );
    renderContainer({ onSave, isDirty: () => true });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    const cancel = screen.getByRole('button', { name: /discard changes and return/i });
    const close = screen.getByRole('button', { name: /exit the editor/i });
    expect(cancel).toBeDisabled();
    expect(close).toBeDisabled();
    fireEvent.click(cancel);
    fireEvent.click(close);
    expect(openCancelConfirmModal).not.toHaveBeenCalled();

    await act(async () => {
      finish();
    });
  });

  // The modal's own close affordance (Escape / backdrop click) bypasses the
  // disabled footer/header buttons entirely, so it needs its own guard.
  it('refuses to close via the modal backdrop while the override is still saving', async () => {
    let finish;
    const onSave = jest.fn(() =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
    );
    renderContainer({ onSave, isDirty: () => true });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(openCancelConfirmModal).not.toHaveBeenCalled();

    await act(async () => {
      finish();
    });
  });

  it('lets the author cancel again once the override has failed', async () => {
    const onSave = jest.fn(() => Promise.reject(new Error('handler said no')));
    renderContainer({ onSave, isDirty: () => true });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText(/Content save failed/)).toBeInTheDocument();

    const cancel = screen.getByRole('button', { name: /discard changes and return/i });
    expect(cancel).toBeEnabled();
    fireEvent.click(cancel);
    expect(openCancelConfirmModal).toHaveBeenCalledTimes(1);
  });

  it('lets the author save again once the override has failed', async () => {
    const onSave = jest.fn(() => Promise.reject(new Error('handler said no')));
    renderContainer({ onSave, isDirty: () => true });
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);
    expect(await screen.findByText(/Content save failed/)).toBeInTheDocument();

    expect(saveButton).toBeEnabled();
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(saveButton).toBeEnabled());
  });

  // The title is edited in this container's header, outside the editor body.
  // The override reads it once, when it sends; a change after that would be
  // dropped when the save lands and the editor closes.
  it('locks the title while the override is saving, and unlocks it if the save fails', async () => {
    const titleProps = () => (TitleHeader as unknown as jest.Mock).mock.lastCall[0];
    let fail;
    const onSave = jest.fn(() =>
      new Promise<void>((_resolve, reject) => {
        fail = reject;
      })
    );
    renderContainer({ onSave, isDirty: () => true });
    expect(titleProps().isEditDisabled).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(titleProps().isEditDisabled).toBe(true);

    await act(async () => {
      fail(new Error('handler said no'));
    });
    expect(titleProps().isEditDisabled).toBe(false);
  });

  // An override need not be async: one that throws before returning anything
  // is a failed save like any other, and must not leave Save disabled.
  it('treats an override that throws as a failed save', async () => {
    const onSave = jest.fn(() => {
      throw new Error('could not even start');
    });
    renderContainer({ onSave, isDirty: () => true });
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/Content save failed/)).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
    expect(builtInSave).not.toHaveBeenCalled();
  });

  it('clears the save-failed message when it is dismissed', async () => {
    const onSave = jest.fn(() => Promise.reject(new Error('handler said no')));
    renderContainer({ onSave, isDirty: () => true });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    // The toast sits outside the modal, which hides everything but itself from
    // the accessibility tree, hence `hidden: true`.
    const toast = await screen.findByRole('alert', { hidden: true });
    expect(toast).toHaveTextContent(/Content save failed/);

    fireEvent.click(within(toast).getByRole('button', { name: /close/i, hidden: true }));
    await waitFor(() => expect(screen.queryByText(/Content save failed/)).not.toBeInTheDocument());
  });

  it('shows no failure message when the override resolves', async () => {
    const onSave = jest.fn(() => Promise.resolve());
    renderContainer({ onSave });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/Content save failed/)).not.toBeInTheDocument();
  });

  it('toggles fullscreen sizing and the header icon when the fullscreen button is clicked', () => {
    renderContainer();
    expect(screen.getByRole('dialog')).toHaveClass('pgn__modal-xl');

    fireEvent.click(screen.getByRole('button', { name: /toggle fullscreen/i }));
    expect(screen.getByRole('dialog')).toHaveClass('pgn__modal-fullscreen');
  });

  it('does not crash when a caller omits onClose', () => {
    renderContainer({ onClose: undefined });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});

describe('EditorModalWrapper', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('defaults to non-fullscreen sizing when fullscreen is omitted', () => {
    render(
      <EditorModalWrapper onClose={jest.fn()}>
        <div>content</div>
      </EditorModalWrapper>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('pgn__modal-xl');
  });
});
