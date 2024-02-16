import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import SectionSubHeader from '../../generic/section-sub-header';
import messages from './messages';

const PacingSection = ({
  selfPaced, startDate, onChange,
}) => {
  const intl = useIntl();
  const canTogglePace = new Date() <= new Date(startDate);

  return (
    <section className="section-container pacing-section">
      <SectionSubHeader
        title={intl.formatMessage(messages.pacingTitle)}
        description={intl.formatMessage(messages.pacingDescription)}
      />
      <Form.Group>
        {!canTogglePace && (
          <Form.Label className="text pt-3">
            {intl.formatMessage(messages.pacingRestriction)}
          </Form.Label>
        )}
        <Form.RadioSet
          name="selfPaced"
          onChange={(e) => onChange(e.target.value, e.target.name)}
          value={selfPaced.toString()}
        >
          <Form.Radio
            value="false"
            description={intl.formatMessage(messages.pacingTypeInstructorDescription)}
            disabled={!canTogglePace}
          >
            {intl.formatMessage(messages.pacingTypeInstructorLabel)}
          </Form.Radio>
          <Form.Radio
            value="true"
            description={intl.formatMessage(messages.pacingTypeSelfDescription)}
            disabled={!canTogglePace}
          >
            {intl.formatMessage(messages.pacingTypeSelfLabel)}
          </Form.Radio>
        </Form.RadioSet>
      </Form.Group>
    </section>
  );
};

PacingSection.defaultProps = {
  selfPaced: '',
  startDate: '',
};

PacingSection.propTypes = {
  startDate: PropTypes.string,
  selfPaced: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  onChange: PropTypes.func.isRequired,
};

export default PacingSection;
