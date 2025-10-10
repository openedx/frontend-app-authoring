import React, {
  useCallback, useContext, useMemo, useState,
} from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Breadcrumb,
  Button,
  Card,
  Hyperlink,
  Icon,
  Stack,
  useToggle,
} from '@openedx/paragon';

import { tail, keyBy } from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { Loop } from '@openedx/paragon/icons';
import messages from './messages';
import previewChangesMessages from '../course-unit/preview-changes/messages';
import { invalidateLinksQuery, useEntityLinks } from './data/apiHooks';
import {
  SearchContextProvider, SearchKeywordsField, useSearchContext, BlockTypeLabel, Highlight, SearchSortWidget,
} from '../search-manager';
import { getItemIcon } from '../generic/block-type-utils';
import type { ContentHit } from '../search-manager/data/api';
import { SearchSortOption } from '../search-manager/data/api';
import Loading from '../generic/Loading';
import { useAcceptLibraryBlockChanges, useIgnoreLibraryBlockChanges } from '../course-unit/data/apiHooks';
import { PreviewLibraryXBlockChanges, LibraryChangesMessageData } from '../course-unit/preview-changes';
import LoadingButton from '../generic/loading-button';
import { ToastContext } from '../generic/toast-context';
import { useLoadOnScroll } from '../hooks';
import DeleteModal from '../generic/delete-modal/DeleteModal';
import { PublishableEntityLink } from './data/api';
import AlertError from '../generic/alert-error';
import NewsstandIcon from '../generic/NewsstandIcon';

interface Props {
  courseId: string;
}

interface ItemCardProps {
  info: ContentHit;
  itemType: 'component' | 'container';
  actions?: React.ReactNode;
  libraryName?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  info,
  itemType,
  actions,
  libraryName,
}) => {
  const intl = useIntl();
  const itemIcon = getItemIcon(info.blockType);
  const breadcrumbs = tail(info.breadcrumbs) as Array<{ displayName: string, usageKey: string }>;

  const getItemLink = useCallback(() => {
    let key = info.usageKey;
    if (breadcrumbs?.length > 1) {
      key = breadcrumbs[breadcrumbs.length - 1].usageKey || key;
    }

    if (itemType === 'component') {
      return `${getConfig().STUDIO_BASE_URL}/container/${key}`;
    }
    if (itemType === 'container') {
      const encodedKey = encodeURIComponent(key);
      return `${getConfig().STUDIO_BASE_URL}/course/${info.contextKey}?show=${encodedKey}`;
    }

    // istanbul ignore next
    return '';
  }, [info]);

  return (
    <Card
      className="my-3 border-light-500 border shadow-none"
      orientation="horizontal"
    >
      <Card.Section
        className="py-3"
      >
        <Stack direction="horizontal" gap={2}>
          <Stack direction="vertical" gap={1}>
            <Stack direction="horizontal" gap={1} className="micro text-gray-500">
              <Icon src={itemIcon} size="xs" />
              <BlockTypeLabel blockType={info.blockType} />
            </Stack>
            <Stack direction="horizontal" className="small" gap={1}>
              <strong>
                <Highlight text={info.formatted?.displayName ?? ''} />
              </strong>
            </Stack>
            <Stack direction="horizontal" className="micro" gap={3}>
              {libraryName && (
                <Stack direction="horizontal" gap={2}>
                  <Icon src={NewsstandIcon} size="xs" />
                  {libraryName}
                </Stack>
              )}
              {intl.formatMessage(messages.breadcrumbLabel)}
              <Hyperlink showLaunchIcon={false} destination={getItemLink()} target="_blank">
                {info.blockType === 'chapter' ? (
                  <div className="micro text-gray-700 border-bottom">
                    {intl.formatMessage(messages.viewSectionInCourseLabel)}
                  </div>
                ) : (
                  <Breadcrumb
                    className="micro text-gray-700 border-bottom"
                    ariaLabel={intl.formatMessage(messages.breadcrumbLabel)}
                    links={breadcrumbs.map((breadcrumb) => ({ label: breadcrumb.displayName }))}
                    spacer={<span className="custom-spacer">/</span>}
                    linkAs="span"
                  />
                )}
              </Hyperlink>
            </Stack>
          </Stack>
          {actions}
        </Stack>
      </Card.Section>
    </Card>
  );
};

