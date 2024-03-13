// @ts-check
import React from 'react';
import { Stack } from '@openedx/paragon';
import { useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import { useContentTaxonomyTagsCount } from '../data/apiHooks';
import TagCount from '../../generic/tag-count';

const TagsSidebarHeader = () => {
  const intl = useIntl();
  const contentId = useParams().blockId;

  const {
    data: contentTaxonomyTagsCount,
    isSuccess: isContentTaxonomyTagsCountLoaded,
  } = useContentTaxonomyTagsCount(contentId || '');

  return (
    <Stack
      className="course-unit-sidebar-header justify-content-between pb-1"
      direction="horizontal"
    >
      <h3 className="course-unit-sidebar-header-title m-0">
        {intl.formatMessage(messages.tagsSidebarTitle)}
      </h3>
      { isContentTaxonomyTagsCountLoaded
        && <TagCount count={contentTaxonomyTagsCount} />}
    </Stack>
  );
};

TagsSidebarHeader.propTypes = {};

export default TagsSidebarHeader;
