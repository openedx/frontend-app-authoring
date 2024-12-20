import React, { useEffect } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Icon, Stack } from '@openedx/paragon';
import {
  BookOpen, ExpandLess, ExpandMore, Tag,
} from '@openedx/paragon/icons';

import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarActions, useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryBlockMetadata } from '../data/apiHooks';
import StatusWidget from '../generic/status-widget';
import messages from './messages';
import { ContentTagsDrawer } from '../../content-tags-drawer';
import { useContentTaxonomyTagsData } from '../../content-tags-drawer/data/apiHooks';
import ManageCollections from './ManageCollections';

const ComponentManagement = () => {
  const intl = useIntl();
  const { readOnly, isLoadingLibraryData } = useLibraryContext();
  const { sidebarComponentInfo, sidebarAction, resetSidebarAction } = useSidebarContext();
  const jumpToCollections = sidebarAction === SidebarActions.JumpToAddCollections;
  const [tagsCollapseIsOpen, setTagsCollapseOpen] = React.useState(!jumpToCollections);
  const [collectionsCollapseIsOpen, setCollectionsCollapseOpen] = React.useState(true);

  useEffect(() => {
    if (jumpToCollections) {
      setTagsCollapseOpen(false);
      setCollectionsCollapseOpen(true);
    }
  }, [jumpToCollections, tagsCollapseIsOpen, collectionsCollapseIsOpen]);

  useEffect(() => {
    // This is required to redo actions.
    if (tagsCollapseIsOpen || !collectionsCollapseIsOpen) {
      resetSidebarAction();
    }
  }, [tagsCollapseIsOpen, collectionsCollapseIsOpen]);

  const usageKey = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  const { data: componentMetadata } = useLibraryBlockMetadata(usageKey);
  const { data: componentTags } = useContentTaxonomyTagsData(usageKey);

  const collectionsCount = React.useMemo(() => componentMetadata?.collections?.length || 0, [componentMetadata]);
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
  if (isLoadingLibraryData) {
    return null;
  }

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
          <Collapsible.Advanced
            open={tagsCollapseIsOpen}
            className="collapsible-card border-0"
          >
            <Collapsible.Trigger
              onClick={() => setTagsCollapseOpen((prev) => !prev)}
              className="collapsible-trigger d-flex justify-content-between p-2"
            >
              <Stack gap={1} direction="horizontal">
                <Icon src={Tag} />
                {intl.formatMessage(messages.manageTabTagsTitle, { count: tagsCount })}
              </Stack>
              <Collapsible.Visible whenClosed>
                <Icon src={ExpandMore} />
              </Collapsible.Visible>
              <Collapsible.Visible whenOpen>
                <Icon src={ExpandLess} />
              </Collapsible.Visible>
            </Collapsible.Trigger>
            <Collapsible.Body className="collapsible-body">
              <ContentTagsDrawer
                id={usageKey}
                variant="component"
                readOnly={readOnly}
              />
            </Collapsible.Body>
          </Collapsible.Advanced>
        )}
      <Collapsible.Advanced
        open={collectionsCollapseIsOpen}
        className="collapsible-card border-0"
      >
        <Collapsible.Trigger
          onClick={() => setCollectionsCollapseOpen((prev) => !prev)}
          className="collapsible-trigger d-flex justify-content-between p-2"
        >
          <Stack gap={1} direction="horizontal">
            <Icon src={BookOpen} />
            {intl.formatMessage(messages.manageTabCollectionsTitle, { count: collectionsCount })}
          </Stack>
          <Collapsible.Visible whenClosed>
            <Icon src={ExpandMore} />
          </Collapsible.Visible>
          <Collapsible.Visible whenOpen>
            <Icon src={ExpandLess} />
          </Collapsible.Visible>
        </Collapsible.Trigger>
        <Collapsible.Body className="collapsible-body">
          <ManageCollections usageKey={usageKey} collections={componentMetadata.collections} />
        </Collapsible.Body>
      </Collapsible.Advanced>
    </Stack>
  );
};

export default ComponentManagement;
