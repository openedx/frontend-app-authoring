import moment from 'moment/moment';
import { useEffect, useState } from 'react';
import { useToggle } from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';

import { REQUEST_TYPES } from '../course-updates/constants';
import {
  fetchReleaseNotesQuery,
  createReleaseNoteQuery,
  editReleaseNoteQuery,
  deleteReleaseNoteQuery,
} from './data/thunk';
import {
  getReleaseNotes as selectReleaseNotes,
  getLoadingStatuses,
  getSavingStatuses,
  getErrors,
} from './data/selectors';

const useReleaseNotes = () => {
  const dispatch = useDispatch();
  const initialNote = {
    id: undefined, published_at: moment().utc().toDate(), title: '', description: '',
  };

  const [requestType, setRequestType] = useState('');
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [currentNote, setCurrentNote] = useState(initialNote);

  const notes = useSelector(selectReleaseNotes) || [];
  const loadingStatuses = useSelector(getLoadingStatuses);
  const savingStatuses = useSelector(getSavingStatuses);
  const errors = useSelector(getErrors);

  useEffect(() => {
    dispatch(fetchReleaseNotesQuery());
  }, [dispatch]);

  const notesInitialValues = currentNote;

  const handleOpenUpdateForm = (type, note) => {
    setRequestType(type);

    switch (type) {
      case REQUEST_TYPES.add_new_update:
        setCurrentNote(initialNote);
        break;
      case REQUEST_TYPES.edit_update:
        setCurrentNote(note);
        break;
      default:
        window.scrollTo(0, 0);
    }

    openForm();
  };

  const handleOpenDeleteForm = (note) => {
    setRequestType(REQUEST_TYPES.delete_update);
    setCurrentNote(note);
    openDeleteModal();
  };

  const handleUpdatesSubmit = async (data) => {
    const payload = {
      ...data,
      published_at:
        data.published_at && data.published_at.toISOString
          ? data.published_at.toISOString()
          : data.published_at,
    };

    let result;
    switch (requestType) {
      case REQUEST_TYPES.add_new_update:
        result = await dispatch(createReleaseNoteQuery(payload));
        break;
      case REQUEST_TYPES.edit_update:
        result = await dispatch(editReleaseNoteQuery(payload));
        break;
      default:
        break;
    }

    // Only close form if the operation was successful
    if (result?.success) {
      closeForm();
      setCurrentNote(initialNote);
    }
  };

  const handleDeleteUpdateSubmit = async () => {
    const { id } = currentNote;
    const result = await dispatch(deleteReleaseNoteQuery(id));

    // Only close modal if delete was successful
    if (result?.success) {
      setCurrentNote(initialNote);
      closeDeleteModal();
    }
  };

  return {
    requestType,
    notes,
    notesInitialValues,
    isMainFormOpen: isFormOpen && requestType !== REQUEST_TYPES.edit_update,
    isInnerFormOpen: (id) => (
      isFormOpen && currentNote.id === id && requestType === REQUEST_TYPES.edit_update
    ),
    isFormOpen,
    isDeleteModalOpen,
    closeForm,
    closeDeleteModal,
    handleUpdatesSubmit,
    handleOpenUpdateForm,
    handleDeleteUpdateSubmit,
    handleOpenDeleteForm,
    loadingStatuses,
    savingStatuses,
    errors,
  };
};

export { useReleaseNotes };
