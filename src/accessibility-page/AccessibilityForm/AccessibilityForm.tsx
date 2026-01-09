import {
  FormattedMessage, FormattedDate, FormattedTime, useIntl,
} from '@edx/frontend-platform/i18n';
import {
  ActionRow, Alert, Form, Stack, StatefulButton,
} from '@openedx/paragon';

import { STATEFUL_BUTTON_STATES } from '@src/constants';
import useAccessibility from './hooks';
import messages from './messages';

const AccessibilityForm = ({ accessibilityEmail }: { accessibilityEmail: string }) => {
  const intl = useIntl();
  const {
    errors,
    values,
    isFormFilled,
    mutation,
    handleBlur,
    handleChange,
    hasErrorField,
    savingStatus,
  } = useAccessibility({ name: '', email: '', message: '' });

  const formFields = [
    {
      label: intl.formatMessage(messages.accessibilityPolicyFormEmailLabel),
      name: 'email',
      value: values.email,
    },
    {
      label: intl.formatMessage(messages.accessibilityPolicyFormNameLabel),
      name: 'name',
      value: values.name,
    },
    {
      label: intl.formatMessage(messages.accessibilityPolicyFormMessageLabel),
      name: 'message',
      value: values.message,
    },
  ];

  const createButtonState = {
    labels: {
      default: intl.formatMessage(messages.accessibilityPolicyFormSubmitLabel),
      pending: intl.formatMessage(messages.accessibilityPolicyFormSubmittingFeedbackLabel),
    },
    disabledStates: [STATEFUL_BUTTON_STATES.pending],
  };

  const handleSubmit = () => {
    mutation.mutateAsync(values).catch(() => {});
  };

  const start = new Date('Mon Jan 29 2018 13:00:00 GMT (UTC)');
  const end = new Date('Fri Feb 2 2018 21:00:00 GMT (UTC)');

  return (
    <>
      <h2 className="my-4">
        <FormattedMessage {...messages.accessibilityPolicyFormHeader} />
      </h2>
      {savingStatus === 'success' && (
        <Alert variant="success">
          <Stack gap={2}>
            <div className="mb-2">
              <FormattedMessage {...messages.accessibilityPolicyFormSuccess} />
            </div>
            <div>
              <FormattedMessage
                {...messages.accessibilityPolicyFormSuccessDetails}
                values={{
                  day_start: (<FormattedDate value={start} weekday="long" />),
                  time_start: (<FormattedTime value={start} timeZoneName="short" />),
                  day_end: (<FormattedDate value={end} weekday="long" />),
                  time_end: (<FormattedTime value={end} timeZoneName="short" />),
                }}
              />
            </div>
          </Stack>
        </Alert>
      )}
      {savingStatus === 'error' && (
        <Alert variant="danger">
          <div data-testid="rate-limit-alert">
            <FormattedMessage
              {...messages.accessibilityPolicyFormErrorHighVolume}
              values={{
                emailLink: <a href={`mailto:${accessibilityEmail}`}>{accessibilityEmail}</a>,
              }}
            />
          </div>
        </Alert>
      )}
      <Form>
        {formFields.map((field) => (
          <Form.Group size="sm" key={field.label}>
            <Form.Control
              value={field.value}
              name={field.name}
              isInvalid={hasErrorField(field.name)}
              type={field.name === 'email' ? 'email' : null}
              as={field.name === 'message' ? 'textarea' : 'input'}
              onChange={handleChange}
              onBlur={handleBlur}
              floatingLabel={field.label}
            />
            {hasErrorField(field.name) && (
              <Form.Control.Feedback type="invalid" data-testid={`error-feedback-${field.name}`}>
                {errors[field.name]}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        ))}
      </Form>
      <ActionRow>
        <StatefulButton
          key="save-button"
          onClick={handleSubmit}
          disabled={!isFormFilled}
          state={
            savingStatus === 'pending'
              ? STATEFUL_BUTTON_STATES.pending
              : STATEFUL_BUTTON_STATES.default
          }
          {...createButtonState}
        />
      </ActionRow>
    </>
  );
};

export default AccessibilityForm;
