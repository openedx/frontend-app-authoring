import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  ActionRow,
  Button,
  Form,
} from '@openedx/paragon';

import { WarningFilled as WarningFilledIcon } from '@openedx/paragon/icons';

import PromptIfDirty from '../../generic/prompt-if-dirty/PromptIfDirty';
import { isAlreadyExistsGroup } from './utils';
import messages from './messages';

const ContentGroupForm = ({
  isEditMode,
  groupNames,
  isUsedInLocation,
  overrideValue,
  onCreateClick,
  onCancelClick,
  onEditClick,
}) => {
  const { formatMessage } = useIntl();
  const initialValues = { newGroupName: overrideValue };
  const validationSchema = Yup.object().shape({
    newGroupName: Yup.string()
      .required(formatMessage(messages.requiredError))
      .trim()
      .test(
        'unique-name-restriction',
        formatMessage(messages.invalidMessage),
        (value) => overrideValue === value || !isAlreadyExistsGroup(groupNames, value),
      ),
  });
  const onSubmitForm = isEditMode ? onEditClick : onCreateClick;

  return (
    <div className="configuration-card" data-testid="content-group-form">
      <div className="configuration-card-header">
        <h3>{formatMessage(messages.newGroupHeader)}</h3>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={onSubmitForm}
      >
        {({
          values, errors, dirty, handleChange, handleSubmit,
        }) => {
          const isInvalid = !!errors.newGroupName;

          return (
            <>
              <Form.Group
                className="mt-3 mb-4 configuration-form-group"
                isInvalid={isInvalid}
              >
                <Form.Control
                  value={values.newGroupName}
                  name="newGroupName"
                  onChange={handleChange}
                  placeholder={formatMessage(messages.newGroupInputPlaceholder)}
                />
                {isInvalid && (
                  <Form.Control.Feedback type="invalid" hasIcon={false}>
                    {errors.newGroupName}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              {isUsedInLocation && (
                <Alert
                  variant="warning"
                  icon={WarningFilledIcon}
                  className="my-3"
                >
                  <p>{formatMessage(messages.alertGroupInUsage)}</p>
                </Alert>
              )}
              <ActionRow>
                <Button onClick={onCancelClick} variant="tertiary">
                  {formatMessage(messages.cancelButton)}
                </Button>
                <Button onClick={handleSubmit}>
                  {formatMessage(
                    isEditMode ? messages.saveButton : messages.createButton,
                  )}
                </Button>
              </ActionRow>
              <PromptIfDirty dirty={dirty} />
            </>
          );
        }}
      </Formik>
    </div>
  );
};

ContentGroupForm.defaultProps = {
  groupNames: [],
  overrideValue: '',
  isEditMode: false,
  isUsedInLocation: false,
  onCreateClick: null,
  onEditClick: null,
};

ContentGroupForm.propTypes = {
  groupNames: PropTypes.arrayOf(PropTypes.string),
  isEditMode: PropTypes.bool,
  isUsedInLocation: PropTypes.bool,
  overrideValue: PropTypes.string,
  onCreateClick: PropTypes.func,
  onCancelClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func,
};

export default ContentGroupForm;
