import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  PageBanner, Button, Card, MailtoLink, Hyperlink,
} from '@openedx/paragon';
import { Email as EmailIcon } from '@openedx/paragon/icons';

import SectionSubHeader from '../../generic/section-sub-header';
import { INVITE_STUDENTS_LINK_ID } from './constants';
import messages from './messages';

const BasicSection = ({
  org,
  courseNumber,
  run,
  lmsLinkForAboutPage,
  marketingEnabled,
  courseDisplayName,
  platformName,
}) => {
  const intl = useIntl();
  const [showPageBanner, setShowPageBanner] = useState(true);
  const emailSubject = intl.formatMessage(
    {
      id: 'course-authoring.schedule.basic.email.subject',
      defaultMessage: 'Enroll in {courseDisplayName}.',
    },
    { courseDisplayName },
  );

  const emailBody = intl.formatMessage(
    {
      id: 'course-authoring.schedule.basic.email.body',
      defaultMessage:
        'The course {courseDisplayName}, provided by {platformName}, is open for enrollment. Please navigate to this course at {lmsLinkForAboutPage} to enroll.',
    },
    {
      courseDisplayName,
      platformName,
      lmsLinkForAboutPage,
    },
  );

  const promotionTitle = (
    <FormattedMessage
      id="course-authoring.schedule.basic.promotion.title"
      defaultMessage="Course summary page {smallText}"
      values={{
        smallText: <small>(for student enrollment and access)</small>,
      }}
    />
  );

  const courseBasicInfo = [
    {
      label: `${intl.formatMessage(messages.courseOrganization)}`,
      prefix: 'basic-organization',
      value: org,
    },
    {
      label: `${intl.formatMessage(messages.courseNumber)}`,
      prefix: 'basic-course-number',
      value: courseNumber,
    },
    {
      label: `${intl.formatMessage(messages.courseRun)}`,
      prefix: 'basic-course-run',
      value: run,
    },
  ];

  const renderBasicInfo = (info) => (
    <li key={info.prefix}>
      <h4 className="mb-0 text-black">{info.label}</h4>
      <span className="small text-black">{info.value}</span>
    </li>
  );

  const renderPageBanner = () => (
    <PageBanner
      show={showPageBanner}
      dismissible
      onDismiss={() => setShowPageBanner(false)}
      className="align-items-start"
    >
      <h4 className="text-black">{intl.formatMessage(messages.basicBannerTitle)}</h4>
      <span className="text text-gray-700 text-left">
        {intl.formatMessage(messages.basicBannerText)}
      </span>
    </PageBanner>
  );

  const renderCoursePromotion = () => (
    <Card>
      <Card.Header
        className="h4 px-3 text-gray-500"
        title={promotionTitle}
        size="sm"
      />
      <Card.Section className="px-3 py-1">
        <Hyperlink
          destination={lmsLinkForAboutPage}
          className="lead info-500 small text-decoration-none"
          target="_blank"
          showLaunchIcon={false}
        >
          {lmsLinkForAboutPage}
        </Hyperlink>
      </Card.Section>
      <Card.Divider />
      <Card.Footer className="p-3 justify-content-start">
        <MailtoLink
          to={process.env.INVITE_STUDENTS_EMAIL_TO}
          subject={emailSubject}
          body={emailBody}
          data-testid={INVITE_STUDENTS_LINK_ID}
        >
          <Button variant="outline-primary" iconBefore={EmailIcon} size="sm">
            {intl.formatMessage(messages.basicPromotionButton)}
          </Button>
        </MailtoLink>
      </Card.Footer>
    </Card>
  );

  return (
    <section className="section-container basic-section">
      <SectionSubHeader
        title={intl.formatMessage(messages.basicTitle)}
        description={intl.formatMessage(messages.basicDescription)}
      />
      <ul className="basic-info-list">
        {courseBasicInfo.map(renderBasicInfo)}
      </ul>
      {marketingEnabled ? renderPageBanner() : renderCoursePromotion()}
    </section>
  );
};

BasicSection.propTypes = {
  org: PropTypes.string.isRequired,
  courseNumber: PropTypes.string.isRequired,
  run: PropTypes.string.isRequired,
  lmsLinkForAboutPage: PropTypes.string.isRequired,
  marketingEnabled: PropTypes.bool.isRequired,
  courseDisplayName: PropTypes.string.isRequired,
  platformName: PropTypes.string.isRequired,
};

export default BasicSection;
