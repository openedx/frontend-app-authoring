import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, IconButton } from '@edx/paragon';
import {
  EditOutline as EditIcon,
  Settings as SettingsIcon,
} from '@edx/paragon/icons';

import messages from './messages';

const HeaderTitle = ({
  unitTitle,
  isTitleEditFormOpen,
  handleTitleEdit,
  handleTitleEditSubmit,
}) => {
  const intl = useIntl();
  const [titleValue, setTitleValue] = useState(unitTitle);

  useEffect(() => {
    setTitleValue(unitTitle);
  }, [unitTitle]);

  return (
    <div className="d-flex align-items-center lead">
      {isTitleEditFormOpen ? (
        <Form.Group className="m-0">
          <Form.Control
            ref={(e) => e && e.focus()}
            value={titleValue}
            name="displayName"
            onChange={(e) => setTitleValue(e.target.value)}
            aria-label={intl.formatMessage(messages.ariaLabelButtonEdit)}
            onBlur={() => handleTitleEditSubmit(titleValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTitleEditSubmit(titleValue);
              }
            }}
          />
        </Form.Group>
      ) : unitTitle}
      <IconButton
        alt={intl.formatMessage(messages.altButtonEdit)}
        className="ml-1 flex-shrink-0"
        iconAs={EditIcon}
        onClick={handleTitleEdit}
      />
      <IconButton
        alt={intl.formatMessage(messages.altButtonSettings)}
        className="flex-shrink-0"
        iconAs={SettingsIcon}
        onClick={() => {}}
      />
    </div>
  );
};

HeaderTitle.propTypes = {
  unitTitle: PropTypes.string.isRequired,
  isTitleEditFormOpen: PropTypes.bool.isRequired,
  handleTitleEdit: PropTypes.func.isRequired,
  handleTitleEditSubmit: PropTypes.func.isRequired,
};

export default HeaderTitle;
