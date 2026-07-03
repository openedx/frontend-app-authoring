import React from 'react';
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
import { RequestStatus } from '@src/data/constants';
import { useNavigate } from 'react-router-dom';
import { type CustomPage } from './data/apiHooks';
import messages from './messages';

interface CustomPageCardProps {
  page: CustomPage;
  courseId: string;
  setCurrentPage: (id: string) => void;
  onDelete: (blockId: string, onSettled?: () => void) => void;
  isDeleting: boolean;
  onToggleVisibility: (blockId: string, courseStaffOnly: boolean) => void;
}

const CustomPageCard = ({
  page,
  courseId,
  setCurrentPage,
  onDelete,
  isDeleting,
  onToggleVisibility,
}: CustomPageCardProps) => {
  const intl = useIntl();
  const [isDeleteConfirmationOpen, openDeleteConfirmation, closeDeleteConfirmation] = useToggle(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    onDelete(page.id, closeDeleteConfirmation);
  };

  const toggleVisibility = () => {
    onToggleVisibility(page.id, page.courseStaffOnly ?? false);
  };

  const handleEditOpen = () => {
    setCurrentPage(page.id);
    navigate(`/course/${courseId}/custom-pages/editor`);
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
        footerNode={
          <ActionRow>
            <Button variant="tertiary" onClick={closeDeleteConfirmation}>
              {intl.formatMessage(messages.cancelButtonLabel)}
            </Button>
            <StatefulButton
              onClick={handleDelete}
              state={isDeleting ? RequestStatus.PENDING : 'default'}
              labels={{
                default: intl.formatMessage(messages.deletePageLabel),
                pending: intl.formatMessage(messages.deletingPageBodyLabel),
              }}
              icons={{
                pending: <Icon src={SpinnerSimple} className="icon-spin" />,
              }}
              disabledStates={['pending']}
            />
          </ActionRow>
        }
      >
        {intl.formatMessage(messages.deleteConfirmationMessage)}
      </AlertModal>
    </>
  );
};

export default CustomPageCard;
