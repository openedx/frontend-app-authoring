import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Stack } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';

import Button from '@src/editors/sharedComponents/Button';
import messages from '@src/editors/containers/GamesEditor/messages';
import type { GameSettings, GameType } from '@src/editors/containers/GamesEditor/types';
import SettingsCard from './SettingsCard';

interface OnOffSettingProps {
  /** Distinguishes the setting's card and buttons in the stylesheet. */
  name: 'shuffle' | 'timer';
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** Locks the card while a save is out; the On/Off buttons are native and covered by the fieldset. */
  isSaving?: boolean;
}

/** A setting the author turns on or off with a pair of toggle buttons. */
const OnOffSetting = ({
  name,
  title,
  description,
  value,
  onChange,
  isSaving,
}: OnOffSettingProps) => {
  const intl = useIntl();
  return (
    <SettingsCard
      className={`sidebar-${name} d-flex flex-column align-items-start align-self-stretch`}
      title={title}
      summary={intl.formatMessage(value ? messages.onLabel : messages.offLabel)}
      isSaving={isSaving}
    >
      <>
        <div className="pb-3 mb-2 text-gray-600">{description}</div>
        <Stack direction="horizontal" gap={0} className="w-100 align-items-stretch">
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
        </Stack>
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
  /** True while a save is out: the cards' triggers are divs, so they lock here. */
  isSaving?: boolean;
}

/** The game's settings: its type, whether cards are shuffled, and (for matching) the timer. */
const SettingsSidebar = ({
  type,
  settings,
  updateType,
  setShuffleStatus,
  setTimerStatus,
  isSaving = false,
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
    <Stack
      direction="vertical"
      gap={3}
      className="games-sidebar align-items-start align-self-start flex-shrink-0 flex-grow-0 py-2"
    >
      <div className="sidebar-header d-flex align-items-center align-self-stretch">
        <span className="sidebar-title text-primary-500 font-weight-bold">
          {intl.formatMessage(messages.settingsTitle)}
        </span>
      </div>
      <SettingsCard
        className="sidebar-type d-flex flex-column align-items-start align-self-stretch"
        title={intl.formatMessage(messages.typeLabel)}
        summary={intl.formatMessage(type === 'matching' ? messages.matchingLabel : messages.flashcardsLabel)}
        isSaving={isSaving}
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
        isSaving={isSaving}
      />
      {type === 'matching' && (
        <OnOffSetting
          name="timer"
          title={intl.formatMessage(messages.timerLabel)}
          description={intl.formatMessage(messages.timerSettingsDescription)}
          value={settings.timer}
          onChange={setTimerStatus}
          isSaving={isSaving}
        />
      )}
    </Stack>
  );
};

export default SettingsSidebar;
