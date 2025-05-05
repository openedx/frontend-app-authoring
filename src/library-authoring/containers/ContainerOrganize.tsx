import { useMemo, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  Collapsible,
  Icon,
  Stack,
  useToggle,
} from '@openedx/paragon';
import {
  BookOpen,
  ExpandLess,
  ExpandMore,
  Tag,
} from '@openedx/paragon/icons';

import { ContentTagsDrawer, useContentTaxonomyTagsData } from '../../content-tags-drawer';
import { ManageCollections } from '../generic/manage-collections';
import { useContainer, useUpdateContainerCollections } from '../data/apiHooks';
import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarActions, useSidebarContext } from '../common/context/SidebarContext';
import messages from './messages';

const ContainerOrganize = () => {
  const intl = useIntl();
  const [tagsCollapseIsOpen, ,setTagsCollapseClose, toggleTags] = useToggle(true);
  const [collectionsCollapseIsOpen, setCollectionsCollapseOpen, , toggleCollections] = useToggle(true);

  const { readOnly } = useLibraryContext();
  const { sidebarComponentInfo, sidebarAction } = useSidebarContext();
  const jumpToCollections = sidebarAction === SidebarActions.JumpToManageCollections;

  const containerId = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!containerId) {
    throw new Error('containerId is required');
  }

  const { data: containerMetadata } = useContainer(containerId);
  const { data: componentTags } = useContentTaxonomyTagsData(containerId);

  useEffect(() => {
    if (jumpToCollections) {
      setTagsCollapseClose();
      setCollectionsCollapseOpen();
    }
  }, [jumpToCollections, tagsCollapseIsOpen, collectionsCollapseIsOpen]);

  const collectionsCount = useMemo(() => containerMetadata?.collections?.length || 0, [containerMetadata]);
  const tagsCount = useMemo(() => {
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
  if (!containerMetadata) {
    return null;
  }

  return (
    <Stack gap={3}>
      {[true, 'true'].includes(getConfig().ENABLE_TAGGING_TAXONOMY_PAGES)
        && (
          <Collapsible.Advanced
            open={tagsCollapseIsOpen}
            className="collapsible-card border-0"
          >
            <Collapsible.Trigger
              onClick={toggleTags}
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
                id={containerId}
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
          onClick={toggleCollections}
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
          <ManageCollections
            opaqueKey={containerId}
            collections={containerMetadata.collections}
            useUpdateCollectionsHook={useUpdateContainerCollections}
          />
        </Collapsible.Body>
      </Collapsible.Advanced>
    </Stack>
  );
};

export default ContainerOrganize;
