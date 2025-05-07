import React, { useState, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker/dist';
import 'react-datepicker/dist/react-datepicker.css';
import {
    Container,
    Form,
    Card,
    Row,
    Col,
    Button,
    Stack,
    Icon,
    Tabs,
    Tab,
    Image,
    RadioButton,
    useToggle,
    Dropdown,
    Nav,
    Alert,
} from '@openedx/paragon';
import { Settings, Calendar, Money, More, CloudUpload, Close, InfoOutline } from '@openedx/paragon/icons';
import messages from './messages';
import { REGEX_RULES } from '../../constants';
import { MAX_TOTAL_LENGTH } from '../../data/constants';
import { DatepickerControl, DATEPICKER_TYPES } from '../../generic/datepicker-control';
import { parseYoutubeId } from '../../editors/data/services/cms/api';
import './PSCourseForm.scss';
import IntroductionVideo from '../../schedule-and-details/introducing-section/introduction-video';
import { getStudioHomeData } from '../../studio-home/data/selectors';
import { useCreateOrRerunCourse } from '../../generic/create-or-rerun-course/hooks';
import { fetchStudioHomeData } from '../../studio-home/data/thunks';
import TypeaheadDropdown from '../../../src/editors/sharedComponents/TypeaheadDropdown';
import { getCourseAppSettings } from '../../advanced-settings/data/selectors';
import { fetchCourseAppSettings } from '../../advanced-settings/data/thunks';
import { videoTranscriptLanguages } from '../../editors/data/constants/video';

const validateScheduleAndDetails = (formData, intl) => {
    const errors = {};
    const { endDate, endTime, startDate, startTime, organization, courseNumber, courseRun, shortDescription } = formData;

    const combineDateTime = (date, time) => {
        if (!date) return null;
        const combined = new Date(date);
        if (time) {
            const [hours, minutes] = time.split(':');
            combined.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        }
        return combined;
    };

    const startDateTime = combineDateTime(startDate, startTime);
    const endDateTime = combineDateTime(endDate, endTime);

    if (!startDate) {
        errors.startDate = 'The course must have an assigned start date.';
    }

    if (endDateTime && startDateTime && endDateTime <= startDateTime) {
        errors.endDate = 'The course end date and time must be later than the course start date and time.';
    }

    // Validate mandatory fields
    if (!shortDescription?.trim()) {
        errors.shortDescription = 'Required field.';
    }

    if (!organization?.trim()) {
        errors.organization = 'Required field.';
    } else if (!REGEX_RULES.specialCharsRule.test(organization)) {
        errors.organization = 'Please do not use any spaces or special characters in this field.';
    } else if (!REGEX_RULES.noSpaceRule.test(organization)) {
        errors.organization = 'Please do not use any spaces in this field.';
    }

    if (!courseNumber?.trim()) {
        errors.courseNumber = 'Required field.';
    } else if (!REGEX_RULES.specialCharsRule.test(courseNumber)) {
        errors.courseNumber = 'Please do not use any spaces or special characters in this field.';
    } else if (!REGEX_RULES.noSpaceRule.test(courseNumber)) {
        errors.courseNumber = 'Please do not use any spaces in this field.';
    }

    if (!courseRun?.trim()) {
        errors.courseRun = 'Required field.';
    } else if (!REGEX_RULES.specialCharsRule.test(courseRun)) {
        errors.courseRun = 'Please do not use any spaces or special characters in this field.';
    } else if (!REGEX_RULES.noSpaceRule.test(courseRun)) {
        errors.courseRun = 'Please do not use any spaces in this field.';
    }

    // Validate total length
    if ((organization?.length || 0) + (courseNumber?.length || 0) + (courseRun?.length || 0) > MAX_TOTAL_LENGTH) {
        errors.totalLength = `The combined length of the organization, course number and course run fields cannot be more than ${MAX_TOTAL_LENGTH} characters.`;
    }

    return errors;
};

const PSCourseForm = () => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const { allowToCreateNewOrg, allowedOrganizations } = useSelector(getStudioHomeData);
    const courseSettings = useSelector(getCourseAppSettings);
    const [formData, setFormData] = useState({
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
        pricingModel: 'free',
        price: '',
        language: 'en',
        duration: '',
        invitationOnly: false,
        cardImage: null,
        bannerImage: null,
        introVideo: null,
    });
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
        pricingModel: 'free',
        price: '',
        language: 'en',
        duration: '',
        invitationOnly: false,
        cardImage: null,
        bannerImage: null,
        introVideo: null,
    };
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                await dispatch(fetchStudioHomeData());
            } catch (error) {
                console.error('Error loading studio home data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [dispatch]);

    useEffect(() => {
        // Fetch course settings when component mounts
        dispatch(fetchCourseAppSettings());
    }, [dispatch]);

    const {
        organizations: createOrRerunOrganizations,
    } = useCreateOrRerunCourse(initialValues);

    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.shortDescription.trim()) {
            newErrors.shortDescription = 'Short description is required';
        }

        if (!formData.organization) {
            newErrors.organization = 'Organization is required';
        }

        if (!formData.courseNumber.trim()) {
            newErrors.courseNumber = 'Course number is required';
        }

        if (!formData.courseRun.trim()) {
            newErrors.courseRun = 'Course run is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (validateForm()) {
            try {
                // Here you can send the formData to your API
                console.log('Form submitted with data:', formData);
                // Add your API call here
            } catch (error) {
                console.error('Error submitting form:', error);
                // Handle submission error
            }
        }

        setIsSubmitting(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleImageUpload = (field, event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type based on field
            if (field === 'introVideo') {
                if (!file.type.startsWith('video/')) {
                    setErrors((prev) => ({
                        ...prev,
                        introVideo: 'Please upload a valid video file (MP4 or WebM)',
                    }));
                    return;
                }
            } else if (field === 'cardImage' || field === 'bannerImage') {
                if (!file.type.startsWith('image/')) {
                    setErrors((prev) => ({
                        ...prev,
                        [field]: 'Please upload a valid image file (JPEG or PNG)',
                    }));
                    return;
                }
            }

            // Clear any previous errors
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });

            handleInputChange(field, file);
        }
    };

    const handleVideoChange = (value, field) => {
        const youtubeId = parseYoutubeId(value);
        if (youtubeId) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
            handleInputChange(field, youtubeId);
        } else {
            setErrors((prev) => ({
                ...prev,
                [field]: 'Please enter a valid YouTube video ID or URL',
            }));
        }
    };

    const handleDeleteVideo = (field) => {
        handleInputChange(field, null);
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const languageOptions = Object.entries(videoTranscriptLanguages)
        .filter(([code]) => code !== 'placeholder')
        .map(([code, name]) => ({
            value: code,
            label: name,
        }));

    const formattedLanguage = (code) => {
        const option = languageOptions.find(opt => opt.value === code);
        return option ? option.label : 'Select a language';
    };

    return (
        <Container size="xl" className="py-4">
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <Form className="ps-course-form" onSubmit={handleSubmit}>
                    <Row>
                        {/* Left Column */}
                        <Col xs={8}>
                            {/* Course Information Section */}
                            <Form.Group className="mb-1">
                                <Form.Label><>Title </></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    maxLength={50}
                                />
                                <Form.Text>Displayed as title on the course details page. Limit to 50 characters.</Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-1">
                                <Form.Label><>Short Description <span className="required-asterisk">*</span></></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={1}
                                    value={formData.shortDescription}
                                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                                    maxLength={150}
                                    className="short-description"
                                />
                                <Form.Text>A short description that will be displayed on the course card. Limit to 150 characters.</Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-1">
                                <Form.Label><>Description</></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    maxLength={1000}
                                    className="description-editor"
                                />
                                <Form.Text>Displayed on the course details page. Limit to 1000 characters.</Form.Text>
                            </Form.Group>

                            {/* Options Section */}
                            <div className="options-container">
                                <Row>
                                    {/* Left Sidebar Navigation */}
                                    <Col xs={3} className="sidebar">
                                        <Nav className="nav-tabs flex-column border-0">
                                            <Nav.Item>
                                                <Nav.Link
                                                    className={activeTab === 'general' ? 'active' : ''}
                                                    onClick={() => setActiveTab('general')}
                                                >
                                                    <Icon className="icon" src={Settings} />
                                                    <span>General</span>
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link
                                                    className={activeTab === 'schedule' ? 'active' : ''}
                                                    onClick={() => setActiveTab('schedule')}
                                                >
                                                    <Icon className="icon" src={Calendar} />
                                                    <span>Schedule</span>
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link
                                                    className={activeTab === 'pricing' ? 'active' : ''}
                                                    onClick={() => setActiveTab('pricing')}
                                                >
                                                    <Icon className="icon" src={Money} />
                                                    <span>Pricing</span>
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link
                                                    className={activeTab === 'additional' ? 'active' : ''}
                                                    onClick={() => setActiveTab('additional')}
                                                >
                                                    <Icon className="icon" src={More} />
                                                    <span>Additional</span>
                                                </Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Col>

                                    {/* Tab Content Area */}
                                    <Col xs={9} className="content-area">
                                        {/* Tab Content */}
                                        {activeTab === 'general' && (
                                            <div className="form-section">
                                                <Stack gap={4}>
                                                    <Row>
                                                        <Col xs={6}>
                                                            <Form.Group>
                                                                <Form.Label><>Organization <span className="required-asterisk">*</span></></Form.Label>
                                                                {createOrRerunOrganizations ? (
                                                                    <TypeaheadDropdown
                                                                        readOnly={false}
                                                                        name="organization"
                                                                        value={formData.organization}
                                                                        controlClassName={errors.organization ? 'is-invalid' : ''}
                                                                        options={createOrRerunOrganizations}
                                                                        placeholder="Select an organization"
                                                                        handleChange={(value) => handleInputChange('organization', value)}
                                                                        noOptionsMessage="No organizations available"
                                                                        required
                                                                    />
                                                                ) : (
                                                                    <Dropdown>
                                                                        <Dropdown.Toggle id="organization-dropdown" variant="outline-primary">
                                                                            {formData.organization || 'Select an organization'}
                                                                        </Dropdown.Toggle>
                                                                        <Dropdown.Menu>
                                                                            {allowedOrganizations?.map((org) => (
                                                                                <Dropdown.Item
                                                                                    key={org.value}
                                                                                    onClick={() => handleInputChange('organization', org.value)}
                                                                                >
                                                                                    {org.label}
                                                                                </Dropdown.Item>
                                                                            ))}
                                                                        </Dropdown.Menu>
                                                                    </Dropdown>
                                                                )}
                                                                <Form.Text>
                                                                    The name of the organization sponsoring the course.
                                                                </Form.Text>
                                                                {errors.organization && (
                                                                    <Form.Control.Feedback type="invalid" className="d-block">
                                                                        {errors.organization}
                                                                    </Form.Control.Feedback>
                                                                )}
                                                            </Form.Group>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <Form.Group>
                                                                <Form.Label><>Course Number <span className="required-asterisk">*</span></></Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={formData.courseNumber}
                                                                    onChange={(e) => handleInputChange('courseNumber', e.target.value)}
                                                                    placeholder="e.g. CS101"
                                                                    isInvalid={!!errors.courseNumber}
                                                                    required
                                                                />
                                                                <Form.Text>
                                                                    The unique number that identifies your course within your organization.
                                                                </Form.Text>
                                                                {errors.courseNumber && (
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.courseNumber}
                                                                    </Form.Control.Feedback>
                                                                )}
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={6}>
                                                            <Form.Group>
                                                                <Form.Label><>Course Run <span className="required-asterisk">*</span></></Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={formData.courseRun}
                                                                    onChange={(e) => handleInputChange('courseRun', e.target.value)}
                                                                    placeholder="e.g. 2014_T1"
                                                                    isInvalid={!!errors.courseRun}
                                                                    required
                                                                />
                                                                <Form.Text>
                                                                    The term in which your course will run.
                                                                </Form.Text>
                                                                {errors.courseRun && (
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.courseRun}
                                                                    </Form.Control.Feedback>
                                                                )}
                                                            </Form.Group>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <Form.Group>
                                                                <Form.Label>Course Pacing</Form.Label>
                                                                <div className="d-flex radio-button-options radio-button">
                                                                    <RadioButton
                                                                        name="coursePacing"
                                                                        value="instructor"
                                                                        checked={formData.coursePacing === 'instructor'}
                                                                        onChange={(e) => handleInputChange('coursePacing', e.target.value)}
                                                                    >
                                                                        Instructor-paced
                                                                    </RadioButton>
                                                                    <RadioButton
                                                                        name="coursePacing"
                                                                        value="self"
                                                                        checked={formData.coursePacing === 'self'}
                                                                        onChange={(e) => handleInputChange('coursePacing', e.target.value)}
                                                                    >
                                                                        Self-paced
                                                                    </RadioButton>
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
                                                                <div className="schedule-date-item-container">
                                                                    <div className="datepicker-control">
                                                                        <DatepickerControl
                                                                            type={DATEPICKER_TYPES.date}
                                                                            value={formData.startDate}
                                                                            label={<>Course start date <span className="required-asterisk">*</span></>}
                                                                            helpText="Enter the date when your course will start"
                                                                            isInvalid={!!errors.startDate}
                                                                            controlName="start-date"
                                                                            onChange={(date) => handleInputChange('startDate', date)}
                                                                            placeholder="MM/DD/YYYY"
                                                                        />
                                                                    </div>
                                                                    <div className="time-field">
                                                                        <DatepickerControl
                                                                            type={DATEPICKER_TYPES.time}
                                                                            value={formData.startTime}
                                                                            label="Course start time"
                                                                            isInvalid={!!errors.startTime}
                                                                            controlName="start-time"
                                                                            onChange={(time) => handleInputChange('startTime', time)}
                                                                        />
                                                                        <span className="timezone-text">(Asia/Calcutta GMT+05:30)</span>
                                                                    </div>
                                                                </div>
                                                                {errors.startDate && (
                                                                    <span className="schedule-date-item-error">{errors.startDate}</span>
                                                                )}
                                                            </li>
                                                            <li className="schedule-date-item">
                                                                <div className="schedule-date-item-container">
                                                                    <div className="datepicker-control">
                                                                        <DatepickerControl
                                                                            type={DATEPICKER_TYPES.date}
                                                                            value={formData.endDate}
                                                                            label="Course end date"
                                                                            helpText="Enter the date when your course will end"
                                                                            isInvalid={!!errors.endDate}
                                                                            controlName="end-date"
                                                                            onChange={(date) => handleInputChange({ target: { name: 'endDate', value: date } })}
                                                                        />
                                                                    </div>
                                                                    <div className="time-field">
                                                                        <DatepickerControl
                                                                            type={DATEPICKER_TYPES.time}
                                                                            value={formData.endTime}
                                                                            label="Course end time"
                                                                            isInvalid={!!errors.endTime}
                                                                            controlName="end-time"
                                                                            onChange={(time) => handleInputChange('endTime', time)}
                                                                        />
                                                                        <span className="timezone-text">(Asia/Calcutta GMT+05:30)</span>
                                                                    </div>
                                                                </div>
                                                                {errors.endDate && (
                                                                    <span className="schedule-date-item-error">{errors.endDate}</span>
                                                                )}
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </Stack>
                                            </div>
                                        )}

                                        {activeTab === 'pricing' && (
                                            <div className="form-section">
                                                <Stack gap={1}>
                                                    <Form.Group>
                                                        <Form.Label>Pricing Model</Form.Label>
                                                        <div className="d-flex radio-button-options radio-button">
                                                            <RadioButton
                                                                name="pricingModel"
                                                                value="free"
                                                                checked={formData.pricingModel === 'free'}
                                                                onChange={(e) => handleInputChange('pricingModel', e.target.value)}
                                                            >
                                                                Free
                                                            </RadioButton>
                                                            <RadioButton
                                                                name="pricingModel"
                                                                value="paid"
                                                                checked={formData.pricingModel === 'paid'}
                                                                onChange={(e) => handleInputChange('pricingModel', e.target.value)}
                                                            >
                                                                Paid
                                                            </RadioButton>
                                                        </div>
                                                    </Form.Group>

                                                    {formData.pricingModel === 'paid' && (
                                                        <Form.Group>
                                                            <Form.Label>Price</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                value={formData.price}
                                                                onChange={(e) => handleInputChange('price', e.target.value)}
                                                                prefix="$"
                                                            />
                                                        </Form.Group>
                                                    )}
                                                </Stack>
                                            </div>
                                        )}

                                        {activeTab === 'additional' && (
                                            <div className="form-section">
                                                <Stack gap={4}>
                                                    <Row>
                                                        <Col xs={6}>
                                                            <Form.Group>
                                                                <Form.Label>Course Language</Form.Label>
                                                                <Dropdown className="bg-white dropdown-language">
                                                                    <Dropdown.Toggle
                                                                        variant="outline-primary"
                                                                        id="languageDropdown"
                                                                    >
                                                                        {formattedLanguage(formData.language)}
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu>
                                                                        {languageOptions.map(({ value, label }) => (
                                                                            <Dropdown.Item
                                                                                key={value}
                                                                                onClick={() => handleInputChange('language', value)}
                                                                            >
                                                                                {label}
                                                                            </Dropdown.Item>
                                                                        ))}
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                                <Form.Text>
                                                                    Select the primary language for your course content.
                                                                </Form.Text>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <Form.Group>
                                                                <Form.Label>Course Duration</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={formData.duration}
                                                                    onChange={(e) => handleInputChange('duration', e.target.value)}
                                                                    placeholder="e.g., 8 weeks"
                                                                    maxLength={50}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>

                                                    <Form.Group>
                                                        <Form.Label>Invitation Only</Form.Label>
                                                        <div>
                                                            <Form.Switch
                                                                checked={formData.invitationOnly}
                                                                onChange={(e) => handleInputChange('invitationOnly', e.target.checked)}
                                                            />
                                                        </div>
                                                    </Form.Group>
                                                </Stack>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        </Col>

                        {/* Right Column - Media */}
                        <Col xs={4}>
                            <div className="media-section">
                                <Stack gap={1}>
                                    <Form.Group>
                                        <div className="d-flex align-items-center">
                                            <Form.Label>Course Card Image</Form.Label>
                                            <Icon
                                                src={InfoOutline}
                                                className="ms-2 cursor-pointer"
                                                data-tooltip="Displayed on the course card in the catalog. Please add a course card image (Note: only JPEG or PNG format supported, recommended size 378x225 pixels)"
                                            />
                                        </div>
                                        <div className="upload-box p-4 border rounded text-center">
                                            {formData.cardImage ? (
                                                <div className="image-preview-container">
                                                    <Image
                                                        src={URL.createObjectURL(formData.cardImage)}
                                                        className="preview-image"
                                                        fluid
                                                    />
                                                    <Button
                                                        variant="icon"
                                                        className="remove-image-overlay"
                                                        onClick={() => handleInputChange('cardImage', null)}
                                                        aria-label="Remove course card image"
                                                    >
                                                        <Icon src={Close} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="outline-primary" onClick={() => document.getElementById('cardImageInput').click()}>
                                                    <Icon src={CloudUpload} className="me-2" /> Upload Image
                                                </Button>
                                            )}
                                            <input
                                                type="file"
                                                id="cardImageInput"
                                                accept="image/jpeg,image/png"
                                                className="d-none"
                                                onChange={(e) => handleImageUpload('cardImage', e)}
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group>
                                        <div className="d-flex align-items-center">
                                            <Form.Label>Course Banner Image</Form.Label>
                                            <Icon
                                                src={InfoOutline}
                                                className="ms-2 cursor-pointer"
                                                data-tooltip="Displayed as a banner on the course details page. Please add a banner image (Note: only JPEG or PNG format supported, recommended size 1440x400 pixels)"
                                            />
                                        </div>
                                        <div className="upload-box p-4 border rounded text-center">
                                            {formData.bannerImage ? (
                                                <div className="image-preview-container">
                                                    <Image
                                                        src={URL.createObjectURL(formData.bannerImage)}
                                                        className="preview-image"
                                                        fluid
                                                    />
                                                    <Button
                                                        variant="icon"
                                                        className="remove-image-overlay"
                                                        onClick={() => handleInputChange('bannerImage', null)}
                                                        aria-label="Remove course banner image"
                                                    >
                                                        <Icon src={Close} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="outline-primary" onClick={() => document.getElementById('bannerImageInput').click()}>
                                                    <Icon src={CloudUpload} className="me-2" /> Upload Image
                                                </Button>
                                            )}
                                            <input
                                                type="file"
                                                id="bannerImageInput"
                                                accept="image/jpeg,image/png"
                                                className="d-none"
                                                onChange={(e) => handleImageUpload('bannerImage', e)}
                                            />
                                        </div>
                                    </Form.Group>

                                    <IntroductionVideo introVideo={formData.introVideo} onChange={(value) => handleInputChange('introVideo', value)} />
                                </Stack>
                            </div>
                        </Col>
                    </Row>

                    {/* Add submit button at the end of the form */}
                    <div className="mt-4 d-flex justify-content-end">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting || !formData.shortDescription?.trim() || !formData.organization || !formData.courseNumber?.trim() || !formData.courseRun?.trim() || !formData.startDate}
                            className="mt-3"
                        >
                            {isSubmitting ? 'Creating...' : 'Create New Course'}
                        </Button>
                    </div>

                    {/* Display validation errors */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="danger" className="mt-3">
                            <ul className="mb-0">
                                {Object.entries(errors).map(([field, error]) => (
                                    <li key={field}>{error}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}
                </Form>
            )}
        </Container>
    );
};

export default PSCourseForm;
