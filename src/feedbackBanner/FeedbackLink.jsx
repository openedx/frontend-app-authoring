import React from 'react';
import './feedbackLink.scss';


const FeedbackLink = ({ isOpen, setIsOpen }) => {
    return (
        <div className="feedback_banner">
            <span>Beta Release - We're iterating fast!</span>
            <a
                className='feedback_banner_button'
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
                aria-label={isOpen ? 'Close feedback form' : 'Open feedback form'}
            >
                 Feedback
            </a>
        </div>
    );
};

export default FeedbackLink;