import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    StatefulButton,
} from '@openedx/paragon';
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon
} from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import AlertMessage from './generic/alert-message';
import {
    getCourseSettings,
    getCourseDetails,
    getSavingStatus
} from './schedule-and-details/data/selectors';
import { useSaveValuesPrompt } from './schedule-and-details/hooks';
import { STATEFUL_BUTTON_STATES } from './constants';
import { RequestStatus } from './data/constants';
import { videoTranscriptLanguages } from './editors/data/constants/video';
import './CustomScheduleAndDetails.scss';
import { updateCourseDetailsQuery } from './schedule-and-details/data/thunks';
import InternetConnectionAlert from './generic/internet-connection-alert';
import { uploadAssets } from './generic/course-upload-image/data/api';
import { validateScheduleAndDetails } from './schedule-and-details/utils';
import PacingSection from './schedule-and-details/pacing-section';
import BasicSection from './schedule-and-details/basic-section';
import PSCourseForm from './studio-home/ps-course-form/PSCourseForm';
import { validateImageFile } from './utils/imageValidation';

const getImageUrl = (imageObj) => {
    if (!imageObj) return '';
    if (typeof imageObj === 'string') {
        if (imageObj.startsWith('/asset-v1:')) {
            const baseUrl = getConfig().LMS_BASE_URL;
            if (!baseUrl) {
                console.error('LMS_BASE_URL is not configured');
                return imageObj;
            }
            try {
                return new URL(imageObj, baseUrl).href;
            } catch (error) {
                console.error('Error constructing image URL:', error);
                return imageObj;
            }
        }
        return imageObj;
    }
    if (imageObj.uri_absolute) return imageObj.uri_absolute;
    if (imageObj.uri) {
        if (imageObj.uri.startsWith('/asset-v1:')) {
            const baseUrl = getConfig().LMS_BASE_URL;
            if (!baseUrl) {
                console.error('LMS_BASE_URL is not configured');
                return imageObj.uri;
            }
            try {
                return new URL(imageObj.uri, baseUrl).href;
            } catch (error) {
                console.error('Error constructing image URL:', error);
                return imageObj.uri;
            }
        }
        return imageObj.uri;
    }
    return '';
};

const validateImage = async (file) => {
    if (!file) return { isValid: false, error: 'No file selected.' };

    try {
        const result = await validateImageFile(file);
        return result;
    } catch (error) {
        console.error('Image validation error:', error);
        return {
            isValid: false,
            error: 'Error validating image file.'
        };
    }
};

const parseYoutubeId = (src) => {
    if (!src) return null;
    const youtubeRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/;
    const match = src.match(youtubeRegex);
    if (!match) {
        return null;
    }
    return match[5];
};

