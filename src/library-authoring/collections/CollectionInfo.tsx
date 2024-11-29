import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { useCallback } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import {
  useLibraryContext,
  type CollectionInfoTab,
  COLLECTION_INFO_TABS,
  isCollectionInfoTab,
  COMPONENT_INFO_TABS,
} from '../common/context/LibraryContext';
import CollectionDetails from './CollectionDetails';
import messages from './messages';
import { ContentTagsDrawer } from '../../content-tags-drawer';
import { buildCollectionUsageKey } from '../../generic/key-utils';

const CollectionInfo = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const {
    libraryId,
    collectionId,
    setCollectionId,
    sidebarComponentInfo,
    setSidebarCurrentTab,
  } = useLibraryContext();
  const { componentPickerMode } = useComponentPickerContext();

  const tab: CollectionInfoTab = (
    sidebarComponentInfo?.currentTab && isCollectionInfoTab(sidebarComponentInfo.currentTab)
  ) ? sidebarComponentInfo?.currentTab : COLLECTION_INFO_TABS.Manage;

  const sidebarCollectionId = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!sidebarCollectionId) {
    throw new Error('sidebarCollectionId is required');
  }

  const url = `/library/${libraryId}/collection/${sidebarCollectionId}/`;
  const urlMatch = useMatch(url);

  const showOpenCollectionButton = !urlMatch && collectionId !== sidebarCollectionId;

  const collectionUsageKey = buildCollectionUsageKey(libraryId, sidebarCollectionId);

  const handleOpenCollection = useCallback(() => {
    if (!componentPickerMode) {
      navigate(url);
    } else {
      setCollectionId(sidebarCollectionId);
    }
  }, [componentPickerMode, url]);

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
        onSelect={setSidebarCurrentTab}
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
