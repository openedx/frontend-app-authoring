import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '@src/editors/containers/MatchingEditor/messages';
import { Card, Form } from '@openedx/paragon';
import { useFormikContext } from 'formik';
import { MatchingState } from '@src/editors/containers/MatchingEditor/types';

const SettingsSidebar = () => {
  const intl = useIntl();
  const { values, setFieldValue } = useFormikContext<MatchingState>();

  return (
    <div className="w-25">
      <h4>
        {intl.formatMessage(messages.settingsTitle)}
      </h4>
      <Card className="d-flex flex-column align-self-stretch border mb-3">
        <Card.Section>
          <Form.Switch
            checked={values.isShuffled}
            onChange={(e) => setFieldValue('isShuffled', e.target.checked)}
            helperText={intl.formatMessage(messages.shuffleSettingsDescription)}
          >
            {intl.formatMessage(messages.shuffleLabel)}
          </Form.Switch>
        </Card.Section>
      </Card>
      <Card className="d-flex flex-column align-self-stretch border">
        <Card.Section>
          <Form.Switch
            checked={values.hasTimer}
            onChange={(e) => setFieldValue('hasTimer', e.target.checked)}
            helperText={intl.formatMessage(messages.timerSettingsDescription)}
          >
            {intl.formatMessage(messages.timerLabel)}
          </Form.Switch>
        </Card.Section>
      </Card>
    </div>
  );
};

export default SettingsSidebar;
