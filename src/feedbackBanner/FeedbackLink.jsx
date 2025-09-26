import React, { useState, useEffect } from 'react';
import { Icon } from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import './feedbackLink.scss';


const FeedbackLink = ({ isOpen, setIsOpen }) => {
    const [bannerShow, setBannerShow] = useState(() => {
        const lastClosed = localStorage.getItem('bannerClosedTimestamp');
        if (lastClosed) {
            const timeDiff = Date.now() - parseInt(lastClosed, 10);
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            return hoursDiff >= 24;
        }
        return true;
    });

    const [isAnimating, setIsAnimating] = useState(false);

    const handleClose = () => {
        setIsAnimating(true); 
        setTimeout(() => {
            setBannerShow(false); 
            setIsAnimating(false); 
            localStorage.setItem('bannerClosedTimestamp', Date.now().toString());
        }, 1000); 
    };

    useEffect(() => {
        const checkBannerReset = () => {
            const lastClosed = localStorage.getItem('bannerClosedTimestamp');
            if (lastClosed) {
                const timeDiff = Date.now() - parseInt(lastClosed, 10);
                const hoursDiff = timeDiff / (1000 * 60 * 60);
                if (hoursDiff >= 24) {
                    localStorage.removeItem('bannerClosedTimestamp');
                    setBannerShow(true);
                }
            }
        };

        const interval = setInterval(checkBannerReset, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className={`feedback_banner ${bannerShow && !isAnimating ? 'showBanner' : isAnimating ? 'hideBanner' : ''}`}
            style={{ display: !bannerShow && !isAnimating ? 'none' : 'flex' }}
        >
            <span>You're using the new Studio (Beta). <span className='desktopview'>We're refining the experience.</span> Your</span>
            <a
                className='feedback_banner_button'
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
                aria-label={isOpen ? 'Close feedback form' : 'Open feedback form'}
            >
                feedback 
            </a>
            <span>helps us get it right.</span>

            <Icon
                src={Close}
                className="close_icon"
                onClick={handleClose}
                aria-label="Close feedback banner"
            />
        </div>
    );
};

export default FeedbackLink;
