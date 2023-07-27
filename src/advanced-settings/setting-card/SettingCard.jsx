import React, { useState } from 'react';
import {
  ActionRow,
  Card,
  Form,
  Icon,
  IconButton,
  ModalPopup,
  useToggle,
} from '@edx/paragon';
import { InfoOutline, Warning } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { capitalize } from 'lodash';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import TextareaAutosize from 'react-textarea-autosize';

import messages from './messages';

const SettingCard = ({
  intl, showDeprecated, name, onChange, value, settingData, handleBlur,
}) => {
  const { deprecated, help, displayName } = settingData;
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  return (
    <li className={classNames('field-group course-advanced-policy-list-item', { 'd-none': deprecated && !showDeprecated })}>
      <Card className="flex-column setting-card">
        <Card.Body className="d-flex">
          <Card.Header
            title={(
              <ActionRow>
                {capitalize(displayName)}
                <IconButton
                  ref={setTarget}
                  onClick={open}
                  src={InfoOutline}
                  iconAs={Icon}
                  alt={intl.formatMessage(messages.helpButtonText)}
                  variant="primary"
                  className=" ml-1 mr-2"
                />
                <ModalPopup
                  hasArrow
                  placement="right"
                  positionRef={target}
                  isOpen={isOpen}
                  onClose={close}
                  className="pgn__modal-popup__arrow"
                >
                  <div
                    className="p-2 x-small rounded modal-popup-content"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: help }}
                  />
                </ModalPopup>
              </ActionRow>
            )}
          />
          <Card.Section>
            <Form.Group className="m-0">
              <Form.Control
                as={TextareaAutosize}
                value={value}
                name={name}
                onChange={onChange}
                aria-label={displayName}
                onBlur={handleBlur}
              />
            </Form.Group>
          </Card.Section>
        </Card.Body>
        {deprecated && (
          <Card.Status icon={Warning} variant="danger">
            {intl.formatMessage(messages.deprecated)}
          </Card.Status>
        )}
      </Card>
    </li>
  );
};

SettingCard.propTypes = {
  intl: intlShape.isRequired,
  settingData: PropTypes.shape({
    deprecated: PropTypes.bool,
    help: PropTypes.string,
    displayName: PropTypes.string,
  }).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),
  onChange: PropTypes.func.isRequired,
  showDeprecated: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  handleBlur: PropTypes.func.isRequired,
};

SettingCard.defaultProps = {
  value: undefined,
};

export default injectIntl(SettingCard);
