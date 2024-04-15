import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Hyperlink,
  Icon,
  IconButtonWithTooltip,
  useToggle,
} from '@openedx/paragon';
import {
  DeleteOutline as DeleteOutlineIcon,
  EditOutline as EditOutlineIcon,
} from '@openedx/paragon/icons';

import DeleteModal from '../../generic/delete-modal/DeleteModal';
import TitleButton from '../common/TitleButton';
import UsageList from '../common/UsageList';
import ExperimentCardGroup from './ExperimentCardGroup';
import ExperimentForm from './ExperimentForm';
import messages from './messages';
import { initialExperimentConfiguration } from './constants';

const ExperimentCard = ({
  configuration,
  experimentConfigurationActions,
  isExpandedByDefault,
  onCreate,
}) => {
  const { formatMessage } = useIntl();
  const { courseId } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, switchOnEditMode, switchOffEditMode] = useToggle(false);
  const [isOpenDeleteModal, openDeleteModal, closeDeleteModal] = useToggle(false);

  useEffect(() => {
    setIsExpanded(isExpandedByDefault);
  }, [isExpandedByDefault]);

  const {
    id, groups: groupsControl, description, usage,
  } = configuration;
  const isUsedInLocation = !!usage?.length;

  const { href: outlineUrl } = new URL(
    `/course/${courseId}`,
    getConfig().STUDIO_BASE_URL,
  );

  const outlineComponentLink = (
    <Hyperlink destination={outlineUrl}>
      {formatMessage(messages.courseOutline)}
    </Hyperlink>
  );

  const guideHowToAdd = (
    <span
      className="small text-gray-700"
      data-testid="experiment-configuration-card-usage-empty"
    >
      {formatMessage(messages.emptyExperimentGroup, { outlineComponentLink })}
    </span>
  );

  // We need to store actual idx as an additional field for getNextGroupName utility.
  const configurationGroupsWithIndexField = {
    ...configuration,
    groups: configuration.groups.map((group, idx) => ({ ...group, idx })),
  };

  const formValues = isEditMode
    ? configurationGroupsWithIndexField
    : initialExperimentConfiguration;

  const handleDeleteConfiguration = () => {
    experimentConfigurationActions.handleDelete(id);
    closeDeleteModal();
  };

  const handleEditConfiguration = (values) => {
    experimentConfigurationActions.handleEdit(values, switchOffEditMode);
  };

  return (
    <>
      {isEditMode ? (
        <ExperimentForm
          isEditMode={isEditMode}
          initialValues={formValues}
          isUsedInLocation={isUsedInLocation}
          onCreateClick={onCreate}
          onCancelClick={switchOffEditMode}
          onEditClick={handleEditConfiguration}
        />
      ) : (
        <div
          className="configuration-card"
          data-testid="configuration-card"
          id={id}
        >
          <div className="configuration-card-header">
            <TitleButton
              group={configuration}
              isExpanded={isExpanded}
              onTitleClick={() => setIsExpanded((prevState) => !prevState)}
              isExperiment
            />
            <ActionRow className="ml-auto d-flex">
              <IconButtonWithTooltip
                tooltipContent={formatMessage(messages.actionEdit)}
                alt={formatMessage(messages.actionEdit)}
                src={EditOutlineIcon}
                iconAs={Icon}
                onClick={switchOnEditMode}
                data-testid="configuration-card-header-edit"
              />
              <IconButtonWithTooltip
                className="configuration-card-header__delete-tooltip"
                tooltipContent={formatMessage(
                  isUsedInLocation
                    ? messages.experimentConfigurationDeleteRestriction
                    : messages.actionDelete,
                )}
                alt={formatMessage(messages.actionDelete)}
                src={DeleteOutlineIcon}
                iconAs={Icon}
                onClick={openDeleteModal}
                data-testid="configuration-card-header-delete"
                disabled={isUsedInLocation}
              />
            </ActionRow>
          </div>
          {isExpanded && (
            <div
              className="configuration-card-content"
              data-testid="configuration-card-content"
            >
              <span className="x-small text-gray-500">{description}</span>
              <ExperimentCardGroup groups={groupsControl} />
              {usage?.length ? (
                <UsageList
                  className="mt-2.5"
                  itemList={usage}
                  isExperiment
                />
              ) : (
                guideHowToAdd
              )}
            </div>
          )}
        </div>
      )}
      <DeleteModal
        category={formatMessage(messages.subtitleModalDelete)}
        isOpen={isOpenDeleteModal}
        close={closeDeleteModal}
        onDeleteSubmit={handleDeleteConfiguration}
      />
    </>
  );
};

ExperimentCard.defaultProps = {
  configuration: {
    id: undefined,
    name: '',
    usage: [],
    version: undefined,
  },
  isExpandedByDefault: false,
  onCreate: null,
  experimentConfigurationActions: {},
};

ExperimentCard.propTypes = {
  configuration: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
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
    scheme: PropTypes.string,
  }),
  isExpandedByDefault: PropTypes.bool,
  onCreate: PropTypes.func,
  experimentConfigurationActions: PropTypes.shape({
    handleCreate: PropTypes.func,
    handleEdit: PropTypes.func,
    handleDelete: PropTypes.func,
  }),
};

export default ExperimentCard;
