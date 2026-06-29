import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack, Form } from '@openedx/paragon';

import CertificateSection from '../certificate-section/CertificateSection';
import messages from './messages';

interface CertificateDetailsFromsProps {
  courseTitleOverride: string;
  detailsCourseTitle: string;
  handleChange: React.ChangeEventHandler<any>;
  handleBlur: React.FocusEventHandler<any>;
}

const CertificateDetailsForm = ({
  detailsCourseTitle,
  courseTitleOverride,
  handleChange,
  handleBlur,
}: CertificateDetailsFromsProps) => {
  const intl = useIntl();
  return (
    <CertificateSection
      title={intl.formatMessage(messages.detailsSectionTitle)}
      className="certificate-details"
      data-testid="certificate-details-form"
    >
      <Stack>
        <Stack direction="horizontal" gap={1.5} className="certificate-details__info">
          <p className="certificate-details__info-paragraph">
            <strong>{intl.formatMessage(messages.detailsCourseTitle)}:</strong> {detailsCourseTitle}
          </p>
        </Stack>
        <Stack direction="horizontal" gap={1.5} className="certificate-details__info">
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

export default CertificateDetailsForm;
