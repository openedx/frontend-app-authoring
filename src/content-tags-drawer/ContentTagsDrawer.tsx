import React, { useContext, useEffect } from 'react';
import {
  Container,
  Spinner,
  Stack,
  Button,
  Toast,
} from '@openedx/paragon';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import messages from './messages';
import ContentTagsCollapsible from './ContentTagsCollapsible';
import Loading from '../generic/Loading';
import { useCreateContentTagsDrawerContext } from './ContentTagsDrawerHelper';
import { ContentTagsDrawerContext, ContentTagsDrawerSheetContext } from './common/context';

interface TaxonomyListProps {
  contentId: string;
}

const TaxonomyList = ({ contentId }: TaxonomyListProps) => {
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
            <div key={data.id}>
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

const ContentTagsDrawerTitle = () => {
  const intl = useIntl();
  const {
    isContentDataLoaded,
    contentName,
  } = useContext(ContentTagsDrawerContext);

  return (
    <>
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
    </>
  );
};

interface ContentTagsDrawerVariantFooterProps {
  onClose: () => void,
  readOnly: boolean,
}

const ContentTagsDrawerVariantFooter = ({ onClose, readOnly }: ContentTagsDrawerVariantFooterProps) => {
  const intl = useIntl();
  const {
    commitGlobalStagedTagsStatus,
    commitGlobalStagedTags,
    isEditMode,
    toReadMode,
    toEditMode,
  } = useContext(ContentTagsDrawerContext);

  return (
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
                : onClose}
            >
              { intl.formatMessage(isEditMode
                ? messages.tagsDrawerCancelButtonText
                : messages.tagsDrawerCloseButtonText)}
            </Button>
            {!readOnly && (
              <Button
                className="rounded-0"
                onClick={isEditMode
                  ? commitGlobalStagedTags
                  : toEditMode}
              >
                { intl.formatMessage(isEditMode
                  ? messages.tagsDrawerSaveButtonText
                  : messages.tagsDrawerEditTagsButtonText)}
              </Button>
            )}
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
  );
};

interface ContentTagsComponentVariantFooterProps {
  readOnly?: boolean;
}

const ContentTagsComponentVariantFooter = ({ readOnly = false }: ContentTagsComponentVariantFooterProps) => {
  const intl = useIntl();
  const {
    commitGlobalStagedTagsStatus,
    commitGlobalStagedTags,
    isEditMode,
    toReadMode,
    toEditMode,
  } = useContext(ContentTagsDrawerContext);

  return (
    <div>
      {isEditMode ? (
        <div>
          { commitGlobalStagedTagsStatus !== 'loading' ? (
            <Stack direction="horizontal" gap={2}>
              <Button
                className="font-weight-bold tags-drawer-cancel-button"
                variant="tertiary"
                onClick={toReadMode}
              >
                {intl.formatMessage(messages.tagsDrawerCancelButtonText)}
              </Button>
              <Button
                className="rounded-0"
                onClick={commitGlobalStagedTags}
                block
              >
                {intl.formatMessage(messages.tagsDrawerSaveButtonText)}
              </Button>
            </Stack>
          ) : (
            <div className="d-flex justify-content-center">
              <Spinner
                animation="border"
                size="xl"
                screenReaderText={intl.formatMessage(messages.loadingMessage)}
              />
            </div>
          )}
        </div>
      ) : !readOnly && (
        <Button
          variant="outline-primary"
          onClick={toEditMode}
          block
        >
          {intl.formatMessage(messages.manageTagsButton)}
        </Button>
      )}
    </div>
  );
};

interface ContentTagsDrawerProps {
  id?: string;
  onClose?: () => void;
  variant?: 'drawer' | 'component';
  readOnly?: boolean;
}

/**
 * Drawer with the functionality to show and manage tags in a certain content.
 * It is used both in interfaces of this MFE and in edx-platform interfaces such as iframe.
 * - If you want to use it as an iframe, the component obtains the `contentId` from the url parameters.
 *   Functions to close the drawer are handled internally.
 *   TODO: We can delete this method when is no longer used on edx-platform.
 * - If you want to use it as react component, you need to pass the content id and the close functions
 *   through the component parameters.
 */
const ContentTagsDrawer = ({
  id,
  onClose,
  variant = 'drawer',
  readOnly = false,
}: ContentTagsDrawerProps) => {
  const intl = useIntl();
  // TODO: We can delete 'params' when the iframe is no longer used on edx-platform
  const params = useParams();
  const contentId = id ?? params.contentId;

  if (contentId === undefined) {
    throw new Error('Error: contentId cannot be null.');
  }

  const context = useCreateContentTagsDrawerContext(contentId, !readOnly);
  const { blockingSheet } = useContext(ContentTagsDrawerSheetContext);

  const {
    showToastAfterSave,
    toReadMode,
    commitGlobalStagedTagsStatus,
    isTaxonomyListLoaded,
    isContentTaxonomyTagsLoaded,
    stagedContentTags,
    collapsibleStates,
    toastMessage,
    closeToast,
    setCollapsibleToInitalState,
    otherTaxonomies,
  } = context;

  let onCloseDrawer: () => void;
  if (variant === 'drawer') {
    if (onClose === undefined) {
      onCloseDrawer = () => {
        // "*" allows communication with any origin
        window.parent.postMessage('closeManageTagsDrawer', '*');
      };
    } else {
      onCloseDrawer = onClose;
    }
  }

  useEffect(() => {
    if (variant === 'drawer') {
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
    }
    return () => {};
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

  const renderFooter = () => {
    if (isTaxonomyListLoaded && isContentTaxonomyTagsLoaded) {
      switch (variant) {
        case 'drawer':
          return <ContentTagsDrawerVariantFooter onClose={onCloseDrawer} readOnly={readOnly} />;
        case 'component':
          return <ContentTagsComponentVariantFooter readOnly={readOnly} />;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <ContentTagsDrawerContext.Provider value={context}>
      <div
        id="content-tags-drawer"
        className={classNames(
          'mt-1 tags-drawer d-flex flex-column justify-content-between pt-3',
          {
            'min-vh-100': variant === 'drawer',
          },
        )}
      >
        <Container
          size="xl"
          className={classNames(
            {
              'p-0': variant === 'component',
            },
          )}
        >
          {variant === 'drawer' && (
            <ContentTagsDrawerTitle />
          )}
          <Container
            className={classNames(
              {
                'p-0': variant === 'component',
              },
            )}
          >
            {variant === 'drawer' && (
              <p className="h4 text-gray-500 font-weight-bold">
                {intl.formatMessage(messages.headerSubtitle)}
              </p>
            )}
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
                    <div key={data.id}>
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
        {renderFooter()}
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

export default ContentTagsDrawer;
