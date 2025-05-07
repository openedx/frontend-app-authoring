import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, StatefulButton, Stack, Dropdown, Image, RadioButton, Icon } from '@openedx/paragon';
import { InfoOutline, CloudUpload, Close, CheckCircle as CheckCircleIcon, Warning as WarningIcon, Settings, Calendar, Money, More } from '@openedx/paragon/icons';
import AlertMessage from './generic/alert-message';
import { useSelector } from 'react-redux';
import { getCourseSettings, getCourseDetails, getSavingStatus } from './schedule-and-details/data/selectors';
import { useSaveValuesPrompt } from './schedule-and-details/hooks';
import { STATEFUL_BUTTON_STATES } from './constants';
import { RequestStatus } from './data/constants';
import TypeaheadDropdown from './editors/sharedComponents/TypeaheadDropdown';
import DatepickerControl, { DATEPICKER_TYPES } from './generic/datepicker-control/DatepickerControl';
import { videoTranscriptLanguages } from './editors/data/constants/video';
import './CustomScheduleAndDetails.scss';
import IntroductionVideo from './schedule-and-details/introducing-section/introduction-video';
import { Nav } from '@openedx/paragon';
import { updateCourseDetailsQuery } from './schedule-and-details/data/thunks';
import InternetConnectionAlert from './generic/internet-connection-alert';
import CourseUploadImage from './generic/course-upload-image';
import introducingMessages from './schedule-and-details/introducing-section/messages';
import { uploadAssets } from './generic/course-upload-image/data/api';
import uploadMessages from './generic/course-upload-image/messages';
import { getConfig } from '@edx/frontend-platform';

const languageOptionsList = Object.entries(videoTranscriptLanguages)
    .filter(([code]) => code !== 'placeholder')
    .map(([code, name]) => ({ value: code, label: name }));

const formattedLanguage = (code) => {
    const option = languageOptionsList.find(opt => opt.value === code);
    return option ? option.label : 'Select a language';
};

const tabList = [
    { key: 'schedule', label: 'Schedule', icon: Calendar },
    { key: 'pricing', label: 'Pricing', icon: Money },
    { key: 'additional', label: 'Additional', icon: More },
];

const getImageUrl = (path) => {
    if (!path) return '';
    // If it's an asset-v1: path, resolve it relative to LMS_BASE_URL
    if (path.startsWith('/asset-v1:')) {
        return new URL(path, getConfig().LMS_BASE_URL).href;
    }
    // Otherwise, assume it's a full URL or relative path
    return path;
};

