import { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Hyperlink,
  Icon,
  IconButtonWithTooltip,
} from '@edx/paragon';
import {
  DeleteOutline as DeleteOutlineIcon,
  EditOutline as EditOutlineIcon,
} from '@edx/paragon/icons';

import ExperimentGroupStack from './ExperimentGroupStack';
import TitleButton from './TitleButton';
import UsageList from './UsageList';
import messages from './messages';

const GroupConfigurationContainer = ({ group, isExperiment, readOnly }) => {
  const { formatMessage } = useIntl();
  const { courseId } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const { groups: groupsControl, description, usage } = group;

  const { href: outlineUrl } = new URL(
    `/course/${courseId}`,
    getConfig().STUDIO_BASE_URL,
  );

  const outlineComponentLink = (
    <Hyperlink destination={outlineUrl}>
      {formatMessage(messages.courseOutline)}
    </Hyperlink>
  );

  const createGuide = (emptyMessage, testId) => (
    <span className="small text-gray-700" data-testid={testId}>
      {formatMessage(emptyMessage, { outlineComponentLink })}
    </span>
  );

  const contentGroupsGuide = createGuide(
    messages.emptyContentGroups,
    'configuration-card-usage-empty',
  );

  const experimentalConfigurationsGuide = createGuide(
    messages.emptyExperimentGroup,
    'configuration-card-usage-experiment-empty',
  );

  const displayGuide = isExperiment
    ? experimentalConfigurationsGuide
    : contentGroupsGuide;

  const handleExpandContent = () => {
    setIsExpanded((prevState) => !prevState);
  };

  return (
    <div className="configuration-card" data-testid="configuration-card">
      <div className="configuration-card-header">
        <TitleButton
          group={group}
          isExpanded={isExpanded}
          isExperiment={isExperiment}
          onTitleClick={handleExpandContent}
        />
        {!readOnly && (
          <ActionRow className="ml-auto d-flex">
            <IconButtonWithTooltip
              tooltipContent={formatMessage(messages.actionEdit)}
              alt={formatMessage(messages.actionEdit)}
              src={EditOutlineIcon}
              iconAs={Icon}
              onClick={() => ({})}
              data-testid="configuration-card-header-edit"
            />
            <IconButtonWithTooltip
              tooltipContent={formatMessage(messages.actionDelete)}
              alt={formatMessage(messages.actionDelete)}
              src={DeleteOutlineIcon}
              iconAs={Icon}
              onClick={() => ({})}
              data-testid="configuration-card-header-delete"
            />
          </ActionRow>
        )}
      </div>
      {isExpanded && (
        <div
          className="configuration-card-content"
          data-testid="configuration-card-content"
        >
          {isExperiment && (
            <span className="x-small text-gray-500">{description}</span>
          )}
          {isExperiment && <ExperimentGroupStack itemList={groupsControl} />}
          {usage?.length ? (
            <UsageList
              className="mt-2.5"
              itemList={usage}
              key={usage.label}
              isExperiment={isExperiment}
            />
          ) : (
            displayGuide
          )}
        </div>
      )}
    </div>
  );
};

GroupConfigurationContainer.defaultProps = {
  isExperiment: false,
  readOnly: false,
};

GroupConfigurationContainer.propTypes = {
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
  isExperiment: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default GroupConfigurationContainer;
