import { FormattedMessage, useIntl } from "@edx/frontend-platform/i18n";
import { ActionRow, Badge, Breadcrumb, Button, Container, Icon, Stack, useToggle } from "@openedx/paragon";
import { Add, Description, InfoOutline } from "@openedx/paragon/icons";
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { Helmet } from 'react-helmet';
import { Link } from "react-router-dom";
import { ContentTagsDrawerSheet } from "../../content-tags-drawer";
import { blockTypes } from "../../editors/data/constants/app";
import DraggableList, { SortableItem } from "../../editors/sharedComponents/DraggableList";

import ErrorAlert from '../../generic/alert-error';
import { getItemIcon } from "../../generic/block-type-utils";
import { IframeProvider } from "../../generic/hooks/context/iFrameContext";
import Loading from "../../generic/Loading";
import NotFoundAlert from "../../generic/NotFoundAlert";
import SubHeader from "../../generic/sub-header/SubHeader";
import TagCount from "../../generic/tag-count";
import Header from "../../header";
import { useLibraryContext } from "../common/context/LibraryContext";
import { COLLECTION_INFO_TABS, COMPONENT_INFO_TABS, DefaultTabs, UNIT_INFO_TABS, useSidebarContext } from "../common/context/SidebarContext";
import ComponentMenu from "../components";
import { LibraryBlockMetadata } from "../data/api";
import { libraryAuthoringQueryKeys, useContainer, useContainerChildren, useContentLibrary } from "../data/apiHooks";
import { LibrarySidebar } from "../library-sidebar";
import { SubHeaderTitle } from "../LibraryAuthoringPage";
import { LibraryBlock } from "../LibraryBlock";
import { useLibraryRoutes } from "../routes";
import messages from "./messages";

const HeaderActions = () => {
  const intl = useIntl();

  return (
    <div className="header-actions">
      <Button
        className='normal-border'
        iconBefore={InfoOutline}
        variant="outline-primary rounded-0"
      >
        {intl.formatMessage(messages.infoButtonText)}
      </Button>
      <Button
        className="ml-2"
        iconBefore={Add}
        variant="primary rounded-0"
      >
        {intl.formatMessage(messages.newContentButton)}
      </Button>
    </div>
  );
};

const UnitBlocks = () => {
  const [orderedBlocks, setOrderedBlocks] = useState<LibraryBlockMetadata[]>([]);
  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);
  const { navigateTo } = useLibraryRoutes();

  const {
    libraryId,
    unitId,
    showOnlyPublished,
    componentId,
    setComponentId,
  } = useLibraryContext();

  const queryClient = useQueryClient();
  const {
    data: blocks,
    isLoading,
    isError,
    error,
  } = useContainerChildren(libraryId, unitId);

  useEffect(() => setOrderedBlocks(blocks || []), [blocks])

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <ErrorAlert error={error} />;
  }
  const handleReorder = () => (newOrder: LibraryBlockMetadata[]) => {
    // TODO: update order of components in unit
  };

  const onTagSidebarClose = () => {
    queryClient.invalidateQueries(libraryAuthoringQueryKeys.containerChildren(libraryId, unitId));
    closeManageTagsDrawer();
  }

  const handleComponentSelection = (block: LibraryBlockMetadata) => {
    setComponentId(block.id);
    navigateTo({ componentId: block.id });
  }

  const renderedBlocks = orderedBlocks?.map((block) => (
    <IframeProvider key={block.id}>
      <SortableItem
        id={block.id}
        componentStyle={null}
        actions={
          <>
            <Stack direction="horizontal" gap={2} className="font-weight-bold">
              <Icon src={getItemIcon(block.blockType)} />
              {block.displayName}
            </Stack>
            <ActionRow.Spacer />
            <Stack direction="horizontal" gap={3}>
              {block.hasUnpublishedChanges && (
                <Badge
                  className="px-2 pt-1"
                  variant="warning"
                >
                  <Stack direction="horizontal" gap={1}>
                    <Icon className="mb-1" size="xs" src={Description} />
                    <FormattedMessage {...messages.draftChipText} />
                  </Stack>
                </Badge>
              )}
              <TagCount size="sm" count={block.tagsCount} onClick={openManageTagsDrawer} />
              <ComponentMenu usageKey={block.id} />
            </Stack>
          </>
        }
        actionStyle={{
          borderRadius: '8px 8px 0px 0px',
          padding: '0.5rem 1rem',
          background: '#FBFAF9',
          borderBottom: 'solid 1px #E1DDDB'
        }}
        isClickable
        onClick={() => handleComponentSelection(block)}
      >
        <div className={classNames('p-3', {
          "container-mw-md": block.blockType === blockTypes.video,
        })}>
          <LibraryBlock
            usageKey={block.id}
            version={showOnlyPublished ? 'published' : undefined}
          />
        </div>
      </SortableItem>
    </IframeProvider>
  ));

  return (
    <>
      <DraggableList itemList={orderedBlocks} setState={setOrderedBlocks} updateOrder={handleReorder}>
        {renderedBlocks}
      </DraggableList>
      <ContentTagsDrawerSheet
        id={componentId}
        onClose={onTagSidebarClose}
        showSheet={isManageTagsDrawerOpen}
      />
    </>
  );
}

