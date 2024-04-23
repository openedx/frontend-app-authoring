/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Close as CloseIcon, Add as AddIcon } from '@openedx/paragon/icons';
import {
  Form, Icon, IconButtonWithTooltip, Stack, Button,
} from '@openedx/paragon';

import {
  getNextGroupName,
  getGroupPercentage,
  getFormGroupErrors,
} from './utils';
import messages from './messages';

const ExperimentFormGroups = ({
  groups,
  errors,
  onChange,
  onDeleteGroup,
  onCreateGroup,
}) => {
  const { formatMessage } = useIntl();
  const percentage = getGroupPercentage(groups.length);
  const { arrayErrors, stringError } = getFormGroupErrors(errors);

  return (
    <Form.Group className="configuration-form-group">
      <Form.Label className="font-weight-bold">
        {formatMessage(messages.experimentConfigurationGroups)}*
      </Form.Label>
      <Form.Control.Feedback className="mt-0">
        {formatMessage(messages.experimentConfigurationGroupsFeedback)}
      </Form.Control.Feedback>
      {stringError && (
        <Form.Control.Feedback type="invalid" hasIcon={false}>
          {stringError}
        </Form.Control.Feedback>
      )}
      <Stack className="mt-3">
        {groups.map((group, idx) => {
          const fieldError = arrayErrors?.[idx]?.name;
          const isInvalid = !!fieldError;

          return (
            <Form.Group
              key={idx}
              isInvalid={isInvalid}
              className="configuration-form-group"
            >
              <Stack className="align-content-between" direction="horizontal">
                <Form.Control
                  name={`groups[${idx}].name`}
                  value={group.name}
                  onChange={onChange}
                />
                <div className="experiment-configuration-form-percentage">
                  {percentage}
                </div>
                <IconButtonWithTooltip
                  size="sm"
                  tooltipContent={formatMessage(
                    messages.experimentConfigurationGroupsTooltip,
                  )}
                  src={CloseIcon}
                  iconAs={Icon}
                  alt={formatMessage(
                    messages.experimentConfigurationGroupsTooltip,
                  )}
                  onClick={() => onDeleteGroup(idx)}
                />
              </Stack>
              {isInvalid && (
                <Form.Control.Feedback type="invalid" hasIcon={false}>
                  {fieldError}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          );
        })}
      </Stack>
      <Button
        variant="outline-primary"
        onClick={() => onCreateGroup(getNextGroupName(groups))}
        iconBefore={AddIcon}
        block
      >
        {formatMessage(messages.experimentConfigurationGroupsAdd)}
      </Button>
    </Form.Group>
  );
};

ExperimentFormGroups.defaultProps = {
  errors: [],
};

ExperimentFormGroups.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      version: PropTypes.number,
      usage: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          url: PropTypes.string,
          validation: PropTypes.shape({
            type: PropTypes.string,
            text: PropTypes.string,
          }),
        }),
      ),
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  onDeleteGroup: PropTypes.func.isRequired,
  onCreateGroup: PropTypes.func.isRequired,
  errors: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
    PropTypes.string,
  ]),
};

export default ExperimentFormGroups;
