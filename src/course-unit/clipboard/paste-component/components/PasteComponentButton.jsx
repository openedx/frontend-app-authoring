import PropsTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { ContentCopy as ContentCopyIcon } from '@openedx/paragon/icons';

import messages from '../messages';

const PasteComponentButton = ({ handleCreateNewCourseXBlock }) => {
  const intl = useIntl();
  const { blockId } = useParams();

  const handlePasteXBlockComponent = () => {
    handleCreateNewCourseXBlock({ stagedContent: 'clipboard', parentLocator: blockId }, null, blockId);
  };

  return (
    <Button
      iconBefore={ContentCopyIcon}
      variant="outline-primary"
      block
      onClick={handlePasteXBlockComponent}
    >
      {intl.formatMessage(messages.pasteComponentButtonText)}
    </Button>
  );
};

PasteComponentButton.propTypes = {
  handleCreateNewCourseXBlock: PropsTypes.func.isRequired,
};

export default PasteComponentButton;
