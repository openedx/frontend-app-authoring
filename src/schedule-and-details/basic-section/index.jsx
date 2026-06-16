import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import PageBannerSlot from '@src/plugin-slots/PageBannerSlot';

import SectionSubHeader from '../../generic/section-sub-header';
import CoursePromotionCard from './CoursePromotionCard';
import messages from './messages';

export { CoursePromotionCard };

const BasicSection = ({
  org,
  courseNumber,
  run,
  lmsLinkForAboutPage,
  courseDisplayName,
  platformName,
}) => {
  const intl = useIntl();
  const [showPageBanner, setShowPageBanner] = useState(true);

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
    <PageBannerSlot
      show={showPageBanner}
      onDismiss={() => setShowPageBanner(false)}
      lmsLinkForAboutPage={lmsLinkForAboutPage}
      courseDisplayName={courseDisplayName}
      platformName={platformName}
    >
      <h4 className="text-black">{intl.formatMessage(messages.basicBannerTitle, { platformName })}</h4>
      <span className="text text-gray-700 text-left">
        {intl.formatMessage(messages.basicBannerText)}
      </span>
    </PageBannerSlot>
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
      {renderPageBanner()}
    </section>
  );
};

BasicSection.propTypes = {
  org: PropTypes.string.isRequired,
  courseNumber: PropTypes.string.isRequired,
  run: PropTypes.string.isRequired,
  lmsLinkForAboutPage: PropTypes.string.isRequired,
  courseDisplayName: PropTypes.string.isRequired,
  platformName: PropTypes.string.isRequired,
};

export default BasicSection;
