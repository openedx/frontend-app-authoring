import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
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

import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { AvailableGroup, GroupActions } from '@src/group-configurations/types';
import TitleButton from '../common/TitleButton';
import UsageList from '../common/UsageList';
import ExperimentCardGroup from './ExperimentCardGroup';
import ExperimentForm from './ExperimentForm';
import messages from './messages';
import { initialExperimentConfiguration } from './constants';

interface ExperimentCardProps {
  configuration: AvailableGroup;
  experimentConfigurationActions: GroupActions;
  isExpandedByDefault?: boolean;
  onCreate?: (configuration: AvailableGroup) => void;
  readOnly?: boolean;
}

const ExperimentCard = ({
  configuration,
  experimentConfigurationActions,
  isExpandedByDefault = false,
  onCreate,
  readOnly = false,
}: ExperimentCardProps) => {
  const { formatMessage } = useIntl();
  const { courseId } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, switchOnEditMode, switchOffEditMode] = useToggle(false);
  const [isOpenDeleteModal, openDeleteModal, closeDeleteModal] = useToggle(false);

  useEffect(() => {
    setIsExpanded(isExpandedByDefault);
  }, [isExpandedByDefault]);

  const {
    id,
    groups: groupsControl,
    description,
    usage,
  } = configuration;
  const isUsedInLocation = !!usage?.length;

  const { href: outlineUrl } = new URL(
    `/course/${courseId}`,
    getConfig().STUDIO_BASE_URL,
  );

  const outlineComponentLink = (
    <Hyperlink destination={outlineUrl}>
      <FormattedMessage {...messages.courseOutline} />
    </Hyperlink>
  );

  const guideHowToAdd = (
    <span
      className="small text-gray-700"
      data-testid="experiment-configuration-card-usage-empty"
    >
      <FormattedMessage {...messages.emptyExperimentGroup} values={{ outlineComponentLink }} />
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

  const handleEditConfiguration = (values: AvailableGroup) => {
    experimentConfigurationActions.handleEdit(values, switchOffEditMode);
  };

  return (
    <>
      {isEditMode ?
        (
          <ExperimentForm
            isEditMode={isEditMode}
            initialValues={formValues}
            isUsedInLocation={isUsedInLocation}
            onCreateClick={onCreate}
            onCancelClick={switchOffEditMode}
            onEditClick={handleEditConfiguration}
          />
        ) :
        (
          <div
            className="configuration-card"
            data-testid="configuration-card"
            id={String(id)}
          >
            <div className="configuration-card-header">
              <TitleButton
                group={configuration}
                isExpanded={isExpanded}
                onTitleClick={() => setIsExpanded((prevState) => !prevState)}
                isExperiment
              />
              {!readOnly && (
                <ActionRow className="ml-auto d-flex">
                  <IconButtonWithTooltip
                    tooltipContent={<FormattedMessage {...messages.actionEdit} />}
                    alt={formatMessage(messages.actionEdit)}
                    src={EditOutlineIcon}
                    iconAs={Icon}
                    onClick={switchOnEditMode}
                    data-testid="configuration-card-header-edit"
                  />
                  <IconButtonWithTooltip
                    className="configuration-card-header__delete-tooltip"
                    tooltipContent={
                      <FormattedMessage
                        {...(isUsedInLocation
                          ? messages.experimentConfigurationDeleteRestriction
                          : messages.actionDelete)}
                      />
                    }
                    alt={formatMessage(messages.actionDelete)}
                    src={DeleteOutlineIcon}
                    iconAs={Icon}
                    onClick={openDeleteModal}
                    data-testid="configuration-card-header-delete"
                    disabled={isUsedInLocation}
                  />
                </ActionRow>
              )}
            </div>
            {isExpanded && (
              <div
                className="configuration-card-content"
                data-testid="configuration-card-content"
              >
                <span className="x-small text-gray-500">{description}</span>
                <ExperimentCardGroup groups={groupsControl} />
                {usage?.length ?
                  (
                    <UsageList
                      className="mt-2.5"
                      itemList={usage}
                      isExperiment
                    />
                  ) :
                  guideHowToAdd}
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

export default ExperimentCard;