export const LibraryUnitPage = () => {
  const intl = useIntl();

  const {
    libraryId,
    unitId,
    collectionId,
    componentId,
  } = useLibraryContext();
  const {
    sidebarComponentInfo,
    openInfoSidebar,
    setDefaultTab,
    setDisabledTabs,
  } = useSidebarContext();

  useEffect(() => {
    setDefaultTab({
      collection: COLLECTION_INFO_TABS.Details,
      component: COMPONENT_INFO_TABS.Manage,
      unit: UNIT_INFO_TABS.Organize,
    });
    setDisabledTabs([COMPONENT_INFO_TABS.Preview, UNIT_INFO_TABS.Preview]);
    return () => {
      setDefaultTab({
        component: COMPONENT_INFO_TABS.Preview,
        unit: UNIT_INFO_TABS.Preview,
        collection: COLLECTION_INFO_TABS.Manage,
      });
      setDisabledTabs([])
    };
  }, [setDefaultTab, setDisabledTabs]);

  useEffect(() => {
    openInfoSidebar(componentId, collectionId, unitId);
  }, [componentId]);

  if (!unitId || !libraryId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without unitId or libraryId URL parameter');
  }

  const { data: libraryData, isLoading: isLibLoading } = useContentLibrary(libraryId);
  const {
    data: unitData,
    isLoading,
    isError,
    error,
  } = useContainer(libraryId, unitId);

  // Only show loading if unit or library data is not fetched from index yet
  if (isLibLoading || isLoading) {
    return <Loading />;
  }

  if (!libraryData || !unitData) {
    return <NotFoundAlert />;
  }

  if (isError) {
    return <ErrorAlert error={error} />;
  }

  const breadcrumbs = (
    <Breadcrumb
      ariaLabel={intl.formatMessage(messages.breadcrumbsAriaLabel)}
      links={[
        {
          label: libraryData.title,
          to: `/library/${libraryId}`,
        },
        // Adding empty breadcrumb to add the last `>` spacer.
        {
          label: '',
          to: '',
        },
      ]}
      linkAs={Link}
    />
  )

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <Helmet><title>{libraryData.title} | {process.env.SITE_NAME}</title></Helmet>
        <Header
          number={libraryData.slug}
          title={libraryData.title}
          org={libraryData.org}
          contextId={libraryId}
          isLibrary
          containerProps={{
            size: undefined,
          }}
        />
        <Container className="px-0 mt-4 mb-5 library-authoring-page bg-white">
          <div className="px-4 bg-light-200 border-bottom mb-2">
            <SubHeader
              title={<SubHeaderTitle title={unitData.displayName} />}
              headerActions={<HeaderActions />}
              breadcrumbs={breadcrumbs}
              hideBorder
            />
          </div>
          <Container className="px-4 py-4 library-unit-page">
            <UnitBlocks/>
          </Container>
        </Container>
      </div>
      {!!sidebarComponentInfo?.type && (
        <div
          className="library-authoring-sidebar box-shadow-left-1 bg-white"
          data-testid="library-sidebar"
        >
          <LibrarySidebar />
        </div>
      )}
    </div>
  )
}
