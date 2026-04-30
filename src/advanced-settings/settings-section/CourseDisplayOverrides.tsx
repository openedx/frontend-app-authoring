import { useEffect, useState } from 'react';
import {
  Form,
  Icon,
  IconButton,
  ModalPopup,
  useToggle,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import SettingCard from '../setting-card/SettingCard';
import type { SettingEntry, SetEditedSettings } from '../data/types';
import messages from './messages';

interface CourseDisplayOverridesProps {
  displaySettingsEntries: SettingEntry[];
  showSaveSettingsPrompt: (value: boolean) => void;
  saveSettingsPrompt: boolean;
  setEditedSettings: SetEditedSettings;
  handleSettingBlur: () => void;
  isEditableState: boolean;
  setIsEditableState: (value: boolean) => void;
}

const CourseDisplayOverrides = ({
  displaySettingsEntries,
  showSaveSettingsPrompt,
  saveSettingsPrompt,
  setEditedSettings,
  handleSettingBlur,
  isEditableState,
  setIsEditableState,
}: CourseDisplayOverridesProps) => {
  const hasContent = displaySettingsEntries.some(([, data]) => {
    const val = data.value;
    return val !== null && val !== undefined && val !== '';
  });

  const intl = useIntl();
  const [isEnabled, setIsEnabled] = useState(hasContent);

  // Re-sync toggle state when entries change (e.g. after a successful save)
  useEffect(() => {
    setIsEnabled(hasContent);
  }, [hasContent]);
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);
  const [isInfoOpen, openInfo, closeInfo] = useToggle(false);
  const [infoTarget, setInfoTarget] = useState<HTMLElement | null>(null);

  const handleToggle = (checked: boolean) => {
    if (!checked && hasContent) {
      setShowBlockedMessage(true);
    } else {
      setShowBlockedMessage(false);
      setIsEnabled(checked);
    }
  };

  return (
    <>
      <li className="setting-row">
        <div className="d-flex align-items-center px-4 py-3">
          <div className="setting-row-label col-6 d-flex align-items-center flex-wrap">
            <span className="setting-row-name font-weight-bold mr-1">
              {intl.formatMessage(messages.courseDisplayOverridesLabel)}
            </span>
            <IconButton
              ref={setInfoTarget}
              onClick={openInfo}
              src={InfoOutline}
              iconAs={Icon}
              alt={intl.formatMessage(messages.courseDisplayOverridesInfoAlt)}
              variant="primary"
              size="sm"
              className="flex-shrink-0"
            />
            <ModalPopup
              hasArrow
              placement="right"
              positionRef={infoTarget}
              isOpen={isInfoOpen}
              onClose={closeInfo}
              className="pgn__modal-popup__arrow"
            >
              <div className="p-2 x-small rounded modal-popup-content">
                {intl.formatMessage(messages.courseDisplayOverridesInfoText)}
              </div>
            </ModalPopup>
          </div>
          <div className="setting-row-input col-6">
            <Form.Group className="m-0">
              <Form.Switch
                id="course-display-overrides-toggle"
                checked={isEnabled}
                onChange={(e) => handleToggle(e.target.checked)}
                aria-label={intl.formatMessage(messages.courseDisplayOverridesLabel)}
                className="m-0"
              />
            </Form.Group>
          </div>
        </div>
        {showBlockedMessage && (
          <p className="display-overrides-blocked-message px-4 pb-3 mt-0 mb-0">
            {intl.formatMessage(messages.courseDisplayOverridesBlockedMessage)}
          </p>
        )}
      </li>

      {isEnabled && (
        <li className="display-overrides-nested-fields">
          <ul className="setting-items-list m-0 p-0">
            {displaySettingsEntries.map(([settingName, settingData]) => (
              <SettingCard
                key={settingName}
                settingData={settingData}
                name={settingName}
                showSaveSettingsPrompt={showSaveSettingsPrompt}
                saveSettingsPrompt={saveSettingsPrompt}
                setEdited={setEditedSettings}
                handleBlur={handleSettingBlur}
                isEditableState={isEditableState}
                setIsEditableState={setIsEditableState}
              />
            ))}
          </ul>
        </li>
      )}
    </>
  );
};

export default CourseDisplayOverrides;
