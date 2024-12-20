import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { useCallback } from 'react';

import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  type CollectionInfoTab,
  COLLECTION_INFO_TABS,
  COMPONENT_INFO_TABS,
  isCollectionInfoTab,
  useSidebarContext,
} from '../common/context/SidebarContext';
import { useLibraryRoutes } from '../routes';
import { ContentTagsDrawer } from '../../content-tags-drawer';
import { buildCollectionUsageKey } from '../../generic/key-utils';
import CollectionDetails from './CollectionDetails';
import messages from './messages';

const CollectionInfo = () => {
  const intl = useIntl();

  const { componentPickerMode } = useComponentPickerContext();
  const { libraryId, setCollectionId } = useLibraryContext();
  const { sidebarComponentInfo, sidebarTab, setSidebarTab } = useSidebarContext();

  const tab: CollectionInfoTab = (
    sidebarTab && isCollectionInfoTab(sidebarTab)
  ) ? sidebarTab : COLLECTION_INFO_TABS.Manage;

  const collectionId = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!collectionId) {
    throw new Error('collectionId is required');
  }

  const collectionUsageKey = buildCollectionUsageKey(libraryId, collectionId);

  const { insideCollection, navigateTo } = useLibraryRoutes();
  const showOpenCollectionButton = !insideCollection || componentPickerMode;

  const handleOpenCollection = useCallback(() => {
    if (componentPickerMode) {
      setCollectionId(collectionId);
    } else {
      navigateTo({ collectionId });
    }
  }, [componentPickerMode, navigateTo]);

  return (
    <Stack>
      {showOpenCollectionButton && (
        <div className="d-flex flex-wrap">
          <Button
            onClick={handleOpenCollection}
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
          >
            {intl.formatMessage(messages.openCollectionButton)}
          </Button>
        </div>
      )}
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey={COMPONENT_INFO_TABS.Manage}
        activeKey={tab}
        onSelect={setSidebarTab}
      >
        <Tab eventKey={COMPONENT_INFO_TABS.Manage} title={intl.formatMessage(messages.manageTabTitle)}>
          <ContentTagsDrawer
            id={collectionUsageKey}
            variant="component"
          />
        </Tab>
        <Tab eventKey={COMPONENT_INFO_TABS.Details} title={intl.formatMessage(messages.detailsTabTitle)}>
          <CollectionDetails />
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default CollectionInfo;
