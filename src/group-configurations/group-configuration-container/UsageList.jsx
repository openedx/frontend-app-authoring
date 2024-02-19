import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Stack } from '@edx/paragon';

import { formatUrlToUnitPage } from './utils';
import messages from './messages';

const UsageList = ({ className, itemList, isExperiment }) => {
  const { formatMessage } = useIntl();
  const usageDescription = isExperiment
    ? messages.experimentAccessTo
    : messages.accessTo;

  return (
    <div className={className}>
      <p className="small text-gray-700 pt-2 pb-1.5 m-0">
        {formatMessage(usageDescription)}
      </p>
      <Stack gap={2}>
        {itemList.map(({ url, label }) => (
          <Hyperlink
            className="small text-info-500"
            destination={formatUrlToUnitPage(url)}
            key={`${label} - ${url}`}
          >
            {label}
          </Hyperlink>
        ))}
      </Stack>
    </div>
  );
};

UsageList.defaultProps = {
  className: '',
  isExperiment: false,
};

UsageList.propTypes = {
  className: PropTypes.string,
  itemList: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      url: PropTypes.string,
    }).isRequired,
  ).isRequired,
  isExperiment: PropTypes.bool,
};

export default UsageList;
