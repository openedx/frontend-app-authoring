import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '@src/editors/containers/FlashcardsEditor/messages';
import { Card, Form } from '@openedx/paragon';
import { useFormikContext } from 'formik';
import { FlashcardsState } from '@src/editors/containers/FlashcardsEditor/types';

const SettingsSidebar = () => {
  const intl = useIntl();
  const { values, setFieldValue } = useFormikContext<FlashcardsState>();

  return (
    <div className="w-25">
      <h4>
        {intl.formatMessage(messages.settingsTitle)}
      </h4>
      <Card className="d-flex flex-column align-self-stretch border">
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
    </div>
  );
};

export default SettingsSidebar;
