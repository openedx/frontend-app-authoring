import { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb,
  Container,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import Loading from '../../generic/Loading';
import NotFoundAlert from '../../generic/NotFoundAlert';
import SubHeader from '../../generic/sub-header/SubHeader';
import ErrorAlert from '../../generic/alert-error';
import Header from '../../header';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  COLLECTION_INFO_TABS, COMPONENT_INFO_TABS, UNIT_INFO_TABS, useSidebarContext,
} from '../common/context/SidebarContext';
import { useContainer, useContentLibrary } from '../data/apiHooks';
import { LibrarySidebar } from '../library-sidebar';
import { SubHeaderTitle } from '../LibraryAuthoringPage';
import { LibraryUnitBlocks } from './LibraryUnitBlocks';
import messages from './messages';
import { ContainerEditableTitle, FooterActions, HeaderActions } from '../containers';
import { ContainerType } from '../../generic/key-utils';

export const LibraryUnitPage = () => {
  const intl = useIntl();

  const {
    libraryId,
    unitId,
  } = useLibraryContext();

  // istanbul ignore if: this should never happen
  if (!unitId) {
    throw new Error('unitId is required');
  }

  const {
    sidebarComponentInfo,
    setDefaultTab,
    setHiddenTabs,
  } = useSidebarContext();

  useEffect(() => {
    setDefaultTab({
      collection: COLLECTION_INFO_TABS.Details,
      component: COMPONENT_INFO_TABS.Manage,
      unit: UNIT_INFO_TABS.Manage,
    });
    setHiddenTabs([COMPONENT_INFO_TABS.Preview, UNIT_INFO_TABS.Preview]);
    return () => {
      setDefaultTab({
        component: COMPONENT_INFO_TABS.Preview,
        unit: UNIT_INFO_TABS.Preview,
        collection: COLLECTION_INFO_TABS.Manage,
      });
      setHiddenTabs([]);
    };
  }, [setDefaultTab, setHiddenTabs]);

  const { data: libraryData, isLoading: isLibLoading } = useContentLibrary(libraryId);
  const {
    data: unitData,
    isLoading,
    isError,
    error,
  } = useContainer(unitId);

  if (!unitId || !libraryId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without unitId or libraryId URL parameter');
  }

  // Only show loading if unit or library data is not fetched from index yet
  if (isLibLoading || isLoading) {
    return <Loading />;
  }

  if (!libraryData || !unitData) {
    return <NotFoundAlert />;
  }

  // istanbul ignore if
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
  );

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
              title={<SubHeaderTitle title={<ContainerEditableTitle containerId={unitId} />} />}
              headerActions={(
                <HeaderActions
                  containerKey={unitId}
                  containerType={ContainerType.Unit}
                  infoBtnText={intl.formatMessage(messages.infoButtonText)}
                  addContentBtnText={intl.formatMessage(messages.addContentButton)}
                />
              )}
              breadcrumbs={breadcrumbs}
              hideBorder
            />
          </div>
          <Container className="px-4 py-4">
            <LibraryUnitBlocks unitId={unitId} />
            <FooterActions
              addContentBtnText={intl.formatMessage(messages.newContentButton)}
              addExistingContentBtnText={intl.formatMessage(messages.addExistingContentButton)}
            />
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
  );
};
