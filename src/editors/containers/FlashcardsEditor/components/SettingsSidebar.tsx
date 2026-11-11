import { useIntl } from '@edx/frontend-platform/i18n';

import Button from '@src/editors/sharedComponents/Button';
import messages from '@src/editors/containers/FlashcardsEditor/messages';
import { Card } from '@openedx/paragon';
import { useFormikContext } from 'formik';
import { FlashcardsState } from '../types';

const SettingsSidebar = () => {
  const intl = useIntl();
  const { values, setValues } = useFormikContext<FlashcardsState>();

  return (
    <div className="w-25">
      <div className="text-primary-500 font-weight-bold mb-3">
        {intl.formatMessage(messages.settingsTitle)}
      </div>
      <Card className="d-flex flex-column align-self-stretch border">
        <Card.Section>
          <span className="flex-grow-1 text-primary-500 x-small">{intl.formatMessage(messages.shuffleLabel)}</span>
        </Card.Section>
        <Card.Section className="pt-0">
          <div className="text-primary-500 x-small">
            <div className="pb-3 mb-2 text-gray-600">{intl.formatMessage(messages.shuffleSettingsDescription)}</div>
            <div className="d-flex flex-row gap-0 w-100">
              <Button
                onClick={() => setValues({ ...values, isShuffled: false })}
                variant={!values.isShuffled ? 'primary' : 'outline-primary'}
                className="flex-grow-1 rounded-0"
              >
                {intl.formatMessage(messages.offLabel)}
              </Button>
              <Button
                onClick={() => setValues({ ...values, isShuffled: true })}
                variant={values.isShuffled ? 'primary' : 'outline-primary'}
                className="flex-grow-1 rounded-0"
              >
                {intl.formatMessage(messages.onLabel)}
              </Button>
            </div>
          </div>
        </Card.Section>
      </Card>
    </div>
  );
};

export default SettingsSidebar;
