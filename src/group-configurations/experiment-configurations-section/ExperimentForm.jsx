import PropTypes from 'prop-types';
import { FieldArray, Formik } from 'formik';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  ActionRow,
  Button,
  Form,
} from '@openedx/paragon';
import { WarningFilled as WarningFilledIcon } from '@openedx/paragon/icons';

import PromptIfDirty from '../../generic/prompt-if-dirty/PromptIfDirty';
import ExperimentFormGroups from './ExperimentFormGroups';
import messages from './messages';
import { experimentFormValidationSchema } from './validation';

const ExperimentForm = ({
  isEditMode,
  initialValues,
  isUsedInLocation,
  onCreateClick,
  onCancelClick,
  onEditClick,
}) => {
  const { formatMessage } = useIntl();
  const onSubmitForm = isEditMode ? onEditClick : onCreateClick;

  return (
    <div
      className="configuration-card"
      data-testid="experiment-configuration-form"
    >
      <div className="configuration-card-header">
        <h3>{formatMessage(messages.experimentConfigurationName)}*</h3>
        {isEditMode && (
          <span className="text-gray-500">
            {formatMessage(messages.experimentConfigurationId, {
              id: initialValues.id,
            })}
          </span>
        )}
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={experimentFormValidationSchema(formatMessage)}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={onSubmitForm}
      >
        {({
          values, errors, dirty, handleChange, handleSubmit,
        }) => (
          <>
            <Form.Group
              className="mt-3 configuration-form-group"
              isInvalid={!!errors.name}
            >
              <Form.Control
                value={values.name}
                name="name"
                onChange={handleChange}
                placeholder={formatMessage(
                  messages.experimentConfigurationNamePlaceholder,
                )}
              />
              <Form.Control.Feedback hasIcon={false} type="default">
                {formatMessage(messages.experimentConfigurationNameFeedback)}
              </Form.Control.Feedback>
              {errors.name && (
                <Form.Control.Feedback hasIcon={false} type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="configuration-form-group">
              <Form.Label>
                {formatMessage(messages.experimentConfigurationDescription)}
              </Form.Label>
              <Form.Control
                value={values.description}
                name="description"
                onChange={handleChange}
                placeholder={formatMessage(
                  messages.experimentConfigurationDescriptionPlaceholder,
                )}
                as="textarea"
              />
              <Form.Control.Feedback hasIcon={false} type="default">
                {formatMessage(
                  messages.experimentConfigurationDescriptionFeedback,
                )}
              </Form.Control.Feedback>
            </Form.Group>

            <FieldArray
              name="groups"
              render={(arrayHelpers) => (
                <ExperimentFormGroups
                  groups={values.groups}
                  errors={errors.groups}
                  onChange={handleChange}
                  onDeleteGroup={(idx) => arrayHelpers.remove(idx)}
                  onCreateGroup={(newGroup) => arrayHelpers.push(newGroup)}
                />
              )}
            />

            {isUsedInLocation && (
              <Alert
                variant="warning"
                icon={WarningFilledIcon}
                className="my-3"
              >
                <p>{formatMessage(messages.experimentConfigurationAlert)}</p>
              </Alert>
            )}
            <ActionRow data-testid="experiment-configuration-actions">
              <Button onClick={onCancelClick} variant="tertiary">
                {formatMessage(messages.experimentConfigurationCancel)}
              </Button>
              <Button onClick={handleSubmit}>
                {formatMessage(
                  isEditMode
                    ? messages.experimentConfigurationSave
                    : messages.experimentConfigurationCreate,
                )}
              </Button>
            </ActionRow>
            <PromptIfDirty dirty={dirty} />
          </>
        )}
      </Formik>
    </div>
  );
};

ExperimentForm.defaultProps = {
  isEditMode: false,
  isUsedInLocation: false,
  onCreateClick: null,
  onEditClick: null,
};

ExperimentForm.propTypes = {
  isEditMode: PropTypes.bool,
  initialValues: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        groupName: PropTypes.string,
      }),
    ),
  }).isRequired,
  isUsedInLocation: PropTypes.bool,
  onCreateClick: PropTypes.func,
  onCancelClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func,
};

export default ExperimentForm;
