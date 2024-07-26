// @ts-check
import React from 'react';
import { Stack } from '@openedx/paragon';
import { useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useContentTagsCount } from '../../generic/data/apiHooks';
import messages from '../messages';
import TagCount from '../../generic/tag-count';

const TagsSidebarHeader = () => {
  const intl = useIntl();
  const contentId = useParams().blockId;

  const {
    data: contentTagsCount,
    isSuccess: isContentTagsCountLoaded,
  } = useContentTagsCount(contentId);

  return (
    <Stack
      className="course-unit-sidebar-header justify-content-between pb-1"
      direction="horizontal"
    >
      <h3 className="course-unit-sidebar-header-title m-0">
        {intl.formatMessage(messages.tagsSidebarTitle)}
      </h3>
      { isContentTagsCountLoaded
        && <TagCount count={contentTagsCount} />}
    </Stack>
  );
};

TagsSidebarHeader.propTypes = {};

export default TagsSidebarHeader;
