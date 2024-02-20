import React, { useContext } from 'react';
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
} from '@openedx/paragon';
import {
  DeleteOutline,
  EditOutline,
  SpinnerSimple,
  Visibility,
  VisibilityOff,
} from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';
import { deleteSingleCustomPage, updateCustomPageVisibility } from './data/thunks';
import messages from './messages';
import { CustomPagesContext } from './CustomPagesProvider';

const CustomPageCard = ({
  page,
  dispatch,
  deletePageStatus,
  setCurrentPage,
  // injected
  intl,
}) => {
  const [isDeleteConfirmationOpen, openDeleteConfirmation, closeDeleteConfirmation] = useToggle(false);
  const { path: customPagesPath } = useContext(CustomPagesContext);
  const navigate = useNavigate();

  const handleDelete = () => {
    dispatch(deleteSingleCustomPage({
      blockId: page.id,
      closeConfirmation: closeDeleteConfirmation,
    }));
  };

  const toggleVisibility = () => {
    dispatch(updateCustomPageVisibility({
      blockId: page.id,
      metadata: { course_staff_only: !page.courseStaffOnly },
    }));
  };
  const handleEditOpen = () => {
    setCurrentPage(page.id);
    navigate(`${customPagesPath}/editor`);
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
        <div className="h4" data-testid="card-title">
          {page?.name || intl.formatMessage(messages.newPageTitle)}
        </div>
        <ActionRow.Spacer />
        <IconButtonWithTooltip
          key={intl.formatMessage(messages.editTooltipContent)}
          tooltipPlacement="top"
          tooltipContent={intl.formatMessage(messages.editTooltipContent)}
          src={EditOutline}
          iconAs={Icon}
          alt={intl.formatMessage(messages.editTooltipContent)}
          onClick={handleEditOpen}
          data-testid="edit-modal-icon"
        />
        <IconButtonWithTooltip
          key={intl.formatMessage(messages.visibilityTooltipContent)}
          tooltipPlacement="top"
          tooltipContent={intl.formatMessage(messages.visibilityTooltipContent)}
          src={page.courseStaffOnly ? VisibilityOff : Visibility}
          iconAs={Icon}
          alt={intl.formatMessage(messages.visibilityTooltipContent)}
          onClick={toggleVisibility}
          data-testid="visibility-toggle-icon"
        />
        <IconButtonWithTooltip
          key={intl.formatMessage(messages.deleteTooltipContent)}
          tooltipPlacement="top"
          tooltipContent={intl.formatMessage(messages.deleteTooltipContent)}
          src={DeleteOutline}
          iconAs={Icon}
          alt={intl.formatMessage(messages.deleteTooltipContent)}
          onClick={openDeleteConfirmation}
          data-testid="delete-modal-icon"
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
    </>
  );
};

CustomPageCard.propTypes = {
  page: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string.isRequired,
    courseStaffOnly: PropTypes.bool.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  deletePageStatus: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(CustomPageCard);
