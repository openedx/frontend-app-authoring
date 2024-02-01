import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Dropdown, Form, Collapsible, Icon,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';

import { getLabelById } from '../../../utils';
import { DatepickerControl, DATEPICKER_TYPES } from '../../../generic/datepicker-control';
import messages from './messages';

export const CERTIFICATE_DISPLAY_BEHAVIOR = {
  earlyNoInfo: 'early_no_info',
  end: 'end',
  endWithDate: 'end_with_date',
};

const CertificateDisplayRow = ({
  certificateAvailableDate,
  availableDateErrorFeedback,
  certificatesDisplayBehavior,
  displayBehaviorErrorFeedback,
  onChange,
}) => {
  const intl = useIntl();
  const dropdownOptions = [
    {
      id: CERTIFICATE_DISPLAY_BEHAVIOR.earlyNoInfo,
      label: intl.formatMessage(messages.certificateBehaviorDropdownOption1),
    },
    {
      id: CERTIFICATE_DISPLAY_BEHAVIOR.end,
      label: intl.formatMessage(messages.certificateBehaviorDropdownOption2),
    },
    {
      id: CERTIFICATE_DISPLAY_BEHAVIOR.endWithDate,
      label: intl.formatMessage(messages.certificateBehaviorDropdownOption3),
    },
  ];

  const formatCertificateDisplayBehavior = (value) => {
    if (!value) {
      return '';
    }

    if (Object.values(CERTIFICATE_DISPLAY_BEHAVIOR).includes(value)) {
      return value;
    }

    return value.split('.')[1].toLowerCase();
  };

  const handleOnChange = (optionId) => {
    if (optionId !== CERTIFICATE_DISPLAY_BEHAVIOR.endWithDate) {
      onChange('', 'certificateAvailableDate');
    }
    onChange(optionId, 'certificatesDisplayBehavior');
  };

  const formattedCertificateBehavior = formatCertificateDisplayBehavior(
    certificatesDisplayBehavior,
  );

  const certificateDisplayValue = getLabelById(dropdownOptions, formattedCertificateBehavior)
    || intl.formatMessage(messages.certificateBehaviorDropdownEmpty);

  const showAvailableDate = formattedCertificateBehavior === CERTIFICATE_DISPLAY_BEHAVIOR.endWithDate;

  const renderReadMoreToggle = () => {
    const readMore = [
      {
        heading: intl.formatMessage(
          messages.certificateDisplayBehaviorToggleHeading1,
        ),
        paragraph: intl.formatMessage(
          messages.certificateDisplayBehaviorToggleParagraph1,
        ),
      },
      {
        heading: intl.formatMessage(
          messages.certificateDisplayBehaviorToggleHeading2,
        ),
        paragraph: intl.formatMessage(
          messages.certificateDisplayBehaviorToggleParagraph2,
        ),
      },
      {
        heading: intl.formatMessage(
          messages.certificateDisplayBehaviorToggleHeading3,
        ),
        paragraph: intl.formatMessage(
          messages.certificateDisplayBehaviorToggleParagraph3,
        ),
      },
    ];

    return (
      <Collapsible.Advanced>
        <Collapsible.Trigger className="d-flex small text-primary-500 align-items-center mt-3">
          <Icon className="mr-1" src={InfoOutline} />
          {intl.formatMessage(messages.certificateDisplayBehaviorToggleTitle)}
        </Collapsible.Trigger>
        <Collapsible.Body className="mt-2.5">
          <p className="x-small text-gray-500">
            {intl.formatMessage(
              messages.certificateDisplayBehaviorToggleParagraph,
            )}
          </p>
          {readMore.map(({ heading, paragraph }) => (
            <div className="mt-2" key={heading}>
              <p className="h6 text-gray-700 mt-1">{heading}</p>
              <p className="x-small text-gray-500 mt-1">{paragraph}</p>
            </div>
          ))}
        </Collapsible.Body>
      </Collapsible.Advanced>
    );
  };

  return (
    <li className="schedule-date-item">
      <div className="schedule-date-item-container">
        <Form.Group className="form-group-custom">
          <Form.Label>
            {intl.formatMessage(messages.certificateBehaviorLabel)}
          </Form.Label>
          <Dropdown claswsName="bg-white">
            <Dropdown.Toggle id="certificate-behavior-dropdown" variant="outline-primary">
              {certificateDisplayValue}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {dropdownOptions.map(({ id, label }) => (
                <Dropdown.Item key={id} onClick={() => handleOnChange(id)}>
                  {label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Form.Control.Feedback>
            {intl.formatMessage(messages.certificateBehaviorHelpText)}
          </Form.Control.Feedback>
          {showAvailableDate && (
            <DatepickerControl
              label={intl.formatMessage(messages.certificateAvailableDateLabel)}
              value={certificateAvailableDate}
              type={DATEPICKER_TYPES.date}
              onChange={(date) => onChange(date, 'certificateAvailableDate')}
              isInvalid={!!availableDateErrorFeedback}
              controlName="certificateAvailableDate"
            />
          )}
          {availableDateErrorFeedback && (
            <span className="schedule-date-item-error">
              {availableDateErrorFeedback}
            </span>
          )}
          {displayBehaviorErrorFeedback && (
            <span className="schedule-date-item-error">
              {displayBehaviorErrorFeedback}
            </span>
          )}
          {renderReadMoreToggle()}
        </Form.Group>
      </div>
    </li>
  );
};

CertificateDisplayRow.defaultProps = {
  certificateAvailableDate: '',
  availableDateErrorFeedback: '',
  certificatesDisplayBehavior: '',
  displayBehaviorErrorFeedback: '',
};

CertificateDisplayRow.propTypes = {
  certificateAvailableDate: PropTypes.string,
  availableDateErrorFeedback: PropTypes.string,
  certificatesDisplayBehavior: PropTypes.string,
  displayBehaviorErrorFeedback: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default CertificateDisplayRow;