const ItemReviewList = ({
  outOfSyncItems,
}: {
  outOfSyncItems: PublishableEntityLink[];
}) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const [blockData, setBlockData] = useState<LibraryChangesMessageData | undefined>(undefined);
  // ignore changes confirmation modal toggle.
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useToggle(false);
  // Toggle preview changes modal
  const [isPreviewModalOpen, openPreviewModal, closePreviewModal] = useToggle(false);
  const acceptChangesMutation = useAcceptLibraryBlockChanges();
  const ignoreChangesMutation = useIgnoreLibraryBlockChanges();

  const {
    hits,
    isPending: isIndexDataPending,
    hasError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSearchContext();

  const downstreamInfo = hits as ContentHit[];

  useLoadOnScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    true,
  );

  const outOfSyncItemsByKey = useMemo(
    () => keyBy(outOfSyncItems, 'downstreamUsageKey'),
    [outOfSyncItems],
  );
  const queryClient = useQueryClient();

  const setSelectedBlockData = useCallback((info: ContentHit) => {
    setBlockData({
      displayName: info.displayName,
      downstreamBlockId: info.usageKey,
      upstreamBlockId: outOfSyncItemsByKey[info.usageKey].upstreamKey,
      upstreamBlockVersionSynced: outOfSyncItemsByKey[info.usageKey].versionSynced,
      isContainer: info.blockType === 'vertical' || info.blockType === 'sequential' || info.blockType === 'chapter',
      blockType: info.blockType,
      isLocallyModified: outOfSyncItemsByKey[info.usageKey].downstreamIsModified,
    });
  }, [outOfSyncItemsByKey]);

  // Show preview changes on review
  const onReview = useCallback((info: ContentHit) => {
    setSelectedBlockData(info);
    openPreviewModal();
  }, [setSelectedBlockData, openPreviewModal]);

  const onIgnoreClick = useCallback((info: ContentHit) => {
    setSelectedBlockData(info);
    openConfirmModal();
  }, [setSelectedBlockData, openConfirmModal]);

  const reloadLinks = useCallback((usageKey: string) => {
    const courseKey = outOfSyncItemsByKey[usageKey].downstreamContextKey;
    invalidateLinksQuery(queryClient, courseKey);
  }, [outOfSyncItemsByKey]);

  const postChange = (accept: boolean) => {
    // istanbul ignore if: this should never happen
    if (!blockData) {
      return;
    }
    reloadLinks(blockData.downstreamBlockId);
    if (accept) {
      showToast(intl.formatMessage(
        messages.updateSingleBlockSuccess,
        { name: blockData.displayName },
      ));
    } else {
      showToast(intl.formatMessage(
        messages.ignoreSingleBlockSuccess,
        { name: blockData.displayName },
      ));
    }
  };

  const updateBlock = useCallback(async (info: ContentHit) => {
    try {
      await acceptChangesMutation.mutateAsync({
        blockId: info.usageKey,
        overrideCustomizations: info.blockType === 'html' && outOfSyncItemsByKey[info.usageKey].downstreamIsModified,
      });
      reloadLinks(info.usageKey);
      showToast(intl.formatMessage(
        messages.updateSingleBlockSuccess,
        { name: info.displayName },
      ));
    } catch (e) {
      showToast(intl.formatMessage(previewChangesMessages.acceptChangesFailure));
    }
  }, []);

  const ignoreBlock = useCallback(async () => {
    // istanbul ignore if: this should never happen
    if (!blockData) {
      return;
    }
    try {
      await ignoreChangesMutation.mutateAsync({
        blockId: blockData.downstreamBlockId,
      });
      reloadLinks(blockData.downstreamBlockId);
      showToast(intl.formatMessage(
        messages.ignoreSingleBlockSuccess,
        { name: blockData.displayName },
      ));
    } catch (e) {
      showToast(intl.formatMessage(previewChangesMessages.ignoreChangesFailure));
    } finally {
      closeConfirmModal();
    }
  }, [blockData]);

  if (isIndexDataPending) {
    return <Loading />;
  }

  if (hasError) {
    return <AlertError error={intl.formatMessage(messages.genericErrorMessage)} />;
  }

  return (
    <>
      {downstreamInfo?.map((info) => (
        <ItemCard
          key={info.usageKey}
          info={info}
          itemType={outOfSyncItemsByKey[info.usageKey]?.upstreamType}
          libraryName={outOfSyncItemsByKey[info.usageKey]?.upstreamContextTitle}
          actions={(
            <ActionRow>
              <Button
                size="sm"
                variant="outline-primary border-light-300"
                onClick={() => onReview(info)}
                iconBefore={Loop}
                className="mr-2"
              >
                {intl.formatMessage(messages.cardReviewContentBtn)}
              </Button>
              <span className="border border-dark py-3 ml-4 mr-3" />
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => onIgnoreClick(info)}
              >
                {intl.formatMessage(messages.cardIgnoreContentBtn)}
              </Button>
              <LoadingButton
                label={intl.formatMessage(messages.cardUpdateContentBtn)}
                variant="primary"
                size="sm"
                onClick={() => updateBlock(info)}
                className="rounded-0"
              />
            </ActionRow>
          )}
        />
      ))}
      {blockData && (
        <PreviewLibraryXBlockChanges
          blockData={blockData}
          isModalOpen={isPreviewModalOpen}
          closeModal={closePreviewModal}
          postChange={postChange}
        />
      )}
      <DeleteModal
        isOpen={isConfirmModalOpen}
        close={closeConfirmModal}
        variant="warning"
        title={intl.formatMessage(previewChangesMessages.confirmationTitle)}
        description={intl.formatMessage(previewChangesMessages.confirmationDescription)}
        onDeleteSubmit={ignoreBlock}
        btnLabel={intl.formatMessage(previewChangesMessages.confirmationConfirmBtn)}
      />
    </>
  );
};

