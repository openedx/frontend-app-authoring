import React from 'react';
import PropTypes from 'prop-types';
import { Button, Container, SelectableBox } from '@openedx/paragon';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import { ProblemTypes, ProblemTypeKeys, AdvanceProblemKeys } from '../../../../../data/constants/problem';
import messages from './messages';

export const ProblemTypeSelect = ({
  selected,
  setSelected,
}) => {
  const handleChange = e => setSelected(e.target.value);
  const handleClick = () => setSelected(AdvanceProblemKeys.BLANK);
  const settings = { 'aria-label': 'checkbox', type: 'radio' };

  return (
    <Container style={{ width: '494px', height: '400px' }}>
      <SelectableBox.Set
        columns={1}
        onChange={handleChange}
        type={settings.type}
        value={selected}
      >
        {Object.values(ProblemTypeKeys).map((key) => (
          key !== 'advanced'
            ? (
              <SelectableBox
                className="border border-light-400 text-primary-500 shadow-none"
                id={key}
                value={key}
                {...settings}
              >
                {ProblemTypes[key].title}
              </SelectableBox>
            )
            : null
        ))}
      </SelectableBox.Set>
      <Button variant="link" className="pl-0 mt-2" onClick={handleClick}>
        <FormattedMessage {...messages.advanceProblemButtonLabel} />
      </Button>
    </Container>
  );
};
ProblemTypeSelect.propTypes = {
  selected: PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
};

export default injectIntl(ProblemTypeSelect);
