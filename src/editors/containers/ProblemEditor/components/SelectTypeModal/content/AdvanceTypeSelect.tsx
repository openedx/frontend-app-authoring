import React from 'react';

import {
  Form,
  ActionRow,
  IconButton,
  Icon,
  OverlayTrigger,
  Tooltip,
  Hyperlink,
  Col,
} from '@openedx/paragon';
import { ArrowBack } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  AdvancedProblemType,
  AdvanceProblems,
  ProblemType,
  ProblemTypeKeys,
  getAdvanceProblems,
} from '@src/editors/data/constants/problem';
import messages from './messages';

interface Props {
  selected: AdvancedProblemType;
  setSelected: React.Dispatch<ProblemType | AdvancedProblemType>;
}

const AdvanceTypeSelect: React.FC<Props> = ({
  selected,
  setSelected,
}) => {
  const intl = useIntl();

  const localizedAdvanceProblems = getAdvanceProblems(intl.formatMessage);
  const staticAdvanceProblems = AdvanceProblems;

  const handleChange = e => { setSelected(e.target.value); };
  return (
    <Col xs={12} md={8} className="justify-content-center">
      <Form.Group className="border rounded text-primary-500 p-0">
        <ActionRow className="border-primary-100 border-bottom py-3 pl-2.5 pr-4">
          <IconButton
            src={ArrowBack}
            iconAs={Icon}
            alt={intl.formatMessage(messages.advanceMenuGoBack)}
            onClick={() => setSelected(ProblemTypeKeys.SINGLESELECT)}
          />
          <ActionRow.Spacer />
          <Form.Label className="h4">
            <FormattedMessage {...messages.advanceMenuTitle} />
          </Form.Label>
          <ActionRow.Spacer />
        </ActionRow>
        <Form.RadioSet
          name="advanceTypes"
          onChange={handleChange}
          value={selected}
          className="px-4"
        >
          {Object.entries(staticAdvanceProblems).map(([type, staticData]) => {
            const localizedData = localizedAdvanceProblems[type];
            if (staticData.status !== '') {
              return (
                <ActionRow className="border-primary-100 border-bottom m-0 py-3 w-100" key={type}>
                  <Form.Radio id={type} value={type}>
                    {intl.formatMessage(messages.advanceProblemTypeLabel, { problemType: localizedData.title })}
                  </Form.Radio>
                  <ActionRow.Spacer />
                  <OverlayTrigger
                    placement="right"
                    overlay={(
                      <Tooltip id={`tooltip-adv-${type}`}>
                        <div className="text-left">
                          {intl.formatMessage(messages.supportStatusTooltipMessage, { supportStatus: staticData.status.replace(' ', '_') })}
                        </div>
                      </Tooltip>
                    )}
                  >
                    <div className="text-gray-500">
                      {intl.formatMessage(messages.problemSupportStatus, { supportStatus: staticData.status })}
                    </div>
                  </OverlayTrigger>
                </ActionRow>
              );
            }
            return (
              <ActionRow className="border-primary-100 border-bottom m-0 py-3 w-100" key={type}>
                <Form.Radio id={type} value={type}>
                  {intl.formatMessage(messages.advanceProblemTypeLabel, { problemType: localizedData.title })}
                </Form.Radio>
                <ActionRow.Spacer />
              </ActionRow>
            );
          })}
        </Form.RadioSet>
      </Form.Group>
      <Hyperlink
        destination="https://docs.openedx.org/en/latest/educators/references/course_development/exercise_tools/guide_problem_types.html#advanced-problem-types"
        target="_blank"
      >
        <FormattedMessage {...messages.learnMoreAdvancedButtonLabel} />
      </Hyperlink>
    </Col>
  );
};

export default AdvanceTypeSelect;
