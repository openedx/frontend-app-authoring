import React, { useMemo, useEffect } from 'react';
import {
  Container,
  CloseButton,
  Spinner,
} from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import messages from './messages';
import ContentTagsCollapsible from './ContentTagsCollapsible';
import { extractOrgFromContentId } from './utils';
import {
  useContentTaxonomyTagsDataResponse,
  useIsContentTaxonomyTagsDataLoaded,
  useContentDataResponse,
  useIsContentDataLoaded,
} from './data/apiHooks';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from '../taxonomy/data/apiHooks';
import Loading from '../generic/Loading';

const ContentTagsDrawer = () => {
  const intl = useIntl();
  const { contentId } = useParams();

  const org = extractOrgFromContentId(contentId);

  const useContentData = () => {
    const contentData = useContentDataResponse(contentId);
    const isContentDataLoaded = useIsContentDataLoaded(contentId);
    return { contentData, isContentDataLoaded };
  };

  const useContentTaxonomyTagsData = () => {
    const contentTaxonomyTagsData = useContentTaxonomyTagsDataResponse(contentId);
    const isContentTaxonomyTagsLoaded = useIsContentTaxonomyTagsDataLoaded(contentId);
    return { contentTaxonomyTagsData, isContentTaxonomyTagsLoaded };
  };

  const useTaxonomyListData = () => {
    const taxonomyListData = useTaxonomyListDataResponse(org);
    const isTaxonomyListLoaded = useIsTaxonomyListDataLoaded(org);
    return { taxonomyListData, isTaxonomyListLoaded };
  };

  const { contentData, isContentDataLoaded } = useContentData();
  const { contentTaxonomyTagsData, isContentTaxonomyTagsLoaded } = useContentTaxonomyTagsData();
  const { taxonomyListData, isTaxonomyListLoaded } = useTaxonomyListData();

  const closeContentTagsDrawer = () => {
    // "*" allows communication with any origin
    window.parent.postMessage('closeManageTagsDrawer', '*');
  };

  useEffect(() => {
    const handleEsc = (event) => {
      /* Close drawer when ESC-key is pressed and selectable dropdown box not open */
      const selectableBoxOpen = document.querySelector('[data-selectable-box="taxonomy-tags"]');
      if (event.key === 'Escape' && !selectableBoxOpen) {
        closeContentTagsDrawer();
      }
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const taxonomies = useMemo(() => {
    if (taxonomyListData && contentTaxonomyTagsData) {
      // Initialize list of content tags in taxonomies to populate
      const taxonomiesList = taxonomyListData.results.map((taxonomy) => {
        // eslint-disable-next-line no-param-reassign
        taxonomy.contentTags = [];
        return taxonomy;
      });

      const contentTaxonomies = contentTaxonomyTagsData.taxonomies;

      // eslint-disable-next-line array-callback-return
      contentTaxonomies.map((contentTaxonomyTags) => {
        const contentTaxonomy = taxonomiesList.find((taxonomy) => taxonomy.id === contentTaxonomyTags.taxonomyId);
        if (contentTaxonomy) {
          contentTaxonomy.contentTags = contentTaxonomyTags.tags;
        }
      });

      return taxonomiesList;
    }
    return [];
  }, [taxonomyListData, contentTaxonomyTagsData]);

  return (

    <div className="mt-1">
      <Container size="xl">
        <CloseButton onClick={() => closeContentTagsDrawer()} data-testid="drawer-close-button" />
        <span>{intl.formatMessage(messages.headerSubtitle)}</span>
        { isContentDataLoaded
          ? <h3>{ contentData.displayName }</h3>
          : (
            <div className="d-flex justify-content-center align-items-center flex-column">
              <Spinner
                animation="border"
                size="xl"
                screenReaderText={intl.formatMessage(messages.loadingMessage)}
              />
            </div>
          )}

        <hr />

        { isTaxonomyListLoaded && isContentTaxonomyTagsLoaded
          ? taxonomies.map((data) => (
            <div key={`taxonomy-tags-collapsible-${data.id}`}>
              <ContentTagsCollapsible taxonomyAndTagsData={data} />
              <hr />
            </div>
          ))
          : <Loading />}

      </Container>
    </div>
  );
};

export default ContentTagsDrawer;