const ReviewTabContent = ({ courseId }: Props) => {
  const intl = useIntl();
  const {
    data: outOfSyncItems,
    isPending: isSyncItemsLoading,
    isError,
    error,
  } = useEntityLinks({
    courseId,
    readyToSync: true,
    useTopLevelParents: true,
  });

  const downstreamKeys = useMemo(
    () => outOfSyncItems?.map(link => link.downstreamUsageKey),
    [outOfSyncItems],
  );

  const disableSortOptions = [
    SearchSortOption.RELEVANCE,
    SearchSortOption.OLDEST,
    SearchSortOption.NEWEST,
    SearchSortOption.RECENTLY_PUBLISHED,
  ];

  if (isSyncItemsLoading) {
    return <Loading />;
  }

  if (isError) {
    return <AlertError error={error} />;
  }

  return (
    <SearchContextProvider
      extraFilter={[`context_key = "${courseId}"`, `usage_key IN ["${downstreamKeys?.join('","')}"]`]}
      skipUrlUpdate
      skipBlockTypeFetch
    >
      <ActionRow>
        <SearchKeywordsField
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
        />
        <SearchSortWidget disableOptions={disableSortOptions} />
        <ActionRow.Spacer />
      </ActionRow>
      <ItemReviewList
        outOfSyncItems={outOfSyncItems}
      />
    </SearchContextProvider>
  );
};

export default ReviewTabContent;