const CustomScheduleAndDetails = (props) => {
    const { courseId, messages, intl } = props;
    const courseSettings = useSelector(getCourseSettings);
    const courseDetails = useSelector(getCourseDetails);
    const savingStatus = useSelector(getSavingStatus);
    const {
        errorFields,
        editedValues,
        isQueryPending,
        isEditableState,
        showModifiedAlert,
        showSuccessfulAlert,
        handleResetValues,
        handleValuesChange,
        handleUpdateValues,
        handleQueryProcessing,
        handleInternetConnectionFailed,
    } = useSaveValuesPrompt(
        courseId,
        updateCourseDetailsQuery,
        courseSettings?.canShowCertificateAvailableDateField,
        courseDetails,
    );
    const hasErrors = !!Object.keys(errorFields).length;
    const updateValuesButtonState = {
        labels: {
            default: intl.formatMessage(messages.buttonSaveText),
            pending: intl.formatMessage(messages.buttonSavingText),
        },
        disabledStates: [STATEFUL_BUTTON_STATES.pending],
    };
    const [activeTab, setActiveTab] = useState('general');
    const [cardImageFile, setCardImageFile] = useState(null);
    const [bannerImageFile, setBannerImageFile] = useState(null);
    const [bannerImagePreview, setBannerImagePreview] = useState(editedValues.bannerImageAssetPath || '');
    const prevCardImageUrl = useRef(editedValues.courseImageAssetPath);
    const prevBannerImageUrl = useRef(editedValues.bannerImageAssetPath);

    // Only clear local file if the server URL has changed and is not empty
    useEffect(() => {
        if (
            cardImageFile &&
            editedValues.courseImageAssetPath &&
            editedValues.courseImageAssetPath !== prevCardImageUrl.current
        ) {
            setCardImageFile(null);
        }
        prevCardImageUrl.current = editedValues.courseImageAssetPath;
    }, [editedValues.courseImageAssetPath]);

    useEffect(() => {
        if (
            bannerImageFile &&
            editedValues.bannerImageAssetPath &&
            editedValues.bannerImageAssetPath !== prevBannerImageUrl.current
        ) {
            setBannerImageFile(null);
        }
        prevBannerImageUrl.current = editedValues.bannerImageAssetPath;
    }, [editedValues.bannerImageAssetPath]);

    useEffect(() => {
        if (editedValues.bannerImageAssetPath) setBannerImagePreview(editedValues.bannerImageAssetPath);
    }, [editedValues.bannerImageAssetPath]);

    const handleImageUpload = async (field, event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (field === 'courseImageAssetPath') setCardImageFile(file);
        if (field === 'bannerImageAssetPath') setBannerImageFile(file);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await uploadAssets(courseId, formData);
            const url = response?.asset?.url;
            if (url) {
                handleValuesChange(url, field);
                if (field === 'bannerImageAssetPath') {
                    setBannerImagePreview(url);
                    setBannerImageFile(null);
                }
                if (field === 'courseImageAssetPath') {
                    setCardImageFile(null);
                }
            }
        } catch (error) {
            // Optionally show an error message
            // eslint-disable-next-line no-console
            console.error('Image upload failed', error);
        }
    };

    const hasCardImage = cardImageFile || (editedValues.courseImageAssetPath && editedValues.courseImageAssetPath.trim() !== '');
    const hasBannerImage = bannerImageFile || (bannerImagePreview && bannerImagePreview.trim() !== '');

    return (
        <div className="custom-schedule-details">
            <Container size="xl" className="schedule-and-details px-4">
                <div className="alert-container mb-4">
                    <AlertMessage
                        show={showSuccessfulAlert}
                        variant="success"
                        icon={CheckCircleIcon}
                        title={intl.formatMessage(messages.alertSuccess)}
                        className="success-alert"
                        dismissible={false}
                        aria-hidden="true"
                        aria-labelledby={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
                        aria-describedby={intl.formatMessage(messages.alertSuccessAriaDescribedby)}
                    />
                </div>
                <Form className="ps-course-form">
                    <Row>
                        {/* Left Column: Sidebar + Tab Content */}
                        <Col xs={8}>
                            <Row>
                                {/* Sidebar Navigation */}
                                <Col xs={3} className="sidebar">
                                    <Nav className="nav-tabs flex-column border-0">
                                        {tabList.map(tab => (
                                            <Nav.Item key={tab.key}>
                                                <Nav.Link
                                                    className={activeTab === tab.key ? 'active' : ''}
                                                    onClick={() => setActiveTab(tab.key)}
                                                >
                                                    <Icon className="icon" src={tab.icon} />
                                                    <span>{tab.label}</span>
                                                </Nav.Link>
                                            </Nav.Item>
                                        ))}
                                    </Nav>
                                </Col>
                                {/* Tab Content Area */}
                                <Col xs={9} className="content-area">
                                    {activeTab === 'schedule' && (
                                        <div className="form-section">
                                            <Stack gap={4}>
                                                <Row>
                                                    <Col xs={6}>
                                                        <Form.Group>
                                                            <Form.Label>Course start date <span className="required-asterisk">*</span></Form.Label>
                                                            <DatepickerControl
                                                                type={DATEPICKER_TYPES.date}
                                                                value={editedValues.startDate || ''}
                                                                label={null}
                                                                helpText="Enter the date when your course will start"
                                                                isInvalid={!!errorFields.startDate}
                                                                controlName="start-date"
                                                                onChange={(value) => handleValuesChange(value, 'startDate')}
                                                                placeholder="MM/DD/YYYY"
                                                            />
                                                            <Form.Text>Course start time</Form.Text>
                                                            <DatepickerControl
                                                                type={DATEPICKER_TYPES.time}
                                                                value={editedValues.startTime || ''}
                                                                label={null}
                                                                isInvalid={!!errorFields.startTime}
                                                                controlName="start-time"
                                                                onChange={(value) => handleValuesChange(value, 'startTime')}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={6}>
                                                        <Form.Group>
                                                            <Form.Label>Course end date</Form.Label>
                                                            <DatepickerControl
                                                                type={DATEPICKER_TYPES.date}
                                                                value={editedValues.endDate || ''}
                                                                label={null}
                                                                helpText="Enter the date when your course will end"
                                                                isInvalid={!!errorFields.endDate}
                                                                controlName="end-date"
                                                                onChange={(value) => handleValuesChange(value, 'endDate')}
                                                                placeholder="MM/DD/YYYY"
                                                            />
                                                            <Form.Text>Course end time</Form.Text>
                                                            <DatepickerControl
                                                                type={DATEPICKER_TYPES.time}
                                                                value={editedValues.endTime || ''}
                                                                label={null}
                                                                isInvalid={!!errorFields.endTime}
                                                                controlName="end-time"
                                                                onChange={(value) => handleValuesChange(value, 'endTime')}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
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
                                                            checked={editedValues.pricingModel === 'free'}
                                                            onChange={e => handleValuesChange(e.target.value, 'pricingModel')}
                                                        >
                                                            Free
                                                        </RadioButton>
                                                        <RadioButton
                                                            name="pricingModel"
                                                            value="paid"
                                                            checked={editedValues.pricingModel === 'paid'}
                                                            onChange={e => handleValuesChange(e.target.value, 'pricingModel')}
                                                        >
                                                            Paid
                                                        </RadioButton>
                                                    </div>
                                                </Form.Group>
                                                {editedValues.pricingModel === 'paid' && (
                                                    <Form.Group>
                                                        <Form.Label>Price</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={editedValues.price}
                                                            onChange={(e) => handleValuesChange('price', e.target.value)}
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
                                                                    {formattedLanguage(editedValues.language)}
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    {languageOptionsList.map(({ value, label }) => (
                                                                        <Dropdown.Item
                                                                            key={value}
                                                                            onClick={() => handleValuesChange('language', value)}
                                                                        >
                                                                            {label}
                                                                        </Dropdown.Item>
                                                                    ))}
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <Form.Text>Select the primary language for your course content.</Form.Text>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={6}>
                                                        <Form.Group>
                                                            <Form.Label>Course Duration</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={editedValues.duration}
                                                                onChange={(e) => handleValuesChange('duration', e.target.value)}
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
                                                            checked={!!editedValues.invitationOnly}
                                                            onChange={(e) => handleValuesChange('invitationOnly', e.target.checked)}
                                                        />
                                                    </div>
                                                </Form.Group>
                                            </Stack>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Col>
                        {/* Right Column: Media */}
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
                                            {hasCardImage ? (
                                                <div className="image-preview-container">
                                                    <Image
                                                        src={cardImageFile ? URL.createObjectURL(cardImageFile) : getImageUrl(editedValues.courseImageAssetPath)}
                                                        className="preview-image"
                                                        fluid
                                                    />
                                                    <Button
                                                        variant="icon"
                                                        className="remove-image-overlay"
                                                        onClick={() => { handleValuesChange('', 'courseImageAssetPath'); setCardImageFile(null); }}
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
                                                onChange={(e) => handleImageUpload('courseImageAssetPath', e)}
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
                                            {hasBannerImage ? (
                                                <div className="image-preview-container">
                                                    <Image
                                                        src={bannerImageFile ? URL.createObjectURL(bannerImageFile) : getImageUrl(bannerImagePreview)}
                                                        className="preview-image"
                                                        fluid
                                                    />
                                                    <Button
                                                        variant="icon"
                                                        className="remove-image-overlay"
                                                        onClick={() => { handleValuesChange('', 'bannerImageAssetPath'); setBannerImageFile(null); setBannerImagePreview(''); }}
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
                                            <inpu
                                                type="file"
                                                id="bannerImageInput"
                                                accept="image/jpeg,image/png"
                                                className="d-none"
                                                onChange={(e) => handleImageUpload('bannerImageAssetPath', e)}
                                            />
                                        </div>
                                    </Form.Group>
                                    <IntroductionVideo
                                        intl={intl}
                                        introVideo={editedValues.introVideo}
                                        onChange={handleValuesChange}
                                    />
                                </Stack>
                            </div>
                        </Col>
                    </Row>
                </Form>
                <div>
                    {!isEditableState && (
                        <InternetConnectionAlert
                            isFailed={savingStatus === RequestStatus.FAILED}
                            isQueryPending={isQueryPending}
                            onQueryProcessing={handleQueryProcessing}
                            onInternetConnectionFailed={handleInternetConnectionFailed}
                        />
                    )}
                    <AlertMessage
                        show={showModifiedAlert}
                        aria-labelledby={intl.formatMessage(messages.alertWarningAriaLabelledby)}
                        aria-describedby={intl.formatMessage(messages.alertWarningAriaDescribedby)}
                        role="dialog"
                        actions={[
                            !isQueryPending && (
                                <Button
                                    key="cancel-button"
                                    variant="tertiary"
                                    onClick={handleResetValues}
                                >
                                    {intl.formatMessage(messages.buttonCancelText)}
                                </Button>
                            ),
                            <StatefulButton
                                key="save-button"
                                onClick={handleUpdateValues}
                                disabled={hasErrors}
                                state={
                                    isQueryPending
                                        ? STATEFUL_BUTTON_STATES.pending
                                        : STATEFUL_BUTTON_STATES.default
                                }
                                {...updateValuesButtonState}
                            />,
                        ].filter(Boolean)}
                        variant="warning"
                        icon={WarningIcon}
                        title={intl.formatMessage(messages.alertWarning)}
                        description={intl.formatMessage(messages.alertWarningDescriptions)}
                    />
                </div>
            </Container>
        </div>
    );
};

export default CustomScheduleAndDetails;
