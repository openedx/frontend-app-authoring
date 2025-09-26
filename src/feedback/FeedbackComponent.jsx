import React, { useState, useEffect } from 'react'; // Add useEffect import
import { Check } from '@openedx/paragon/icons';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import './feedbackComponent.scss';
import emoji1 from './emoji/emoji-1.png';
import emoji2 from './emoji/emoji-2.png';
import emoji3 from './emoji/emoji-3.png';
import emoji4 from './emoji/emoji-4.png';

const FeedbackComponent = ({ isOpen, setIsOpen }) => {
  const [formData, setFormData] = useState({
    mood: '',
    feedbackType: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const moods = [
    { value: 'not_good', label: 'Not good', emoji: <img src={emoji1} alt="Not good" />, rating: 1, question: 'What didn’t work for you?' },
    { value: 'okay', label: 'Okay', emoji: <img src={emoji2} alt="Okay" />, rating: 2, question: 'What can we improve?' },
    { value: 'good', label: 'Good', emoji: <img src={emoji3} alt="Good" />, rating: 3, question: 'What excited you most?' },
    { value: 'love_it', label: 'Love it', emoji: <img src={emoji4} alt="Love it" />, rating: 4, question: 'What excited you most?' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setFormData({ mood: '', feedbackType: '', description: '' });
      setSubmitStatus(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleMoodClick = (value) => {
    setFormData((prev) => ({ ...prev, mood: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mood) return;

    setIsSubmitting(true);
    try {
      const httpClient = getAuthenticatedHttpClient();
      const apiUrl = `${getConfig().LMS_BASE_URL}/feedback/api/v1/submit-feedback/`;

      const selectedMood = moods.find((m) => m.value === formData.mood);

      const payload = {
        satisfaction_rating: selectedMood.rating,
        experience: formData.description,
        feedback_for: formData.feedbackType || '',
        page_url: window.location.href,
        extra_responses: {
          used_dark_mode: '',
          feedback_time: '',
        },
        email: '',
        interface: 'studio',
      };

      const response = await httpClient.post(apiUrl, payload);
      if (response.status !== 200) throw new Error('API error');

      setSubmitStatus('success');
      setTimeout(() => {
        setIsOpen(false); // useEffect will handle reset
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setIsSubmitting(false);
      setFormData({ mood: '', feedbackType: '', description: '' });
      setTimeout(() => {
        setSubmitStatus(null);
      }, 2000);
    }
  };

  return (
    <div className="feedback-container">
      <button
        className={`feedback-button vertical ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close feedback form' : 'Open feedback form'}
      >
        <span className="text">{isOpen ? 'Close' : 'Feedback'}</span>
      </button>

      {isOpen && (
        <div className="feedback-form-container">
          <div className="feedback-body">
            {submitStatus === 'success' ? (
              <div className="success-message">
                <Check className="check-icon" />
                <p>Thank you! Your feedback helps us make your experience even better.</p>
              </div>
            ) : submitStatus === 'error' ? (
              <div className="error-message">
                <p>Something went wrong. Please try again.</p>
              </div>
            ) : (
              <>
                <div className="feedback-question">How's your experience with the new Studio?</div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <div className="mood-rating">
                      {moods.map((mood) => (
                        <div className="mood-icon-wrapper" key={mood.value}>
                          <span
                            className={`mood-icon ${formData.mood === mood.value ? 'selected' : ''}`}
                            onClick={() => handleMoodClick(mood.value)}
                            role="button"
                            tabIndex={0}
                            aria-label={mood.label}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleMoodClick(mood.value);
                              }
                            }}
                          >
                            {mood.emoji}
                          </span>
                          <span className="mood-tooltip">{mood.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="radio-group">
                      {['Feedback is about this page', 'Feedback is about the new Studio experience'].map((option) => (
                        <label key={option} className="radio-label">
                          <input
                            type="radio"
                            name="feedbackType"
                            value={option}
                            checked={formData.feedbackType === option}
                            onChange={handleInputChange}
                            className="radio-input"
                          />
                          {option === 'Feedback is about this page' ? 'Feedback is about this page' : 'Feedback is about the new Studio experience'}
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.mood && (
                    <>
                      <div className="form-group">
                        <label className="form-label">
                          {moods.find((m) => m.value === formData.mood).question}
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="form-textarea"
                          placeholder="Please share your thoughts"
                        />
                      </div>

                      <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting || !formData.mood}
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