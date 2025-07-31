import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import SelectTypeModal from './components/SelectTypeModal';
import EditProblemView from './components/EditProblemView';
import { EditorState, selectors, thunkActions } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import messages from './messages';
import type { EditorComponent } from '../../EditorComponent';

export interface Props extends EditorComponent {}

const ProblemEditor: React.FC<Props> = ({
  onClose,
  returnFunction = null,
}) => {
  const dispatch = useDispatch();

  const blockFinished = useSelector((state: EditorState) => selectors.app.shouldCreateBlock(state)
    || selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }));

  const blockFailed = useSelector(
    (state: EditorState) => selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  );

  const problemType = useSelector(selectors.problem.problemType);
  const blockValue = useSelector(selectors.app.blockValue);

  const advancedSettingsFinished = useSelector((state: EditorState) => selectors.app.shouldCreateBlock(state)
    || selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchAdvancedSettings }));

  useEffect(() => {
    if (blockFinished && !blockFailed) {
      dispatch(thunkActions.problem.initializeProblem(blockValue));
    }
  }, [blockFinished, blockFailed, blockValue, dispatch]);

  if (!blockFinished || !advancedSettingsFinished) {
    return (
      <div className="text-center p-6">
        <Spinner
          animation="border"
          className="m-3"
          screenReaderText="Loading Problem Editor"
        />
      </div>
    );
  }

  if (blockFailed) {
    return (
      <div className="text-center p-6">
        <FormattedMessage {...messages.blockFailed} />
      </div>
    );
  }

  if (problemType === null) {
    return (<SelectTypeModal onClose={onClose} />);
  }

  return (<EditProblemView returnFunction={returnFunction} />);
};

export default ProblemEditor;
