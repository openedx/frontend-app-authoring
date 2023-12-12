// ts-check
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Dropdown,
  DropdownButton,
} from '@edx/paragon';
import PropTypes from 'prop-types';

import messages from './messages';

const TaxonomyDetailMenu = ({
  id, name, disabled, onClickMenuItem,
}) => {
  const intl = useIntl();

  return (
    <DropdownButton
      id={id}
      title={intl.formatMessage(messages.actionsButtonLabel)}
      alt={intl.formatMessage(messages.actionsButtonAlt, { name })}
      disabled={disabled}
    >
      <Dropdown.Item onClick={() => onClickMenuItem('export')}>
        {intl.formatMessage(messages.exportMenu)}
      </Dropdown.Item>
    </DropdownButton>
  );
};

TaxonomyDetailMenu.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onClickMenuItem: PropTypes.func.isRequired,
};

TaxonomyDetailMenu.defaultProps = {
  disabled: false,
};

export default TaxonomyDetailMenu;
