import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack, Form } from '@openedx/paragon';

import CertificateSection from '../certificate-section/CertificateSection';
import messages from './messages';

const CertificateDetailsForm = ({
  detailsCourseTitle,
  courseTitleOverride,
  handleChange,
  handleBlur,
}) => {
  const intl = useIntl();
  return (
    <CertificateSection
      title={intl.formatMessage(messages.detailsSectionTitle)}
      className="certificate-details"
      data-testid="certificate-details-form"
    >
      <Stack>
        <Stack direction="horizontal" gap="1.5" className="certificate-details__info">
          <p className="certificate-details__info-paragraph">
            <strong>{intl.formatMessage(messages.detailsCourseTitle)}:</strong> {detailsCourseTitle}
          </p>
        </Stack>
        <Stack direction="horizontal" gap="1.5" className="certificate-details__info">
          <Form.Group className="m-0 w-100">
            <Form.Label>{intl.formatMessage(messages.detailsCourseTitleOverride)}</Form.Label>
            <Form.Control
              name="courseTitle"
              value={courseTitleOverride}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={intl.formatMessage(messages.detailsCourseTitleOverride)}
            />
            <Form.Control.Feedback>
              <span className="x-small">{intl.formatMessage(messages.detailsCourseTitleOverrideDescription)}</span>
            </Form.Control.Feedback>
          </Form.Group>
        </Stack>
      </Stack>
    </CertificateSection>
  );
};

CertificateDetailsForm.propTypes = {
  courseTitleOverride: PropTypes.string.isRequired,
  detailsCourseTitle: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
};

export default CertificateDetailsForm;
