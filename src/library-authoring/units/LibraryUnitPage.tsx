import { useIntl } from "@edx/frontend-platform/i18n";
import { Breadcrumb, Button, Card, Container } from "@openedx/paragon";
import { Add, InfoOutline } from "@openedx/paragon/icons";
import { useEffect } from "react";
import { Helmet } from 'react-helmet';
import { Link } from "react-router-dom";

import ErrorAlert from '../../generic/alert-error';
import { IframeProvider } from "../../generic/hooks/context/iFrameContext";
import Loading from "../../generic/Loading";
import NotFoundAlert from "../../generic/NotFoundAlert";
import SubHeader from "../../generic/sub-header/SubHeader";
import Header from "../../header";
import { useLibraryContext } from "../common/context/LibraryContext";
import { useSidebarContext } from "../common/context/SidebarContext";
import { useContainer, useContainerChildren, useContentLibrary } from "../data/apiHooks";
import { LibrarySidebar } from "../library-sidebar";
import { SubHeaderTitle } from "../LibraryAuthoringPage";
import { LibraryBlock } from "../LibraryBlock";
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
  const {
    libraryId,
    unitId,
    showOnlyPublished
  } = useLibraryContext();

  const {
    data: blocks,
    isLoading,
    isError,
    error,
  } = useContainerChildren(libraryId, unitId);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <ErrorAlert error={error} />;
  }

  const renderedBlocks = blocks?.map((block) => (
    <Card
      className="my-3"
      key={block.id}
    >
      <LibraryBlock
        usageKey={block.id}
        version={showOnlyPublished ? 'published' : undefined}
      />
    </Card>
  ));
  return (<>{renderedBlocks}</>);
}

export const LibraryUnitPage = () => {
  const intl = useIntl();

  const {
    libraryId,
    unitId,
    componentId,
  } = useLibraryContext();
  const { sidebarComponentInfo, openInfoSidebar } = useSidebarContext();

  useEffect(() => {
    openInfoSidebar(componentId, unitId);
  }, []);

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
    <IframeProvider>
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
          <Container className="px-4 mt-4 mb-5 library-authoring-page">
            <SubHeader
              title={<SubHeaderTitle title={unitData.displayName} />}
              headerActions={<HeaderActions />}
              breadcrumbs={breadcrumbs}
              hideBorder
            />
            <UnitBlocks/>
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
    </IframeProvider>
  )
}
