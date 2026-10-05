import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';

import Button from '@src/editors/sharedComponents/Button';
import messages from '../messages';
import type { GameSettings, GameType } from '../types';
import SettingsCard from './SettingsCard';

interface OnOffSettingProps {
  /** Distinguishes the setting's card and buttons in the stylesheet. */
  name: 'shuffle' | 'timer';
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

/** A setting the author turns on or off with a pair of toggle buttons. */
const OnOffSetting = ({ name, title, description, value, onChange }: OnOffSettingProps) => {
  const intl = useIntl();
  return (
    <SettingsCard
      className={`sidebar-${name} d-flex flex-column align-items-start align-self-stretch`}
      title={title}
      summary={intl.formatMessage(value ? messages.onLabel : messages.offLabel)}
    >
      <>
        <div className="pb-3 mb-2 text-gray-600">{description}</div>
        <div className="d-flex flex-row gap-0 w-100">
          <Button
            onClick={() => onChange(false)}
            variant={!value ? 'primary' : 'outline-primary'}
            className={`toggle-button rounded-0 ${name}-toggle-button`}
          >
            {intl.formatMessage(messages.offLabel)}
          </Button>
          <Button
            onClick={() => onChange(true)}
            variant={value ? 'primary' : 'outline-primary'}
            className={`toggle-button rounded-0 ${name}-toggle-button`}
          >
            {intl.formatMessage(messages.onLabel)}
          </Button>
        </div>
      </>
    </SettingsCard>
  );
};

interface SettingsSidebarProps {
  type: GameType;
  settings: GameSettings;
  updateType: (type: GameType) => void;
  setShuffleStatus: (value: boolean) => void;
  setTimerStatus: (value: boolean) => void;
}

/** The game's settings: its type, whether cards are shuffled, and (for matching) the timer. */
const SettingsSidebar = ({
  type,
  settings,
  updateType,
  setShuffleStatus,
  setTimerStatus,
}: SettingsSidebarProps) => {
  const intl = useIntl();
  const typeOption = (value: GameType, label: string) => (
    <Button
      onClick={() => updateType(value)}
      className="w-100 d-flex align-items-center justify-content-between py-2 px-0"
    >
      <span className="small text-primary-500">{label}</span>
      <span hidden={type !== value}>
        <Icon src={Check} className="text-success" />
      </span>
    </Button>
  );
  return (
    <div className="sidebar d-flex flex-column align-items-start flex-shrink-0 py-2">
      <div className="sidebar-header d-flex align-items-center align-self-stretch">
        <span className="sidebar-title text-primary-500 font-weight-bold">
          {intl.formatMessage(messages.settingsTitle)}
        </span>
      </div>
      <SettingsCard
        className="sidebar-type d-flex flex-column align-items-start align-self-stretch"
        title={intl.formatMessage(messages.typeLabel)}
        summary={intl.formatMessage(type === 'matching' ? messages.matchingLabel : messages.flashcardsLabel)}
      >
        {typeOption('flashcards', intl.formatMessage(messages.flashcardsLabel))}
        <div className="card-divider" />
        {typeOption('matching', intl.formatMessage(messages.matchingLabel))}
      </SettingsCard>
      <OnOffSetting
        name="shuffle"
        title={intl.formatMessage(messages.shuffleLabel)}
        description={intl.formatMessage(messages.shuffleSettingsDescription)}
        value={settings.shuffle}
        onChange={setShuffleStatus}
      />
      {type === 'matching' && (
        <OnOffSetting
          name="timer"
          title={intl.formatMessage(messages.timerLabel)}
          description={intl.formatMessage(messages.timerSettingsDescription)}
          value={settings.timer}
          onChange={setTimerStatus}
        />
      )}
    </div>
  );
};

export default SettingsSidebar;
