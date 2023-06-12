import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  IconButtonWithTooltip,
  Icon,
  AlertModal,
  Button,
  StatefulButton,
  useToggle,
} from '@edx/paragon';
import {
  DeleteOutline,
  EditOutline,
  SpinnerSimple,
  Visibility,
  VisibilityOff,
} from '@edx/paragon/icons';
import { deleteSingleCustomPage, updateCustomPageVisibility, updateSingleCustomPage } from './data/thunks';
import EditModal from './EditModal';
import messages from './messages';

const CustomPageCard = ({
  page,
  dispatch,
  deletePageStatus,
  courseId,
  // injected
  intl,
}) => {
  const [isEditModalOpen, openEditModal, closeEditModal] = useToggle(false);
  const [isDeleteConfirmationOpen, openDeleteConfirmation, closeDeleteConfirmation] = useToggle(false);
  const handleDelete = () => {
    dispatch(deleteSingleCustomPage({
      blockId: page.id,
      closeConfirmation: closeDeleteConfirmation,
    }));
  };

  const toggleVisibilty = () => {
    dispatch(updateCustomPageVisibility({
      blockId: page.id,
      metadata: { course_staff_only: !page.courseStaffOnly },
    }));
  };

  const handleEditClose = () => (content) => {
    if (!content?.metadata) {
      closeEditModal();
      return;
    }
    dispatch(updateSingleCustomPage({
      blockId: page.id,
      metadata: { displayName: content.metadata.display_name },
      onClose: closeEditModal,
    }));
  };

  const deletePageStateProps = {
    labels: {
      default: intl.formatMessage(messages.deletePageLabel),
      pending: intl.formatMessage(messages.deletingPageBodyLabel),
    },
    icons: {
      pending: <Icon src={SpinnerSimple} className="icon-spin" />,
    },
    disabledStates: ['pending'],
  };

  return (
    <>
      <ActionRow>
        <div className="h4">
          {page?.name || 'Empty'}
        </div>
        <ActionRow.Spacer />
        <IconButtonWithTooltip
          key={intl.formatMessage(messages.editTooltipContent)}
          tooltipPlacement="top"
          tooltipContent={intl.formatMessage(messages.editTooltipContent)}
          src={EditOutline}
          iconAs={Icon}
          alt={intl.formatMessage(messages.editTooltipContent)}
          onClick={openEditModal}
        />
        <IconButtonWithTooltip
          key={intl.formatMessage(messages.visibilityTooltipContent)}
          tooltipPlacement="top"
          tooltipContent={intl.formatMessage(messages.visibilityTooltipContent)}
          src={page.courseStaffOnly ? VisibilityOff : Visibility}
          iconAs={Icon}
          alt={intl.formatMessage(messages.visibilityTooltipContent)}
          onClick={toggleVisibilty}
        />
        <IconButtonWithTooltip
          key={intl.formatMessage(messages.deleteTooltipContent)}
          tooltipPlacement="top"
          tooltipContent={intl.formatMessage(messages.deleteTooltipContent)}
          src={DeleteOutline}
          iconAs={Icon}
          alt={intl.formatMessage(messages.deleteTooltipContent)}
          onClick={openDeleteConfirmation}
        />
      </ActionRow>
      <AlertModal
        title={intl.formatMessage(messages.deleteConfirmationTitle)}
        isOpen={isDeleteConfirmationOpen}
        onClose={closeDeleteConfirmation}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={closeDeleteConfirmation}>
              {intl.formatMessage(messages.cancelButtonLabel)}
            </Button>
            <StatefulButton onClick={handleDelete} state={deletePageStatus} {...deletePageStateProps} />
          </ActionRow>
        )}
      >
        {intl.formatMessage(messages.deleteConfirmationMessage)}
      </AlertModal>
      <EditModal isOpen={isEditModalOpen} page={page} courseId={courseId} onClose={handleEditClose} />
    </>
  );
};

CustomPageCard.propTypes = {
  page: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string.isRequired,
    courseStaffOnly: PropTypes.bool.isRequired,
  }).isRequired,
  courseId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  deletePageStatus: PropTypes.string.isRequired,
  editorPath: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(CustomPageCard);
