import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import messages from '../messages';

interface Props {
  onClick: () => void;
}

export const PublishButon = ({ onClick }: Props) => {
  const { canPublishCourseContent } = useCourseAuthoringContext();

  if (!canPublishCourseContent) {
    return null;
  }

  return (
    <Button
      variant="outline-primary w-100 rounded status-button draft-status"
      className="m-1"
      onClick={onClick}
    >
      <strong className="mr-1">
        <FormattedMessage {...messages.publishContainerButton} />
      </strong>
      <FormattedMessage {...messages.draftText} />
    </Button>
  );
};
