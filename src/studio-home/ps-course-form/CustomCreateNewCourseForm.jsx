import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Container,
    Row,
    Col,
} from '@openedx/paragon';
import PSCourseForm from './PSCourseForm';
import { validateImageFile } from '../../utils/imageValidation';

const CustomCreateNewCourseForm = ({
    editedValues,
    courseSettings,
    handleValuesChange,
}) => {
    const initialFormValues = {
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

    const [formValues, setFormValues] = useState(editedValues || initialFormValues);
    const [imageErrors, setImageErrors] = useState({ cardImage: '', bannerImage: '' });
    const [cardImagePreview, setCardImagePreview] = useState('');
    const [bannerImagePreview, setBannerImagePreview] = useState('');

    useEffect(() => {
        if (editedValues) {
            setFormValues(prevValues => ({
                ...prevValues,
                ...editedValues
            }));
        }
    }, [editedValues]);

    const handleFieldChange = (value, field) => {
        if (field === 'introVideo') {
            let videoId = value;
            if (value && (value.includes('youtube.com') || value.includes('youtu.be'))) {
                const urlParams = new URLSearchParams(new URL(value).search);
                videoId = urlParams.get('v') || value.split('/').pop();
            }
            setFormValues(prev => ({
                ...prev,
                [field]: videoId
            }));
            if (handleValuesChange) {
                handleValuesChange(videoId, field);
            }
        } else {
            setFormValues(prev => ({
                ...prev,
                [field]: value
            }));
            if (handleValuesChange) {
                handleValuesChange(value, field);
            }
        }
    };

    const handleImageUpload = async (field, event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const validationResult = await validateImageFile(file);
            if (!validationResult.isValid) {
                const errorField = field === 'courseImageAssetPath' ? 'cardImage' : 'bannerImage';
                setImageErrors(prev => ({
                    ...prev,
                    [errorField]: validationResult.error
                }));
                return;
            }

            const errorField = field === 'courseImageAssetPath' ? 'cardImage' : 'bannerImage';
            setImageErrors(prev => ({
                ...prev,
                [errorField]: ''
            }));

            const previewUrl = URL.createObjectURL(file);

            if (field === 'courseImageAssetPath') {
                setCardImagePreview(previewUrl);
                handleFieldChange(file, 'cardImage');
                handleFieldChange(previewUrl, 'cardImageAssetPath');
            } else if (field === 'bannerImageAssetPath') {
                setBannerImagePreview(previewUrl);
                handleFieldChange(file, 'bannerImage');
                handleFieldChange(previewUrl, 'bannerImageAssetPath');
            }
        } catch (error) {
            console.error('Image validation error:', error);
            const errorField = field === 'courseImageAssetPath' ? 'cardImage' : 'bannerImage';
            setImageErrors(prev => ({
                ...prev,
                [errorField]: 'Error validating image file.'
            }));
        }
    };

    const handleRemoveImage = (field) => {
        if (field === 'courseImageAssetPath') {
            setCardImagePreview('');
            handleFieldChange(null, 'cardImage');
            handleFieldChange('', 'cardImageAssetPath');
            setImageErrors(prev => ({
                ...prev,
                cardImage: ''
            }));
        } else if (field === 'bannerImageAssetPath') {
            setBannerImagePreview('');
            handleFieldChange(null, 'bannerImage');
            handleFieldChange('', 'bannerImageAssetPath');
            setImageErrors(prev => ({
                ...prev,
                bannerImage: ''
            }));
        }
    };

    const handleCreateNewCourse = (formData) => {
        console.log('Create New Course form data:', {
            ...formData,
            cardImage: formValues.cardImage,
            bannerImage: formValues.bannerImage,
            cardImageAssetPath: formValues.cardImageAssetPath,
            bannerImageAssetPath: formValues.bannerImageAssetPath
        });
    };

    const resetForm = () => {
        setFormValues(initialFormValues);
        setImageErrors({ cardImage: '', bannerImage: '' });
        setCardImagePreview('');
        setBannerImagePreview('');
    };

    return (
        <div className="create-new-course-form mt-4">
            <Container size="xl" className="pb-0 px-2">
                <Row>
                    <Col xs={12}>
                        <PSCourseForm
                            hideGeneralTab={false}
                            editedValues={formValues}
                            handleValuesChange={handleFieldChange}
                            onImageUpload={handleImageUpload}
                            onBannerImageUpload={handleImageUpload}
                            onRemoveImage={handleRemoveImage}
                            onFieldChange={handleFieldChange}
                            cardImagePreview={cardImagePreview}
                            bannerImagePreview={bannerImagePreview}
                            hasCardImage={Boolean(cardImagePreview)}
                            hasBannerImage={Boolean(bannerImagePreview)}
                            cardImageFile={formValues.cardImage}
                            bannerImageFile={formValues.bannerImage}
                            imageErrors={imageErrors}
                            onSubmit={handleCreateNewCourse}
                            onResetForm={resetForm}
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

CustomCreateNewCourseForm.propTypes = {
    editedValues: PropTypes.shape({
        org: PropTypes.string,
        courseId: PropTypes.string,
        run: PropTypes.string,
        selfPaced: PropTypes.bool,
        startDate: PropTypes.string,
    }).isRequired,
    courseSettings: PropTypes.shape({
        lmsLinkForAboutPage: PropTypes.string,
        marketingEnabled: PropTypes.bool,
        courseDisplayName: PropTypes.string,
        platformName: PropTypes.string,
    }),
    handleValuesChange: PropTypes.func,
};

CustomCreateNewCourseForm.defaultProps = {
    courseSettings: {},
    handleValuesChange: () => { },
};

export default CustomCreateNewCourseForm; 