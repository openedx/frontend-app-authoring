import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';
import EmailValidator from 'email-validator';
import moment from 'moment';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Alert, Badge, Form, Hyperlink, ModalDialog, StatefulButton,
} from '@openedx/paragon';

import ExamsApiService from 'CourseAuthoring/data/services/ExamsApiService';
import StudioApiService from 'CourseAuthoring/data/services/StudioApiService';
import Loading from 'CourseAuthoring/generic/Loading';
import ConnectionErrorAlert from 'CourseAuthoring/generic/ConnectionErrorAlert';
import FormSwitchGroup from 'CourseAuthoring/generic/FormSwitchGroup';
import { useModel } from 'CourseAuthoring/generic/model-store';
import PermissionDeniedAlert from 'CourseAuthoring/generic/PermissionDeniedAlert';
import { useIsMobile } from 'CourseAuthoring/utils';
import { PagesAndResourcesContext } from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';

import messages from './messages';

const ProctoringSettings = ({ intl, onClose }) => {
  const initialFormValues = {
    enableProctoredExams: false,
    proctoringProvider: false,
    escalationEmail: '',
    allowOptingOut: false,
    createZendeskTickets: false,
  };
  const [formValues, setFormValues] = useState(initialFormValues);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [loadingConnectionError, setLoadingConnectionError] = useState(false);
  const [loadingPermissionError, setLoadingPermissionError] = useState(false);
  const [allowLtiProviders, setAllowLtiProviders] = useState(false);
  const [availableProctoringProviders, setAvailableProctoringProviders] = useState([]);
  const [ltiProctoringProviders, setLtiProctoringProviders] = useState([]);
  const [courseStartDate, setCourseStartDate] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [showEscalationEmail, setShowEscalationEmail] = useState(false);
  const isEdxStaff = getAuthenticatedUser().administrator;
  const [formStatus, setFormStatus] = useState({
    isValid: true,
    errors: {},
  });
  const isMobile = useIsMobile();
  const modalVariant = isMobile ? 'dark' : 'default';

  const isLtiProvider = (provider) => (
    ltiProctoringProviders.some(p => p.name === provider)
  );

  function getProviderDisplayLabel(provider) {
    // if a display label exists for this provider return it
    return ltiProctoringProviders.find(p => p.name === provider)?.verbose_name || provider;
  }

  const { courseId } = useContext(PagesAndResourcesContext);
  const courseDetails = useModel('courseDetails', courseId);
  const org = courseDetails?.org;
  const appInfo = useModel('courseApps', 'proctoring');
  const alertRef = React.createRef();
  const saveStatusAlertRef = React.createRef();
  const proctoringEscalationEmailInputRef = useRef(null);
  const submitButtonState = submissionInProgress ? 'pending' : 'default';

  const handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    if (['allowOptingOut', 'createZendeskTickets'].includes(name)) {
      // Form.Radio expects string values, so convert back to a boolean here
      setFormValues({ ...formValues, [name]: value === 'true' });
    } else if (name === 'proctoringProvider') {
      const newFormValues = { ...formValues, proctoringProvider: value };

      if (value === 'proctortrack') {
        setFormValues({ ...newFormValues, createZendeskTickets: false });
        setShowEscalationEmail(true);
      } else if (value === 'software_secure') {
        setFormValues({ ...newFormValues, createZendeskTickets: true });
        setShowEscalationEmail(false);
      } else if (isLtiProvider(value)) {
        setFormValues(newFormValues);
        setShowEscalationEmail(true);
      } else {
        setFormValues(newFormValues);
        setShowEscalationEmail(false);
      }
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  const setFocusToEscalationEmailInput = () => {
    if (proctoringEscalationEmailInputRef && proctoringEscalationEmailInputRef.current) {
      proctoringEscalationEmailInputRef.current.focus();
    }
  };

  function postSettingsBackToServer() {
    const selectedProvider = formValues.proctoringProvider;
    const isLtiProviderSelected = isLtiProvider(selectedProvider);
    const studioDataToPostBack = {
      proctored_exam_settings: {
        enable_proctored_exams: formValues.enableProctoredExams,
        // lti providers are managed outside edx-platform, lti_external indicates this
        proctoring_provider: isLtiProviderSelected ? 'lti_external' : selectedProvider,
        create_zendesk_tickets: formValues.createZendeskTickets,
      },
    };
    if (isEdxStaff) {
      studioDataToPostBack.proctored_exam_settings.allow_proctoring_opt_out = formValues.allowOptingOut;
    }

    if (formValues.proctoringProvider === 'proctortrack') {
      studioDataToPostBack.proctored_exam_settings.proctoring_escalation_email = formValues.escalationEmail === '' ? null : formValues.escalationEmail;
    }

    // only save back to exam service if necessary
    setSubmissionInProgress(true);

    const saveOperations = [StudioApiService.saveProctoredExamSettingsData(courseId, studioDataToPostBack)];
    if (allowLtiProviders && ExamsApiService.isAvailable()) {
      const selectedEscalationEmail = formValues.escalationEmail;

      saveOperations.push(
        ExamsApiService.saveCourseExamConfiguration(
          courseId,
          {
            provider: isLtiProviderSelected ? formValues.proctoringProvider : null,
            escalationEmail: (isLtiProviderSelected && selectedEscalationEmail !== '') ? selectedEscalationEmail : null,
          },
        ),
      );
    }
    Promise.all(saveOperations)
      .then(() => {
        setSaveSuccess(true);
        setSaveError(false);
        setSubmissionInProgress(false);
      }).catch((error) => {
        setSaveSuccess(false);
        setSaveError(error);
        setSubmissionInProgress(false);
      });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const isLtiProviderSelected = isLtiProvider(formValues.proctoringProvider);
    if (
      (formValues.proctoringProvider === 'proctortrack' || isLtiProviderSelected)
      && !EmailValidator.validate(formValues.escalationEmail)
      && !(formValues.escalationEmail === '' && !formValues.enableProctoredExams)
    ) {
      if (formValues.escalationEmail === '') {
        const errorMessage = intl.formatMessage(messages['authoring.proctoring.escalationemail.error.blank'], { proctoringProviderName: getProviderDisplayLabel(formValues.proctoringProvider) });

        setFormStatus({
          isValid: false,
          errors: {
            formEscalationEmail: {
              dialogErrorMessage: (
                <Alert.Link onClick={setFocusToEscalationEmailInput} href="#formEscalationEmail" data-testid="escalationEmailErrorLink">
                  {errorMessage}
                </Alert.Link>
              ),
              inputErrorMessage: errorMessage,
            },
          },
        });
      } else {
        const errorMessage = intl.formatMessage(messages['authoring.proctoring.escalationemail.error.invalid']);

        setFormStatus({
          isValid: false,
          errors: {
            formEscalationEmail: {
              dialogErrorMessage: (<Alert.Link onClick={setFocusToEscalationEmailInput} href="#formEscalationEmail" data-testid="escalationEmailErrorLink">{errorMessage}</Alert.Link>),
              inputErrorMessage: errorMessage,
            },
          },
        });
      }
    } else {
      postSettingsBackToServer();
      const errors = { ...formStatus.errors };
      delete errors.formEscalationEmail;
      setFormStatus({
        isValid: true,
        errors,
      });
    }
  };

  function cannotEditProctoringProvider() {
    const currentDate = moment(moment()).format('YYYY-MM-DD[T]hh:mm:ss[Z]');
    const isAfterCourseStart = currentDate > courseStartDate;

    // if the user is not edX staff and it is after the course start date, user cannot edit proctoring provider
    return !isEdxStaff && isAfterCourseStart;
  }

  function isDisabledOption(provider) {
    let markDisabled = false;
    if (cannotEditProctoringProvider()) {
      markDisabled = provider !== formValues.proctoringProvider;
    }
    return markDisabled;
  }

  function getProctoringProviderOptions(providers) {
    return providers.map(provider => (
      <option
        key={provider}
        value={provider}
        disabled={isDisabledOption(provider)}
        data-testid={provider}
      >
        {getProviderDisplayLabel(provider)}
      </option>
    ));
  }

  function getFormErrorMessage() {
    const numOfErrors = Object.keys(formStatus.errors).length;
    const errors = Object.entries(formStatus.errors).map(([id, error]) => <li key={id}>{error.dialogErrorMessage}</li>);
    const messageId = numOfErrors > 1 ? 'authoring.proctoring.error.multiple' : 'authoring.proctoring.error.single';

    return (
      <>
        <div>{intl.formatMessage(messages[messageId], { numOfErrors })}</div>
        <ul>
          {errors}
        </ul>
      </>
    );
  }

  const learnMoreLink = appInfo?.documentationLinks?.learnMoreConfiguration && (
    <Hyperlink
      className="text-primary-500"
      destination={appInfo.documentationLinks.learnMoreConfiguration}
      target="_blank"
      rel="noreferrer noopener"
    >
      {intl.formatMessage(messages['authoring.proctoring.learn.more'])}
    </Hyperlink>
  );

  function renderContent() {
    const isLtiProviderSelected = isLtiProvider(formValues.proctoringProvider);

    return (
      <>
        {!formStatus.isValid && formStatus.errors.formEscalationEmail
          && (
            // tabIndex="-1" to make non-focusable element focusable
            <Alert
              id="escalationEmailError"
              variant="danger"
              tabIndex="-1"
              data-testid="escalationEmailError"
              ref={alertRef}
            >
              {getFormErrorMessage()}
            </Alert>
          )}

        {/* ENABLE PROCTORED EXAMS */}
        <FormSwitchGroup
          id="enable-proctoring-toggle"
          name="enableProctoredExams"
          onChange={handleChange}
          checked={formValues.enableProctoredExams}
          label={(
            <div className="d-flex align-items-center">
              {intl.formatMessage(messages['authoring.proctoring.enableproctoredexams.label'])}
              {
                formValues.enableProctoredExams && (
                  <Badge className="ml-2" variant="success">
                    {intl.formatMessage(messages['authoring.proctoring.enabled'])}
                  </Badge>
                )
              }
            </div>
          )}
          helpText={(
            <div>
              <p>
                {intl.formatMessage(messages['authoring.proctoring.enableproctoredexams.help'])}
              </p>
              <span className="py-3">{learnMoreLink}</span>
            </div>
          )}
        />

        {/* PROCTORING PROVIDER */}
        { formValues.enableProctoredExams && (
          <>
            <hr />
            <Form.Group controlId="formProctoringProvider">
              <Form.Label as="legend" className="font-weight-bold">
                {intl.formatMessage(messages['authoring.proctoring.provider.label'])}
              </Form.Label>
              <Form.Control
                as="select"
                name="proctoringProvider"
                value={formValues.proctoringProvider}
                onChange={handleChange}
                aria-describedby="proctoringProviderHelpText"
              >
                {getProctoringProviderOptions(availableProctoringProviders)}
              </Form.Control>
              <Form.Text id="proctoringProviderHelpText">
                {
                  cannotEditProctoringProvider()
                    ? intl.formatMessage(messages['authoring.proctoring.provider.help.aftercoursestart'])
                    : intl.formatMessage(messages['authoring.proctoring.provider.help'])
                }
              </Form.Text>
            </Form.Group>
          </>
        )}

        {/* ESCALATION EMAIL */}
        {showEscalationEmail && formValues.enableProctoredExams && (
          <Form.Group controlId="formEscalationEmail">
            <Form.Label className="font-weight-bold">
              {intl.formatMessage(messages['authoring.proctoring.escalationemail.label'])}
            </Form.Label>
            <Form.Control
              ref={proctoringEscalationEmailInputRef}
              type="email"
              name="escalationEmail"
              data-testid="escalationEmail"
              onChange={handleChange}
              value={formValues.escalationEmail}
              isInvalid={Object.prototype.hasOwnProperty.call(formStatus.errors, 'formEscalationEmail')}
              aria-describedby="escalationEmailHelpText"
            />
            <Form.Text id="escalationEmailHelpText">
              {intl.formatMessage(messages['authoring.proctoring.escalationemail.help'])}
            </Form.Text>
            {Object.prototype.hasOwnProperty.call(formStatus.errors, 'formEscalationEmail') && (
              <Form.Control.Feedback type="invalid">
                {
                  formStatus.errors.formEscalationEmail
                  && formStatus.errors.formEscalationEmail.inputErrorMessage
                }
              </Form.Control.Feedback>
            )}
          </Form.Group>
        )}

        {/* ALLOW OPTING OUT OF PROCTORED EXAMS */}
        { isEdxStaff && formValues.enableProctoredExams && !isLtiProviderSelected && (
          <fieldset aria-describedby="allowOptingOutHelpText">
            <Form.Group controlId="formAllowingOptingOut">
              <Form.Label as="legend" className="font-weight-bold">
                {intl.formatMessage(messages['authoring.proctoring.allowoptout.label'])}
              </Form.Label>
              <Form.RadioSet
                name="allowOptingOut"
                data-testid="allowOptingOutRadio"
                value={formValues.allowOptingOut.toString()}
                onChange={handleChange}
              >
                <Form.Radio value="true" data-testid="allowOptingOutYes">
                  {intl.formatMessage(messages['authoring.proctoring.yes'])}
                </Form.Radio>
                <Form.Radio value="false" data-testid="allowOptingOutNo">
                  {intl.formatMessage(messages['authoring.proctoring.no'])}
                </Form.Radio>
              </Form.RadioSet>
            </Form.Group>
          </fieldset>
        )}

        {/* CREATE ZENDESK TICKETS */}
        { isEdxStaff && formValues.enableProctoredExams && !isLtiProviderSelected && (
          <fieldset aria-describedby="createZendeskTicketsText">
            <Form.Group controlId="formCreateZendeskTickets">
              <Form.Label as="legend" className="font-weight-bold">
                {intl.formatMessage(messages['authoring.proctoring.createzendesk.label'])}
              </Form.Label>
              <Form.RadioSet
                name="createZendeskTickets"
                value={formValues.createZendeskTickets.toString()}
                onChange={handleChange}
              >
                <Form.Radio value="true" data-testid="createZendeskTicketsYes">
                  {intl.formatMessage(messages['authoring.proctoring.yes'])}
                </Form.Radio>
                <Form.Radio value="false" data-testid="createZendeskTicketsNo">
                  {intl.formatMessage(messages['authoring.proctoring.no'])}
                </Form.Radio>
              </Form.RadioSet>
            </Form.Group>
          </fieldset>
        )}
      </>
    );
  }

  function renderLoading() {
    return (
      <Loading />
    );
  }

  function renderConnectionError() {
    return (
      <ConnectionErrorAlert />
    );
  }

  function renderPermissionError() {
    return (
      <PermissionDeniedAlert />
    );
  }

  function renderSaveSuccess() {
    const studioCourseRunURL = StudioApiService.getStudioCourseRunUrl(courseId);
    return (
      <Alert
        variant="success"
        data-testid="saveSuccess"
        tabIndex="-1"
        ref={saveStatusAlertRef}
        onClose={() => setSaveSuccess(false)}
        dismissible
      >
        <FormattedMessage
          id="authoring.proctoring.alert.success"
          defaultMessage={`
            Proctored exam settings saved successfully. {studioCourseRunURL}.
          `}
          values={{
            studioCourseRunURL: (
              <Alert.Link href={studioCourseRunURL}>
                {intl.formatMessage(messages['authoring.proctoring.studio.link.text'])}
              </Alert.Link>
            ),
          }}
        />
      </Alert>
    );
  }

  function renderSaveError() {
    let errorMessage = (
      <FormattedMessage
        id="authoring.proctoring.alert.error"
        defaultMessage={`
          We encountered a technical error while trying to save proctored exam settings.
          This might be a temporary issue, so please try again in a few minutes.
          If the problem persists, please go to the {support_link} for help.
        `}
        values={{
          support_link: (
            <Alert.Link href={getConfig().SUPPORT_URL}>
              {intl.formatMessage(messages['authoring.proctoring.support.text'])}
            </Alert.Link>
          ),
        }}
      />
    );

    if (saveError?.response.status === 403) {
      errorMessage = (
        <FormattedMessage
          id="authoring.proctoring.alert.error.forbidden"
          defaultMessage={`
            You do not have permission to edit proctored exam settings for this course.
            If you are a course team member and this problem persists,
            please go to the {support_link} for help.
          `}
          values={{
            support_link: (
              <Alert.Link href={getConfig().SUPPORT_URL}>
                {intl.formatMessage(messages['authoring.proctoring.support.text'])}
              </Alert.Link>
            ),
          }}
        />
      );
    }

    return (
      <Alert
        variant="danger"
        data-testid="saveError"
        tabIndex="-1"
        ref={saveStatusAlertRef}
        onClose={() => setSaveError(false)}
        dismissible
      >
        {errorMessage}
      </Alert>
    );
  }

  useEffect(() => {
    Promise.all([
      StudioApiService.getProctoredExamSettingsData(courseId),
      ExamsApiService.isAvailable() ? ExamsApiService.getCourseExamConfiguration(courseId) : Promise.resolve(),
      ExamsApiService.isAvailable() ? ExamsApiService.getAvailableProviders(org) : Promise.resolve(),
    ])
      .then(
        ([settingsResponse, examConfigResponse, ltiProvidersResponse]) => {
          const proctoredExamSettings = settingsResponse.data.proctored_exam_settings;
          setLoaded(true);
          setLoading(false);
          setSubmissionInProgress(false);
          setCourseStartDate(settingsResponse.data.course_start_date);
          setAvailableProctoringProviders(settingsResponse.data.available_proctoring_providers);

          // The list of providers returned by studio settings are the default behavior. If lti_external
          // is available as an option display the list of LTI providers returned by the exam service.
          // Setting 'lti_external' in studio indicates an LTI provider configured outside of edx-platform.
          // This option is not directly selectable.
          const proctoringProvidersStudio = settingsResponse.data.available_proctoring_providers;
          const proctoringProvidersLti = ltiProvidersResponse?.data || [];
          const enableLtiProviders = proctoringProvidersStudio.includes('lti_external');
          setAllowLtiProviders(enableLtiProviders);
          setLtiProctoringProviders(proctoringProvidersLti);
          // flatten provider objects and coalesce values to just the provider key
          let availableProviders = proctoringProvidersStudio.filter(value => value !== 'lti_external');
          if (enableLtiProviders) {
            availableProviders = proctoringProvidersLti.reduce(
              (result, provider) => [...result, provider.name],
              availableProviders,
            );
          }
          setAvailableProctoringProviders(availableProviders);

          let selectedProvider;
          if (proctoredExamSettings.proctoring_provider === 'lti_external') {
            selectedProvider = examConfigResponse.data.provider;
          } else {
            selectedProvider = proctoredExamSettings.proctoring_provider;
          }

          const isProctortrack = selectedProvider === 'proctortrack';
          const ltiProviderSelected = proctoringProvidersLti.some(p => p.name === selectedProvider);

          if (isProctortrack || ltiProviderSelected) {
            setShowEscalationEmail(true);
          }

          const proctoringEscalationEmail = ltiProviderSelected
            ? examConfigResponse.data.escalation_email
            : proctoredExamSettings.proctoring_escalation_email;

          setFormValues({
            ...formValues,
            proctoringProvider: selectedProvider,
            enableProctoredExams: proctoredExamSettings.enable_proctored_exams,
            allowOptingOut: proctoredExamSettings.allow_proctoring_opt_out,
            createZendeskTickets: proctoredExamSettings.create_zendesk_tickets,
            // The backend API may return null for the proctoringEscalationEmail value, which is the default.
            // In order to keep our email input component controlled, we use the empty string as the default
            // and perform this conversion during GETs and POSTs.
            escalationEmail: proctoringEscalationEmail === null ? '' : proctoringEscalationEmail,
          });
        },
      ).catch(
        error => {
          if (error.response?.status === 403) {
            setLoadingPermissionError(true);
          } else {
            setLoadingConnectionError(true);
          }
          setLoading(false);
          setLoaded(false);
          setSubmissionInProgress(false);
        },
      );
  }, []);

  useEffect(() => {
    if ((saveSuccess || saveError) && !!saveStatusAlertRef.current) {
      saveStatusAlertRef.current.focus();
    }
    if (!formStatus.isValid && !!alertRef.current) {
      alertRef.current.focus();
    }
  }, [formStatus, saveSuccess, saveError]);

  return (
    <ModalDialog
      title="Proctoring Settings"
      isOpen
      onClose={onClose}
      size="lg"
      variant={modalVariant}
      hasCloseButton={isMobile}
      isFullscreenScroll
      isFullscreenOnMobile
    >
      <Form onSubmit={handleSubmit} data-testid="proctoringForm">
        <ModalDialog.Header>
          <ModalDialog.Title>
            Proctored Exam Settings
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          {loading ? renderLoading() : null}
          {saveSuccess ? renderSaveSuccess() : null}
          {saveError ? renderSaveError() : null}
          {loaded ? renderContent() : null}
          {loadingConnectionError ? renderConnectionError() : null}
          {loadingPermissionError ? renderPermissionError() : null}
        </ModalDialog.Body>
        <ModalDialog.Footer
          className={classNames(
            'p-4',
          )}
        >
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              {intl.formatMessage(messages['authoring.proctoring.cancel'])}
            </ModalDialog.CloseButton>
            <StatefulButton
              labels={{
                default: intl.formatMessage(messages['authoring.proctoring.save']),
                pending: intl.formatMessage(messages['authoring.proctoring.saving']),
              }}
              description="Form save button"
              data-testid="submissionButton"
              disabled={submissionInProgress}
              state={submitButtonState}
              type="submit"
            />
          </ActionRow>
        </ModalDialog.Footer>
      </Form>
    </ModalDialog>
  );
};

ProctoringSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

ProctoringSettings.defaultProps = {};

export default injectIntl(ProctoringSettings);
