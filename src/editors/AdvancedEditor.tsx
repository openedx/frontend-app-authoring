import { LibraryBlock } from '../library-authoring/LibraryBlock';
import { EditorModalWrapper } from './containers/EditorContainer';

interface AdvancedEditorProps {
  usageKey: string,
  onClose: Function | null,
}

const AdvancedEditor = ({ usageKey, onClose }: AdvancedEditorProps) => (
  <EditorModalWrapper onClose={onClose as () => void}>
    <LibraryBlock
      usageKey={usageKey}
      view="studio_view"
    />
  </EditorModalWrapper>
);

export default AdvancedEditor;
