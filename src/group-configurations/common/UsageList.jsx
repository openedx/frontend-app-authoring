import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Stack, Icon } from '@openedx/paragon';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@openedx/paragon/icons';

import { MESSAGE_VALIDATION_TYPES } from '../constants';
import { formatUrlToUnitPage } from '../utils';
import messages from './messages';

const UsageList = ({ className, itemList, isExperiment }) => {
  const { formatMessage } = useIntl();
  const usageDescription = isExperiment
    ? messages.experimentAccessTo
    : messages.accessTo;

  const renderValidationMessage = ({ text, type }) => (
    <span className="d-inline-flex align-items-center">
      <Icon
        src={MESSAGE_VALIDATION_TYPES.error === type ? ErrorIcon : WarningIcon}
        size="sm"
        className="mr-2"
      />
      <span className="small text-gray-700">{text}</span>
    </span>
  );

  return (
    <div className={className}>
      <p className="small text-gray-700 pt-2 pb-1.5 m-0">
        {formatMessage(usageDescription)}
      </p>
      <Stack gap={2}>
        {itemList.map(({ url, label, validation }) => (
          <>
            <Hyperlink
              className="small text-info-500"
              destination={formatUrlToUnitPage(url)}
              key={`${label} - ${url}`}
            >
              {label}
            </Hyperlink>
            {validation && renderValidationMessage(validation)}
          </>
        ))}
      </Stack>
    </div>
  );
};

UsageList.defaultProps = {
  className: undefined,
  isExperiment: false,
};

UsageList.propTypes = {
  className: PropTypes.string,
  itemList: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      url: PropTypes.string,
      validation: PropTypes.shape({
        text: PropTypes.string,
        type: PropTypes.string,
      }),
    }).isRequired,
  ).isRequired,
  isExperiment: PropTypes.bool,
};

export default UsageList;
