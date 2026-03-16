import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Icon, Stack } from '@openedx/paragon';
import { Question } from '@openedx/paragon/icons';
import { Paragraph } from '@src/utils';

import messages from './messages';

export const HelpSidebar = () => (
  <div className="pt-3 border-left h-100">
    <Stack gap={1} direction="horizontal" className="pl-4 h4 text-primary-700">
      <Icon src={Question} />
      <span>
        <FormattedMessage {...messages.helpAndSupportTitle} />
      </span>
    </Stack>
    <hr />
    <Stack className="pl-4 pr-4">
      <Stack>
        <span className="h5">
          <FormattedMessage {...messages.helpAndSupportFirstQuestionTitle} />
        </span>
        <span className="x-small">
          <FormattedMessage
            {...messages.helpAndSupportFirstQuestionBody}
            values={{ p: Paragraph }}
          />
        </span>
      </Stack>
      <hr />
      <Stack>
        <span className="h5">
          <FormattedMessage {...messages.helpAndSupportSecondQuestionTitle} />
        </span>
        <span className="x-small">
          <FormattedMessage
            {...messages.helpAndSupportSecondQuestionBody}
            values={{ p: Paragraph }}
          />
        </span>
      </Stack>
    </Stack>
    <hr className="w-100" />
  </div>
);
