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
} from '../../../../../data/constants/problem';
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
          {Object.entries(AdvanceProblems).map(([type, data]) => {
            if (data.status !== '') {
              return (
                <ActionRow className="border-primary-100 border-bottom m-0 py-3 w-100" key={type}>
                  <Form.Radio id={type} value={type}>
                    {intl.formatMessage(messages.advanceProblemTypeLabel, { problemType: data.title })}
                  </Form.Radio>
                  <ActionRow.Spacer />
                  <OverlayTrigger
                    placement="right"
                    overlay={(
                      <Tooltip id={`tooltip-adv-${type}`}>
                        <div className="text-left">
                          {intl.formatMessage(messages.supportStatusTooltipMessage, { supportStatus: data.status.replace(' ', '_') })}
                        </div>
                      </Tooltip>
                    )}
                  >
                    <div className="text-gray-500">
                      {intl.formatMessage(messages.problemSupportStatus, { supportStatus: data.status })}
                    </div>
                  </OverlayTrigger>
                </ActionRow>
              );
            }
            return (
              <ActionRow className="border-primary-100 border-bottom m-0 py-3 w-100" key={type}>
                <Form.Radio id={type} value={type}>
                  {intl.formatMessage(messages.advanceProblemTypeLabel, { problemType: data.title })}
                </Form.Radio>
                <ActionRow.Spacer />
              </ActionRow>
            );
          })}
        </Form.RadioSet>
      </Form.Group>
      <Hyperlink
        destination="https://edx.readthedocs.io/projects/edx-partner-course-staff/en/latest/exercises_tools/create_exercises_and_tools.html#advanced"
        target="_blank"
      >
        <FormattedMessage {...messages.learnMoreAdvancedButtonLabel} />
      </Hyperlink>
    </Col>
  );
};

export default AdvanceTypeSelect;
