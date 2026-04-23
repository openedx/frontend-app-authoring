import React, { useState } from 'react';
import {
  Badge,
  Form,
  Icon,
  IconButton,
  ModalPopup,
  useToggle,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { capitalize } from 'lodash';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import {
  FIELD_TYPE,
  getFieldType,
  serializeValue,
} from '../data/fieldTypes';
import { FIELD_PLACEHOLDER_MESSAGES } from '../data/fieldTypeMessages';
import BooleanInput from './inputs/BooleanInput';
import NumberInput from './inputs/NumberInput';
import EnumInput from './inputs/EnumInput';
import StringInput from './inputs/StringInput';
import JsonInput from './inputs/JsonInput';

const SettingCard = ({
  name,
  settingData,
  handleBlur,
  setEdited,
  showSaveSettingsPrompt,
  saveSettingsPrompt,
  isEditableState,
  setIsEditableState,
}) => {
  const intl = useIntl();
  const { deprecated, help, displayName } = settingData;
  const initialValue = JSON.stringify(settingData.value, null, 4);
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState<HTMLButtonElement | null>(null);
  const [newValue, setNewValue] = useState(initialValue);

  const fieldType = getFieldType(name, settingData.value);
  const placeholder = FIELD_PLACEHOLDER_MESSAGES[name]
    ? intl.formatMessage(FIELD_PLACEHOLDER_MESSAGES[name])
    : '';

  /**
   * Returns the native (parsed) value for display in the input.
   * For JSON type, returns the raw JSON string (CodeMirror handles it as text).
   */
  const getDisplayValue = () => {
    const raw = isEditableState ? newValue : initialValue;
    if (fieldType === FIELD_TYPE.JSON) { return raw; }
    try {
      const parsed = JSON.parse(raw);
      return parsed ?? '';
    } catch {
      return raw;
    }
  };

  /**
   * Marks the field as edited and shows the save prompt.
   * Does not commit to the parent — call handleCommit() for that.
   */
  const markEdited = (serialized: string) => {
    setNewValue(serialized);
    if (!saveSettingsPrompt) { showSaveSettingsPrompt(true); }
    if (!isEditableState) { setIsEditableState(true); }
  };

  /** Commits the current newValue to the parent edited state and validates. */
  const handleCommit = () => {
    setEdited((prevEditedSettings) => ({
      ...prevEditedSettings,
      [name]: newValue,
    }));
    handleBlur();
  };

  /**
   * For immediate inputs (Boolean, Enum): serialize, mark, and commit in one step.
   */
  const handleImmediateChange = (nativeValue) => {
    const serialized = serializeValue(nativeValue, fieldType);
    setNewValue(serialized);
    if (!saveSettingsPrompt) { showSaveSettingsPrompt(true); }
    if (!isEditableState) { setIsEditableState(true); }
    setEdited((prev) => ({ ...prev, [name]: serialized }));
    handleBlur();
  };

  /**
   * For lazy inputs (Number, String, JSON): serialize and mark only.
   * The parent is updated on blur via handleCommit().
   */
  const handleLazyChange = (rawValue) => {
    const serialized = serializeValue(rawValue, fieldType);
    markEdited(serialized);
  };

  const renderInput = () => {
    const displayValue = getDisplayValue();

    switch (fieldType) {
      case FIELD_TYPE.BOOLEAN:
        return (
          <BooleanInput
            value={displayValue as boolean}
            name={name}
            displayName={displayName}
            onChange={handleImmediateChange}
          />
        );
      case FIELD_TYPE.NUMBER:
        return (
          <NumberInput
            value={displayValue as number}
            name={name}
            displayName={displayName}
            onChange={handleLazyChange}
            onBlur={handleCommit}
            placeholder={placeholder}
          />
        );
      case FIELD_TYPE.ENUM:
        return (
          <EnumInput
            value={displayValue as string}
            name={name}
            displayName={displayName}
            onChange={handleImmediateChange}
          />
        );
      case FIELD_TYPE.STRING:
        return (
          <StringInput
            value={displayValue as string}
            name={name}
            displayName={displayName}
            onChange={handleLazyChange}
            onBlur={handleCommit}
            placeholder={placeholder}
          />
        );
      case FIELD_TYPE.JSON:
        return (
          <JsonInput
            initialValue={displayValue as string}
            onChange={handleLazyChange}
            onBlur={handleCommit}
            isEditableState={isEditableState}
          />
        );
      default:
        return null;
    }
  };

  return (
    <li className="setting-row">
      <div className="d-flex align-items-center px-4 py-3">
        <div className="setting-row-label col-6 d-flex align-items-center flex-wrap">
          <span className="setting-row-name font-weight-bold mr-1">
            {capitalize(displayName)}
          </span>
          {deprecated && (
            <Badge variant="danger" className="ml-1 mr-1">
              {intl.formatMessage(messages.deprecated)}
            </Badge>
          )}
          <IconButton
            ref={setTarget}
            onClick={open}
            src={InfoOutline}
            iconAs={Icon}
            alt={intl.formatMessage(messages.helpButtonText)}
            variant="primary"
            size="sm"
            className="flex-shrink-0"
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
        </div>
        <div className="setting-row-input col-6">
          <Form.Group className="m-0">
            {renderInput()}
          </Form.Group>
        </div>
      </div>
    </li>
  );
};

SettingCard.propTypes = {
  settingData: PropTypes.shape({
    deprecated: PropTypes.bool,
    help: PropTypes.string,
    displayName: PropTypes.string,
    value: PropTypes.oneOfType([
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

export default SettingCard;
