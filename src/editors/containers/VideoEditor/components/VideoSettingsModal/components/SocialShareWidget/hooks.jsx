import { useSelector } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { selectors } from '../../../../../../data/redux';
import { analyticsEvents } from './constants';

export const useTrackSocialSharingChange = ({ updateField }) => {
  const analytics = useSelector(selectors.app.analytics);
  const allowVideoSharing = useSelector(selectors.video.allowVideoSharing);
  return (event) => {
    sendTrackEvent(
      analyticsEvents.socialSharingSettingChanged,
      {
        ...analytics,
        value: event.target.checked,
      },
    );
    updateField({
      allowVideoSharing: {
        ...allowVideoSharing,
        value: event.target.checked,
      },
    });
  };
};

export default useTrackSocialSharingChange;
