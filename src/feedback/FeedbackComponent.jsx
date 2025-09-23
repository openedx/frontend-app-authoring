import React, { useState } from 'react';
import { Feedback as FeedbackIcon, Close, Star, Check } from '@openedx/paragon/icons';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import './FeedbackComponent.scss';

const FeedbackComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    satisfaction: 0,
    experience: '',
    issues: '',
    issueDescription: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleStarClick = (rating) => {
    setFormData((prev) => ({ ...prev, satisfaction: rating }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.satisfaction === 0) return;

    setIsSubmitting(true);
    try {
      const httpClient = getAuthenticatedHttpClient();
      const apiUrl = `${getConfig().LMS_BASE_URL}/feedback/api/v1/submit-feedback/`;
      
      const payload = {
        satisfaction_rating: formData.satisfaction,
        overall_experience: formData.experience,
        encountered_issues: formData.issues === 'Yes',
        issue_description: formData.issueDescription,
        page_url: window.location.href,
        interface: 'cms/studio',
      };

      const response = await httpClient.post(apiUrl, payload);
      if (response.status !== 200) throw new Error('API error');
      
      setSubmitStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus(null);
        setFormData({
          satisfaction: 0,
          experience: '',
          issues: '',
          issueDescription: '',
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setIsSubmitting(false);
      setFormData({
        satisfaction: 0,
        experience: '',
        issues: '',
        issueDescription: '',
      });
      setTimeout(() => {
        setSubmitStatus(null);
      }, 2000); 
    }
  };

  return (
    <div className="feedback-container">
      <button
        className={`feedback-button ${isOpen ? 'open' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            setFormData({
              satisfaction: 0,
              experience: '',
              issues: '',
              issueDescription: '',
            });
            setSubmitStatus(null);
          }
        }}
        aria-label={isOpen ? 'Close feedback' : 'Give feedback'}
      >
        <div className="icon">
          {isOpen ? <Close /> : <FeedbackIcon />}
        </div>
        {(isHovered || isOpen) && (
          <span className="text">{isOpen ? 'Close' : 'Feedback'}</span>
        )}
      </button>

      {isOpen && (
        <div className="feedback-form-container">
          <div className="feedback-header">We'd Love Your Feedback</div>
          <div className="feedback-body">
            {submitStatus === 'success' ? (
              <div className="success-message">
                <Check className="check-icon" />
                <p>Thank you for your feedback!</p>
              </div>
            ) : submitStatus === 'error' ? (
              <div className="error-message">
                <p>Something went wrong. Please try again.</p>
              </div>
            ) : (
              <>
                <p className="feedback-intro">
                  Your input is vital to improving our platform. Please take a moment to share your feedback.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label required">
                      How satisfied are you with the updated Studio/CMS interface?
                    </label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`star-icon ${formData.satisfaction >= star ? 'filled' : ''}`}
                          onClick={() => handleStarClick(star)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Rate ${star}`}
                        />
                      ))}
                    </div>
                  </div>

                  {formData.satisfaction > 0 && (
                    <>
                      <div className="form-group">
                        <label className="form-label">
                          Please share your overall experience with the new interface:
                        </label>
                        <textarea
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="form-textarea"
                          placeholder="Share your thoughts..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Did you encounter any issues while using the new interface?
                        </label>
                        <div className="radio-group">
                          {['Yes', 'No'].map((option) => (
                            <label key={option} className="radio-label">
                              <input
                                type="radio"
                                name="issues"
                                value={option}
                                checked={formData.issues === option}
                                onChange={handleInputChange}
                                className="radio-input"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>

                      {formData.issues === 'Yes' && (
                        <div className="form-group">
                          <label className="form-label">
                            If Yes, please describe the issue:
                          </label>
                          <textarea
                            name="issueDescription"
                            value={formData.issueDescription}
                            onChange={handleInputChange}
                            className="form-textarea"
                            placeholder="Describe the issue..."
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting || formData.satisfaction === 0}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner"></span>
                            Submitting...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    </>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;