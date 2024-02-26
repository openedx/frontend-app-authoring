import { Icon, Stack } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';
import { useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import { useContentTaxonomyTagsCount } from '../data/apiHooks';

const TagsSidebarHeader = () => {
  const intl = useIntl();
  const contentId = useParams().blockId;

  const {
    data: contentTaxonomyTagsCount,
    isSuccess: isContentTaxonomyTagsCountLoaded,
  } = useContentTaxonomyTagsCount(contentId);

  return (
    <Stack className="course-unit-sidebar-header justify-content-between" direction="horizontal">
      <h3 className="course-unit-sidebar-header-title m-0">
        {intl.formatMessage(messages.tagsSidebarTitle)}
      </h3>
      { isContentTaxonomyTagsCountLoaded && contentTaxonomyTagsCount !== 0
        && (
          <div className="d-flex">
            <Icon
              className="mr-1 pt-1"
              src={Tag}
            />
            {contentTaxonomyTagsCount}
          </div>
        )}
    </Stack>
  );
};

TagsSidebarHeader.propTypes = {};

export default TagsSidebarHeader;
