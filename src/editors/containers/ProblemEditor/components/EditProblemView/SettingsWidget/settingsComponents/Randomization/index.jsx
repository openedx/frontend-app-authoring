import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form } from '@edx/paragon';
import PropTypes from 'prop-types';
import SettingsOption from '../../SettingsOption';
import messages from './messages';
import { useRandomizationSettingStatus } from './hooks';
import { RandomizationTypesKeys, RandomizationTypes } from '../../../../../../../data/constants/problem';

export const RandomizationCard = ({
  randomization,
  updateSettings,
  // inject
  intl,
}) => {
  const { summary, handleChange } = useRandomizationSettingStatus({ randomization, updateSettings });
  return (
    <SettingsOption
      title={intl.formatMessage(messages.randomizationSettingTitle)}
      summary={intl.formatMessage(summary.message)}
      none={!randomization}
    >
      <div className="mb-3">
        {intl.formatMessage(messages.randomizationSettingText, { randomization })}
      </div>

      <Form.Group>
        <Form.Control
          as="select"
          value={randomization}
          onChange={handleChange}
        >
          {
            Object.values(RandomizationTypesKeys).map((randomizationType) => (
              <option
                key={randomizationType}
                value={randomizationType}
              >
                {intl.formatMessage(RandomizationTypes[randomizationType])}
              </option>
            ))
          }
        </Form.Control>
      </Form.Group>

    </SettingsOption>
  );
};

RandomizationCard.propTypes = {
  randomization: PropTypes.string.isRequired,
  updateSettings: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(RandomizationCard);
