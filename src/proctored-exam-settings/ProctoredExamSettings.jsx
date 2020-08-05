import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import EmailValidator from 'email-validator';
import moment from 'moment';
import {
  Alert, Button, Form, Spinner,
} from '@edx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import StudioApiService from '../data/services/StudioApiService';

function ExamSettings(props) {
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [loadingConnectionError, setLoadingConnectionError] = useState(false);
  const [loadingPermissionError, setLoadingPermissionError] = useState(false);
  const [enableProctoredExams, setEnableProctoredExams] = useState(true);
  const [allowOptingOut, setAllowOptingOut] = useState(false);
  const [proctoringProvider, setProctoringProvider] = useState('');
  const [availableProctoringProviders, setAvailableProctoringProviders] = useState([]);
  const [proctortrackEscalationEmail, setProctortrackEscalationEmail] = useState('');
  const [createZendeskTickets, setCreateZendeskTickets] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [showProctortrackEscalationEmail, setShowProctortrackEscalationEmail] = useState(false);
  const isEdxStaff = getAuthenticatedUser().administrator;
  const [formStatus, setFormStatus] = useState({
    isValid: true,
    errors: {},
  });

  const alertRef = React.createRef();
  const proctoringEscalationEmailInputRef = useRef(null);

  function onEnableProctoredExamsChange(event) {
    setEnableProctoredExams(event.target.checked);
  }

  function onAllowOptingOutChange(value) {
    setAllowOptingOut(value);
  }

  function onCreateZendeskTicketsChange(value) {
    setCreateZendeskTickets(value);
  }

  function onProctoringProviderChange(event) {
    const provider = event.target.value;
    setProctoringProvider(provider);

    if (provider === 'proctortrack') {
      setCreateZendeskTickets(false);
      setShowProctortrackEscalationEmail(true);
    } else {
      if (provider === 'software_secure') {
        setCreateZendeskTickets(true);
      }
      setShowProctortrackEscalationEmail(false);
    }
  }

  function onProctortrackEscalationEmailChange(event) {
    setProctortrackEscalationEmail(event.target.value);
  }

  function setFocusToProctortrackEscalationEmailInput() {
    if (proctoringEscalationEmailInputRef && proctoringEscalationEmailInputRef.current) {
      proctoringEscalationEmailInputRef.current.focus();
    }
  }

  function postSettingsBackToServer() {
    const dataToPostBack = {
      proctored_exam_settings: {
        enable_proctored_exams: enableProctoredExams,
        proctoring_provider: proctoringProvider,
      },
    };
    if (isEdxStaff) {
      dataToPostBack.proctored_exam_settings.allow_proctoring_opt_out = allowOptingOut;
      dataToPostBack.proctored_exam_settings.create_zendesk_tickets = createZendeskTickets;
    }

    if (proctoringProvider === 'proctortrack') {
      dataToPostBack.proctored_exam_settings.proctoring_escalation_email = proctortrackEscalationEmail === '' ? null : proctortrackEscalationEmail;
    }

    setSubmissionInProgress(true);
    StudioApiService.saveProctoredExamSettingsData(props.courseId, dataToPostBack).then(() => {
      setSaveSuccess(true);
      setSaveError(false);
      setSubmissionInProgress(false);
    }).catch(() => {
      setSaveSuccess(false);
      setSaveError(true);
      setSubmissionInProgress(false);
    });
  }

  function onButtonClick() {
    if (proctoringProvider === 'proctortrack' && !EmailValidator.validate(proctortrackEscalationEmail)) {
      if (proctortrackEscalationEmail === '') {
        const errorMessage = 'The Proctortrack Escalation Email field cannot be empty if proctortrack is the selected provider.';

        setFormStatus({
          isValid: false,
          errors: {
            formProctortrackEscalationEmail: {
              dialogErrorMessage: (<Alert.Link onClick={setFocusToProctortrackEscalationEmailInput} href="#formProctortrackEscalationEmail" data-test-id="proctorTrackEscalationEmailErrorLink">{errorMessage}</Alert.Link>),
              inputErrorMessage: errorMessage,
            },
          },
        });
      } else {
        const errorMessage = 'The Proctortrack Escalation Email field is in the wrong format and is not valid.';

        setFormStatus({
          isValid: false,
          errors: {
            formProctortrackEscalationEmail: {
              dialogErrorMessage: (<Alert.Link onClick={setFocusToProctortrackEscalationEmailInput} href="#formProctortrackEscalationEmail" data-test-id="proctorTrackEscalationEmailErrorLink">{errorMessage}</Alert.Link>),
              inputErrorMessage: errorMessage,
            },
          },
        });
      }
    } else {
      postSettingsBackToServer();
      const errors = { ...formStatus.errors };
      delete errors.formProctortrackEscalationEmail;
      setFormStatus({
        isValid: true,
        errors,
      });
    }
  }

  function cannotEditProctoringProvider() {
    const currentDate = moment(moment()).format('YYYY-MM-DD[T]hh:mm:ss[Z]');
    const isAfterCourseStart = currentDate > courseStartDate;

    // if the user is not edX staff and it is after the course start date, user cannot edit proctoring provider
    return !isEdxStaff && isAfterCourseStart;
  }

  function isDisabledOption(provider) {
    let markDisabled = false;
    if (cannotEditProctoringProvider()) {
      markDisabled = provider !== proctoringProvider;
    }
    return markDisabled;
  }

  function getProctoringProviderOptions(providers) {
    return providers.map(provider => (
      <option
        key={provider}
        value={provider}
        disabled={isDisabledOption(provider)}
        data-test-id={provider}
      >
        {provider}
      </option>
    ));
  }

  function getFormErrorMessage() {
    const numOfErrors = Object.keys(formStatus.errors).length;
    const errors = Object.entries(formStatus.errors).map(([id, error]) => <li key={id}>{error.dialogErrorMessage}</li>);

    return (
      <>
        <div>{numOfErrors > 1 ? `There are ${numOfErrors} errors in this form.` : 'There is 1 error in this form.'}</div>
        <ul>
          {errors}
        </ul>
      </>
    );
  }

  function renderContent() {
    return (
      <Form>
        {enableProctoredExams && !formStatus.isValid && formStatus.errors.formProctortrackEscalationEmail
          && (
            // tabIndex="-1" to make non-focusable element focusable
            <Alert
              id="proctortrackEscalationEmailError"
              variant="danger"
              tabIndex="-1"
              data-test-id="proctortrackEscalationEmailError"
              ref={alertRef}
            >
              {getFormErrorMessage()}
            </Alert>
          )}
        {/* ENABLE PROCTORED EXAMS */}
        <Form.Group controlId="formEnableProctoredExam">
          <Form.Check
            type="checkbox"
            id="enableProctoredExams"
            label="Enable Proctored Exams"
            aria-describedby="enableProctoredExamsHelpText"
            onChange={onEnableProctoredExamsChange}
            checked={enableProctoredExams}
            inline
          />
          <Form.Text id="enableProctoredExamsHelpText">
            If checked, proctored exams are enabled in your course.
          </Form.Text>
        </Form.Group>

        {/* ALLOW OPTING OUT OF PROCTORED EXAMS */}
        { isEdxStaff && enableProctoredExams && (
          <fieldset aria-describedby="allowOptingOutHelpText">
            <Form.Group controlId="formAllowingOptingOut">
              <Form.Label as="legend">Allow Opting Out of Proctored Exams</Form.Label>
              <Form.Check
                type="radio"
                id="allowOptingOutYes"
                name="allowOptingOut"
                label="Yes"
                inline
                checked={allowOptingOut}
                onChange={() => onAllowOptingOutChange(true)}
                data-test-id="allowOptingOutYes"
              />
              <Form.Check
                type="radio"
                id="allowOptingOutNo"
                name="allowOptingOut"
                label="No"
                inline
                checked={!allowOptingOut}
                onChange={() => onAllowOptingOutChange(false)}
                data-test-id="allowOptingOutNo"
              />
              <Form.Text id="allowOptingOutHelpText">
                If this value is &quot;Yes&quot;, learners can choose to take proctored exams without proctoring.
                If this value is &quot;No&quot;, all learners must take the exam with proctoring.
                This setting only applies if proctored exams are enabled for the course.
              </Form.Text>
            </Form.Group>
          </fieldset>
        )}

        {/* PROCTORING PROVIDER */}
        { enableProctoredExams && (
        <Form.Group controlId="formProctoringProvider">
          <Form.Label>Proctoring Provider</Form.Label>
          <Form.Control
            as="select"
            value={proctoringProvider}
            onChange={onProctoringProviderChange}
            aria-describedby="proctoringProviderHelpText"
          >
            {getProctoringProviderOptions(availableProctoringProviders)}
          </Form.Control>
          <Form.Text id="proctoringProviderHelpText">{cannotEditProctoringProvider() ? ('Proctoring provider cannot be modified after course start date.') : ('Select the proctoring provider you want to use for this course run.')}</Form.Text>
        </Form.Group>
        )}

        {/* PROCTORTRACK ESCALATION EMAIL */}
        {showProctortrackEscalationEmail && enableProctoredExams && (
          <Form.Group controlId="formProctortrackEscalationEmail">
            <Form.Label>Proctortrack Escalation Email</Form.Label>
            <Form.Control
              ref={proctoringEscalationEmailInputRef}
              type="email"
              data-test-id="escalationEmail"
              onChange={onProctortrackEscalationEmailChange}
              value={proctortrackEscalationEmail}
              isInvalid={Object.prototype.hasOwnProperty.call(formStatus.errors, 'formProctortrackEscalationEmail')}
              aria-describedby="proctortrackEscalationEmailHelpText"
            />
            <Form.Control.Feedback type="invalid">{formStatus.errors.formProctortrackEscalationEmail && formStatus.errors.formProctortrackEscalationEmail.inputErrorMessage} </Form.Control.Feedback>
            <Form.Text id="proctortrackEscalationEmailHelpText">
              Required if &quot;proctortrack&quot; is selected as your proctoring provider.
              Enter an email address to be contacted by the support team whenever there are escalations
              (e.g. appeals, delayed reviews, etc.).
            </Form.Text>
          </Form.Group>
        )}
        {/* CREATE ZENDESK TICKETS */}
        { isEdxStaff && enableProctoredExams && (
          <fieldset aria-describedby="createZendeskTicketsText">
            <Form.Group controlId="formCreateZendeskTickets">
              <Form.Label as="legend">Create Zendesk Tickets for Suspicious Proctored Exam Attempts</Form.Label>
              <Form.Check
                type="radio"
                id="createZendeskTicketsYes"
                label="Yes"
                inline
                name="createZendeskTickets"
                checked={createZendeskTickets}
                onChange={() => onCreateZendeskTicketsChange(true)}
                data-test-id="createZendeskTicketsYes"
              />
              <Form.Check
                type="radio"
                id="createZendeskTicketsNo"
                label="No"
                inline
                name="createZendeskTickets"
                checked={!createZendeskTickets}
                onChange={() => onCreateZendeskTicketsChange(false)}
                data-test-id="createZendeskTicketsNo"
              />
              <Form.Text id="createZendeskTicketsText">
                If this value is &quot;Yes&quot;,
                a Zendesk ticket will be created for suspicious proctored exam attempts.
              </Form.Text>
            </Form.Group>
          </fieldset>
        )}
        <Button
          className="btn-primary mb-3"
          data-test-id="submissionButton"
          onClick={onButtonClick}
          disabled={submissionInProgress}
        >
          Submit
        </Button> {' '}
        {submissionInProgress && <Spinner animation="border" variant="primary" data-test-id="saveInProgress" aria-label="Save in progress" />}
      </Form>
    );
  }

  function renderLoading() {
    return (
      <div
        className="d-flex justify-content-center align-items-center flex-column"
        style={{
          height: '50vh',
        }}
        data-test-id="spinnerContainer"
      >
        <Spinner className animation="border" role="status" variant="primary">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  }

  function renderConnectionError() {
    return (
      <Alert variant="danger" data-test-id="connectionError">
        We encountered a technical error when loading this page.
        This might be a temporary issue, so please try again in a few minutes.
        If the problem persists,
        please go to <Alert.Link href="https://support.edx.org/hc/en-us">edX Support Page</Alert.Link> for help.
      </Alert>
    );
  }

  function renderPermissionError() {
    return (
      <Alert variant="danger" data-test-id="permissionError">
        You are not authorized to view this page. If you feel you should have access,
        please reach out to your course team admin to be given access.
      </Alert>
    );
  }

  function renderSaveSuccess() {
    const studioCourseRunURL = StudioApiService.getStudioCourseRunUrl(props.courseId);
    return (
      <Alert
        variant="success"
        dismissible
        data-test-id="saveSuccess"
        onClose={() => setSaveSuccess(false)}
      >
        Proctored exam settings saved successfully.
        You can go back to your course in Studio <Alert.Link href={studioCourseRunURL}>here</Alert.Link>.
      </Alert>
    );
  }

  function renderSaveError() {
    return (
      <Alert
        variant="danger"
        dismissible
        data-test-id="saveError"
        onClose={() => setSaveError(false)}
      >
        We encountered a technical error while trying to save proctored exam settings.
        This might be a temporary issue, so please try again in a few minutes.
        If the problem persists,
        please go to <Alert.Link href="https://support.edx.org/hc/en-us">edX Support Page</Alert.Link> for help.
      </Alert>
    );
  }

  useEffect(
    () => {
      StudioApiService.getProctoredExamSettingsData(props.courseId)
        .then(
          response => {
            const proctoredExamSettings = response.data.proctored_exam_settings;
            setLoaded(true);
            setLoading(false);
            setSubmissionInProgress(false);
            setCourseStartDate(response.data.course_start_date);
            setEnableProctoredExams(proctoredExamSettings.enable_proctored_exams);
            setAllowOptingOut(proctoredExamSettings.allow_proctoring_opt_out);
            setProctoringProvider(proctoredExamSettings.proctoring_provider);
            const isProctortrack = proctoredExamSettings.proctoring_provider === 'proctortrack';
            setShowProctortrackEscalationEmail(isProctortrack);
            setAvailableProctoringProviders(response.data.available_proctoring_providers);

            // The backend API may return null for the proctoringEscalationEmail value, which is the default.
            // In order to keep our email input component controlled, we use the empty string as the default
            // and perform this conversion during GETs and POSTs.
            const proctoringEscalationEmail = proctoredExamSettings.proctoring_escalation_email;
            setProctortrackEscalationEmail(proctoringEscalationEmail === null ? '' : proctoringEscalationEmail);

            setCreateZendeskTickets(proctoredExamSettings.create_zendesk_tickets);
          },
        ).catch(
          errorDetails => {
            if (errorDetails.customAttributes.httpErrorStatus === 403) {
              setLoadingPermissionError(true);
            } else {
              setLoadingConnectionError(true);
            }
            setLoading(false);
            setLoaded(false);
            setSubmissionInProgress(false);
          },
        );
    }, [],
  );

  useEffect(() => {
    if (!formStatus.isValid && !!alertRef.current) {
      alertRef.current.focus();
    }
  }, [formStatus]);

  return (
    <div className="container">
      <h2 className="mb-1">
        Proctored Exam Settings
      </h2>
      <div>
        {loading ? renderLoading() : null}
        {saveSuccess ? renderSaveSuccess() : null}
        {saveError ? renderSaveError() : null}
        {loaded ? renderContent() : null}
        {loadingConnectionError ? renderConnectionError() : null}
        {loadingPermissionError ? renderPermissionError() : null}
      </div>
    </div>
  );
}

ExamSettings.propTypes = {
  courseId: PropTypes.string.isRequired,
};

ExamSettings.defaultProps = {};

export default ExamSettings;
