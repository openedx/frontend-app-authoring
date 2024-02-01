import React from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  intlShape,
  FormattedMessage,
} from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@openedx/paragon';

import CourseUploadImage from '../../generic/course-upload-image';
import { WysiwygEditor } from '../../generic/WysiwygEditor';
import SectionSubHeader from '../../generic/section-sub-header';
import IntroductionVideo from './introduction-video';
import ExtendedCourseDetails from './extended-course-details';
import messages from './messages';

const IntroducingSection = ({
  intl,
  title,
  subtitle,
  duration,
  overview,
  introVideo,
  description,
  aboutSidebarHtml,
  shortDescription,
  aboutPageEditable,
  sidebarHtmlEnabled,
  lmsLinkForAboutPage,
  courseImageAssetPath,
  bannerImageAssetPath,
  shortDescriptionEditable,
  enableExtendedCourseDetails,
  videoThumbnailImageAssetPath,
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
            showLaunchIcon={false}
          >
            {intl.formatMessage(messages.courseAboutHyperlink)}
          </Hyperlink>
        ),
      }}
    />
  );

  return (
    <section className="section-container introducing-section">
      {aboutPageEditable && (
        <SectionSubHeader
          title={intl.formatMessage(messages.introducingTitle)}
          description={intl.formatMessage(messages.introducingDescription)}
        />
      )}
      {enableExtendedCourseDetails && (
        <ExtendedCourseDetails
          title={title}
          subtitle={subtitle}
          duration={duration}
          description={description}
          onChange={onChange}
        />
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
            maxLength={150}
          />
          <Form.Control.Feedback>
            {intl.formatMessage(messages.courseShortDescriptionHelpText)}
          </Form.Control.Feedback>
        </Form.Group>
      )}
      {aboutPageEditable && (
        <>
          <Form.Group className="form-group-custom">
            <Form.Label>{intl.formatMessage(messages.courseOverviewLabel)}</Form.Label>
            <WysiwygEditor
              initialValue={overview}
              onChange={(value) => onChange(value, 'overview')}
            />
            <Form.Control.Feedback>{overviewHelpText}</Form.Control.Feedback>
          </Form.Group>
          {sidebarHtmlEnabled && (
            <Form.Group className="form-group-custom">
              <Form.Label>{intl.formatMessage(messages.courseAboutSidebarLabel)}</Form.Label>
              <WysiwygEditor
                initialValue={aboutSidebarHtml}
                onChange={(value) => onChange(value, 'aboutSidebarHtml')}
              />
              <Form.Control.Feedback>{aboutSidebarHelpText}</Form.Control.Feedback>
            </Form.Group>
          )}
          <CourseUploadImage
            label={intl.formatMessage(messages.courseCardImageLabel)}
            identifierFieldText={intl.formatMessage(messages.courseCardImageIdentifierText)}
            assetImagePath={courseImageAssetPath}
            assetImageField="courseImageAssetPath"
            imageNameField="courseImageName"
            showImageBodyText
            onChange={onChange}
          />
        </>
      )}
      {enableExtendedCourseDetails && (
        <>
          <CourseUploadImage
            label={intl.formatMessage(messages.courseBannerImageLabel)}
            identifierFieldText={intl.formatMessage(messages.courseBannerImageInsertText)}
            assetImagePath={bannerImageAssetPath}
            assetImageField="bannerImageAssetPath"
            imageNameField="bannerImageName"
            showImageBodyText
            onChange={onChange}
          />
          <CourseUploadImage
            label={intl.formatMessage(messages.courseVideoThumbnailLabel)}
            identifierFieldText={intl.formatMessage(messages.courseVideoThumbnailInsertText)}
            assetImagePath={videoThumbnailImageAssetPath}
            assetImageField="videoThumbnailImageAssetPath"
            imageNameField="videoThumbnailImageName"
            showImageBodyText
            onChange={onChange}
          />
        </>
      )}
      {aboutPageEditable && (
        <IntroductionVideo introVideo={introVideo} onChange={onChange} />
      )}
    </section>
  );
};

IntroducingSection.defaultProps = {
  title: '',
  subtitle: '',
  duration: '',
  description: '',
  introVideo: '',
  shortDescription: '',
  aboutSidebarHtml: '',
  courseImageAssetPath: '',
  bannerImageAssetPath: '',
  videoThumbnailImageAssetPath: '',
  overview: '',
};

IntroducingSection.propTypes = {
  intl: intlShape.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  duration: PropTypes.string,
  description: PropTypes.string,
  overview: PropTypes.string,
  introVideo: PropTypes.string,
  aboutSidebarHtml: PropTypes.string,
  shortDescription: PropTypes.string,
  aboutPageEditable: PropTypes.bool.isRequired,
  sidebarHtmlEnabled: PropTypes.bool.isRequired,
  lmsLinkForAboutPage: PropTypes.string.isRequired,
  courseImageAssetPath: PropTypes.string,
  bannerImageAssetPath: PropTypes.string,
  shortDescriptionEditable: PropTypes.bool.isRequired,
  enableExtendedCourseDetails: PropTypes.bool.isRequired,
  videoThumbnailImageAssetPath: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default injectIntl(IntroducingSection);
