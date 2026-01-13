import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router';
import { ComponentCountSnippet, getItemIcon } from '@src/generic/block-type-utils';
import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { useMemo } from 'react';
import { Tag } from '@openedx/paragon/icons';
import { ContentTagsSnippet } from '@src/content-tags-drawer';
import messages from './messages';
import PublishControls from '../legacy-sidebar/PublishControls';
import { useUnitSidebarContext } from './UnitSidebarContext';

export const UnitInfoSidebar = () => {
  const intl = useIntl();
  const { blockId } = useParams();
  const { title, childrenBlocks } = useUnitSidebarContext();

  if (blockId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing blockId.');
  }

  const componentData: Record<string, number> = useMemo(() => childrenBlocks.reduce<Record<string, number>>(
    (acc, { blockType }) => {
      acc[blockType] = (acc[blockType] ?? 0) + 1;
      return acc;
    },
    {},
  ), [childrenBlocks]);

  return (
    <div>
      <SidebarTitle
        title={title}
        icon={getItemIcon('unit')}
      />
      <SidebarContent>
        <PublishControls blockId={blockId} hideCopyButton />
        <SidebarSection
          title={intl.formatMessage(messages.sidebarSectionSummary)}
          icon={getItemIcon('unit')}
        >
          {componentData && <ComponentCountSnippet componentData={componentData} />}
        </SidebarSection>
        <SidebarSection
          title={intl.formatMessage(messages.sidebarSectionTaxonomies)}
          icon={Tag}
        >
          <ContentTagsSnippet contentId={blockId} />
        </SidebarSection>
      </SidebarContent>
    </div>
  );
};
