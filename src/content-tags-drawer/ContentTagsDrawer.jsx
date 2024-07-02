// @ts-check
import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Spinner,
  Stack,
  Button,
  Toast,
} from '@openedx/paragon';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { useParams, useNavigate } from 'react-router-dom';
import messages from './messages';
import ContentTagsCollapsible from './ContentTagsCollapsible';
import Loading from '../generic/Loading';
import useContentTagsDrawerContext from './ContentTagsDrawerHelper';
import { ContentTagsDrawerContext, ContentTagsDrawerSheetContext } from './common/context';

const TaxonomyList = ({ contentId }) => {
  const navigate = useNavigate();
  const intl = useIntl();

  const {
    isTaxonomyListLoaded,
    isContentTaxonomyTagsLoaded,
    tagsByTaxonomy,
    stagedContentTags,
    collapsibleStates,
  } = React.useContext(ContentTagsDrawerContext);

  if (isTaxonomyListLoaded && isContentTaxonomyTagsLoaded) {
    if (tagsByTaxonomy.length !== 0) {
      return (
        <div>
          { tagsByTaxonomy.map((data) => (
            <div key={`taxonomy-tags-collapsible-${data.id}`}>
              <ContentTagsCollapsible
                contentId={contentId}
                taxonomyAndTagsData={data}
                stagedContentTags={stagedContentTags[data.id] || []}
                collapsibleState={collapsibleStates[data.id] || false}
              />
              <hr />
            </div>
          ))}
        </div>
      );
    }

    return (
      <FormattedMessage
        {...messages.emptyDrawerContent}
        values={{
          link: (
            <Button
              tabIndex={0}
              size="inline"
              variant="link"
              className="text-info-500 p-0 enable-taxonomies-button"
              onClick={() => navigate('/taxonomies')}
            >
              { intl.formatMessage(messages.emptyDrawerContentLink) }
            </Button>
          ),
        }}
      />
    );
  }

  return <Loading />;
};

TaxonomyList.propTypes = {
  contentId: PropTypes.string.isRequired,
};

/**
 * Drawer with the functionality to show and manage tags in a certain content.
 * It is used both in interfaces of this MFE and in edx-platform interfaces such as iframe.
 * - If you want to use it as an iframe, the component obtains the `contentId` from the url parameters.
 *   Functions to close the drawer are handled internally.
 *   TODO: We can delete this method when is no longer used on edx-platform.
 * - If you want to use it as react component, you need to pass the content id and the close functions
 *   through the component parameters.
 */
const ContentTagsDrawer = ({ id, onClose }) => {
  const intl = useIntl();
  // TODO: We can delete 'params' when the iframe is no longer used on edx-platform
  const params = useParams();
  const contentId = id ?? params.contentId;

  const context = useContentTagsDrawerContext(contentId);
  const { blockingSheet } = useContext(ContentTagsDrawerSheetContext);

  const {
    showToastAfterSave,
    toReadMode,
    commitGlobalStagedTagsStatus,
    isContentDataLoaded,
    contentName,
    isTaxonomyListLoaded,
    isContentTaxonomyTagsLoaded,
    stagedContentTags,
    collapsibleStates,
    isEditMode,
    commitGlobalStagedTags,
    toEditMode,
    toastMessage,
    closeToast,
    setCollapsibleToInitalState,
    otherTaxonomies,
  } = context;

  let onCloseDrawer = onClose;
  if (onCloseDrawer === undefined) {
    onCloseDrawer = () => {
      // "*" allows communication with any origin
      window.parent.postMessage('closeManageTagsDrawer', '*');
    };
  }

  useEffect(() => {
    const handleEsc = (event) => {
      /* Close drawer when ESC-key is pressed and selectable dropdown box not open */
      const selectableBoxOpen = document.querySelector('[data-selectable-box="taxonomy-tags"]');
      if (event.key === 'Escape' && !selectableBoxOpen && !blockingSheet) {
        onCloseDrawer();
      }
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [blockingSheet]);

  useEffect(() => {
    /* istanbul ignore next */
    if (commitGlobalStagedTagsStatus === 'success') {
      showToastAfterSave();
      toReadMode();
    }
  }, [commitGlobalStagedTagsStatus]);

  // First call of the initial collapsible states
  React.useEffect(() => {
    setCollapsibleToInitalState();
  }, [isTaxonomyListLoaded, isContentTaxonomyTagsLoaded]);

  return (
    <ContentTagsDrawerContext.Provider value={context}>
      <div id="content-tags-drawer" className="mt-1 tags-drawer d-flex flex-column justify-content-between min-vh-100 pt-3">
        <Container size="xl">
          { isContentDataLoaded
            ? <h2 className="h3 pl-2.5">{ contentName }</h2>
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
          <Container>
            <p className="h4 text-gray-500 font-weight-bold">
              {intl.formatMessage(messages.headerSubtitle)}
            </p>
            <TaxonomyList contentId={contentId} />
            {otherTaxonomies.length !== 0 && (
              <div>
                <p className="h4 text-gray-500 font-weight-bold">
                  {intl.formatMessage(messages.otherTagsHeader)}
                </p>
                <p className="other-description text-gray-500">
                  {intl.formatMessage(messages.otherTagsDescription)}
                </p>
                { isTaxonomyListLoaded && isContentTaxonomyTagsLoaded && (
                  otherTaxonomies.map((data) => (
                    <div key={`taxonomy-tags-collapsible-${data.id}`}>
                      <ContentTagsCollapsible
                        contentId={contentId}
                        taxonomyAndTagsData={data}
                        stagedContentTags={stagedContentTags[data.id] || []}
                        collapsibleState={collapsibleStates[data.id] || false}
                      />
                      <hr />
                    </div>
                  ))
                )}
              </div>
            )}
          </Container>
        </Container>

        { isTaxonomyListLoaded && isContentTaxonomyTagsLoaded && (
          <Container
            className="bg-white position-sticky p-3.5 box-shadow-up-2 tags-drawer-footer"
          >
            <div className="d-flex justify-content-end">
              { commitGlobalStagedTagsStatus !== 'loading' ? (
                <Stack direction="horizontal" gap={2}>
                  <Button
                    className="font-weight-bold tags-drawer-cancel-button"
                    variant="tertiary"
                    onClick={isEditMode
                      ? toReadMode
                      : onCloseDrawer}
                  >
                    { intl.formatMessage(isEditMode
                      ? messages.tagsDrawerCancelButtonText
                      : messages.tagsDrawerCloseButtonText)}
                  </Button>
                  <Button
                    variant="dark"
                    className="rounded-0"
                    onClick={isEditMode
                      ? commitGlobalStagedTags
                      : toEditMode}
                  >
                    { intl.formatMessage(isEditMode
                      ? messages.tagsDrawerSaveButtonText
                      : messages.tagsDrawerEditTagsButtonText)}
                  </Button>
                </Stack>
              )
                : (
                  <Spinner
                    animation="border"
                    size="xl"
                    screenReaderText={intl.formatMessage(messages.loadingMessage)}
                  />
                )}
            </div>
          </Container>
        )}
        {/* istanbul ignore next */
          toastMessage && (
            <Toast
              show
              onClose={closeToast}
            >
              {toastMessage}
            </Toast>
          )
        }
      </div>
    </ContentTagsDrawerContext.Provider>
  );
};

ContentTagsDrawer.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
};

ContentTagsDrawer.defaultProps = {
  id: undefined,
  onClose: undefined,
};

export default ContentTagsDrawer;
