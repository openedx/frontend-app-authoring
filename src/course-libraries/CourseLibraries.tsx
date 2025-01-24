import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useIntl } from '@edx/frontend-platform/i18n';

import getPageHeadTitle from '../generic/utils';
import { useModel } from '../generic/model-store';
import messages from './messages';
import { Breadcrumb, Card, Collapsible, Container, Layout, Tab, Tabs } from '@openedx/paragon';
import SubHeader from '../generic/sub-header/SubHeader';
import { useEntityLinksByDownstreamContext } from './data/apiHooks';
import { groupBy, keyBy, merge, tail, uniq } from 'lodash';
import { PublishableEntityLink } from './data/api';
import { useFetchIndexDocuments } from '../search-manager/data/apiHooks';

interface Props {
  courseId: string;
}

interface LibraryCardProps {
  courseId: string;
  title: string;
  links: PublishableEntityLink[];
}

interface ComponentInfo {
  display_name: string;
  description: string;
  _formatted: {
    display_name: string;
    description: string;
  },
  breadcrumbs: {
    display_name: string;
  }[]
}

export enum CourseLibraryTabs {
  home = '',
  review = 'review',
}

const LibraryCard: React.FC<LibraryCardProps> = ({ courseId, title, links }) => {
  const intl = useIntl();
  const linksInfo = keyBy(links, 'downstreamUsageKey');
  const downstreamKeys = useMemo(() => uniq(Object.keys(linksInfo)), [links]);
  const { data: downstreamInfo } = useFetchIndexDocuments(
      [`context_key = "${courseId}"`, `usage_key IN ["${downstreamKeys.join('","')}"]`],
      downstreamKeys.length,
      ["usage_key", "display_name", "breadcrumbs", "description", "block_type"],
      ["description:30"]
  ) as unknown as { data: ComponentInfo[]};
  const downstreamInfoMap = keyBy(downstreamInfo, 'usage_key');
  const mergedData = merge(linksInfo, downstreamInfoMap);
  return (
    <Collapsible.Advanced className="collapsible-card">
      <Collapsible.Trigger className="collapsible-trigger d-flex">
        <span className="flex-grow-1">{title}</span>
        <Collapsible.Visible whenClosed> + </Collapsible.Visible>
        <Collapsible.Visible whenOpen> - </Collapsible.Visible>
      </Collapsible.Trigger>

      <Collapsible.Body className="collapsible-body">
        {Object.values(mergedData).map(info => (
          <Card orientation="horizontal" key={info.downstreamUsageKey}>
            <Card.Section>
              <div>{info._formatted?.display_name}</div>
              <small>{info._formatted?.description}</small>
              <Breadcrumb
                className="x-small text-gray-500"
                ariaLabel={intl.formatMessage(messages.breadcrumbAriaLabel)}
                links={tail(info.breadcrumbs).map((breadcrumb) => ({label: breadcrumb.display_name}))}
                spacer={<span className="custom-spacer">/</span>}
                linkAs='span'
              />
            </Card.Section>
          </Card>
        ))}
      </Collapsible.Body>
    </Collapsible.Advanced>
  )
}

const CourseLibraries: React.FC<Props> = ({ courseId }) => {
  const intl = useIntl();
  const courseDetails = useModel('courseDetails', courseId);
  const [tabKey, setTabKey] = useState<CourseLibraryTabs>(CourseLibraryTabs.home);
  const { data: links } = useEntityLinksByDownstreamContext(courseId);
  const linksByLib = useMemo(() => groupBy(links, 'upstreamContextKey'), [links]);

  return (
    <>
      <Helmet>
        <title>
          {getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.headingTitle))}
        </title>
      </Helmet>
      <Container size="xl" className="px-4 pt-4 mt-3">
        <SubHeader
          title={intl.formatMessage(messages.headingTitle)}
          subtitle={intl.formatMessage(messages.headingSubtitle)}
          hideBorder
        />
        <section className="mb-4">
          <Tabs
            id="course-library-tabs"
            activeKey={tabKey}
            onSelect={(k: CourseLibraryTabs) => setTabKey(k)}
          >
            <Tab eventKey={CourseLibraryTabs.home} title={intl.formatMessage(messages.homeTabTitle)}>
              <Layout
                lg={[{ span: 9 }, { span: 3 }]}
                md={[{ span: 9 }, { span: 3 }]}
                sm={[{ span: 12 }, { span: 12 }]}
                xs={[{ span: 12 }, { span: 12 }]}
                xl={[{ span: 9 }, { span: 3 }]}
              >
                <Layout.Element>
                  {Object.values(linksByLib).map((libLinks) => <LibraryCard
                    courseId={courseId}
                    title={libLinks[0].upstreamContextTitle}
                    links={libLinks}
                  />)}
                </Layout.Element>
                <Layout.Element>
                  Help panel
                </Layout.Element>
              </Layout>
            </Tab>
            <Tab
              eventKey={CourseLibraryTabs.review}
              title={intl.formatMessage(messages.reviewTabTitle, { count: 2 })}
            >
              <Layout
                lg={[{ span: 9 }, { span: 3 }]}
                md={[{ span: 9 }, { span: 3 }]}
                sm={[{ span: 12 }, { span: 12 }]}
                xs={[{ span: 12 }, { span: 12 }]}
                xl={[{ span: 9 }, { span: 3 }]}
              >
                <Layout.Element>
                  Hello I am the first panel.
                </Layout.Element>
                <Layout.Element>
                  Help panel
                </Layout.Element>
              </Layout>
            </Tab>
          </Tabs>
        </section>
      </Container>
    </>
  );
};

export default CourseLibraries;
