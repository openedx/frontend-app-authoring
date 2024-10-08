import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Icon, Stack } from '@openedx/paragon';
import { BookOpen, Tag } from '@openedx/paragon/icons';

import { useLibraryBlockMetadata } from '../data/apiHooks';
import StatusWidget from '../generic/status-widget';
import messages from './messages';
import { ContentTagsDrawer } from '../../content-tags-drawer';
import { useContentTaxonomyTagsData } from '../../content-tags-drawer/data/apiHooks';
import ManageCollections from './ManageCollections';
import { ContentHit, useGetDocumentByUsageKey } from '../../search-manager';

interface ComponentManagementProps {
  usageKey: string;
}

const ComponentManagement = ({ usageKey }: ComponentManagementProps) => {
  const intl = useIntl();
  const { data: componentMetadata } = useLibraryBlockMetadata(usageKey);
  const { data: componentTags } = useContentTaxonomyTagsData(usageKey);
  const { data: contentHit } = useGetDocumentByUsageKey(usageKey) as { data: ContentHit };

  const collectionsCount = React.useMemo(() => contentHit?.collections?.displayName?.length || 0, [contentHit]);
  const tagsCount = React.useMemo(() => {
    if (!componentTags) {
      return 0;
    }
    let result = 0;
    componentTags.taxonomies.forEach((taxonomy) => {
      const countedTags : string[] = [];
      taxonomy.tags.forEach((tagData) => {
        tagData.lineage.forEach((tag) => {
          if (!countedTags.includes(tag)) {
            result += 1;
            countedTags.push(tag);
          }
        });
      });
    });
    return result;
  }, [componentTags]);

  // istanbul ignore if: this should never happen
  if (!componentMetadata) {
    return null;
  }

  return (
    <Stack gap={3}>
      <StatusWidget
        {...componentMetadata}
      />
      {[true, 'true'].includes(getConfig().ENABLE_TAGGING_TAXONOMY_PAGES)
        && (
        <Collapsible
          defaultOpen
          title={(
            <Stack gap={1} direction="horizontal">
              <Icon src={Tag} />
              {intl.formatMessage(messages.manageTabTagsTitle, { count: tagsCount })}
            </Stack>
          )}
          className="border-0"
        >
          <ContentTagsDrawer
            id={usageKey}
            variant="component"
          />
        </Collapsible>
        )}
      <Collapsible
        defaultOpen
        title={(
          <Stack gap={1} direction="horizontal">
            <Icon src={BookOpen} />
            {intl.formatMessage(messages.manageTabCollectionsTitle, { count: collectionsCount })}
          </Stack>
        )}
        className="border-0"
      >
        <ManageCollections contentHit={contentHit} />
      </Collapsible>
    </Stack>
  );
};

export default ComponentManagement;
