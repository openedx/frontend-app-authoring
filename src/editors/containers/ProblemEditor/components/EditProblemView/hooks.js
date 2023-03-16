import 'tinymce';
import ReactStateSettingsParser from '../../data/ReactStateSettingsParser';
import ReactStateOLXParser from '../../data/ReactStateOLXParser';
import { setAssetToStaticUrl } from '../../../../sharedComponents/TinyMceWidget/hooks';

export const fetchEditorContent = ({ format }) => {
  const editorObject = { hints: [] };
  const EditorsArray = window.tinymce.editors;
  Object.entries(EditorsArray).forEach(([id, editor]) => {
    if (Number.isNaN(parseInt(id))) {
      if (id.startsWith('answer')) {
        const { answers } = editorObject;
        const answerId = id.substring(id.indexOf('-') + 1);
        editorObject.answers = { ...answers, [answerId]: editor.getContent({ format }) };
      } else if (id.includes('Feedback')) {
        const { selectedFeedback, unselectedFeedback, groupFeedback } = editorObject;
        const feedbackId = id.substring(id.indexOf('-') + 1);
        if (id.startsWith('selected')) {
          editorObject.selectedFeedback = { ...selectedFeedback, [feedbackId]: editor.getContent({ format }) };
        }
        if (id.startsWith('unselected')) {
          editorObject.unselectedFeedback = { ...unselectedFeedback, [feedbackId]: editor.getContent({ format }) };
        }
        if (id.startsWith('group')) {
          editorObject.groupFeedback = { ...groupFeedback, [feedbackId]: editor.getContent({ format }) };
        }
      } else if (id.startsWith('hint')) {
        const { hints } = editorObject;
        hints.push(editor.getContent({ format }));
      } else {
        editorObject[id] = editor.getContent();
      }
    }
  });
  return editorObject;
};

export const parseState = ({
  problem,
  isAdvanced,
  ref,
  assets,
  lmsEndpointUrl,
}) => () => {
  const editorObject = fetchEditorContent({ format: '' });
  const reactSettingsParser = new ReactStateSettingsParser(problem);
  const reactOLXParser = new ReactStateOLXParser({ problem, editorObject });
  const reactBuiltOlx = setAssetToStaticUrl({ editorValue: reactOLXParser.buildOLX(), assets, lmsEndpointUrl });
  const rawOLX = ref?.current?.state.doc.toString();
  return {
    settings: reactSettingsParser.getSettings(),
    olx: isAdvanced ? rawOLX : reactBuiltOlx,
  };
};
