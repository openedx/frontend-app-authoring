import { Link } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Popover, Stack } from '@openedx/paragon';
import { OpenInNew as OpenInNewIcon } from '@openedx/paragon/icons';

import type { ClipboardStatus } from '../../../data/api';
import messages from '../messages';

interface PopoverContentProps {
  clipboardData: ClipboardStatus,
}

const PopoverContent = ({ clipboardData } : PopoverContentProps) => {
  const intl = useIntl();
  const { sourceEditUrl, content, sourceContextTitle } = clipboardData;

  // istanbul ignore if: this should never happen
  if (!content) {
    return null;
  }

  return (
    <Popover.Title
      className="clipboard-popover-title"
      data-testid="popover-content"
      as={sourceEditUrl ? Link : 'div'}
      to={sourceEditUrl || null}
      target="_blank"
    >
      <Stack>
        <Stack className="justify-content-between" direction="horizontal">
          <strong>{content.displayName}</strong>
          {sourceEditUrl && (
            <Icon className="clipboard-popover-icon m-0" src={OpenInNewIcon} />
          )}
        </Stack>
        <div>
          <small className="clipboard-popover-detail-block-type">
            {content.blockTypeDisplay}
          </small>
          <span className="mr-1">{intl.formatMessage(messages.popoverContentText)}</span>
          <span className="clipboard-popover-detail-course-name">
            {sourceContextTitle}
          </span>
        </div>
      </Stack>
    </Popover.Title>
  );
};

export default PopoverContent;
