import Placeholder from './Placeholder';
import messages from './i18n/index';
import EditorPage from './editors/EditorPage';
import VideoSelectorPage from './editors/VideoSelectorPage';
import DraggableList, { SortableItem } from './editors/sharedComponents/DraggableList';
import ErrorAlert from './editors/sharedComponents/ErrorAlerts/ErrorAlert';
import Footer from './footer';
import { TinyMceWidget } from './editors/sharedComponents/TinyMceWidget';
import { prepareEditorRef } from './editors/sharedComponents/TinyMceWidget/hooks';

export {
  messages,
  EditorPage,
  VideoSelectorPage,
  DraggableList,
  SortableItem,
  ErrorAlert,
  Footer,
  TinyMceWidget,
  prepareEditorRef,
};
export default Placeholder;
