import React, {
  useCallback, useContext, useEffect, useMemo, useState,
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
import { Loop, Warning } from '@openedx/paragon/icons';
import messages from './messages';
import previewChangesMessages from '../course-unit/preview-changes/messages';
import { courseLibrariesQueryKeys, useEntityLinks } from './data/apiHooks';
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
import AlertMessage from '../generic/alert-message';

interface Props {
  courseId: string;
}

interface BlockCardProps {
  info: ContentHit;
  actions?: React.ReactNode;
}

const BlockCard: React.FC<BlockCardProps> = ({ info, actions }) => {
  const intl = useIntl();
  const componentIcon = getItemIcon(info.blockType);
  const breadcrumbs = tail(info.breadcrumbs) as Array<{ displayName: string, usageKey: string }>;

  const getBlockLink = useCallback(() => {
    let key = info.usageKey;
    if (breadcrumbs?.length > 1) {
      key = breadcrumbs[breadcrumbs.length - 1].usageKey || key;
    }
    return `${getConfig().STUDIO_BASE_URL}/container/${key}`;
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
              <Icon src={componentIcon} size="xs" />
              <BlockTypeLabel blockType={info.blockType} />
            </Stack>
            <Stack direction="horizontal" className="small" gap={1}>
              <strong>
                <Highlight text={info.formatted?.displayName ?? ''} />
              </strong>
            </Stack>
            <Stack direction="horizontal" className="micro" gap={3}>
              {intl.formatMessage(messages.breadcrumbLabel)}
              <Hyperlink showLaunchIcon={false} destination={getBlockLink()} target="_blank">
                <Breadcrumb
                  className="micro text-gray-700 border-bottom"
                  ariaLabel={intl.formatMessage(messages.breadcrumbLabel)}
                  links={breadcrumbs.map((breadcrumb) => ({ label: breadcrumb.displayName }))}
                  spacer={<span className="custom-spacer">/</span>}
                  linkAs="span"
                />
              </Hyperlink>
            </Stack>
          </Stack>
          {actions}
        </Stack>
      </Card.Section>
    </Card>
  );
};

const ComponentReviewList = ({
  outOfSyncComponents,
  onSearchUpdate,
}: {
  outOfSyncComponents: PublishableEntityLink[];
  onSearchUpdate: () => void;
}) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const [blockData, setBlockData] = useState<LibraryChangesMessageData | undefined>(undefined);
  // ignore changes confirmation modal toggle.
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useToggle(false);
  const {
    hits: downstreamInfo,
    isLoading: isIndexDataLoading,
    searchKeywords,
    hasError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSearchContext() as {
    hits: ContentHit[];
    isLoading: boolean;
    searchKeywords: string;
    searchSortOrder: SearchSortOption;
    hasError: boolean;
    hasNextPage: boolean | undefined,
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
  };

  useLoadOnScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    true,
  );

  const outOfSyncComponentsByKey = useMemo(
    () => keyBy(outOfSyncComponents, 'downstreamUsageKey'),
    [outOfSyncComponents],
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchKeywords) {
      onSearchUpdate();
    }
  }, [searchKeywords]);

  // Toggle preview changes modal
  const [isModalOpen, openModal, closeModal] = useToggle(false);
  const acceptChangesMutation = useAcceptLibraryBlockChanges();
  const ignoreChangesMutation = useIgnoreLibraryBlockChanges();

  const setSeletecdBlockData = (info: ContentHit) => {
    setBlockData({
      displayName: info.displayName,
      downstreamBlockId: info.usageKey,
      upstreamBlockId: outOfSyncComponentsByKey[info.usageKey].upstreamUsageKey,
      upstreamBlockVersionSynced: outOfSyncComponentsByKey[info.usageKey].versionSynced,
      isVertical: info.blockType === 'vertical',
    });
  };
  // Show preview changes on review
  const onReview = useCallback((info: ContentHit) => {
    setSeletecdBlockData(info);
    openModal();
  }, [setSeletecdBlockData, openModal]);

  const onIgnoreClick = useCallback((info: ContentHit) => {
    setSeletecdBlockData(info);
    openConfirmModal();
  }, [setSeletecdBlockData, openConfirmModal]);

  const reloadLinks = useCallback((usageKey: string) => {
    const courseKey = outOfSyncComponentsByKey[usageKey].downstreamContextKey;
    queryClient.invalidateQueries(courseLibrariesQueryKeys.courseLibraries(courseKey));
  }, [outOfSyncComponentsByKey]);

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
      await acceptChangesMutation.mutateAsync(info.usageKey);
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
      await ignoreChangesMutation.mutateAsync(blockData.downstreamBlockId);
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

  if (isIndexDataLoading) {
    return <Loading />;
  }

  if (hasError) {
    return <AlertError error={intl.formatMessage(messages.genericErrorMessage)} />;
  }

  return (
    <>
      {downstreamInfo?.map((info) => (
        <BlockCard
          key={info.usageKey}
          info={info}
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
      <PreviewLibraryXBlockChanges
        blockData={blockData}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        postChange={postChange}
        alertNode={(
          <AlertMessage
            show
            variant="warning"
            icon={Warning}
            title={intl.formatMessage(messages.olderVersionPreviewAlert)}
          />
        )}
      />
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
    data: linkPages,
    isLoading: isSyncComponentsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isError,
    error,
  } = useEntityLinks({ courseId, readyToSync: true });

  const outOfSyncComponents = useMemo(
    () => linkPages?.pages?.reduce((links, page) => [...links, ...page.results], []) ?? [],
    [linkPages],
  );
  const downstreamKeys = useMemo(
    () => outOfSyncComponents?.map(link => link.downstreamUsageKey),
    [outOfSyncComponents],
  );

  useLoadOnScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    true,
  );

  const onSearchUpdate = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const disableSortOptions = [
    SearchSortOption.RELEVANCE,
    SearchSortOption.OLDEST,
    SearchSortOption.NEWEST,
    SearchSortOption.RECENTLY_PUBLISHED,
  ];

  if (isSyncComponentsLoading) {
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
      <ComponentReviewList
        outOfSyncComponents={outOfSyncComponents}
        onSearchUpdate={onSearchUpdate}
      />
    </SearchContextProvider>
  );
};

export default ReviewTabContent;
