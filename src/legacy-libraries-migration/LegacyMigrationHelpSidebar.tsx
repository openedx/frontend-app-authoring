import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Icon, Stack } from '@openedx/paragon';
import { Question } from '@openedx/paragon/icons';

import messages from './messages';

export const SingleLineBreak = (chunk: string[]) => <div>{chunk}</div>;
export const Paragraph = (chunk: string[]) => <p>{chunk}</p>;

export const LegacyMigrationHelpSidebar = () => (
  <div className="legacy-libraries-migration-help bg-white pt-3 mt-1">
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
          <FormattedMessage {...messages.helpAndSupportFirstQuestionBody} />
        </span>
      </Stack>
      <hr />
      <Stack>
        <span className="h5">
          <FormattedMessage {...messages.helpAndSupportSecondQuestionTitle} />
        </span>
        <span className="x-small">
          <FormattedMessage {...messages.helpAndSupportSecondQuestionBody} />
        </span>
      </Stack>
      <hr />
      <Stack>
        <span className="h5">
          <FormattedMessage {...messages.helpAndSupportThirdQuestionTitle} />
        </span>
        <span className="x-small">
          <FormattedMessage
            {...messages.helpAndSupportThirdQuestionBody}
            values={{ div: SingleLineBreak, p: Paragraph }}
          />
        </span>
      </Stack>
    </Stack>
  </div>
);
