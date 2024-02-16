// @ts-check
import React, { useMemo, useEffect } from 'react';
import {
  Container,
  CloseButton,
  Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import messages from './messages';
import ContentTagsCollapsible from './ContentTagsCollapsible';
import { extractOrgFromContentId } from './utils';
import {
  useContentTaxonomyTagsData,
  useContentData,
} from './data/apiHooks';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from '../taxonomy/data/apiHooks';
import Loading from '../generic/Loading';

/** @typedef {import("../taxonomy/data/types.mjs").TaxonomyData} TaxonomyData */
/** @typedef {import("./data/types.mjs").Tag} ContentTagData */

const ContentTagsDrawer = () => {
  const intl = useIntl();
  const { contentId } = /** @type {{contentId: string}} */(useParams());

  const org = extractOrgFromContentId(contentId);

  const useTaxonomyListData = () => {
    const taxonomyListData = useTaxonomyListDataResponse(org);
    const isTaxonomyListLoaded = useIsTaxonomyListDataLoaded(org);
    return { taxonomyListData, isTaxonomyListLoaded };
  };

  const { data: contentData, isSuccess: isContentDataLoaded } = useContentData(contentId);
  const {
    data: contentTaxonomyTagsData,
    isSuccess: isContentTaxonomyTagsLoaded,
  } = useContentTaxonomyTagsData(contentId);
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
      const taxonomiesList = taxonomyListData.results.map((taxonomy) => ({
        ...taxonomy,
        contentTags: /** @type {ContentTagData[]} */([]),
      }));

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
              <ContentTagsCollapsible contentId={contentId} taxonomyAndTagsData={data} />
              <hr />
            </div>
          ))
          : <Loading />}

      </Container>
    </div>
  );
};

export default ContentTagsDrawer;
