import React, { useState } from 'react';
import { Check } from '@openedx/paragon/icons'; // Keep only the Check icon
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import './feedback.scss';

const Feedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    mood: '',
    feedbackType: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const moods = [
    { value: 'not_good', label: 'Not good', emoji: '😞', rating: 1, question: 'What didn’t work for you?' },
    { value: 'okay', label: 'Okay', emoji: '😐', rating: 2, question: 'What can we improve?' },
    { value: 'good', label: 'Good', emoji: '😊', rating: 3, question: 'What excited you most?' },
    { value: 'love_it', label: 'Love it', emoji: '❤️', rating: 4, question: 'What excited you most?' },
  ];

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
          used_dark_mode: window.matchMedia('(prefers-color-scheme: dark)').matches,
          feedback_time: new Date().toISOString(),
        },
        email: '',
        interface: 'studio',
      };

      const response = await httpClient.post(apiUrl, payload);
      if (response.status !== 200) throw new Error('API error');

      setSubmitStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus(null);
        setIsSubmitting(false);
        setFormData({
          mood: '',
          feedbackType: '',
          description: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setIsSubmitting(false);
      setFormData({
        mood: '',
        feedbackType: '',
        description: '',
      });
      setTimeout(() => {
        setSubmitStatus(null);
      }, 2000);
    }
  };

  return (
    <div className="feedback-container">
      <button
        className={`feedback-button vertical ${isOpen ? 'open' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            setFormData({
              mood: '',
              feedbackType: '',
              description: '',
            });
            setSubmitStatus(null);
          }
        }}
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
                <p>Thanks! Your feedback helps us make TELS Studio even better</p>
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
                    <div className="radio-group">
                      {['page', 'studio'].map((option) => (
                        <label key={option} className="radio-label">
                          <input
                            type="radio"
                            name="feedbackType"
                            value={option}
                            checked={formData.feedbackType === option}
                            onChange={handleInputChange}
                            className="radio-input"
                          />
                          {option === 'page' ? 'Feedback is about the page' : 'Feedback is about the new Studio experience'}
                        </label>
                      ))}
                    </div>
                  </div>

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
                          placeholder="Share your thoughts..."
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

export default Feedback;