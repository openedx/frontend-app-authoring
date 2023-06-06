import { useSelector } from 'react-redux';
import analyticsEvents from './constants';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { selectors } from '../../../../../../data/redux';

export const handleSocialSharingCheckboxChange = ({ updateField }) => {
  const analytics = useSelector(selectors.app.analytics);
  const allowVideoSharing = useSelector(selectors.video.allowVideoSharing);
  return (event) => {
    sendTrackEvent(
      analyticsEvents.socialSharingSettingChanged,
      {
        ...analytics,
        value: event.target.checked,
      }
    );
    updateField({
      allowVideoSharing: {
        ...allowVideoSharing,
        value: event.target.checked,
      },
    });
  };
};
