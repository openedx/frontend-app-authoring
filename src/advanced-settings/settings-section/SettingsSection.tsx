import { Fragment, useEffect, useState } from 'react';
import { Card, Collapsible, Icon } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import SettingCard from '../setting-card/SettingCard';
import CourseDisplayOverrides from './CourseDisplayOverrides';
import {
  CATEGORY_GENERAL_SETTING,
  CATEGORY_CONTENT_BLOCKS,
  CATEGORY_GRADING,
  CATEGORY_SCHEDULE,
  CATEGORY_CERTIFICATES,
  CATEGORY_ENROLLMENT_PAGE,
  CATEGORY_PAGES_AND_RESOURCES,
  CATEGORY_SPECIAL_EXAMS,
  CATEGORY_MOBILE,
  CATEGORY_INSTRUCTORS,
  CATEGORY_LEGACY_DISCUSSION,
  CATEGORY_LIBRARIES,
  CATEGORY_OTHER,
} from '../data/settingsCategories';
import type { SettingEntry, SetEditedSettings } from '../data/types';
import messages from './messages';

const DISPLAY_OVERRIDE_KEYS = new Set(['displayName', 'displayCoursenumber', 'displayOrganization']);

const CATEGORY_MESSAGE_MAP = {
  [CATEGORY_GENERAL_SETTING]: messages.categoryGeneralSetting,
  [CATEGORY_CONTENT_BLOCKS]: messages.categoryContentBlocks,
  [CATEGORY_GRADING]: messages.categoryGrading,
  [CATEGORY_SCHEDULE]: messages.categorySchedule,
  [CATEGORY_CERTIFICATES]: messages.categoryCertificates,
  [CATEGORY_ENROLLMENT_PAGE]: messages.categoryEnrollmentPage,
  [CATEGORY_PAGES_AND_RESOURCES]: messages.categoryPagesAndResources,
  [CATEGORY_SPECIAL_EXAMS]: messages.categorySpecialExams,
  [CATEGORY_MOBILE]: messages.categoryMobile,
  [CATEGORY_INSTRUCTORS]: messages.categoryInstructors,
  [CATEGORY_LEGACY_DISCUSSION]: messages.categoryLegacyDiscussion,
  [CATEGORY_LIBRARIES]: messages.categoryLibraries,
  [CATEGORY_OTHER]: messages.categoryOther,
};

const SUBCATEGORY_MESSAGE_MAP: Record<string, { id: string; defaultMessage: string; }> = {
  Settings: messages.subcategorySettings,
  Problems: messages.subcategoryProblems,
  Video: messages.subcategoryVideo,
  Other: messages.subcategoryOther,
};

const groupBySubcategory = (
  settings: SettingEntry[],
  subcategoryMap: Record<string, string>,
  subcategoryOrder: string[],
): Record<string, SettingEntry[]> => {
  const groups: Record<string, SettingEntry[]> = {};
  settings.forEach(([key, value]) => {
    const sub = subcategoryMap[key] || 'Other';
    if (!groups[sub]) { groups[sub] = []; }
    groups[sub].push([key, value]);
  });
  const ordered: Record<string, SettingEntry[]> = {};
  subcategoryOrder.forEach((sub) => {
    if (groups[sub]) { ordered[sub] = groups[sub]; }
  });
  Object.keys(groups).forEach((sub) => {
    if (!ordered[sub]) { ordered[sub] = groups[sub]; }
  });
  return ordered;
};

interface SettingsSectionProps {
  category: string;
  settingsEntries: SettingEntry[];
  showDeprecated: boolean;
  showSaveSettingsPrompt: (value: boolean) => void;
  saveSettingsPrompt: boolean;
  setEditedSettings: SetEditedSettings;
  handleSettingBlur: () => void;
  isEditableState: boolean;
  setIsEditableState: (value: boolean) => void;
  forceOpen?: boolean;
  expandAll?: boolean;
  subcategoryMap?: Record<string, string> | null;
  subcategoryOrder?: string[];
}

const SettingsSection = ({
  category,
  settingsEntries,
  showDeprecated,
  showSaveSettingsPrompt,
  saveSettingsPrompt,
  setEditedSettings,
  handleSettingBlur,
  isEditableState,
  setIsEditableState,
  forceOpen = false,
  expandAll = true,
  subcategoryMap = null,
  subcategoryOrder = [],
}: SettingsSectionProps) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    setIsOpen(expandAll);
  }, [expandAll]);

  const visibleSettings = settingsEntries.filter(
    ([, settingData]) => !settingData.deprecated || showDeprecated,
  );

  if (visibleSettings.length === 0) {
    return null;
  }

  const renderSettingCard = (settingName: string, settingData: SettingEntry[1]) => (
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
  );

  const renderSettingsList = () => {
    if (subcategoryMap) {
      return Object.entries(groupBySubcategory(visibleSettings, subcategoryMap, subcategoryOrder)).map(
        ([subcat, items]) => (
          <Fragment key={subcat}>
            <li className="subcategory-header px-4 pt-4 pb-0">
              <p className="subcategory-header-title mb-2">
                {SUBCATEGORY_MESSAGE_MAP[subcat]
                  ? intl.formatMessage(SUBCATEGORY_MESSAGE_MAP[subcat])
                  : subcat}
              </p>
              <hr className="subcategory-header-divider mt-0 mb-0" />
            </li>
            {items.map(([settingName, settingData]) => renderSettingCard(settingName, settingData))}
          </Fragment>
        ),
      );
    }

    if (category === CATEGORY_GENERAL_SETTING) {
      const displayOverrideEntries = visibleSettings.filter(([key]) => DISPLAY_OVERRIDE_KEYS.has(key));
      const otherEntries = visibleSettings.filter(([key]) => !DISPLAY_OVERRIDE_KEYS.has(key));
      return (
        <>
          {displayOverrideEntries.length > 0 && (
            <CourseDisplayOverrides
              displaySettingsEntries={displayOverrideEntries}
              showSaveSettingsPrompt={showSaveSettingsPrompt}
              saveSettingsPrompt={saveSettingsPrompt}
              setEditedSettings={setEditedSettings}
              handleSettingBlur={handleSettingBlur}
              isEditableState={isEditableState}
              setIsEditableState={setIsEditableState}
            />
          )}
          {otherEntries.map(([settingName, settingData]) => renderSettingCard(settingName, settingData))}
        </>
      );
    }

    return visibleSettings.map(([settingName, settingData]) => renderSettingCard(settingName, settingData));
  };

  return (
    <Card className="settings-section mb-4">
      <Collapsible.Advanced open={isOpen} onToggle={setIsOpen}>
        <Collapsible.Trigger className="settings-section-trigger w-100 p-0 border-0 bg-transparent text-left">
          <div className="d-flex align-items-center justify-content-between px-4 py-3">
            <h3 className="settings-section-title m-0">
              {CATEGORY_MESSAGE_MAP[category]
                ? intl.formatMessage(CATEGORY_MESSAGE_MAP[category])
                : category}
            </h3>
            <Icon src={isOpen ? ExpandLess : ExpandMore} className="settings-section-icon" />
          </div>
        </Collapsible.Trigger>
        <Collapsible.Body>
          <ul className="setting-items-list m-0 p-0">
            {renderSettingsList()}
          </ul>
        </Collapsible.Body>
      </Collapsible.Advanced>
    </Card>
  );
};

export default SettingsSection;
