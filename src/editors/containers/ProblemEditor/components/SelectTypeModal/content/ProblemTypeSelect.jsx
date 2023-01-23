import React from 'react';
import PropTypes from 'prop-types';
import { Button, SelectableBox } from '@edx/paragon';
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
    <>
      <SelectableBox.Set
        columns={1}
        onChange={handleChange}
        type={settings.type}
        value={selected}
      >
        {Object.values(ProblemTypeKeys).map((key) => (
          key !== 'advanced'
            ? (
              <SelectableBox id={key} value={key} {...settings}>
                {ProblemTypes[key].title}
              </SelectableBox>
            )
            : null
        ))}
      </SelectableBox.Set>
      <Button variant="link" className="pl-0 mt-2" onClick={handleClick}>
        <FormattedMessage {...messages.advanceProblemButtonLabel} />
      </Button>
    </>
  );
};
ProblemTypeSelect.propTypes = {
  selected: PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
};

export default injectIntl(ProblemTypeSelect);
