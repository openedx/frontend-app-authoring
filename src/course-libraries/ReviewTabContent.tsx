import React, {
  useCallback, useContext, useMemo, useState,
} from 'react';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Breadcrumb,
  Button,
  Card,
  Hyperlink,
  Icon,
  Stack,
  useToggle,
  SearchField,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { LinkOff, Loop } from '@openedx/paragon/icons';

import _ from 'lodash';
import classNames from 'classnames';
import messages from './messages';
import {default as previewChangesMessages} from '../course-unit/preview-changes/messages'
import {default as searchMessages} from '../search-manager/messages'
import { courseLibrariesQueryKeys, useEntityLinksByDownstreamContext } from './data/apiHooks';
import { useFetchIndexDocuments } from '../search-manager/data/apiHooks';
import { getItemIcon } from '../generic/block-type-utils';
import { BlockTypeLabel, Highlight } from '../search-manager';
import type { ContentHit } from '../search-manager/data/api';
import { SearchSortOption } from '../search-manager/data/api';
import Loading from '../generic/Loading';
import { useAcceptLibraryBlockChanges, useIgnoreLibraryBlockChanges } from '../course-unit/data/apiHooks';
import { BasePreviewLibraryXBlockChanges, LibraryChangesMessageData } from '../course-unit/preview-changes';
import { useQueryClient } from '@tanstack/react-query';
import LoadingButton from '../generic/loading-button';
import { ToastContext } from '../generic/toast-context';
import { BaseSearchSortWidget } from '../search-manager/SearchSortWidget';
import { useLoadOnScroll } from '../hooks';


interface Props {
  courseId: string;
}

interface ComponentInfo extends ContentHit {
  readyToSync: boolean;
  upstreamVersion: number | null;
}

interface BlockCardProps {
  info: ComponentInfo;
  actions?: React.ReactNode;
  reviewMode?: boolean;
}

const BlockCard: React.FC<BlockCardProps> = ({ info, actions, reviewMode }) => {
  const intl = useIntl();
  const componentIcon = getItemIcon(info.blockType);
  const breadcrumbs = _.tail(info.breadcrumbs) as Array<{ displayName: string, usageKey: string }>;

  const getBlockLink = useCallback(() => {
    let key = info.usageKey;
    if (breadcrumbs?.length > 1) {
      key = breadcrumbs[breadcrumbs.length - 1].usageKey || key;
    }
    return `${getConfig().STUDIO_BASE_URL}/container/${key}`;
  }, [info]);

  return (
    <Card
      className={classNames(
        'my-3 border-light-600 border',
        {
          'bg-primary-100': info.readyToSync && !reviewMode,
          'shadow': reviewMode,
          'shadow-none': !reviewMode,
        },
      )}
      orientation="horizontal"
    >
      <Card.Section
        className="py-3"
        actions={actions}
      >
        <Stack direction="horizontal" gap={2}>
          <Stack direction="vertical" gap={1}>
            <Stack direction="horizontal" gap={1} className="micro text-gray-500">
              <Icon src={componentIcon} size="xs" />
              <BlockTypeLabel blockType={info.blockType} />
            </Stack>
            <Stack direction="horizontal" className="small" gap={1}>
              {info.readyToSync && !reviewMode && <Icon src={Loop} size="xs" />}
              {info.upstreamVersion === null && (
                <OverlayTrigger
                  placement="auto"
                  overlay={
                    <Tooltip id={`${info.id}-broken-link-tooltip`}>
                      <FormattedMessage {...messages.brokenLinkTooltip} />
                    </Tooltip>
                  }
                >
                  <Icon src={LinkOff} size="xs" />
                </OverlayTrigger>
              )}
              <Highlight text={info.formatted?.displayName ?? ''} />
            </Stack>
            <div className="micro">
              <Highlight text={info.formatted?.description ?? ''} />
            </div>
            <Breadcrumb
              className="micro text-gray-500"
              ariaLabel={intl.formatMessage(messages.breadcrumbAriaLabel)}
              links={breadcrumbs.map((breadcrumb) => ({ label: breadcrumb.displayName }))}
              spacer={<span className="custom-spacer">/</span>}
              linkAs="span"
            />
          </Stack>
          <Hyperlink className="lead ml-auto mb-auto text-black" destination={getBlockLink()} target="_blank">
            {' '}
          </Hyperlink>
        </Stack>
      </Card.Section>
    </Card>
  );
};

