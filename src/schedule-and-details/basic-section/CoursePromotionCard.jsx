import React from 'react';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button,
  Card,
  MailtoLink,
  Hyperlink,
} from '@openedx/paragon';
import { Email as EmailIcon } from '@openedx/paragon/icons';

import { INVITE_STUDENTS_LINK_ID } from './constants';
import messages from './messages';

const CoursePromotionCard = ({ lmsLinkForAboutPage, courseDisplayName, platformName }) => {
  const intl = useIntl();

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
    { courseDisplayName, platformName, lmsLinkForAboutPage },
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

  return (
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
};

CoursePromotionCard.propTypes = {
  lmsLinkForAboutPage: PropTypes.string.isRequired,
  courseDisplayName: PropTypes.string.isRequired,
  platformName: PropTypes.string.isRequired,
};

export default CoursePromotionCard;
