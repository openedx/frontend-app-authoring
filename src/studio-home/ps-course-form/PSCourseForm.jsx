/* eslint-disable consistent-return */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
import { useState, useEffect, useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useDispatch } from 'react-redux';
import 'react-datepicker/dist/react-datepicker.css';
import PropTypes from 'prop-types';
import {
  Container,
  Form,
  Row,
  Col,
  Button,
  Stack,
  Icon,
  Image,
  RadioButton,
  Dropdown,
  Nav,
} from '@openedx/paragon';
import {
  Calendar, Money, More, Add, Close, InfoOutline, Warning, CheckCircle,
  Photo,
} from '@openedx/paragon/icons';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { DatepickerControl, DATEPICKER_TYPES } from '../../generic/datepicker-control';
import './PSCourseForm.scss';
import IntroductionVideo from '../../schedule-and-details/introducing-section/introduction-video';
// import { getStudioHomeData } from '../data/selectors';
import { useCreateOrRerunCourse } from '../../generic/create-or-rerun-course/hooks';
import { fetchStudioHomeData } from '../data/thunks';
import { fetchCourseAppSettings } from '../../advanced-settings/data/thunks';
import { videoTranscriptLanguages } from '../../editors/data/constants/video';
import { LICENSE_TYPE } from '../../schedule-and-details/license-section/constants';
import { useLicenseDetails } from '../../schedule-and-details/license-section/hooks';
import LicenseSelector from '../../schedule-and-details/license-section/license-selector';
import LicenseCommonsOptions from '../../schedule-and-details/license-section/license-commons-options';
import LicenseIcons from '../../schedule-and-details/license-section/license-icons';
import licenseMessages from '../../schedule-and-details/license-section/messages';
import CustomTypeaheadDropdown from '../../editors/sharedComponents/CustomTypeaheadDropdown';
import AlertMessage from '../../generic/alert-message';

// Utility function to get user's timezone string
function getUserTimezoneString() {
  const date = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const pad = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const hours = pad(offset / 60);
  const minutes = pad(offset % 60);
  return `${tz} GMT${sign}${hours}:${minutes}`;
}

