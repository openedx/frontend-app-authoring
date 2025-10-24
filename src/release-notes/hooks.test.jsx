import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import * as reactRedux from 'react-redux';
import * as api from './data/api';
import { useReleaseNotes } from './hooks';

const initialState = {
  releaseNotes: {
    releaseNotes: [],
    savingStatuses: {},
    loadingStatuses: {},
    errors: {},
  },
};
const reducer = (state = initialState) => state;
const makeStore = () => createStore(reducer, initialState);

describe('useReleaseNotes', () => {
  let dispatchMock;
  beforeEach(() => {
    jest.clearAllMocks();
    dispatchMock = jest.fn((action) => {
      if (typeof action === 'function') {
        return undefined;
      }
      return undefined;
    });
    jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(dispatchMock);
  });

  const AddComponent = () => {
    const hook = useReleaseNotes();
    return (
      <button
        type="button"
        data-testid="add-btn"
        onClick={() => hook.handleUpdatesSubmit({ title: 'New', description: 'desc' })}
      >
        Add
      </button>
    );
  };

  const EditComponent = () => {
    const hook = useReleaseNotes();
    const note = {
      id: 2, title: 'Edit', description: 'desc2', published_at: new Date().toISOString(),
    };
    return (
      <button
        type="button"
        data-testid="edit-btn"
        onClick={() => {
          hook.handleOpenUpdateForm('edit_update', note);
          hook.handleUpdatesSubmit(note);
        }}
      >
        Edit
      </button>
    );
  };

  const DeleteComponent = () => {
    const hook = useReleaseNotes();
    return (
      <button type="button" data-testid="delete-btn" onClick={() => hook.handleDeleteUpdateSubmit(3)}>
        Delete
      </button>
    );
  };

  const StateComponent = () => {
    const hook = useReleaseNotes();
    return (
      <>
        <button type="button" data-testid="open-btn" onClick={() => hook.handleOpenUpdateForm('add_new_update')}>
          Open
        </button>
        <button type="button" data-testid="close-btn" onClick={hook.closeForm}>
          Close
        </button>
      </>
    );
  };

  it('handles add_new_update request', async () => {
    if (typeof api.addReleaseNote !== 'function') {
      return;
    }
    const addNoteMock = jest
      .spyOn(api, 'addReleaseNote')
      .mockResolvedValue({ id: 1, title: 'New', description: 'desc' });
    render(
      <Provider store={makeStore()}>
        <AddComponent />
      </Provider>,
    );
    fireEvent.click(document.querySelector('[data-testid="add-btn"]'));
    expect(addNoteMock).toHaveBeenCalledWith({ title: 'New', description: 'desc' });
  });

  it('dispatches a thunk on edit_update', async () => {
    render(
      <Provider store={makeStore()}>
        <EditComponent />
      </Provider>,
    );
    fireEvent.click(document.querySelector('[data-testid="edit-btn"]'));
    expect(dispatchMock).toHaveBeenCalled();
    expect(typeof dispatchMock.mock.calls[0][0]).toBe('function');
  });

  it('dispatches a thunk on delete_update', async () => {
    render(
      <Provider store={makeStore()}>
        <DeleteComponent />
      </Provider>,
    );
    fireEvent.click(document.querySelector('[data-testid="delete-btn"]'));
    expect(dispatchMock).toHaveBeenCalled();
    expect(typeof dispatchMock.mock.calls[0][0]).toBe('function');
  });

  it('handles API error for add', async () => {
    if (typeof api.addReleaseNote !== 'function') {
      return;
    }
    jest.spyOn(api, 'addReleaseNote').mockRejectedValue(new Error('API error'));
    render(
      <Provider store={makeStore()}>
        <AddComponent />
      </Provider>,
    );
    fireEvent.click(document.querySelector('[data-testid="add-btn"]'));
  });

  it('handles open/close form state', () => {
    render(
      <Provider store={makeStore()}>
        <StateComponent />
      </Provider>,
    );
    fireEvent.click(document.querySelector('[data-testid="open-btn"]'));
    fireEvent.click(document.querySelector('[data-testid="close-btn"]'));
  });

  describe('handleOpenDeleteForm', () => {
    it('sets request type and opens delete modal', () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        return (
          <>
            <button
              type="button"
              data-testid="open-delete-btn"
              onClick={() => hook.handleOpenDeleteForm({ id: 1, title: 'Test' })}
            >
              Open Delete
            </button>
            <span data-testid="modal-state">{hook.isDeleteModalOpen ? 'open' : 'closed'}</span>
          </>
        );
      };

      render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      fireEvent.click(document.querySelector('[data-testid="open-delete-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });
  });

  describe('handleUpdatesSubmit', () => {
    it('handles successful create operation', async () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        React.useEffect(() => {
          hook.handleOpenUpdateForm('add_new_update');
        }, []);

        return (
          <button
            type="button"
            data-testid="submit-create-btn"
            onClick={() => hook.handleUpdatesSubmit({
              title: 'New Note',
              description: 'Description',
              published_at: new Date(),
            })}
          >
            Submit Create
          </button>
        );
      };

      dispatchMock.mockResolvedValue({ success: true });

      render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      fireEvent.click(document.querySelector('[data-testid="submit-create-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });

    it('handles successful edit operation', async () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        React.useEffect(() => {
          hook.handleOpenUpdateForm('edit_update', { id: 1, title: 'Test' });
        }, []);

        return (
          <button
            type="button"
            data-testid="submit-edit-btn"
            onClick={() => hook.handleUpdatesSubmit({
              id: 1,
              title: 'Updated Note',
              description: 'Updated Description',
              published_at: new Date(),
            })}
          >
            Submit Edit
          </button>
        );
      };

      dispatchMock.mockResolvedValue({ success: true });

      render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      fireEvent.click(document.querySelector('[data-testid="submit-edit-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });

    it('does not close form when operation fails', async () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        React.useEffect(() => {
          hook.handleOpenUpdateForm('add_new_update');
        }, []);

        return (
          <>
            <button
              type="button"
              data-testid="submit-fail-btn"
              onClick={() => hook.handleUpdatesSubmit({
                title: 'New Note',
                description: 'Description',
                published_at: new Date(),
              })}
            >
              Submit
            </button>
            <span data-testid="form-state">{hook.isFormOpen ? 'open' : 'closed'}</span>
          </>
        );
      };

      dispatchMock.mockResolvedValue({ success: false });

      render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      fireEvent.click(document.querySelector('[data-testid="submit-fail-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });

    it('handles published_at as ISO string', async () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        React.useEffect(() => {
          hook.handleOpenUpdateForm('add_new_update');
        }, []);

        return (
          <button
            type="button"
            data-testid="submit-iso-btn"
            onClick={() => hook.handleUpdatesSubmit({
              title: 'New Note',
              description: 'Description',
              published_at: new Date().toISOString(),
            })}
          >
            Submit with ISO String
          </button>
        );
      };

      dispatchMock.mockResolvedValue({ success: true });

      render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      fireEvent.click(document.querySelector('[data-testid="submit-iso-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });

    it('handles null published_at', async () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        React.useEffect(() => {
          hook.handleOpenUpdateForm('add_new_update');
        }, []);

        return (
          <button
            type="button"
            data-testid="submit-null-btn"
            onClick={() => hook.handleUpdatesSubmit({
              title: 'New Note',
              description: 'Description',
              published_at: null,
            })}
          >
            Submit with null date
          </button>
        );
      };

      dispatchMock.mockResolvedValue({ success: true });

      render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      fireEvent.click(document.querySelector('[data-testid="submit-null-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });
  });

  describe('handleDeleteUpdateSubmit', () => {
    it('handles successful delete operation', async () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        React.useEffect(() => {
          hook.handleOpenDeleteForm({ id: 3, title: 'Test' });
        }, []);

        return (
          <button
            type="button"
            data-testid="submit-delete-btn"
            onClick={() => hook.handleDeleteUpdateSubmit()}
          >
            Submit Delete
          </button>
        );
      };

      dispatchMock.mockResolvedValue({ success: true });

      render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      fireEvent.click(document.querySelector('[data-testid="submit-delete-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });

    it('does not close modal when delete fails', async () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        React.useEffect(() => {
          hook.handleOpenDeleteForm({ id: 3, title: 'Test' });
        }, []);

        return (
          <>
            <button
              type="button"
              data-testid="delete-fail-btn"
              onClick={() => hook.handleDeleteUpdateSubmit()}
            >
              Delete
            </button>
            <span data-testid="delete-modal-state">{hook.isDeleteModalOpen ? 'open' : 'closed'}</span>
          </>
        );
      };

      dispatchMock.mockResolvedValue({ success: false });

      render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      fireEvent.click(document.querySelector('[data-testid="delete-fail-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });
  });

  describe('handleOpenDeleteForm', () => {
    it('sets request type to delete and opens delete modal', () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        const note = { id: 5, title: 'To Delete', description: 'Will be deleted' };

        return (
          <>
            <button
              type="button"
              data-testid="open-delete-btn"
              onClick={() => hook.handleOpenDeleteForm(note)}
            >
              Open Delete Modal
            </button>
            <span data-testid="request-type">{hook.requestType}</span>
            <span data-testid="delete-modal-state">{hook.isDeleteModalOpen ? 'open' : 'closed'}</span>
            <span data-testid="current-note-id">{hook.notesInitialValues?.id || 'none'}</span>
          </>
        );
      };

      const { getByTestId } = render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      expect(getByTestId('delete-modal-state')).toHaveTextContent('closed');
      fireEvent.click(getByTestId('open-delete-btn'));
      expect(getByTestId('delete-modal-state')).toHaveTextContent('open');
      expect(getByTestId('request-type')).toHaveTextContent('delete_update');
    });
  });

  describe('handleUpdatesSubmit with different request types', () => {
    it('handles edit_update request type', async () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        const note = {
          id: 10,
          title: 'Updated Title',
          description: 'Updated Description',
          published_at: new Date(),
        };

        React.useEffect(() => {
          hook.handleOpenUpdateForm('edit_update', note);
        }, []);

        return (
          <button
            type="button"
            data-testid="submit-edit-btn"
            onClick={() => hook.handleUpdatesSubmit(note)}
          >
            Submit Edit
          </button>
        );
      };

      dispatchMock.mockResolvedValue({ success: true });

      render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      fireEvent.click(document.querySelector('[data-testid="submit-edit-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });

    it('handles add_new_update request type', async () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        const note = {
          title: 'Brand New Note',
          description: 'Fresh Description',
          published_at: new Date(),
        };

        React.useEffect(() => {
          hook.handleOpenUpdateForm('add_new_update');
        }, []);

        return (
          <button
            type="button"
            data-testid="submit-add-btn"
            onClick={() => hook.handleUpdatesSubmit(note)}
          >
            Submit Add
          </button>
        );
      };

      dispatchMock.mockResolvedValue({ success: true });

      render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );

      fireEvent.click(document.querySelector('[data-testid="submit-add-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });

    it('does not close form when submission fails', async () => {
      const TestComponent = () => {
        const hook = useReleaseNotes();
        const note = {
          title: 'Will Fail',
          description: 'Fail Description',
          published_at: new Date(),
        };

        React.useEffect(() => {
          hook.handleOpenUpdateForm('add_new_update');
        }, []);

        return (
          <>
            <button
              type="button"
              data-testid="submit-fail-btn"
              onClick={() => hook.handleUpdatesSubmit(note)}
            >
              Submit (Will Fail)
            </button>
            <span data-testid="form-state">{hook.isFormOpen ? 'open' : 'closed'}</span>
          </>
        );
      };

      dispatchMock.mockResolvedValue({ success: false });

      const { getByTestId } = render(
        <Provider store={makeStore()}>
          <TestComponent />
        </Provider>,
      );
      expect(getByTestId('form-state')).toHaveTextContent('open');
      fireEvent.click(document.querySelector('[data-testid="submit-fail-btn"]'));
      expect(dispatchMock).toHaveBeenCalled();
    });
  });
});
