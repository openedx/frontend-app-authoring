import { COMPONENT_TYPES } from '../course-unit/constants';

const COMPONENT_TYPE_COLOR_MAP = {
  [COMPONENT_TYPES.advanced]: 'bg-other',
  [COMPONENT_TYPES.discussion]: 'bg-component',
  [COMPONENT_TYPES.library]: 'bg-component',
  [COMPONENT_TYPES.html]: 'bg-html',
  [COMPONENT_TYPES.openassessment]: 'bg-component',
  [COMPONENT_TYPES.problem]: 'bg-component',
  [COMPONENT_TYPES.video]: 'bg-video',
  [COMPONENT_TYPES.dragAndDrop]: 'bg-component',
  vertical: 'bg-vertical',
  sequential: 'bg-component',
  chapter: 'bg-component',
  collection: 'bg-collection',
};

export default COMPONENT_TYPE_COLOR_MAP;
