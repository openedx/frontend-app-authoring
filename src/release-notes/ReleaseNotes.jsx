import React, { useMemo, useEffect } from 'react';
import { StudioFooterSlot } from '@edx/frontend-component-footer';
import {
  Add as AddIcon, EditOutline, DeleteOutline, AccessTime as ClockIcon, Info,
} from '@openedx/paragon/icons';
import {
  Button,
  Layout,
  Container,
  Icon,
  IconButtonWithTooltip,
  OverlayTrigger,
  Tooltip,
  ModalDialog,
  Alert,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import moment from 'moment';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import Header from '../header';
import SubHeader from '../generic/sub-header/SubHeader';
import messages from './messages';
import { useReleaseNotes } from './hooks';
import DeleteModal from './delete-modal/DeleteModal';
import ReleaseNoteForm from './update-form/ReleaseNoteForm';
import ReleaseNotesSidebar from './sidebar/ReleaseNotesSidebar';
import { REQUEST_TYPES } from '../course-updates/constants';
import { groupNotesByDate } from './utils/groupNotes';
import unsavedMessages from './update-form/unsaved-modal-messages';

const ReleaseNotes = () => {
  const intl = useIntl();
  const { administrator } = getAuthenticatedUser() || {};
  const isDirtyCheckRef = React.useRef(() => false);
  const showUnsavedModalRef = React.useRef(null);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = React.useState(false);
  const {
    requestType,
    notes,
    notesInitialValues,
    isFormOpen,
    isDeleteModalOpen,
    closeForm,
    closeDeleteModal,
    handleUpdatesSubmit,
    handleOpenUpdateForm,
    handleDeleteUpdateSubmit,
    handleOpenDeleteForm,
    errors,
    savingStatuses,
  } = useReleaseNotes();

  const confirmCloseIfDirty = React.useCallback(() => {
    const isDirty = isDirtyCheckRef.current();
    if (isDirty) {
      setIsUnsavedModalOpen(true);
      return;
    }
    closeForm();
  }, [closeForm]);

  const handleLeaveEditor = () => {
    setIsUnsavedModalOpen(false);
    closeForm();
  };

  const getTzName = (date) => {
    try {
      const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
      const parts = new Intl.DateTimeFormat(undefined, { timeZone, timeZoneName: 'short' }).formatToParts(date);
      const shortName = (parts.find(p => p.type === 'timeZoneName') || {}).value;
      if (shortName && !/^GMT[+-]/i.test(shortName)) {
        return shortName;
      }
      if (timeZone) {
        const human = timeZone.split('/').pop().replace(/_/g, ' ');
        return `${human} Time`;
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormOpen) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFormOpen]);

  const groups = useMemo(() => groupNotesByDate(notes, intl), [notes, intl]);

  // Track active note by scroll and click
  const [activeNoteId, setActiveNoteId] = React.useState();

  // Scroll tracking: highlight the note whose heading is in view
  useEffect(() => {
    const handleScroll = () => {
      const noteEls = document.querySelectorAll('.release-note-item');
      let foundId = false;
      for (const el of noteEls) {
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight) {
          foundId = el.id.replace('note-', '');
          break;
        }
      }
      if (foundId) {
        setActiveNoteId(foundId);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Header isHiddenMainMenu />
      {errors.loadingNotes && (
        <Container size="xl" className="px-4 pt-4">
          <Alert variant="danger" icon={Info}>
            {intl.formatMessage(messages.errorLoadingPage)}
          </Alert>
        </Container>
      )}
      <Container size="xl" className="release-notes-page px-4 pt-4">
        <SubHeader
          title={intl.formatMessage(messages.headingTitle)}
          subtitle=""
          instruction=""
          headerActions={administrator && !errors.loadingNotes ? (
            <Button
              variant="primary"
              iconBefore={AddIcon}
              size="sm"
              className="new-post-button"
              onClick={() => handleOpenUpdateForm(REQUEST_TYPES.add_new_update)}
            >
              {intl.formatMessage(messages.newPostButton)}
            </Button>
          ) : null}
        />

        {!errors.loadingNotes && (
          groups.length > 0 ? (
            <Layout
              lg={[{ span: 9 }, { span: 3 }]}
              md={[{ span: 9 }, { span: 3 }]}
              xs={[{ span: 12 }, { span: 12 }]}
            >
              <Layout.Element>
                <article>
                  <section className="release-notes-list pt-5">
                    {groups.map((g) => (
                      <div key={g.key} className="mb-4">
                        {g.items.map((post) => (
                          <div id={`note-${post.id}`} key={post.id} className="release-note-item mb-4 pb-4">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h2 className="mb-4 pb-4">
                                  {post.published_at
                                    ? moment(post.published_at).format('MMMM D, YYYY')
                                    : intl.formatMessage({ id: 'release-notes.unscheduled.label', defaultMessage: 'Unscheduled' })}
                                </h2>
                                {post.published_at && moment(post.published_at).isAfter(moment()) && (
                                  <OverlayTrigger
                                    placement="right"
                                    overlay={(
                                      <Tooltip className="scheduled-tooltip" id={`scheduled-tooltip-${post.id}`}>
                                        {intl.formatMessage(messages.scheduledTooltip, {
                                          date: `${moment(post.published_at).format('MMMM D, YYYY h:mm A')} ${getTzName(new Date(post.published_at))}`,
                                        })}
                                      </Tooltip>
                                )}
                                  >
                                    <button
                                      type="button"
                                      className="btn-link d-inline-flex align-items-center text-muted small mr-2 p-0 border-0 text-decoration-none"
                                      aria-label={intl.formatMessage(messages.scheduledTooltip, {
                                        date: `${moment(post.published_at).format('MMMM D, YYYY h:mm A')} ${getTzName(new Date(post.published_at))}`,
                                      })}
                                    >
                                      <Icon
                                        className="mr-2 p-0 justify-content-start scheduled-icon"
                                        src={ClockIcon}
                                        alt={intl.formatMessage(messages.scheduledTooltip, {
                                          date: `${moment(post.published_at).format('MMMM D, YYYY h:mm A')} ${getTzName(new Date(post.published_at))}`,
                                        })}
                                      />
                                      <span className="post-scheduled mt-0">{intl.formatMessage(messages.scheduledLabel)}</span>
                                    </button>
                                  </OverlayTrigger>
                                )}
                                <div className="d-flex align-items-center mb-1 justify-content-between">
                                  <h3 className="m-0">{post.title}</h3>
                                  {administrator && (
                                    <div className="ml-3 d-flex">
                                      <IconButtonWithTooltip
                                        tooltipContent={intl.formatMessage(messages.editButton)}
                                        src={EditOutline}
                                        iconAs={Icon}
                                        className="edit-notes-hover"
                                        onClick={() => handleOpenUpdateForm(REQUEST_TYPES.edit_update, post)}
                                        data-testid="release-note-edit-button"
                                        disabled={isFormOpen}
                                      />
                                      <IconButtonWithTooltip
                                        tooltipContent={intl.formatMessage(messages.deleteButton)}
                                        src={DeleteOutline}
                                        iconAs={Icon}
                                        className="delete-notes-hover"
                                        onClick={() => handleOpenDeleteForm(post)}
                                        data-testid="release-note-delete-button"
                                        disabled={isFormOpen}
                                      />
                                    </div>
                                  )}
                                </div>
                                {/* eslint-disable-next-line react/no-danger */}
                                <div className="post-description" dangerouslySetInnerHTML={{ __html: post.description }} />
                              </div>

                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </section>
                </article>
              </Layout.Element>
              <Layout.Element>
                <ReleaseNotesSidebar
                  notes={notes}
                  activeNoteId={activeNoteId}
                  onNoteClick={setActiveNoteId}
                />
              </Layout.Element>
            </Layout>
          ) : (
            <div className="text-center py-5 d-flex justify-content-center align-items-center no-release-notes-container">
              <span className="medium">{intl.formatMessage(messages.noReleaseNotes)}</span>
            </div>
          )
        )}
      </Container>
      {isFormOpen && (
      <ModalDialog
        isOpen={isFormOpen}
        onClose={confirmCloseIfDirty}
        size="xl"
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {requestType === REQUEST_TYPES.add_new_update
              ? intl.formatMessage(messages.newPostButton)
              : intl.formatMessage(messages.editButton)}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          {(errors.savingNote || errors.creatingNote) && (
            <Alert variant="danger" icon={Info} className="mb-3">
              {intl.formatMessage(messages.errorSavingPost)}
            </Alert>
          )}
          <ReleaseNoteForm
            initialValues={notesInitialValues}
            close={closeForm}
            onSubmit={handleUpdatesSubmit}
            savingStatuses={savingStatuses}
            isDirtyCheckRef={isDirtyCheckRef}
            showUnsavedModalRef={showUnsavedModalRef}
            externalUnsavedModalOpen={isUnsavedModalOpen}
            setExternalUnsavedModalOpen={setIsUnsavedModalOpen}
          />
        </ModalDialog.Body>
      </ModalDialog>
      )}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        onDeleteSubmit={handleDeleteUpdateSubmit}
        errorDeleting={errors.deletingNote}
      />
      {isUnsavedModalOpen && (
        <ModalDialog isOpen size="md" onClose={() => setIsUnsavedModalOpen(false)}>
          <ModalDialog.Header>
            <ModalDialog.Title>
              {intl.formatMessage(unsavedMessages.unsavedModalTitle)}
            </ModalDialog.Title>
          </ModalDialog.Header>
          <ModalDialog.Body>
            <p>{intl.formatMessage(unsavedMessages.unsavedModalDescription)}</p>
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <Button variant="tertiary" onClick={() => setIsUnsavedModalOpen(false)}>
              {intl.formatMessage(unsavedMessages.keepEditingButton)}
            </Button>
            <Button variant="danger" onClick={handleLeaveEditor}>
              {intl.formatMessage(unsavedMessages.leaveEditorButton)}
            </Button>
          </ModalDialog.Footer>
        </ModalDialog>
      )}
      <StudioFooterSlot />
    </>
  );
};

export default ReleaseNotes;
