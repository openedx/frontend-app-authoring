import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  ActionRow,
  Button,
  Card,
  Container,
  Hyperlink,
  Icon,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import {
  Cached, CheckCircle, Launch, Loop,
} from '@openedx/paragon/icons';

import sumBy from 'lodash/sumBy';
import { useSearchParams } from 'react-router-dom';
import getPageHeadTitle from '../generic/utils';
import { useModel } from '../generic/model-store';
import messages from './messages';
import SubHeader from '../generic/sub-header/SubHeader';
import { useEntityLinksSummaryByDownstreamContext } from './data/apiHooks';
import type { PublishableEntityLinkSummary } from './data/api';
import Loading from '../generic/Loading';
import { useStudioHome } from '../studio-home/hooks';
import NewsstandIcon from '../generic/NewsstandIcon';
import ReviewTabContent from './ReviewTabContent';
import { OutOfSyncAlert } from './OutOfSyncAlert';

interface Props {
  courseId: string;
}

interface LibraryCardProps {
  linkSummary: PublishableEntityLinkSummary;
}

export enum CourseLibraryTabs {
  all = 'all',
  review = 'review',
}

const LibraryCard = ({ linkSummary }: LibraryCardProps) => {
  const intl = useIntl();

  return (
    <Card className="my-3 border-light-500 border shadow-none">
      <Card.Header
        title={(
          <Stack direction="horizontal" gap={2}>
            <Icon src={NewsstandIcon} />
            {linkSummary.upstreamContextTitle}
          </Stack>
        )}
        actions={(
          <ActionRow>
            <Button
              destination={`${getConfig().PUBLIC_PATH}library/${linkSummary.upstreamContextKey}`}
              target="_blank"
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
        )}
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

export const CourseLibraries: React.FC<Props> = ({ courseId }) => {
  const intl = useIntl();
  const courseDetails = useModel('courseDetails', courseId);
  const [searchParams] = useSearchParams();
  const [tabKey, setTabKey] = useState<CourseLibraryTabs>(
    () => searchParams.get('tab') as CourseLibraryTabs,
  );
  const [showReviewAlert, setShowReviewAlert] = useState(false);
  const { data: libraries, isLoading } = useEntityLinksSummaryByDownstreamContext(courseId);
  const outOfSyncCount = useMemo(() => sumBy(libraries, (lib) => lib.readyToSyncCount), [libraries]);
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

  useEffect(() => {
    setTabKey((prev) => {
      if (outOfSyncCount > 0) {
        return CourseLibraryTabs.review;
      }
      if (prev) {
        return prev;
      }
      /* istanbul ignore next */
      return CourseLibraryTabs.all;
    });
  }, [outOfSyncCount]);

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
            key={library.upstreamContextKey}
          />
        ))}
      </>
    );
  }, [libraries, isLoading]);

  const renderReviewTabContent = useCallback(() => {
    if (isLoading) {
      return <Loading />;
    }
    if (tabKey !== CourseLibraryTabs.review) {
      return null;
    }
    if (!outOfSyncCount) {
      return (
        <Stack direction="horizontal" gap={2}>
          <Icon src={CheckCircle} size="xs" />
          <small>
            <FormattedMessage {...messages.reviewTabDescriptionEmpty} />
          </small>
        </Stack>
      );
    }
    return <ReviewTabContent courseId={courseId} />;
  }, [outOfSyncCount, isLoading, tabKey]);

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
              {renderReviewTabContent()}
            </Tab>
          </Tabs>
        </section>
      </Container>
    </>
  );
};
