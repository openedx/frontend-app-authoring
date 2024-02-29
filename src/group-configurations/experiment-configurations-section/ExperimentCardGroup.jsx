import PropTypes from 'prop-types';
import { Stack, Truncate } from '@openedx/paragon';

import { getGroupPercentage } from './utils';

const ExperimentCardGroup = ({ groups }) => {
  const percentage = getGroupPercentage(groups.length);

  return (
    <Stack className="mb-3">
      {groups.map((item) => (
        <div
          className="configuration-card-content__experiment-stack"
          data-testid="configuration-card-content-experiment-stack"
          key={item.id}
        >
          <Truncate lines={1}>{item.name}</Truncate>
          <span>{percentage}</span>
        </div>
      ))}
    </Stack>
  );
};

ExperimentCardGroup.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      usage: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          url: PropTypes.string,
        }),
      ),
      version: PropTypes.number,
    }),
  ).isRequired,
};

export default ExperimentCardGroup;
