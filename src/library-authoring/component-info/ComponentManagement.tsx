import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Icon, Stack } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';

import { useLibraryBlockMetadata } from '../data/apiHooks';
import StatusWidget from '../generic/status-widget';
import messages from './messages';
import { ContentTagsDrawer } from '../../content-tags-drawer';

interface ComponentManagementProps {
  usageKey: string;
}
const ComponentManagement = ({ usageKey }: ComponentManagementProps) => {
  const intl = useIntl();
  const { data: componentMetadata } = useLibraryBlockMetadata(usageKey);

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
              {intl.formatMessage(messages.manageTabTagsTitle)}
            </Stack>
          )}
          className="border-0"
        >
          <ContentTagsDrawer
            id={usageKey}
            variant="component"
            hideTitle
            hideSubtitle
          />
        </Collapsible>
        )}
      <Collapsible
        defaultOpen
        title={(
          <Stack gap={1} direction="horizontal">
            <Icon src={Tag} />
            {intl.formatMessage(messages.manageTabCollectionsTitle)}
          </Stack>
        )}
        className="border-0"
      >
        Collections placeholder
      </Collapsible>
    </Stack>
  );
};

export default ComponentManagement;
