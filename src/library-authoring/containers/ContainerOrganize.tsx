import { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  Collapsible,
  Icon,
  Stack,
  useToggle,
} from '@openedx/paragon';
import {
  ExpandLess, ExpandMore, Tag,
} from '@openedx/paragon/icons';

import { ContentTagsDrawer, useContentTaxonomyTagsData } from '../../content-tags-drawer';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import messages from './messages';

const ContainerOrganize = () => {
  const intl = useIntl();
  const [tagsCollapseIsOpen, , , toggleTags] = useToggle(true);

  const { readOnly } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();

  const containerId = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!containerId) {
    throw new Error('containerId is required');
  }

  const { data: componentTags } = useContentTaxonomyTagsData(containerId);

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
                {intl.formatMessage(messages.organizeTabTagsTitle, { count: tagsCount })}
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
    </Stack>
  );
};

export default ContainerOrganize;
