import React from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  intlShape,
  FormattedMessage,
} from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@edx/paragon';

import IntroductionVideo from './introduction-video';
import CourseCodeEditor from './course-code-editor';
import CourseCardImage from './course-card-image';
import messages from './messages';

const IntroducingSection = ({
  intl,
  courseId,
  overview,
  introVideo,
  aboutSidebarHtml,
  shortDescription,
  aboutPageEditable,
  sidebarHtmlEnabled,
  lmsLinkForAboutPage,
  courseImageAssetPath,
  shortDescriptionEditable,
  onChange,
}) => {
  const overviewHelpText = (
    <FormattedMessage
      id="course-authoring.schedule-section.introducing.course-overview.help-text"
      defaultMessage="Introductions, prerequisites, FAQs that are used on {hyperlink} (formatted in HTML)"
      values={{
        hyperlink: (
          <Hyperlink
            destination={lmsLinkForAboutPage}
            target="_blank"
            rel="noopener noreferrer"
            showLaunchIcon={false}
          >
            {intl.formatMessage(messages.courseAboutHyperlink)}
          </Hyperlink>
        ),
      }}
    />
  );

  const aboutSidebarHelpText = (
    <FormattedMessage
      id="course-authoring.schedule-section.introducing.about-sidebar.help-text"
      defaultMessage="Custom sidebar content for {hyperlink} (formatted in HTML)"
      values={{
        hyperlink: (
          <Hyperlink
            destination={lmsLinkForAboutPage}
            target="_blank"
            rel="noopener noreferrer"
            showLaunchIcon={false}
          >
            {intl.formatMessage(messages.courseAboutHyperlink)}
          </Hyperlink>
        ),
      }}
    />
  );

  return (
    <section className="section-container details-section">
      {aboutPageEditable && (
        <header className="section-header">
          <span className="lead">
            {intl.formatMessage(messages.introducingTitle)}
          </span>
          <span className="x-small text-gray-700">
            {intl.formatMessage(messages.introducingDescription)}
          </span>
        </header>
      )}
      {shortDescriptionEditable && (
        <Form.Group className="form-group-custom">
          <Form.Label>
            {intl.formatMessage(messages.courseShortDescriptionLabel)}
          </Form.Label>
          <Form.Control
            as="textarea"
            value={shortDescription}
            name="shortDescription"
            onChange={(e) => onChange(e.target.value, 'shortDescription')}
            aria-label={intl.formatMessage(
              messages.courseShortDescriptionAriaLabel,
            )}
          />
          <Form.Control.Feedback>
            {intl.formatMessage(messages.courseShortDescriptionHelpText)}
          </Form.Control.Feedback>
        </Form.Group>
      )}
      {aboutPageEditable && (
        <>
          <CourseCodeEditor
            code={overview}
            field="overview"
            label={intl.formatMessage(messages.courseOverviewLabel)}
            helpText={overviewHelpText}
            onChange={onChange}
          />
          {sidebarHtmlEnabled && (
            <CourseCodeEditor
              code={aboutSidebarHtml}
              field="aboutSidebarHtml"
              label={intl.formatMessage(messages.courseAboutSidebarLabel)}
              helpText={aboutSidebarHelpText}
              onChange={onChange}
            />
          )}
          <CourseCardImage
            courseId={courseId}
            courseImageAssetPath={courseImageAssetPath}
            onChange={onChange}
          />
        </>
      )}
      <IntroductionVideo introVideo={introVideo} onChange={onChange} />
    </section>
  );
};

IntroducingSection.defaultProps = {
  introVideo: '',
  shortDescription: '',
  aboutSidebarHtml: '',
  courseImageAssetPath: '',
  overview: '',
};

IntroducingSection.propTypes = {
  intl: intlShape.isRequired,
  overview: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  introVideo: PropTypes.string,
  aboutSidebarHtml: PropTypes.string,
  shortDescription: PropTypes.string,
  aboutPageEditable: PropTypes.bool.isRequired,
  sidebarHtmlEnabled: PropTypes.bool.isRequired,
  lmsLinkForAboutPage: PropTypes.string.isRequired,
  courseImageAssetPath: PropTypes.string,
  shortDescriptionEditable: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default injectIntl(IntroducingSection);
