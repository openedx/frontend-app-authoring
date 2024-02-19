import PropTypes from 'prop-types';
import { Stack, Truncate } from '@openedx/paragon';

const ExperimentGroupStack = ({ itemList }) => (
  <Stack className="mb-3">
    {itemList.map((item) => (
      <div
        className="configuration-card-content__experiment-stack"
        data-testid="configuration-card-content__experiment-stack"
        key={item.id}
      >
        <Truncate lines={1}>{item.name}</Truncate>
        <span>25%</span>
      </div>
    ))}
  </Stack>
);

ExperimentGroupStack.propTypes = {
  itemList: PropTypes.arrayOf(
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

export default ExperimentGroupStack;
