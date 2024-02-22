import { Icon, Stack } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';
import { useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';

const TagsSidebarHeader = () => {
  const intl = useIntl();
  const contentId = useParams().blockId;
  const tagCount = 0;
  return (
    <Stack className="course-unit-sidebar-header justify-content-between" direction="horizontal">
      <h3 className="course-unit-sidebar-header-title m-0">
        {intl.formatMessage(messages.tagsSidebarTitle)}
      </h3>
      <div className="d-flex">
        <Icon
          src={Tag}
        />
        {tagCount}
      </div>
    </Stack>
  );
};

TagsSidebarHeader.propTypes = {};

export default TagsSidebarHeader;
