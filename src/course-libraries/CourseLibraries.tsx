import React, {
  useCallback, useMemo, useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Breadcrumb, Button, Card, Collapsible, Container, Dropdown, Hyperlink, Icon, IconButton, Layout, Stack, Tab, Tabs,
} from '@openedx/paragon';
import {
  Cached, CheckCircle, KeyboardArrowDown, KeyboardArrowRight, Loop, MoreVert,
} from '@openedx/paragon/icons';

import {
  countBy, groupBy, keyBy, tail, uniq,
} from 'lodash';
import classNames from 'classnames';
import getPageHeadTitle from '../generic/utils';
import { useModel } from '../generic/model-store';
import messages from './messages';
import SubHeader from '../generic/sub-header/SubHeader';
import { useEntityLinksByDownstreamContext } from './data/apiHooks';
import type { PublishableEntityLink } from './data/api';
import { useFetchIndexDocuments } from '../search-manager/data/apiHooks';
import { getItemIcon } from '../generic/block-type-utils';
import { BlockTypeLabel } from '../search-manager';
import AlertMessage from '../generic/alert-message';
import type { ContentHit } from '../search-manager/data/api';
import { SearchSortOption } from '../search-manager/data/api';
import Loading from '../generic/Loading';
import { useStudioHome } from '../studio-home/hooks';

interface Props {
  courseId: string;
}

interface LibraryCardProps {
  courseId: string;
  title: string;
  links: PublishableEntityLink[];
}

interface ComponentInfo extends ContentHit {
  readyToSync: boolean;
}

interface BlockCardProps {
  info: ComponentInfo;
}

export enum CourseLibraryTabs {
  home = '',
  review = 'review',
}

const BlockCard: React.FC<BlockCardProps> = ({ info }) => {
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
      className={classNames(
        'my-3 shadow-none border-light-600 border',
        { 'bg-primary-100': info.readyToSync },
      )}
      orientation="horizontal"
      key={info.usageKey}
    >
      <Card.Section
        className="py-2"
      >
        <Stack direction="vertical" gap={1}>
          <Stack direction="horizontal" gap={1} className="micro text-gray-500">
            <Icon src={componentIcon} size="xs" />
            <BlockTypeLabel blockType={info.blockType} />
            <Hyperlink className="lead ml-auto text-black" destination={getBlockLink()} target="_blank">
              {' '}
            </Hyperlink>
          </Stack>
          <Stack direction="horizontal" className="small" gap={1}>
            {info.readyToSync && <Icon src={Loop} size="xs" />}
            {info.formatted?.displayName}
          </Stack>
          <div className="micro">{info.formatted?.description}</div>
          <Breadcrumb
            className="micro text-gray-500"
            ariaLabel={intl.formatMessage(messages.breadcrumbAriaLabel)}
            links={breadcrumbs.map((breadcrumb) => ({ label: breadcrumb.displayName }))}
            spacer={<span className="custom-spacer">/</span>}
            linkAs="span"
          />
        </Stack>
      </Card.Section>
    </Card>
  );
};

