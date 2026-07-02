import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
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
import { RequestStatus } from '@src/data/constants';
import ErrorAlert from '@src/editors/sharedComponents/ErrorAlerts/ErrorAlert';
import { useDeleteCustomPage, useUpdateCustomPageVisibility } from './data/apiHooks';
import messages from './messages';

const CustomPageCard = ({
  page,
  courseId,
  setCurrentPage,
}) => {
  const intl = useIntl();
  const [isDeleteConfirmationOpen, openDeleteConfirmation, closeDeleteConfirmation] = useToggle(false);
  const navigate = useNavigate();

  const deleteMutation = useDeleteCustomPage(courseId);
  const visibilityMutation = useUpdateCustomPageVisibility(courseId);

  const handleDelete = () => {
    deleteMutation.mutate(page.id, { onSettled: closeDeleteConfirmation });
  };

  const toggleVisibility = () => {
    visibilityMutation.mutate({
      blockId: page.id,
      // snake_case matches the API wire format from existing thunk
      metadata: { course_staff_only: !page.courseStaffOnly },
    });
  };

  const handleEditOpen = () => {
    setCurrentPage(page.id);
    navigate(`/course/${courseId}/custom-pages/editor`);
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
      <ErrorAlert hideHeading isError={deleteMutation.isError}>
        {intl.formatMessage(messages.errorAlertMessage, { actionName: 'delete' })}
      </ErrorAlert>
      <ErrorAlert hideHeading isError={visibilityMutation.isError}>
        {intl.formatMessage(messages.errorAlertMessage, { actionName: 'save' })}
      </ErrorAlert>
      <AlertModal
        title={intl.formatMessage(messages.deleteConfirmationTitle)}
        isOpen={isDeleteConfirmationOpen}
        onClose={closeDeleteConfirmation}
        footerNode={
          <ActionRow>
            <Button variant="tertiary" onClick={closeDeleteConfirmation}>
              {intl.formatMessage(messages.cancelButtonLabel)}
            </Button>
            <StatefulButton
              onClick={handleDelete}
              state={deleteMutation.isPending ? RequestStatus.PENDING : 'default'}
              {...deletePageStateProps}
            />
          </ActionRow>
        }
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
  courseId: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};

export default CustomPageCard;
