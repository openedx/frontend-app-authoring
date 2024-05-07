import React, { useState } from 'react';
import {
  ActionRow,
  Card,
  Form,
  Icon,
  IconButton,
  ModalPopup,
  useToggle,
} from '@openedx/paragon';
import { InfoOutline, Warning } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { capitalize } from 'lodash';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import TextareaAutosize from 'react-textarea-autosize';

import messages from './messages';

const SettingCard = ({
  name,
  settingData,
  handleBlur,
  setEdited,
  showSaveSettingsPrompt,
  saveSettingsPrompt,
  isEditableState,
  setIsEditableState,
  // injected
  intl,
}) => {
  const { deprecated, help, displayName } = settingData;
  const initialValue = JSON.stringify(settingData.value, null, 4);
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  const [newValue, setNewValue] = useState(initialValue);

  const handleSettingChange = (e) => {
    const { value } = e.target;
    setNewValue(e.target.value);
    if (value !== initialValue) {
      if (!saveSettingsPrompt) {
        showSaveSettingsPrompt(true);
      }
      if (!isEditableState) {
        setIsEditableState(true);
      }
    }
  };

  const handleCardBlur = () => {
    setEdited((prevEditedSettings) => ({
      ...prevEditedSettings,
      [name]: newValue,
    }));
    handleBlur();
  };

  return (
    <li className="field-group course-advanced-policy-list-item">
      <Card className="flex-column setting-card">
        <Card.Body className="d-flex row m-0 align-items-center">
          <Card.Header
            className="col-6"
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
                  className="flex-shrink-0 ml-1 mr-2"
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
                <ActionRow.Spacer />
              </ActionRow>
            )}
          />
          <Card.Section className="col-6 flex-grow-1">
            <Form.Group className="m-0">
              <Form.Control
                as={TextareaAutosize}
                value={isEditableState ? newValue : initialValue}
                name={name}
                onChange={handleSettingChange}
                aria-label={displayName}
                onBlur={handleCardBlur}
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
    value: PropTypes.PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
      PropTypes.number,
      PropTypes.object,
      PropTypes.array,
    ]),
  }).isRequired,
  setEdited: PropTypes.func.isRequired,
  showSaveSettingsPrompt: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  handleBlur: PropTypes.func.isRequired,
  saveSettingsPrompt: PropTypes.bool.isRequired,
  isEditableState: PropTypes.bool.isRequired,
  setIsEditableState: PropTypes.func.isRequired,
};

export default injectIntl(SettingCard);
