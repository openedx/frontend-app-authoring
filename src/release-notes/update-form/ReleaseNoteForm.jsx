import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  Form,
  Icon,
  Spinner,
  StatefulButton,
} from '@openedx/paragon';
import { Check as CheckIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Formik } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';
import moment from 'moment';
import { useSelector } from 'react-redux';
import TinyMceWidget, { prepareEditorRef } from '../../editors/sharedComponents/TinyMceWidget';
import messages from '../messages';
import { TIME_FORMAT, STATEFUL_BUTTON_STATES } from '../../constants';
import { convertToDateFromString } from '../../utils';
import { RequestStatus } from '../../data/constants';

const ReleaseNoteForm = ({
  initialValues,
  close,
  onSubmit,
  savingStatuses,
  isDirtyCheckRef,
  showUnsavedModalRef,
  setExternalUnsavedModalOpen,
}) => {
  const [buttonState, setButtonState] = React.useState(STATEFUL_BUTTON_STATES.default);
  const isDirtyRef = React.useRef(false);
  const previousStatusRef = React.useRef('');
  const currentValuesRef = React.useRef(null);
  const valuesTriggerRef = React.useRef(0);
  const intl = useIntl();
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();
  const { courseId } = useSelector((state) => state.courseDetail);

  React.useEffect(() => {
    setButtonState(STATEFUL_BUTTON_STATES.default);
  }, [initialValues.id]);

  React.useEffect(() => {
    const ref = isDirtyCheckRef;
    if (ref) {
      ref.current = () => isDirtyRef.current;
    }
  }, [isDirtyCheckRef]);

  React.useEffect(() => {
    const ref = showUnsavedModalRef;
    if (ref) {
      ref.current = (value) => {
        if (setExternalUnsavedModalOpen) {
          setExternalUnsavedModalOpen(value);
        }
      };
    }
  }, [showUnsavedModalRef, setExternalUnsavedModalOpen]);

  const activeSetShowUnsavedModal = setExternalUnsavedModalOpen;
  const tzName = React.useMemo(() => {
    try {
      const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
      const parts = new Intl.DateTimeFormat(undefined, { timeZone, timeZoneName: 'short' }).formatToParts(new Date());
      const longName = (parts.find(p => p.type === 'timeZoneName') || {}).value;
      if (longName && !/^GMT[+-]/i.test(longName)) {
        return longName;
      }
      if (timeZone) {
        const human = timeZone.split('/').pop().replace(/_/g, ' ');
        return `${human} Time`;
      }
      return '';
    } catch (e) {
      return '';
    }
  }, []);
  const publishTimeText = React.useMemo(() => {
    const base = intl.formatMessage(messages.publishTimeLabel).replace(/\s*\(.*\)\s*$/, '');
    return tzName ? `${base} (${tzName})` : base;
  }, [intl, tzName]);

  // Monitor saving status and update button state
  React.useEffect(() => {
    const createStatus = savingStatuses?.createReleaseNoteQuery;
    const editStatus = savingStatuses?.editReleaseNoteQuery;

    let status;
    if (createStatus === RequestStatus.PENDING) {
      status = createStatus;
    } else if (editStatus === RequestStatus.PENDING) {
      status = editStatus;
    } else {
      status = createStatus || editStatus;
    }

    if (status === previousStatusRef.current) {
      return undefined;
    }

    if (!status) {
      previousStatusRef.current = status;
      return undefined;
    }

    if (status === RequestStatus.PENDING) {
      setButtonState(STATEFUL_BUTTON_STATES.pending);
      previousStatusRef.current = status;
    } else if (status === RequestStatus.SUCCESSFUL && previousStatusRef.current === RequestStatus.PENDING) {
      // Only go to complete state if we were just in pending state (actual save just completed)
      setButtonState('complete');
      previousStatusRef.current = status;
      const timer = setTimeout(() => {
        close();
      }, 500);
      return () => clearTimeout(timer);
    } else if (status === RequestStatus.FAILED && previousStatusRef.current === RequestStatus.PENDING) {
      setButtonState(STATEFUL_BUTTON_STATES.default);
      previousStatusRef.current = status;
    } else {
      previousStatusRef.current = status;
    }
    return undefined;
  }, [savingStatuses, close]);

  const saveButtonConfig = {
    labels: {
      default: intl.formatMessage(messages.saveButton),
      pending: intl.formatMessage(messages.savingButton),
      complete: intl.formatMessage(messages.savedButton),
    },
    icons: {
      default: null,
      pending: <Spinner animation="border" size="sm" />,
      complete: <Icon src={CheckIcon} />,
    },
    disabledStates: [STATEFUL_BUTTON_STATES.pending, 'complete'],
  };

  const validationSchema = Yup.object().shape({
    id: Yup.number(),
    title: Yup.string().required(intl.formatMessage(messages.errorTitleRequired)),
    description: Yup.string().required(intl.formatMessage(messages.errorDescriptionRequired)),
    publishDate: Yup.date().required(intl.formatMessage(messages.errorPublishDateRequired)),
    publishTime: Yup.string()
      .required(intl.formatMessage(messages.errorPublishTimeRequired))
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/, intl.formatMessage(messages.errorPublishTimeRequired)),
  });

  const handleCancel = (e, dirty) => {
    e.preventDefault();
    if (dirty && activeSetShowUnsavedModal) {
      activeSetShowUnsavedModal(true);
    } else {
      close();
    }
  };

  const normalizeHtml = (html) => {
    if (!html) { return ''; }
    return html.replace(/^<p>(.*)<\/p>$/s, '$1').trim();
  };

  const isFormDirty = React.useCallback((values, initialVals) => {
    if (values.title !== initialVals.title) { return true; }

    if (values.publishDate !== initialVals.publishDate) { return true; }
    if (values.publishTime !== initialVals.publishTime) { return true; }

    const currentDesc = normalizeHtml(values.description);
    const initialDesc = normalizeHtml(initialVals.description);
    if (currentDesc !== initialDesc) { return true; }

    return false;
  }, []);

  const updateDirtyState = React.useCallback(() => {
    if (currentValuesRef.current) {
      const formInitialValues = {
        id: initialValues.id,
        title: initialValues.title || '',
        description: initialValues.description || '',
        publishDate: initialValues.published_at
          ? moment(convertToDateFromString(initialValues.published_at)).format('YYYY-MM-DD')
          : '',
        publishTime: initialValues.published_at
          ? moment(initialValues.published_at).format(TIME_FORMAT)
          : '',
      };
      const customDirty = isFormDirty(currentValuesRef.current, formInitialValues);
      isDirtyRef.current = customDirty;
    }
  }, [initialValues, isFormDirty]);

  React.useEffect(() => {
    updateDirtyState();
  }, [valuesTriggerRef.current, updateDirtyState]);

  return (
    <div className={classNames('release-note-form')}>
      <Formik
        initialValues={{
          id: initialValues.id,
          title: initialValues.title || '',
          description: initialValues.description || '',
          publishDate: initialValues.published_at ? moment(convertToDateFromString(initialValues.published_at)).format('YYYY-MM-DD') : '',
          publishTime: initialValues.published_at ? moment(initialValues.published_at).format(TIME_FORMAT) : '',
        }}
        validationSchema={validationSchema}
        validateOnMount
        validateOnBlur
        enableReinitialize
        onSubmit={(values) => {
          const [hh, mm] = (values.publishTime || '').split(':');
          const composed = values.publishDate
            ? moment(values.publishDate).set({
              hour: Number(hh) || 0, minute: Number(mm) || 0, second: 0, millisecond: 0,
            }).toDate()
            : '';
          const payload = {
            id: initialValues.id,
            title: values.title,
            description: values.description,
            published_at: composed,
          };
          onSubmit(payload);
        }}
      >
        {({
          values, handleSubmit, setFieldValue, errors, touched, dirty,
        }) => {
          const valuesJson = JSON.stringify(values);
          if (JSON.stringify(currentValuesRef.current) !== valuesJson) {
            currentValuesRef.current = values;
            valuesTriggerRef.current += 1;
            updateDirtyState();
          }

          return (
            <>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-4 datepicker-field datepicker-custom">
                    <Form.Control.Feedback className="datepicker-float-labels mb-2">
                      {intl.formatMessage(messages.publishDateLabel)}
                    </Form.Control.Feedback>
                    <div className="position-relative">
                      <Form.Control
                        type="date"
                        name="publishDate"
                        value={values.publishDate || ''}
                        className="datepicker-custom-control notes-label p-0"
                        aria-label={intl.formatMessage(messages.publishDateLabel)}
                        onChange={(e) => setFieldValue('publishDate', e.target.value)}
                        isInvalid={touched.publishDate && !!errors.publishDate}
                      />
                      {touched.publishDate && errors.publishDate && (
                      <p className="invalid-feedback d-block">
                        {errors.publishDate}
                      </p>
                      )}
                    </div>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-4 datepicker-field datepicker-custom">
                    <Form.Control.Feedback className="datepicker-float-labels mb-2">
                      {publishTimeText}
                    </Form.Control.Feedback>
                    <div className="position-relative">
                      <Form.Control
                        type="time"
                        name="publishTime"
                        value={values.publishTime || ''}
                        className="datepicker-custom-control notes-label p-0"
                        aria-label={intl.formatMessage(messages.publishTimeLabel)}
                        step="60"
                        onChange={(e) => setFieldValue('publishTime', e.target.value)}
                        isInvalid={touched.publishTime && !!errors.publishTime}
                      />
                      {touched.publishTime && errors.publishTime && (
                      <p className="invalid-feedback d-block">
                        {errors.publishTime}
                      </p>
                      )}
                    </div>
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Control.Feedback className="mb-2">
                  {intl.formatMessage(messages.titleLabel)}
                </Form.Control.Feedback>
                <Form.Control
                  name="title"
                  className="notes-label"
                  value={values.title}
                  aria-label={intl.formatMessage(messages.titleLabel)}
                  onChange={(e) => setFieldValue('title', e.target.value)}
                  isInvalid={touched.title && !!errors.title}
                />
                {touched.title && errors.title && (
                <p className="invalid-feedback d-block">
                  {errors.title}
                </p>
                )}
              </Form.Group>

              <Form.Group className="m-0 mb-3">
                {refReady && (
                <TinyMceWidget
                  editorRef={editorRef}
                  editorType="text"
                  textValue={values.description}
                  initialValue={initialValues.description || ''}
                  minHeight={200}
                  editorContentHtml={initialValues.description || ''}
                  setEditorRef={setEditorRef}
                  onChange={(value) => setFieldValue('description', value)}
                  initializeEditor={() => ({})}
                  learningContextId={courseId}
                  images={{}}
                  enableImageUpload={false}
                  showImageButton
                />
                )}
                {touched.description && errors.description && (
                <p className="invalid-feedback d-block">
                  {errors.description}
                </p>
                )}
              </Form.Group>

              <ActionRow>
                <Button variant="tertiary" type="button" onClick={(e) => handleCancel(e, dirty)}>
                  {intl.formatMessage(messages.cancelButton)}
                </Button>
                <StatefulButton
                  variant="primary"
                  onClick={handleSubmit}
                  type="submit"
                  state={buttonState}
                  {...saveButtonConfig}
                />
              </ActionRow>
            </>
          );
        }}
      </Formik>
    </div>
  );
};

ReleaseNoteForm.propTypes = {
  initialValues: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    published_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
  close: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  savingStatuses: PropTypes.shape({
    createReleaseNoteQuery: PropTypes.string,
    editReleaseNoteQuery: PropTypes.string,
  }),
  isDirtyCheckRef: PropTypes.shape({ current: PropTypes.func }),
  showUnsavedModalRef: PropTypes.shape({ current: PropTypes.func }),
  externalUnsavedModalOpen: PropTypes.bool,
  setExternalUnsavedModalOpen: PropTypes.func,
};

ReleaseNoteForm.defaultProps = {
  savingStatuses: {},
  isDirtyCheckRef: null,
  showUnsavedModalRef: null,
  externalUnsavedModalOpen: undefined,
  setExternalUnsavedModalOpen: null,
};

export default ReleaseNoteForm;
