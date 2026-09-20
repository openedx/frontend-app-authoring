import { useSelector } from 'react-redux';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { Divider } from '@src/generic/divider';
import { getCanEdit, getCourseUnitData } from '@src/course-unit/data/selectors';
import { useClipboard } from '@src/generic/clipboard';
import messages from '../../messages';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

interface ActionButtonsProps {
  openDiscardModal: () => void;
  handlePublishing: () => void;
  hideCopyButton?: boolean;
}

const ActionButtons = ({
  openDiscardModal,
  handlePublishing,
  hideCopyButton = false,
}: ActionButtonsProps) => {
  const intl = useIntl();
  const {
    id,
    published,
    hasChanges,
  } = useSelector(getCourseUnitData);
  const canEdit = useSelector(getCanEdit);
  const { copyToClipboard } = useClipboard();
  const { canPublishCourseContent, canEditCourseContent } = useCourseAuthoringContext();

  return (
    <>
      {(!published || hasChanges) && canPublishCourseContent && (
        <Button
          size="sm"
          className="mt-3.5"
          variant="primary"
          onClick={handlePublishing}
        >
          {intl.formatMessage(messages.actionButtonPublishTitle)}
        </Button>
      )}
      {(published && hasChanges) && canEditCourseContent && (
        <Button
          size="sm"
          variant="link"
          onClick={openDiscardModal}
          className="course-unit-sidebar-footer__discard-changes__btn mt-2"
        >
          {intl.formatMessage(messages.actionButtonDiscardChangesTitle)}
        </Button>
      )}
      {canEdit && !hideCopyButton && canEditCourseContent && (
        <>
          <Divider className="course-unit-sidebar-footer__divider" />
          <Button
            onClick={() => copyToClipboard(id)}
            variant="outline-primary"
            size="sm"
          >
            {intl.formatMessage(messages.actionButtonCopyUnitTitle)}
          </Button>
        </>
      )}
    </>
  );
};

export default ActionButtons;
