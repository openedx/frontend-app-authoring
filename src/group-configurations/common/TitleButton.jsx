import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Stack, Badge, Truncate,
} from '@openedx/paragon';
import {
  ArrowDropDown as ArrowDownIcon,
  ArrowRight as ArrowRightIcon,
} from '@openedx/paragon/icons';

import { getCombinedBadgeList } from '../utils';
import messages from './messages';

const TitleButton = ({
  group, isExpanded, isExperiment, onTitleClick,
}) => {
  const { formatMessage } = useIntl();
  const { id, name, usage } = group;

  return (
    <Button
      iconBefore={isExpanded ? ArrowDownIcon : ArrowRightIcon}
      variant="tertiary"
      className="configuration-card-header__button"
      data-testid="configuration-card-header-button"
      onClick={onTitleClick}
    >
      <div className="configuration-card-header__title">
        <h3>
          <Truncate lines={1}>{name}</Truncate>
        </h3>
        <span className="x-small text-gray-500">
          {formatMessage(messages.titleId, { id })}
        </span>
      </div>
      {!isExpanded && (
        <Stack
          gap={2.5}
          direction="horizontal"
          data-testid="configuration-card-header-button-usage"
        >
          {getCombinedBadgeList(usage, group, isExperiment, formatMessage).map(
            (badge) => (
              <Badge
                key={badge}
                className="configuration-card-header__badge"
                data-testid="configuration-card-header__badge"
              >
                <span className="small">{badge}</span>
              </Badge>
            ),
          )}
        </Stack>
      )}
    </Button>
  );
};

TitleButton.defaultProps = {
  isExperiment: false,
};

TitleButton.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    usage: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        url: PropTypes.string,
      }),
    ),
    version: PropTypes.number.isRequired,
    active: PropTypes.bool,
    description: PropTypes.string,
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
    ),
    parameters: PropTypes.shape({
      courseId: PropTypes.string,
    }),
    readOnly: PropTypes.bool,
    scheme: PropTypes.string,
  }).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isExperiment: PropTypes.bool,
  onTitleClick: PropTypes.func.isRequired,
};

export default TitleButton;
