import React, { useState, useEffect } from 'react';
import {
  Button, CheckBox, Input, ValidationFormGroup,
} from '@edx/paragon';

import StudioApiService from '../data/services/StudioApiService';

function ExamSettings() {
  const [enableProctoredExams, setEnableProctoredExams] = useState(true);
  const [allowOptingOut, setAllowOptingOut] = useState(false);
  const [proctoringProvider, setProctoringProvider] = useState('');
  const [availableProctoringProviders, setAvailableProctoringProviders] = useState([]);
  // TODO: we'll probably want to hide this field when proctortrack is not selected; currently,
  // this causes some errors in the browser console
  const [proctortrackEscalationEmail, setProctortrackEscalationEmail] = useState(null);
  const [createZendeskTickets, setCreateZendeskTickets] = useState(false);

  function onEnableProctoredExamsChange(event) {
    setEnableProctoredExams(event);
  }

  function onAllowOptingOutChange(event) {
    setAllowOptingOut(event);
  }

  function onCreateZendeskTicketsChange(event) {
    setAllowOptingOut(event);
  }

  function onProctoringProviderChange(event) {
    setProctoringProvider(event.target.value);
  }

  function onProctortrackEscalationEmailChange(event) {
    setProctortrackEscalationEmail(event.target.value);
  }

  function onButtonClick() {
    // TODO: implement POST
  }

  function getProctoringProviderOptions(providers) {
    return providers.reduce(
      (accumulator, currentValue) => {
        accumulator.push({ value: currentValue, label: currentValue }); return accumulator;
      }, [],
    );
  }

  useEffect(
    () => {
      StudioApiService.getProctoredExamSettingsData('course-v1:edX+DemoX+Demo_Course')
        .then(
          response => {
            const proctoredExamSettings = response.data.proctored_exam_settings;

            setEnableProctoredExams(proctoredExamSettings.enable_proctored_exams);
            setAllowOptingOut(proctoredExamSettings.allow_proctoring_opt_out);
            setProctoringProvider(proctoredExamSettings.proctoring_provider);
            setAvailableProctoringProviders(response.data.available_proctoring_providers);
            setProctortrackEscalationEmail(proctoredExamSettings.proctoring_escalation_email);
            setCreateZendeskTickets(proctoredExamSettings.create_zendesk_tickets);
          },
        );
      // TODO: handle error
    }, [],
  );

  return (
    <div className="container">
      <h2 className="mb-1">
        Proctored Exam Settings
      </h2>
      <ValidationFormGroup
        for="enableProctoredExams"
        helpText="If checked, proctored exams are enabled in your course."
      >
        <CheckBox
          id="enableProctoredExams"
          name="enable_proctored_exams"
          label="Enable Proctored Exams"
          checked={enableProctoredExams}
          onChange={onEnableProctoredExamsChange}
        />
      </ValidationFormGroup>
      <ValidationFormGroup
        for="allowingOptingOut"
        helpText="If checked, learners can choose to take proctored exams without proctoring. If not checked, all learners must take the exam with proctoring."
      >
        <CheckBox
          id="allowingOptingOut"
          name="allow_opting_out"
          label="Allow Opting Out of Proctored Exams"
          checked={allowOptingOut}
          onChange={onAllowOptingOutChange}
        />
      </ValidationFormGroup>
      <ValidationFormGroup
        for="proctoringProvider"
        helpText="Select the proctoring provider you want to use for this course run."
      >
        <label htmlFor="proctoringProvider">Proctoring Provider</label>
        <Input
          type="select"
          id="proctoringProvider"
          name="proctoring_provider"
          options={getProctoringProviderOptions(availableProctoringProviders)}
          value={proctoringProvider}
          onChange={onProctoringProviderChange}
        />
      </ValidationFormGroup>
      <ValidationFormGroup
        for="proctortrackEscalationEmail"
        helpText="Required if 'proctortrack' is selected as your proctoring provider. Enter an email address to be contacted by the support team whenever there are escalations (e.g. appeals, delayed reviews, etc.)."
      >
        <label htmlFor="proctortrackEscalationEmail">Proctortrack Escalation Email</label>
        <Input
          type="text"
          id="proctortrackEscalationEmail"
          name="proctortrack_escalation_email"
          value={proctortrackEscalationEmail}
          onChange={onProctortrackEscalationEmailChange}
        />
      </ValidationFormGroup>
      <ValidationFormGroup
        for="createZendeskTickets"
        helpText="If checked, a Zendesk ticket will be created for suspicious attempts."
      >
        <CheckBox
          id="createZendeskTickets"
          name="create_zendesk_tickets"
          label="Create Zendesk Tickets For Suspicious Exam Attempts"
          checked={createZendeskTickets}
          onChange={onCreateZendeskTicketsChange}
        />
      </ValidationFormGroup>
      <Button
        className="btn-primary mb-3"
        onClick={onButtonClick}
      >
        Submit
      </Button>
    </div>
  );
}

ExamSettings.propTypes = {};

ExamSettings.defaultProps = {};

export default ExamSettings;
