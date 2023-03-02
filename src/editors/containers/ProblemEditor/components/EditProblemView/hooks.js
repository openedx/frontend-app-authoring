import ReactStateSettingsParser from '../../data/ReactStateSettingsParser';
import ReactStateOLXParser from '../../data/ReactStateOLXParser';
import { setAssetToStaticUrl } from '../../../../sharedComponents/TinyMceWidget/hooks';

// eslint-disable-next-line import/prefer-default-export
export const parseState = ({
  problem,
  isAdvanced,
  ref,
  assets,
}) => () => {
  const reactSettingsParser = new ReactStateSettingsParser(problem);
  const reactOLXParser = new ReactStateOLXParser({ problem });
  const reactBuiltOlx = setAssetToStaticUrl({ editorValue: reactOLXParser.buildOLX(), assets });
  const rawOLX = ref?.current?.state.doc.toString();

  return {
    settings: reactSettingsParser.getSettings(),
    olx: isAdvanced ? rawOLX : reactBuiltOlx,
  };
};