const PSCourseForm = ({
  children,
  hideGeneralTab = false,
  hideTitleField = false,
  hideCreateNewCourseButton = false,
  onImageUpload,
  onBannerImageUpload,
  onRemoveImage,
  onFieldChange,
  possiblePreRequisiteCourses = [],
  cardImagePreview,
  bannerImagePreview,
  hasCardImage,
  hasBannerImage,
  cardImageFile,
  bannerImageFile,
  isImageUploading,
  uploadProgress,
  imageErrors = {},
  editedValues,
  handleValuesChange,
  allowedImageTypes = ['image/jpeg', 'image/png'],
  onSubmit,
  onImageValidationErrorChange,
  onResetForm,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  //   const { allowedOrganizations } = useSelector(getStudioHomeData);
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await getAuthenticatedHttpClient().get('https://studio.staging.titaned.com/organizations');
        console.log('allowedOrganizations response', response);
        // Transform the response to match the expected format
        const organizations = response.data || [];
        setAllowedOrganizations(organizations);
        console.log('allowedOrganizations', allowedOrganizations);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setAllowedOrganizations([]);
      }
    };

    fetchOrganizations();
  }, []);

  const initialValues = {
    title: '',
    shortDescription: '',
    description: '',
    organization: '',
    courseNumber: '',
    courseRun: '',
    coursePacing: 'instructor',
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    enrollmentStartDate: null,
    enrollmentStartTime: null,
    enrollmentEndDate: null,
    enrollmentEndTime: null,
    pricingModel: 'free',
    price: '',
    language: 'en',
    duration: '',
    invitationOnly: false,
    cardImage: null,
    bannerImage: null,
    introVideo: null,
    prerequisites: '',
    license: null,
  };

  const [activeTab, setActiveTab] = useState(hideGeneralTab ? 'schedule' : 'general');
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [allowedOrganizations, setAllowedOrganizations] = useState([]);

  const {
    licenseURL,
    licenseType,
    licenseDetails,
    handleToggleCheckbox,
    handleChangeLicenseType,
  } = useLicenseDetails(editedValues?.license || null, (value, field) => handleInputChange(field, value));

  const userTimezone = useMemo(getUserTimezoneString, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchStudioHomeData());
      } catch (error) {
        console.error('Error loading studio home data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCourseAppSettings());
  }, [dispatch]);
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);
  const {
    organizations: createOrRerunOrganizations,
  } = useCreateOrRerunCourse(initialValues);

  useEffect(() => {
    if (typeof onImageValidationErrorChange === 'function') {
      const hasError = !!imageErrors.cardImage || !!imageErrors.bannerImage;
      onImageValidationErrorChange(hasError);
    }
  }, [imageErrors, onImageValidationErrorChange]);

  const handleInputChange = (field, value) => {
    const hasChanged = value !== editedValues[field];

    if (hasChanged) {
      if (handleValuesChange) {
        handleValuesChange(value, field);
      }

      if (onFieldChange) {
        onFieldChange(value, field);
      }
    }

    setTouched(prev => ({ ...prev, [field]: true }));

    const fieldErrors = validateForm();
    if (fieldErrors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors[field],
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const transformFormDataToApiPayload = (formData) => {
    // Convert date objects to ISO strings if they exist
    const formatDate = (date) => {
      if (!date) { return null; }
      return new Date(date).toISOString();
    };

    return {
      display_name: formData.title || '',
      org: formData.organization || '',
      number: formData.courseNumber || '',
      run: formData.courseRun || '',
      start_date: formatDate(formData.startDate),
      end_date: formatDate(formData.endDate),
      enrollment_start: formatDate(formData.enrollmentStartDate),
      enrollment_end: formatDate(formData.enrollmentEndDate),
      title: formData.title || '',
      description: formData.description || '',
      short_description: formData.shortDescription || '',
      subtitle: '',
      duration: formData.duration || '',
      intro_video: formData.introVideo || 'None',
      course_image_name: formData.cardImage?.name || '',
      course_image_asset_path: formData.cardImageAssetPath || '',
      banner_image_name: formData.bannerImage?.name || '',
      banner_image_asset_path: formData.bannerImageAssetPath || '',
      video_thumbnail_image_name: formData.cardImage?.name || '',
      video_thumbnail_image_asset_path: formData.cardImageAssetPath || '',
      self_paced: formData.coursePacing === 'self',
      effort: formData.hoursOfEffort || 'None',
      pre_requisite_courses: formData.prerequisiteCourse ? [formData.prerequisiteCourse] : [],
      entrance_exam_enabled: formData.requireEntranceExam ? 'true' : 'false',
      entrance_exam_minimum_score_pct: formData.entranceExamGradeRequired?.toString() || '',
      language: formData.language || 'en',
      price: formData.pricingModel === 'paid' ? formData.price : '',
      amount: formData.pricingModel === 'paid' ? formData.price : '',
      license: formData.license || 'all-rights-reserved',
      overview: formData.description || '',
      learning_info: [],
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true); // Show loader and disable button
      const apiPayload = transformFormDataToApiPayload(editedValues);
      console.log('API Payload:', apiPayload);
      const response = await getAuthenticatedHttpClient().post('https://studio.staging.titaned.com/titaned/api/v1/create-course', apiPayload);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to save course data');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
      setShowSuccessAlert(true); // Show success alert
      setTimeout(() => setShowSuccessAlert(false), 10000);

      if (typeof onSubmit === 'function') {
        onSubmit(editedValues);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors((prev) => ({
        ...prev,
        submit: 'Failed to submit form. Please try again.',
      }));
    } finally {
      setIsSubmitting(false); // Hide loader and enable button
    }
  };

  const handleVideoChange = (value, field) => {
    handleInputChange(field, value);

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const languageOptions = useMemo(
    () => Object.entries(videoTranscriptLanguages)
      .filter(([code]) => code !== 'placeholder')
      .map(([code, label]) => [code, label]),
    [],
  );

  const formattedLanguage = () => {
    const result = languageOptions.find((arr) => arr[0] === editedValues.language);
    return result ? result[1] : 'Select language';
  };

  const renderImageUploadSection = (field, label, preview, file, hasImage, onUpload) => {
    const errorField = field === 'courseImageAssetPath' ? 'cardImage' : 'bannerImage';
    const error = imageErrors?.[errorField];

    return (
      <Form.Group className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <Form.Label className="mb-0">{label}</Form.Label>
        </div>
        <div
          className={`upload-box border rounded${error ? ' border-danger' : ''}`}
        >
          {hasImage ? (
            <div className="image-preview-container">
              <Image
                src={file ? URL.createObjectURL(file) : preview}
                className="preview-image"
                fluid
              />
              <Button
                variant="icon"
                className="remove-image-overlay"
                onClick={() => onRemoveImage(field)}
                aria-label={`Remove ${label.toLowerCase()}`}
              >
                <Icon src={Close} />
              </Button>
            </div>
          ) : (
            <div className="p-3 text-center">
              <div className="d-flex flex-column align-items-center">
                <Icon
                  src={Photo}
                  className="mb-2"
                  style={{ fontSize: '2rem' }}
                />
                <Button
                  variant="outline-primary"
                  onClick={() => document.getElementById(`${field}Input`).click()}
                  disabled={isImageUploading}
                  className="mb-2"
                >
                  <Icon src={Add} className="me-2" />
                  {isImageUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <div className="font-12">Please upload a JPEG or PNG image between 300x300 and 1024x1024 pixels, under 5MB.</div>
                <input
                  type="file"
                  id={`${field}Input`}
                  accept={allowedImageTypes.join(',')}
                  className="d-none"
                  onChange={(e) => onUpload(field, e)}
                />
                {isImageUploading && uploadProgress > 0 && (
                <div className="progress mt-2 w-100">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${uploadProgress}%` }}
                    aria-valuenow={uploadProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {uploadProgress}%
                  </div>
                </div>
                )}
                {error && (
                <div className="text-danger mt-2 d-flex align-items-center font-small">
                  <Icon src={Warning} className="me-1" />
                  <span>{error}</span>
                </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Form.Group>
    );
  };

  const tabList = [
    !hideGeneralTab && { key: 'general', label: 'General', icon: InfoOutline },
    { key: 'schedule', label: 'Schedule', icon: Calendar },
    { key: 'requirements', label: 'Requirements', icon: InfoOutline },
    { key: 'additional', label: 'Additional', icon: More },
    { key: 'pricing', label: 'Pricing', icon: Money },
    { key: 'license', label: 'Course content license', icon: InfoOutline },
  ].filter(Boolean);

  const validateForm = () => {
    const newErrors = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    if (typeof onResetForm === 'function') {
      onResetForm();
    }
    setTouched({});
    setErrors({});
  };

  const handleCustomBlurForDropdown = (e) => {
    const { value, name } = e.target;
    handleInputChange(name, value);
    handleBlur(name);
  };

  return (
    <div className="ps-course-form">

      {showSuccessAlert && (
        <div className="alert-container mb-4">
          <AlertMessage
            variant="success"
            icon={CheckCircle}
            title="Data saved succesfully"
            className="success-alert"
            aria-hidden="true"
          />
        </div>
      )}
      <Container size="xl" className="pl-3">
        <Row>
          <Col xs={12} className="pr-0 pb-0">
            <Form className="course-form" onSubmit={handleSubmit}>
              <Row>
                <Col xs={12} md={8} className="col-cs">
                  <div>
                    {children}
                  </div>
                  <div className="title-section">
                    {!hideTitleField && (
                    <Form.Group>
                      <Form.Label><>Title <span className="required-asterisk">*</span></></Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={editedValues.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        onBlur={() => handleBlur('title')}
                        isInvalid={!!errors.title && touched.title}
                      />
                      {errors.title && touched.title && (
                      <Form.Control.Feedback type="invalid">
                        {errors.title}
                      </Form.Control.Feedback>
                      )}
                    </Form.Group>
                    )}
                    <Form.Group className="mb-1">
                      <Form.Label><>Short Description <span className="required-asterisk">*</span></></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="shortDescription"
                        value={editedValues.shortDescription || ''}
                        onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                        onBlur={() => handleBlur('shortDescription')}
                        maxLength={150}
                        isInvalid={!!errors.shortDescription && touched.shortDescription}
                        className="short-description"
                      />
                      <Form.Text>A short description that will be displayed on the course card. Limit to 150 characters.</Form.Text>
                      {errors.shortDescription && touched.shortDescription && (
                        <Form.Control.Feedback type="invalid">
                          {errors.shortDescription}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label><>Description</></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={8}
                        name="description"
                        value={editedValues.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        onBlur={() => handleBlur('description')}
                        isInvalid={!!errors.description && touched.description}
                      />
                      {errors.description && touched.description && (
                        <Form.Control.Feedback type="invalid">
                          {errors.description}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </div>
                  <div className="options-container">
                    <Row>
                      <Col xs={12} md={3} className="sidebar">
                        <Nav className="nav-tabs flex-column border-0">
                          {tabList.map((tab) => (
                            <Nav.Item key={tab.key}>
                              <Nav.Link
                                className={activeTab === tab.key ? 'active' : ''}
                                onClick={() => {
                                  console.log('Edited Values:', editedValues);
                                  setActiveTab(tab.key);
                                }}
                              >
                                <Icon className="icon" src={tab.icon} />
                                <span>{tab.label}</span>
                              </Nav.Link>
                            </Nav.Item>
                          ))}
                        </Nav>
                      </Col>

                      <Col xs={12} md={9} className="content-area">
                        {activeTab === 'general' && (
                        <div className="form-section">
                          <Stack>
                            <Row className="custom-padding">
                              <Col xs={12} md={12}>
                                <Form.Group>
                                  <Form.Label><>Organization <span className="required-asterisk">*</span></></Form.Label>
                                  {createOrRerunOrganizations ? (
                                    <CustomTypeaheadDropdown
                                      readOnly={false}
                                      name="organization"
                                      value={editedValues.organization || ''}
                                      controlClassName={errors.organization ? 'is-invalid' : ''}
                                      options={allowedOrganizations}
                                      placeholder="Select an organization"
                                      handleChange={(value) => handleInputChange('organization', value)}
                                      handleBlur={handleCustomBlurForDropdown}
                                      noOptionsMessage="No organizations available"
                                      required
                                    />
                                  ) : (
                                    <Dropdown>
                                      <Dropdown.Toggle id="organization-dropdown" variant="outline-primary">
                                        {editedValues.organization || 'Select an organization'}
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu>
                                        {allowedOrganizations?.map((org) => (
                                          <Dropdown.Item
                                            key={org}
                                            onClick={() => handleInputChange('organization', org)}
                                          >
                                            {org}
                                          </Dropdown.Item>
                                        ))}
                                      </Dropdown.Menu>
                                    </Dropdown>
                                  )}
                                  <Form.Text>
                                    The name of the organization sponsoring the course.
                                  </Form.Text>
                                  {errors.organization && touched.organization && (
                                  <Form.Control.Feedback type="invalid" className="d-block">
                                    {errors.organization}
                                  </Form.Control.Feedback>
                                  )}
                                </Form.Group>
                              </Col>
                              <Col xs={12} md={12}>
                                <Form.Group>
                                  <Form.Label><>Course Number <span className="required-asterisk">*</span></></Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="courseNumber"
                                    value={editedValues.courseNumber || ''}
                                    onChange={(e) => handleInputChange('courseNumber', e.target.value)}
                                    onBlur={() => handleBlur('courseNumber')}
                                    placeholder="e.g. CS101"
                                    isInvalid={!!errors.courseNumber && touched.courseNumber}
                                    required
                                  />
                                  <Form.Text>
                                    The unique number that identifies your course within your organization.
                                  </Form.Text>
                                  {errors.courseNumber && touched.courseNumber && (
                                  <Form.Control.Feedback type="invalid">
                                    {errors.courseNumber}
                                  </Form.Control.Feedback>
                                  )}
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row className="pt-0 custom-padding">
                              <Col xs={12} md={6}>
                                <Form.Group>
                                  <Form.Label><>Course Run <span className="required-asterisk">*</span></></Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="courseRun"
                                    value={editedValues.courseRun || ''}
                                    onChange={(e) => handleInputChange('courseRun', e.target.value)}
                                    onBlur={() => handleBlur('courseRun')}
                                    placeholder="e.g. 2014_T1"
                                    isInvalid={!!errors.courseRun && touched.courseRun}
                                    required
                                  />
                                  <Form.Text>
                                    The term in which your course will run.
                                  </Form.Text>
                                  {errors.courseRun && touched.courseRun && (
                                  <Form.Control.Feedback type="invalid">
                                    {errors.courseRun}
                                  </Form.Control.Feedback>
                                  )}
                                </Form.Group>
                              </Col>
                              <Col xs={12} md={6}>
                                <Form.Group>
                                  <Form.Label>Course Pacing</Form.Label>
                                  <div className="pacing-style">
                                    <label>
                                      <input
                                        type="radio"
                                        name="coursePacing"
                                        value="instructor"
                                        checked={editedValues.coursePacing === 'instructor'}
                                        onChange={() => handleInputChange('coursePacing', 'instructor')}
                                      />
                                      Instructor-paced
                                    </label>
                                    <label>
                                      <input
                                        type="radio"
                                        name="coursePacing"
                                        value="self"
                                        checked={editedValues.coursePacing === 'self'}
                                        onChange={() => handleInputChange('coursePacing', 'self')}
                                      />
                                      Self-paced
                                    </label>
                                  </div>
                                </Form.Group>
                              </Col>
                            </Row>
                          </Stack>
                        </div>
                        )}
                        {activeTab === 'schedule' && (
                        <div className="form-section">
                          <Stack gap={4}>
                            <div className="schedule-section">
                              <ul className="schedule-date-list">
                                <li className="schedule-date-item">
                                  <div>
                                    <Row className="pl-0 pr-0 pb-0 pt-0">
                                      <Col xs={12} md={6}>
                                        <div className="datepicker-control">
                                          <Form.Label>
                                            Course start date{' '}
                                            <span className="required-asterisk">*</span>
                                          </Form.Label>
                                          <DatepickerControl
                                            type={DATEPICKER_TYPES.date}
                                            value={editedValues.startDate || ''}
                                            label={null}
                                            helpText="Enter the date when your course will start"
                                            isInvalid={!!errors.startDate && touched.startDate}
                                            controlName="start-date"
                                            onChange={(value) => handleInputChange('startDate', value)}
                                            onBlur={() => handleBlur('startDate')}
                                            placeholder="MM/DD/YYYY"
                                          />
                                          {errors.startDate && touched.startDate && (
                                          <Form.Text className="text-danger">
                                            {errors.startDate}
                                          </Form.Text>
                                          )}
                                        </div>
                                      </Col>
                                      <Col xs={12} md={6}>
                                        <div className="time-field">
                                          <Form.Label>Course start time</Form.Label>
                                          <DatepickerControl
                                            type={DATEPICKER_TYPES.time}
                                            value={editedValues.startTime || ''}
                                            label={null}
                                            isInvalid={!!errors.startTime && touched.startTime}
                                            controlName="start-time"
                                            onChange={(value) => handleInputChange('startTime', value)}
                                            onBlur={() => handleBlur('startTime')}
                                          />
                                          <span className="h6 font-weight-normal text-gray-500 mb-0 mt-2">
                                            ({userTimezone})
                                          </span>
                                        </div>
                                      </Col>
                                    </Row>
                                  </div>
                                </li>
                                <li className="schedule-date-item">
                                  <div>
                                    <Row className="pl-0 pr-0 pb-0 pt-0">
                                      <Col xs={12} md={6}>
                                        <div className="datepicker-control">
                                          <Form.Label>Course end date</Form.Label>
                                          <DatepickerControl
                                            type={DATEPICKER_TYPES.date}
                                            value={editedValues.endDate || ''}
                                            label={null}
                                            helpText="Enter the date when your course will end"
                                            isInvalid={!!errors.endDate && touched.endDate}
                                            controlName="end-date"
                                            onChange={(value) => handleInputChange('endDate', value)}
                                            onBlur={() => handleBlur('endDate')}
                                            placeholder="MM/DD/YYYY"
                                          />
                                          {errors.endDate && touched.endDate && (
                                          <Form.Text className="text-danger">
                                            {errors.endDate}
                                          </Form.Text>
                                          )}
                                        </div>
                                      </Col>
                                      <Col xs={12} md={6}>
                                        <div className="time-field">
                                          <Form.Label>Course end time</Form.Label>
                                          <DatepickerControl
                                            type={DATEPICKER_TYPES.time}
                                            value={editedValues.endTime || ''}
                                            label={null}
                                            isInvalid={!!errors.endTime && touched.endTime}
                                            controlName="end-time"
                                            onChange={(value) => handleInputChange('endTime', value)}
                                            onBlur={() => handleBlur('endTime')}
                                          />
                                          <span className="h6 font-weight-normal text-gray-500 mb-0 mt-2">
                                            ({userTimezone})
                                          </span>
                                        </div>
                                      </Col>
                                    </Row>
                                  </div>
                                </li>
                                <li className="schedule-date-item">
                                  <div>
                                    <Row className="pl-0 pr-0 pb-0 pt-0">
                                      <Col xs={12} md={6}>
                                        <div className="datepicker-control">
                                          <Form.Label>
                                            Enrollment start date{' '}
                                            <span className="required-asterisk">*</span>
                                          </Form.Label>
                                          <DatepickerControl
                                            type={DATEPICKER_TYPES.date}
                                            value={editedValues.enrollmentStartDate || ''}
                                            label={null}
                                            helpText="Enter the date when enrollment will start"
                                            isInvalid={!!errors.enrollmentStartDate && touched.enrollmentStartDate}
                                            controlName="enrollment-start-date"
                                            onChange={(value) => handleInputChange('enrollmentStartDate', value)}
                                            onBlur={() => handleBlur('enrollmentStartDate')}
                                            placeholder="MM/DD/YYYY"
                                          />
                                          {errors.enrollmentStartDate && touched.enrollmentStartDate && (
                                          <Form.Text className="text-danger">
                                            {errors.enrollmentStartDate}
                                          </Form.Text>
                                          )}
                                        </div>
                                      </Col>
                                      <Col xs={12} md={6}>
                                        <div className="time-field">
                                          <Form.Label>Enrollment start time</Form.Label>
                                          <DatepickerControl
                                            type={DATEPICKER_TYPES.time}
                                            value={editedValues.enrollmentStartTime || ''}
                                            label={null}
                                            isInvalid={!!errors.enrollmentStartTime && touched.enrollmentStartTime}
                                            controlName="enrollment-start-time"
                                            onChange={(value) => handleInputChange('enrollmentStartTime', value)}
                                            onBlur={() => handleBlur('enrollmentStartTime')}
                                          />
                                          <span className="h6 font-weight-normal text-gray-500 mb-0 mt-2">
                                            ({userTimezone})
                                          </span>
                                        </div>
                                      </Col>
                                    </Row>
                                  </div>
                                </li>
                                <li className="schedule-date-item">
                                  <div>
                                    <Row className="pl-0 pr-0 pb-0 pt-0">
                                      <Col xs={12} md={6}>
                                        <div className="datepicker-control">
                                          <Form.Label>Enrollment end date</Form.Label>
                                          <DatepickerControl
                                            type={DATEPICKER_TYPES.date}
                                            value={editedValues.enrollmentEndDate || ''}
                                            label={null}
                                            helpText="Enter the date when enrollment will end"
                                            isInvalid={!!errors.enrollmentEndDate && touched.enrollmentEndDate}
                                            controlName="enrollment-end-date"
                                            onChange={(value) => handleInputChange('enrollmentEndDate', value)}
                                            onBlur={() => handleBlur('enrollmentEndDate')}
                                            placeholder="MM/DD/YYYY"
                                          />
                                          {errors.enrollmentEndDate && touched.enrollmentEndDate && (
                                          <Form.Text className="text-danger">
                                            {errors.enrollmentEndDate}
                                          </Form.Text>
                                          )}
                                        </div>
                                      </Col>
                                      <Col xs={12} md={6}>
                                        <div className="time-field">
                                          <Form.Label>Enrollment end time</Form.Label>
                                          <DatepickerControl
                                            type={DATEPICKER_TYPES.time}
                                            value={editedValues.enrollmentEndTime || ''}
                                            label={null}
                                            isInvalid={!!errors.enrollmentEndTime && touched.enrollmentEndTime}
                                            controlName="enrollment-end-time"
                                            onChange={(value) => handleInputChange('enrollmentEndTime', value)}
                                            onBlur={() => handleBlur('enrollmentEndTime')}
                                          />
                                          <span className="h6 font-weight-normal text-gray-500 mb-0 mt-2">
                                            ({userTimezone})
                                          </span>
                                        </div>
                                      </Col>
                                    </Row>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </Stack>
                        </div>
                        )}
                        {activeTab === 'requirements' && (
                        <div className="form-section">
                          <Stack gap={2}>
                            <Row className="custom-padding">
                              <Col xs={12} md={6}>
                                <Form.Group>
                                  <Form.Label>Hours of effort per week</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="hoursOfEffort"
                                    value={editedValues.hoursOfEffort || ''}
                                    onChange={(e) => handleInputChange('hoursOfEffort', e.target.value)}
                                    onBlur={() => handleBlur('hoursOfEffort')}
                                    isInvalid={!!errors.hoursOfEffort && touched.hoursOfEffort}
                                  />
                                  <Form.Text>Time spent on all course work</Form.Text>
                                </Form.Group>
                              </Col>
                              <Col xs={12} md={6}>
                                <Form.Group>
                                  <Form.Label>Prerequisite course</Form.Label>
                                  <Dropdown>
                                    <Dropdown.Toggle id="prerequisiteDropdown" variant="outline-primary">
                                      {editedValues.prerequisiteCourse || 'None'}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                      <Dropdown.Item
                                        key="None"
                                        onClick={() => handleInputChange('prerequisiteCourse', '')}
                                      >
                                        None
                                      </Dropdown.Item>
                                      {possiblePreRequisiteCourses?.map((course) => (
                                        <Dropdown.Item
                                          key={course.courseKey}
                                          onClick={() => handleInputChange('prerequisiteCourse', course.courseKey)}
                                        >
                                          {course.displayName}
                                        </Dropdown.Item>
                                      ))}
                                    </Dropdown.Menu>
                                  </Dropdown>
                                  <Form.Text>Course that students must complete before beginning this course</Form.Text>
                                </Form.Group>
                              </Col>
                            </Row>
                            <Form.Group className="entrance-exam-group">
                              <div className="entrance-exam-label mb-2">Entrance exam</div>
                              <div className="entrance-exam-card">
                                <div className="pb-2">
                                  <Form.Check
                                    type="checkbox"
                                    className="entrance-exam-checkbox"
                                    label={<span className="entrance-exam-checkbox-label">Require students to pass an exam before beginning the course.</span>}
                                    checked={!!editedValues.requireEntranceExam}
                                    onChange={(e) => handleInputChange('requireEntranceExam', e.target.checked)}
                                  />
                                </div>
                                {editedValues.requireEntranceExam && (
                                <div className="entrance-exam-content p-1">
                                  <div className="form-group-custom">
                                    <Form.Label>Grade requirements</Form.Label>
                                    <div className="d-flex">
                                      <Form.Control
                                        type="number"
                                        min={0}
                                        max={100}
                                        className=""
                                        value={editedValues.entranceExamGradeRequired || 50}
                                        onChange={(e) => handleInputChange('entranceExamGradeRequired', e.target.value)}
                                        onBlur={() => handleBlur('entranceExamGradeRequired')}
                                      />
                                      <span className="pgn__form-control-trailing">%</span>
                                    </div>
                                    <div className="form-control-feedback">
                                      The score student must meet in order to successfully complete the entrance exam.
                                    </div>
                                  </div>
                                </div>
                                )}
                              </div>
                            </Form.Group>
                          </Stack>
                        </div>
                        )}
                        {activeTab === 'additional' && (
                        <div className="form-section pl-12-pr-12">
                          <Stack gap={1}>
                            <Form.Group className="form-group-custom dropdown-language">
                              <Form.Label>Language</Form.Label>
                              <Dropdown className="bg-white">
                                <Dropdown.Toggle variant="outline-primary" id="languageDropdown">
                                  {formattedLanguage()}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {languageOptions.map((option) => (
                                    <Dropdown.Item
                                      key={option[0]}
                                      onClick={() => handleInputChange('language', option[0])}
                                    >
                                      {option[1]}
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                              <Form.Control.Feedback>
                                The primary language of your course.
                              </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                              <Form.Label>Duration</Form.Label>
                              <Form.Control
                                type="text"
                                name="duration"
                                value={editedValues.duration || ''}
                                onChange={(e) => handleInputChange('duration', e.target.value)}
                                onBlur={() => handleBlur('duration')}
                                placeholder="e.g. 8 weeks"
                                isInvalid={!!errors.duration && touched.duration}
                              />
                              <Form.Text>
                                The expected duration of your course.
                              </Form.Text>
                            </Form.Group>
                          </Stack>
                        </div>
                        )}
                        {activeTab === 'pricing' && (
                        <div className="form-section pl-12-pr-12">
                          <Stack gap={1}>
                            <Form.Group>
                              <Form.Label>Pricing Model</Form.Label>
                              <div className="d-flex radio-button-options">
                                <RadioButton
                                  name="pricingModel"
                                  value="free"
                                  checked={editedValues.pricingModel === 'free'}
                                  onChange={() => handleInputChange('pricingModel', 'free')}
                                >
                                  Free
                                </RadioButton>
                                <RadioButton
                                  name="pricingModel"
                                  value="paid"
                                  checked={editedValues.pricingModel === 'paid'}
                                  onChange={() => handleInputChange('pricingModel', 'paid')}
                                >
                                  Paid
                                </RadioButton>
                              </div>
                              <Form.Text className="mt-1">Choose whether your course will be free or paid.</Form.Text>
                            </Form.Group>

                            {editedValues.pricingModel === 'paid' && (
                            <Form.Group>
                              <Form.Label>Price</Form.Label>
                              <Form.Control
                                type="number"
                                value={editedValues.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                onBlur={() => handleBlur('price')}
                                placeholder="Enter course price"
                                min="0"
                                step="0.01"
                              />
                              <Form.Text>Set the price for your course in your local currency.</Form.Text>
                            </Form.Group>
                            )}
                          </Stack>
                        </div>
                        )}
                        {activeTab === 'license' && (
                        <div className="form-section license-section pl-12-pr-12">
                          <Stack gap={1}>
                            <div>
                              <p className="mb-8">{intl.formatMessage(licenseMessages.licenseDescription)}</p>
                            </div>
                            <LicenseSelector
                              licenseType={licenseType}
                              onChangeLicenseType={handleChangeLicenseType}
                            />
                            {licenseType === LICENSE_TYPE.creativeCommons && (
                            <LicenseCommonsOptions
                              licenseDetails={licenseDetails}
                              onToggleCheckbox={handleToggleCheckbox}
                            />
                            )}
                            <div>
                              <p className="fw-bold mb-1">License display</p>
                              <p className="small text-gray-700 mb-2">
                                The following message will be displayed at the bottom of the courseware pages within your course:
                              </p>
                              <LicenseIcons
                                licenseType={licenseType}
                                licenseDetails={licenseDetails}
                                licenseURL={licenseURL}
                              />
                            </div>
                          </Stack>
                        </div>
                        )}
                      </Col>
                    </Row>
                  </div>
                </Col>

                <Col xs={12} md={4}>
                  <div className="media-section">
                    <Stack gap={1}>
                      {renderImageUploadSection(
                        'courseImageAssetPath',
                        'Course Card Image',
                        cardImagePreview,
                        cardImageFile,
                        hasCardImage,
                        onImageUpload,
                      )}
                      {renderImageUploadSection(
                        'bannerImageAssetPath',
                        'Course Banner Image',
                        bannerImagePreview,
                        bannerImageFile,
                        hasBannerImage,
                        onBannerImageUpload,
                      )}
                      <Form.Group>
                        <IntroductionVideo
                          intl={intl}
                          introVideo={editedValues.introVideo}
                          onChange={(value) => handleVideoChange(value, 'introVideo')}
                        />
                      </Form.Group>
                    </Stack>
                  </div>
                </Col>
              </Row>

              {!hideCreateNewCourseButton && (
                <div className="ps-courseform-footer-bar">
                  <div className="footer-cancel">
                    <Button variant="outline-primary" onClick={handleCancel}>Cancel</Button>
                  </div>
                  <div className="footer-create">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={
            isSubmitting
            || !editedValues.shortDescription?.trim()
            || !editedValues.organization
            || !editedValues.courseNumber?.trim()
            || !editedValues.courseRun?.trim()
            || !editedValues.startDate
            || !!imageErrors.cardImage
            || !!imageErrors.bannerImage
        }
                    >
                      {isSubmitting ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Creating...
                        </span>
                      ) : (
                        'Create'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

PSCourseForm.propTypes = {
  children: PropTypes.node,
  hideGeneralTab: PropTypes.bool,
  hideTitleField: PropTypes.bool,
  hideCreateNewCourseButton: PropTypes.bool,
  onImageUpload: PropTypes.func.isRequired,
  onBannerImageUpload: PropTypes.func.isRequired,
  onRemoveImage: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func,
  possiblePreRequisiteCourses: PropTypes.array,
  cardImagePreview: PropTypes.string,
  bannerImagePreview: PropTypes.string,
  hasCardImage: PropTypes.bool,
  hasBannerImage: PropTypes.bool,
  cardImageFile: PropTypes.object,
  bannerImageFile: PropTypes.object,
  isImageUploading: PropTypes.bool,
  uploadProgress: PropTypes.number,
  imageErrors: PropTypes.object,
  editedValues: PropTypes.object.isRequired,
  handleValuesChange: PropTypes.func.isRequired,
  allowedImageTypes: PropTypes.array,
  onSubmit: PropTypes.func,
  onImageValidationErrorChange: PropTypes.func,
  onResetForm: PropTypes.func,
};

PSCourseForm.defaultProps = {
  children: null,
  hideGeneralTab: false,
  hideTitleField: false,
  hideCreateNewCourseButton: false,
  onFieldChange: () => { },
  cardImagePreview: '',
  bannerImagePreview: '',
  hasCardImage: false,
  hasBannerImage: false,
  cardImageFile: null,
  bannerImageFile: null,
  isImageUploading: false,
  uploadProgress: 0,
  imageErrors: {},
  possiblePreRequisiteCourses: [],
  allowedImageTypes: ['image/jpeg', 'image/png'],
  onSubmit: undefined,
  onImageValidationErrorChange: () => { },
  onResetForm: () => { },
};

export default PSCourseForm;