const LibraryCard: React.FC<LibraryCardProps> = ({ courseId, title, links }) => {
  const intl = useIntl();
  const linksInfo = useMemo(() => keyBy(links, 'downstreamUsageKey'), [links]);
  const totalComponents = links.length;
  const outOfSyncCount = useMemo(() => countBy(links, 'readyToSync').true, [links]);
  const downstreamKeys = useMemo(() => uniq(Object.keys(linksInfo)), [links]);
  const { data: downstreamInfo } = useFetchIndexDocuments({
    filter: [`context_key = "${courseId}"`, `usage_key IN ["${downstreamKeys.join('","')}"]`],
    limit: downstreamKeys.length,
    attributesToRetrieve: ['usage_key', 'display_name', 'breadcrumbs', 'description', 'block_type'],
    attributesToCrop: ['description:30'],
    sort: [SearchSortOption.TITLE_AZ],
  }) as unknown as { data: ComponentInfo[] };

  const renderBlockCards = (info: ComponentInfo) => {
    // eslint-disable-next-line no-param-reassign
    info.readyToSync = linksInfo[info.usageKey].readyToSync;
    return <BlockCard info={info} key={info.usageKey} />;
  };

  return (
    <Collapsible.Advanced>
      <Collapsible.Trigger className="bg-white shadow px-2 py-2 my-3 collapsible-trigger d-flex font-weight-normal text-dark">
        <Collapsible.Visible whenClosed>
          <Icon src={KeyboardArrowRight} />
        </Collapsible.Visible>
        <Collapsible.Visible whenOpen>
          <Icon src={KeyboardArrowDown} />
        </Collapsible.Visible>
        <Stack direction="vertical" className="flex-grow-1 pl-2 x-small" gap={1}>
          <h4>{title}</h4>
          <Stack direction="horizontal" gap={2}>
            <span>
              {intl.formatMessage(messages.totalComponentLabel, { totalComponents })}
            </span>
            <span>/</span>
            {outOfSyncCount ? (
              <>
                <Icon src={Loop} size="xs" />
                <span>
                  {intl.formatMessage(messages.outOfSyncCountLabel, { outOfSyncCount })}
                </span>
              </>
            ) : (
              <>
                <Icon src={CheckCircle} size="xs" />
                <span>
                  {intl.formatMessage(messages.allUptodateLabel)}
                </span>
              </>
            )}
          </Stack>
        </Stack>
        <Dropdown onClick={(e: { stopPropagation: () => void; }) => e.stopPropagation()}>
          <Dropdown.Toggle
            id={`dropdown-toggle-${title}`}
            alt="dropdown-toggle-menu-items"
            as={IconButton}
            src={MoreVert}
            iconAs={Icon}
            variant="primary"
            disabled
          />
          <Dropdown.Menu>
            <Dropdown.Item>TODO 1</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Collapsible.Trigger>

      <Collapsible.Body className="collapsible-body border-left border-left-purple px-2">
        {downstreamInfo?.map(info => renderBlockCards(info))}
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
};

interface ReviewAlertProps {
  show: boolean;
  outOfSyncCount: number;
  onDismiss: () => void;
  onReview: () => void;
}

const ReviewAlert: React.FC<ReviewAlertProps> = ({
  show, outOfSyncCount, onDismiss, onReview,
}) => {
  const intl = useIntl();
  return (
    <AlertMessage
      title={intl.formatMessage(messages.outOfSyncCountAlertTitle, { outOfSyncCount })}
      dismissible
      show={show}
      icon={Loop}
      variant="info"
      onClose={onDismiss}
      actions={[
        <Button
          onClick={onReview}
        >
          {intl.formatMessage(messages.outOfSyncCountAlertReviewBtn)}
        </Button>,
      ]}
    />
  );
};

const TabContent = ({ children }: { children: React.ReactNode }) => (
  <Layout
    lg={[{ span: 9 }, { span: 3 }]}
    md={[{ span: 9 }, { span: 3 }]}
    sm={[{ span: 12 }, { span: 12 }]}
    xs={[{ span: 12 }, { span: 12 }]}
    xl={[{ span: 9 }, { span: 3 }]}
  >
    <Layout.Element>
      {children}
    </Layout.Element>
    <Layout.Element>
      Help panel
    </Layout.Element>
  </Layout>
);

const CourseLibraries: React.FC<Props> = ({ courseId }) => {
  const intl = useIntl();
  const courseDetails = useModel('courseDetails', courseId);
  const [tabKey, setTabKey] = useState<CourseLibraryTabs>(CourseLibraryTabs.home);
  const [showReviewAlert, setShowReviewAlert] = useState(true);
  const { data: links, isLoading } = useEntityLinksByDownstreamContext(courseId);
  const linksByLib = useMemo(() => groupBy(links, 'upstreamContextKey'), [links]);
  const outOfSyncCount = useMemo(() => countBy(links, 'readyToSync').true, [links]);
  const {
    isLoadingPage: isLoadingStudioHome,
    isFailedLoadingPage: isFailedLoadingStudioHome,
    librariesV2Enabled,
  } = useStudioHome();

  const onAlertReview = () => {
    setTabKey(CourseLibraryTabs.review);
    setShowReviewAlert(false);
  };
  const onAlertDismiss = () => {
    setShowReviewAlert(false);
  };

  const renderLibrariesTabContent = useCallback(() => {
    if (isLoading) {
      return <Loading />;
    }
    if (links?.length === 0) {
      return <small><FormattedMessage {...messages.homeTabDescriptionEmpty} /></small>;
    }
    return (
      <>
        <small><FormattedMessage {...messages.homeTabDescription} /></small>
        {Object.entries(linksByLib).map(([libKey, libLinks]) => (
          <LibraryCard
            courseId={courseId}
            title={libLinks[0].upstreamContextTitle}
            links={libLinks}
            key={libKey}
          />
        ))}
      </>
    );
  }, [links, isLoading, linksByLib]);

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
        <ReviewAlert
          show={outOfSyncCount > 0 && tabKey === CourseLibraryTabs.home && showReviewAlert}
          outOfSyncCount={outOfSyncCount}
          onDismiss={onAlertDismiss}
          onReview={onAlertReview}
        />
        <SubHeader
          title={intl.formatMessage(messages.headingTitle)}
          subtitle={intl.formatMessage(messages.headingSubtitle)}
          headerActions={!showReviewAlert && tabKey === CourseLibraryTabs.home && (
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
            onSelect={(k: CourseLibraryTabs) => setTabKey(k)}
          >
            <Tab
              eventKey={CourseLibraryTabs.home}
              title={intl.formatMessage(messages.homeTabTitle)}
              className="px-2 mt-3"
            >
              <TabContent>
                {renderLibrariesTabContent()}
              </TabContent>
            </Tab>
            <Tab
              eventKey={CourseLibraryTabs.review}
              title={intl.formatMessage(
                outOfSyncCount > 0 ? messages.reviewTabTitle : messages.reviewTabTitleEmpty,
                { count: outOfSyncCount },
              )}
            >
              <TabContent>Help</TabContent>
            </Tab>
          </Tabs>
        </section>
      </Container>
    </>
  );
};

export default CourseLibraries;