const CustomScheduleAndDetails = (props) => {
    const { courseId, messages, intl } = props;
    const dispatch = useDispatch();
    const courseSettings = useSelector(getCourseSettings);
    const courseDetails = useSelector(getCourseDetails);
    const savingStatus = useSelector(getSavingStatus);
    const [touched, setTouched] = useState({});
    const initialValues = useMemo(() => ({
        ...courseDetails,
        courseImageAssetPath: courseDetails?.courseImageAssetPath || '',
        bannerImageAssetPath: courseDetails?.bannerImageAssetPath || '',
    }), [courseDetails]);

    const {
        errorFields,
        editedValues,
        isQueryPending,
        isEditableState,
        showModifiedAlert,
        showSuccessfulAlert,
        handleResetValues,
        handleValuesChange,
        handleInternetConnectionFailed,
        handleUpdateValues,
    } = useSaveValuesPrompt(
        courseId,
        updateCourseDetailsQuery,
        courseSettings?.canShowCertificateAvailableDateField,
        initialValues,
    );

    const [cardImageFile, setCardImageFile] = useState(null);
    const [bannerImageFile, setBannerImageFile] = useState(null);
    const [cardImagePreview, setCardImagePreview] = useState('');
    const [bannerImagePreview, setBannerImagePreview] = useState('');
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [showSaveChangesPrompt, setShowSaveChangesPrompt] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState({});
    const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

    const prevCardImageUrl = useRef(editedValues?.courseImageAssetPath);
    const prevBannerImageUrl = useRef(editedValues?.bannerImageAssetPath);

    const validateField = useCallback((value, field) => {
        if (!touched[field]) {
            return null;
        }

        const fieldErrors = validateScheduleAndDetails(
            { ...editedValues, [field]: value },
            courseSettings?.canShowCertificateAvailableDateField,
            intl
        );
        return fieldErrors[field];
    }, [editedValues, courseSettings, intl, touched]);


    const handleFieldChange = useCallback((value, field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        let processedValue = value;
        if (field === 'introVideo' && value) {
            const youtubeId = parseYoutubeId(value);
            if (youtubeId) {
                processedValue = youtubeId;
            }
        }

        const hasChanged = processedValue !== initialValues[field];

        if (hasChanged) {
            handleValuesChange(processedValue, field);
            setHasUnsavedChanges(true);
            setShowSaveChangesPrompt(true);
        } else {
            setHasUnsavedChanges(false);
            setShowSaveChangesPrompt(false);
        }

        const fieldError = validateField(processedValue, field);
        if (fieldError) {
            setErrors(prev => ({
                ...prev,
                [field]: fieldError
            }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [handleValuesChange, validateField, initialValues]);

    const handleImageUpload = useCallback(async (field, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const validation = await validateImage(file);
        if (!validation.isValid) {
            const errorField = field === 'courseImageAssetPath' ? 'cardImage' : 'bannerImage';
            setImageErrors(prev => ({
                ...prev,
                [errorField]: validation.error
            }));
            return;
        }

        setIsImageUploading(true);
        setImageErrors({});
        setUploadProgress(0);

        if (field === 'courseImageAssetPath') setCardImageFile(file);
        if (field === 'bannerImageAssetPath') setBannerImageFile(file);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await uploadAssets(courseId, formData, (progress) => {
                setUploadProgress(progress);
            });

            const asset = response?.asset;
            if (asset) {
                const imageUrl = asset.url || asset.uri;
                if (imageUrl) {
                    const processedUrl = getImageUrl(imageUrl);
                    const imageName = file.name;

                    if (field === 'bannerImageAssetPath') {
                        setBannerImagePreview(processedUrl);
                        setBannerImageFile(null);
                        handleValuesChange(imageUrl, 'bannerImageAssetPath');
                        handleValuesChange(imageName, 'bannerImageName');
                    } else if (field === 'courseImageAssetPath') {
                        setCardImagePreview(processedUrl);
                        setCardImageFile(null);
                        handleValuesChange(imageUrl, 'courseImageAssetPath');
                        handleValuesChange(imageName, 'courseImageName');
                    }
                }
            }
        } catch (error) {
            console.error('Image upload failed', error);
            const errorField = field === 'courseImageAssetPath' ? 'cardImage' : 'bannerImage';
            setImageErrors(prev => ({
                ...prev,
                [errorField]: 'Failed to upload image. Please try again.'
            }));
        } finally {
            setIsImageUploading(false);
            setUploadProgress(0);
        }
    }, [courseId, handleValuesChange]);

    const handleRemoveImage = useCallback((field) => {
        const errorField = field === 'courseImageAssetPath' ? 'cardImage' : 'bannerImage';
        setImageErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[errorField];
            return newErrors;
        });

        if (field === 'courseImageAssetPath') {
            setCardImageFile(null);
            setCardImagePreview('');
            handleValuesChange('', 'courseImageAssetPath');
            handleValuesChange('', 'courseImageName');
        } else if (field === 'bannerImageAssetPath') {
            setBannerImageFile(null);
            setBannerImagePreview('');
            handleValuesChange('', 'bannerImageAssetPath');
            handleValuesChange('', 'bannerImageName');
        }
    }, [handleValuesChange]);

    useEffect(() => {
        if (editedValues?.courseImageAssetPath) {
            const cardImageUrl = getImageUrl(editedValues.courseImageAssetPath);
            setCardImagePreview(cardImageUrl);
        }
        if (editedValues?.bannerImageAssetPath) {
            const bannerImageUrl = getImageUrl(editedValues.bannerImageAssetPath);
            setBannerImagePreview(bannerImageUrl);
        }
    }, [editedValues?.courseImageAssetPath, editedValues?.bannerImageAssetPath]);

    useEffect(() => {
        if (
            cardImageFile &&
            editedValues?.courseImageAssetPath &&
            editedValues.courseImageAssetPath !== prevCardImageUrl.current
        ) {
            setCardImageFile(null);
        }
        prevCardImageUrl.current = editedValues?.courseImageAssetPath;
    }, [editedValues?.courseImageAssetPath, cardImageFile]);

    useEffect(() => {
        if (
            bannerImageFile &&
            editedValues?.bannerImageAssetPath &&
            editedValues.bannerImageAssetPath !== prevBannerImageUrl.current
        ) {
            setBannerImageFile(null);
        }
        prevBannerImageUrl.current = editedValues?.bannerImageAssetPath;
    }, [editedValues?.bannerImageAssetPath, bannerImageFile]);

    const handleQueryProcessing = useCallback(() => {
        const payload = {
            ...editedValues,
            course_image_asset_path: editedValues?.courseImageAssetPath || '',
            banner_image_asset_path: editedValues?.bannerImageAssetPath || '',
            banner_image_name: editedValues?.bannerImageName || ''
        };
        dispatch(updateCourseDetailsQuery(courseId, payload));
    }, [courseId, dispatch, editedValues]);

    const requiredFieldsPresent = Boolean(
        editedValues?.shortDescription &&
        editedValues?.description &&
        editedValues?.startDate &&
        editedValues?.endDate &&
        editedValues?.language
    );

    const hasErrors = !!Object.keys(errorFields || {}).length;
    const hasImageErrors = Object.values(imageErrors).some(error => error !== '');

    const updateValuesButtonState = {
        labels: {
            default: intl.formatMessage(messages.buttonSaveText),
            pending: intl.formatMessage(messages.buttonSavingText),
        },
        disabledStates: [STATEFUL_BUTTON_STATES.pending],
    };

    const handleCancelChanges = useCallback(() => {
        handleResetValues();
        setShowSaveChangesPrompt(false);
        setTouched({});
    }, [handleResetValues]);

    const handleSaveChanges = useCallback(() => {
        setHasAttemptedSave(true);
        handleUpdateValues();
    }, [handleUpdateValues]);

    useEffect(() => {
        if (showSuccessfulAlert && !isQueryPending && hasAttemptedSave) {
            window.scrollTo(0, 0);
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    const alertElement = document.querySelector('.alert-container');
                    if (alertElement) {
                        alertElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }, 300);
        }
    }, [showSuccessfulAlert, isQueryPending, hasAttemptedSave]);

    return (
        <div className="custom-schedule-details">
            <Container size="xl" className="schedule-and-details px-4">
                <div className="alert-container mb-4">
                    <AlertMessage
                        show={showSuccessfulAlert && !isQueryPending && hasAttemptedSave}
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
                <Row className="mb-4">
                    <Col xs={12}>
                        <Form className="schedule-detail-form">
                            <PSCourseForm
                                hideGeneralTab
                                hideTitleField
                                hideCreateNewCourseButton
                                onImageUpload={handleImageUpload}
                                onBannerImageUpload={handleImageUpload}
                                onRemoveImage={handleRemoveImage}
                                showSaveChangesPrompt={showSaveChangesPrompt}
                                onFieldChange={handleFieldChange}
                                cardImagePreview={cardImagePreview}
                                bannerImagePreview={bannerImagePreview}
                                hasCardImage={Boolean(cardImagePreview || cardImageFile)}
                                hasBannerImage={Boolean(bannerImagePreview || bannerImageFile)}
                                cardImageFile={cardImageFile}
                                bannerImageFile={bannerImageFile}
                                isImageUploading={isImageUploading}
                                uploadProgress={uploadProgress}
                                imageErrors={imageErrors}
                                editedValues={editedValues}
                                handleValuesChange={handleValuesChange}
                                intl={intl}
                                messages={messages}
                                touched={touched}
                                onFieldBlur={(field) => setTouched(prev => ({ ...prev, [field]: true }))}
                                allowedImageTypes={props.allowedImageTypes || ['image/jpeg', 'image/png']}
                            >
                                <h2 className="title-class">Schedule & Details</h2>
                                <hr style={{ border: 'none', borderTop: '1px solid #e5e6e6', margin: '0rem -1rem 1rem -1rem' }} />
                                <BasicSection
                                    org={editedValues?.org}
                                    courseNumber={editedValues?.courseId}
                                    run={editedValues?.run}
                                    lmsLinkForAboutPage={courseSettings?.lmsLinkForAboutPage}
                                    marketingEnabled={courseSettings?.marketingEnabled}
                                    courseDisplayName={courseSettings?.courseDisplayName}
                                    platformName={courseSettings?.platformName}
                                    onFieldChange={handleFieldChange}
                                    intl={intl}
                                    messages={messages}
                                />
                                <PacingSection
                                    selfPaced={editedValues?.selfPaced}
                                    startDate={editedValues?.startDate}
                                    onChange={handleFieldChange}
                                    intl={intl}
                                    messages={messages}
                                />
                            </PSCourseForm>
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
                                            onClick={handleCancelChanges}
                                        >
                                            {intl.formatMessage(messages.buttonCancelText)}
                                        </Button>
                                    ),
                                    <StatefulButton
                                        key="save-button"
                                        onClick={handleSaveChanges}
                                        disabled={
                                            hasErrors ||
                                            !requiredFieldsPresent ||
                                            !isEditableState ||
                                            isImageUploading ||
                                            hasImageErrors
                                        }
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
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CustomScheduleAndDetails;
