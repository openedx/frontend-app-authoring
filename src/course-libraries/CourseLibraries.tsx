import React, {
  useCallback, useContext, useMemo, useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  ActionRow,
  Breadcrumb,
  Button,
  Card,
  Container,
  Hyperlink,
  Icon,
  Stack,
  Tab,
  Tabs,
  useToggle,
  SearchField,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import {
  Cached, CheckCircle, Launch, LinkOff, Loop,
} from '@openedx/paragon/icons';

import _ from 'lodash';
import classNames from 'classnames';
import getPageHeadTitle from '../generic/utils';
import { useModel } from '../generic/model-store';
import messages from './messages';
import {default as previewChangesMessages} from '../course-unit/preview-changes/messages'
import {default as searchMessages} from '../search-manager/messages'
import SubHeader from '../generic/sub-header/SubHeader';
import { courseLibrariesQueryKeys, useEntityLinksSummaryByDownstreamContext } from './data/apiHooks';
import type { PublishableEntityLink, PublishableEntityLinkSummary } from './data/api';
import { useFetchIndexDocuments } from '../search-manager/data/apiHooks';
import { getItemIcon } from '../generic/block-type-utils';
import { BlockTypeLabel, Highlight } from '../search-manager';
import type { ContentHit } from '../search-manager/data/api';
import { SearchSortOption } from '../search-manager/data/api';
import Loading from '../generic/Loading';
import { useStudioHome } from '../studio-home/hooks';
import { useAcceptLibraryBlockChanges, useIgnoreLibraryBlockChanges } from '../course-unit/data/apiHooks';
import { BasePreviewLibraryXBlockChanges, LibraryChangesMessageData } from '../course-unit/preview-changes';
import { useQueryClient } from '@tanstack/react-query';
import OutOfSyncAlert from './OutOfSyncAlert';
import { useSearchParams } from 'react-router-dom';
import LoadingButton from '../generic/loading-button';
import { ToastContext } from '../generic/toast-context';
import { BaseSearchSortWidget } from '../search-manager/SearchSortWidget';
import NewsstandIcon from '../generic/NewsstandIcon';

interface Props {
  courseId: string;
}

interface LibraryCardProps {
  linkSummary: PublishableEntityLinkSummary;
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

export enum CourseLibraryTabs {
  all = 'all',
  review = 'review',
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

const LibraryCard = ({ linkSummary }: LibraryCardProps) => {
  const intl = useIntl();

  return (
    <Card className="my-3 border-light-500 border shadow-none">
      <Card.Header
        title={(<Stack direction="horizontal" gap={2}>
          <Icon src={NewsstandIcon} />
          {linkSummary.upstreamContextTitle}
        </Stack>)}
        actions={
          <ActionRow>
            <Button
              destination={`${getConfig().PUBLIC_PATH}library/${linkSummary.upstreamContextKey}`}
              target='_blank'
              className="border border-light-300"
              variant="tertiary"
              as={Hyperlink}
              size="sm"
              showLaunchIcon={false}
              iconAfter={Launch}
            >
              View Library
            </Button>
          </ActionRow>
        }
        size="sm"
      />
      <Card.Section>
        <Stack
          direction="horizontal"
          gap={4}
          className="x-small"
        >
          <span>
            {intl.formatMessage(messages.totalComponentLabel, { totalComponents: linkSummary.totalCount })}
          </span>
          {linkSummary.readyToSyncCount > 0 && (
            <Stack direction="horizontal" gap={1}>
              <Icon src={Loop} size="xs" />
              <span>
                {intl.formatMessage(messages.outOfSyncCountLabel, { outOfSyncCount: linkSummary.readyToSyncCount })}
              </span>
            </Stack>
          )}
        </Stack>
      </Card.Section>
    </Card>
  );
};

const ReviewTabContent = ({ courseId, outOfSyncComponents }: {
  courseId: string,
  outOfSyncComponents: PublishableEntityLink[];
}) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const [blockData, setBlockData] = useState<LibraryChangesMessageData | undefined>(undefined);
  const [searchKeywords, setSearchKeywords] = useState<string>("");
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOption>(SearchSortOption.RECENTLY_MODIFIED);
  const downstreamKeys = outOfSyncComponents?.map(link => link.downstreamUsageKey);
  const { data: downstreamInfo, isLoading } = useFetchIndexDocuments(
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
    if (isLoading) {
      return [];
    }
    let merged = _.merge(downstreamInfoByKey, outOfSyncComponentsByKey);
    merged = _.omitBy(merged, (o) => !o.displayName);
    const ordered = _.orderBy(Object.values(merged), 'updated', 'desc');
    return ordered;
  }, [downstreamInfoByKey, outOfSyncComponentsByKey]);

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

const CourseLibraries: React.FC<Props> = ({ courseId }) => {
  const intl = useIntl();
  const courseDetails = useModel('courseDetails', courseId);
  const [searchParams] = useSearchParams();
  const [tabKey, setTabKey] = useState<CourseLibraryTabs>(
    () => searchParams.get('tab') as CourseLibraryTabs || CourseLibraryTabs.all
  );
  const [showReviewAlert, setShowReviewAlert] = useState(false);
  const { data: libraries, isLoading } = useEntityLinksSummaryByDownstreamContext(courseId);
  const outOfSyncCount = useMemo(() => _.sumBy(libraries, (lib) => lib.readyToSyncCount), [libraries]);
  const {
    isLoadingPage: isLoadingStudioHome,
    isFailedLoadingPage: isFailedLoadingStudioHome,
    librariesV2Enabled,
  } = useStudioHome();

  const onAlertReview = () => {
    setTabKey(CourseLibraryTabs.review);
  };

  const tabChange = useCallback((selectedTab: CourseLibraryTabs) => {
    setTabKey(selectedTab);
  }, []);

  const renderLibrariesTabContent = useCallback(() => {
    if (isLoading) {
      return <Loading />;
    }
    if (libraries?.length === 0) {
      return <small><FormattedMessage {...messages.homeTabDescriptionEmpty} /></small>;
    }
    return (
      <>
        <small><FormattedMessage {...messages.homeTabDescription} /></small>
        {libraries?.map((library) => (
          <LibraryCard
            linkSummary={library}
          />
        ))}
      </>
    );
  }, [libraries, isLoading]);

  const renderReviewTabContent = useCallback(() => {
    if (isLoading) {
      return <Loading />;
    }
    if (!outOfSyncCount || outOfSyncCount === 0) {
      return (
        <Stack direction="horizontal" gap={2}>
          <Icon src={CheckCircle} size="xs" />
          <small>
            <FormattedMessage {...messages.reviewTabDescriptionEmpty} />
          </small>
        </Stack>
      );
    }
    return null;
    //return <ReviewTabContent courseId={courseId} outOfSyncComponents={[]} />;
  }, [outOfSyncCount]);

  if (!isLoadingStudioHome && (!librariesV2Enabled || isFailedLoadingStudioHome)) {
    return (
      <Alert variant="danger">
        {intl.formatMessage(messages.librariesV2DisabledError)}
      </Alert>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.headingTitle))}
        </title>
      </Helmet>
      <Container size="xl" className="px-4 pt-4 mt-3">
        <OutOfSyncAlert
          courseId={courseId}
          onReview={onAlertReview}
          showAlert={showReviewAlert && tabKey === CourseLibraryTabs.all}
          setShowAlert={setShowReviewAlert}
        />
        <SubHeader
          title={intl.formatMessage(messages.headingTitle)}
          subtitle={intl.formatMessage(messages.headingSubtitle)}
          headerActions={!showReviewAlert && outOfSyncCount > 0 && tabKey === CourseLibraryTabs.all && (
            <Button
              variant="primary"
              onClick={onAlertReview}
              iconBefore={Cached}
            >
              {intl.formatMessage(messages.reviewUpdatesBtn)}
            </Button>
          )}
          hideBorder
        />
        <section className="mb-4">
          <Tabs
            id="course-library-tabs"
            activeKey={tabKey}
            onSelect={tabChange}
          >
            <Tab
              eventKey={CourseLibraryTabs.all}
              title={intl.formatMessage(messages.homeTabTitle)}
              className="px-2 mt-3"
            >
              {renderLibrariesTabContent()}
            </Tab>
            <Tab
              eventKey={CourseLibraryTabs.review}
              title={(
                <Stack direction="horizontal" gap={1}>
                  <Icon src={Loop} />
                  {intl.formatMessage(messages.reviewTabTitle)}
                </Stack>
              )}
              notification={outOfSyncCount}
              className="px-2 mt-3"
            >
                TODO
            </Tab>
          </Tabs>
        </section>
      </Container>
    </>
  );
};

export default CourseLibraries;