const ReviewTabContent = ({ courseId }: Props) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const [blockData, setBlockData] = useState<LibraryChangesMessageData | undefined>(undefined);
  const [searchKeywords, setSearchKeywords] = useState<string>("");
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOption>(SearchSortOption.RECENTLY_MODIFIED);
  const {
    data: linkPages,
    isLoading: isSyncComponentsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useEntityLinksByDownstreamContext(courseId, true);
  const outOfSyncComponents = useMemo(
    () => linkPages?.pages?.reduce((links, page) => [...links, ...page.results], []) ?? [],
    [linkPages],
  );
  const downstreamKeys = useMemo(
    () => outOfSyncComponents?.map(link => link.downstreamUsageKey),
    [outOfSyncComponents]
  );
  const { data: downstreamInfo, isLoading: isIndexDataLoading } = useFetchIndexDocuments(
    [`context_key = "${courseId}"`, `usage_key IN ["${downstreamKeys?.join('","')}"]`],
    downstreamKeys?.length || 0,
    ['usage_key', 'display_name', 'breadcrumbs', 'description', 'block_type'],
    ['description:30'],
    [searchSortOrder],
    searchKeywords,
  ) as unknown as { data: ComponentInfo[], isLoading: boolean };
  const outOfSyncComponentsByKey = useMemo(
    () => _.keyBy(outOfSyncComponents, 'downstreamUsageKey'),
    [outOfSyncComponents]
  );
  const downstreamInfoByKey = useMemo(
    () => _.keyBy(downstreamInfo, 'usageKey'),
    [downstreamInfo]
  );
  const queryClient = useQueryClient();

  useLoadOnScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    true,
  );

  // Toggle preview changes modal
  const [isModalOpen, openModal, closeModal] = useToggle(false);
  const acceptChangesMutation = useAcceptLibraryBlockChanges();
  const ignoreChangesMutation = useIgnoreLibraryBlockChanges();

  // Show preview changes on review
  const onReview = (info: ComponentInfo) => {
    setBlockData({
      displayName: info.displayName,
      downstreamBlockId: info.usageKey,
      upstreamBlockId: outOfSyncComponentsByKey[info.usageKey].upstreamUsageKey,
      upstreamBlockVersionSynced: outOfSyncComponentsByKey[info.usageKey].upstreamVersion,
      isVertical: info.blockType === 'vertical',
    });
    openModal();
  }

  const reloadLinks = (usageKey: string) => {
    const courseKey = outOfSyncComponentsByKey[usageKey].downstreamContextKey;
    queryClient.invalidateQueries(courseLibrariesQueryKeys.courseLibraries(courseKey));
  }

  const postChange = () => {
    if (!blockData) {
      return
    }
    reloadLinks(blockData.downstreamBlockId);
  }

  const updateBlock = async (info: ComponentInfo) => {
    try {
      await acceptChangesMutation.mutateAsync(info.usageKey);
      reloadLinks(info.usageKey);
      showToast(intl.formatMessage(
        messages.updateSingleBlockSuccess,
        { name: info.displayName }
      ));
    } catch (e) {
      showToast(intl.formatMessage(previewChangesMessages.acceptChangesFailure));
    }
  }

  const ignoreBlock = async (info: ComponentInfo) => {
    try {
      await acceptChangesMutation.mutateAsync(info.usageKey);
      reloadLinks(info.usageKey);
      showToast(intl.formatMessage(
        messages.ignoreSingleBlockSuccess,
        { name: info.displayName }
      ));
    } catch (e) {
      showToast(intl.formatMessage(previewChangesMessages.ignoreChangesFailure));
    }
  }

  const menuItems = useMemo(
    () => [
      {
        id: 'search-sort-option-recently-modified',
        name: intl.formatMessage(searchMessages.searchSortRecentlyModified),
        value: SearchSortOption.RECENTLY_MODIFIED,
        show: true,
      },
      {
        id: 'search-sort-option-title-az',
        name: intl.formatMessage(searchMessages.searchSortTitleAZ),
        value: SearchSortOption.TITLE_AZ,
        show: true,
      },
      {
        id: 'search-sort-option-title-za',
        name: intl.formatMessage(searchMessages.searchSortTitleZA),
        value: SearchSortOption.TITLE_ZA,
        show: true,
      },
    ],
    [intl],
  );

  const orderInfo = useMemo(() => {
    if (searchSortOrder !== SearchSortOption.RECENTLY_MODIFIED) {
      return downstreamInfo;
    }
    if (isSyncComponentsLoading || isIndexDataLoading) {
      return [];
    }
    let merged = _.merge(downstreamInfoByKey, outOfSyncComponentsByKey);
    merged = _.omitBy(merged, (o) => !o.displayName);
    const ordered = _.orderBy(Object.values(merged), 'updated', 'desc');
    return ordered;
  }, [downstreamInfoByKey, outOfSyncComponentsByKey]);

  if (isSyncComponentsLoading || isIndexDataLoading) {
    return <Loading />;
  }

  return (
    <>
      <ActionRow>
        <SearchField
          onChange={setSearchKeywords}
          onSubmit={setSearchKeywords}
          value={searchKeywords}
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
        />
        <BaseSearchSortWidget
          menuItems={menuItems}
          searchSortOrder={searchSortOrder}
          setSearchSortOrder={setSearchSortOrder}
          defaultSearchSortOrder={SearchSortOption.RECENTLY_MODIFIED}
        />
        <ActionRow.Spacer />
      </ActionRow>
      {orderInfo?.map((info) => (
        <BlockCard key={info.usageKey} info={info} reviewMode actions={
          <ActionRow>
            <Button
              size="sm"
              variant="light"
              onClick={() => onReview(info)}
              className="font-weight-bold text-black"
            >
              {intl.formatMessage(messages.cardReviewContentBtn)}
            </Button>
            <ActionRow.Spacer/>
            <LoadingButton
              label={intl.formatMessage(messages.cardIgnoreContentBtn)}
              variant="tertiary"
              size="sm"
              onClick={() => ignoreBlock(info)}
            />
            <LoadingButton
              label={intl.formatMessage(messages.cardUpdateContentBtn)}
              variant="outline-primary"
              size="sm"
              onClick={() => updateBlock(info)}
            />
          </ActionRow>
        } />
      ))}
      <BasePreviewLibraryXBlockChanges
        blockData={blockData}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        acceptChangesMutation={acceptChangesMutation}
        ignoreChangesMutation={ignoreChangesMutation}
        postChange={postChange}
      />
    </>
  );
}

export default ReviewTabContent;
