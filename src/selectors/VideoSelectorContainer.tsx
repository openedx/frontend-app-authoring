import { useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import VideoSelectorPage from '../editors/VideoSelectorPage';

const VideoSelectorContainer = () => {
  const { blockId } = useParams();
  const { courseId } = useCourseAuthoringContext();
  return (
    <div className="selector-page">
      <VideoSelectorPage
        blockId={blockId}
        courseId={courseId}
        studioEndpointUrl={getConfig().STUDIO_BASE_URL}
        lmsEndpointUrl={getConfig().LMS_BASE_URL}
      />
    </div>
  );
};

export default VideoSelectorContainer;
