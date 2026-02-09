import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  EditorState, selectors, actions, thunkActions,
} from '@src/editors/data/redux';
import { RequestKeys } from '@src/editors/data/constants/requests';
import { EditorComponent } from '@src/editors/EditorComponent';

import SelectTypeModal from './components/SelectTypeModal';
import EditProblemView from './components/EditProblemView';
import messages from './messages';
import * as hooks from './components/SelectTypeModal/hooks';

export interface Props extends EditorComponent {}

/**
 * Renders the form with all field to edit a problem
 *
 * When create a new problem, seet extraProps.problemType to skip the select step
 * and go directly to the edit page using the given problem type.
 */
const ProblemEditor: React.FC<Props> = ({
  onClose,
  returnFunction = null,
  extraProps = null,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const blockFinished = useSelector((state: EditorState) => selectors.app.shouldCreateBlock(state)
    || selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }));

  const blockFailed = useSelector(
    (state: EditorState) => selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  );

  const problemType = useSelector(selectors.problem.problemType);
  const blockValue = useSelector(selectors.app.blockValue);

  const updateField = React.useCallback((data) => dispatch(actions.problem.updateField(data)), [dispatch]);
  const setBlockTitle = React.useCallback((title) => dispatch(actions.app.setBlockTitle(title)), [dispatch]);

  const advancedSettingsFinished = useSelector((state: EditorState) => selectors.app.shouldCreateBlock(state)
    || selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchAdvancedSettings }));

  useEffect(() => {
    const run = async () => {
      if (blockFinished && !blockFailed) {
        // Await initialize problem and set a new problem type if applicable
        // oxlint-disable-next-line @typescript-eslint/await-thenable
        await dispatch(thunkActions.problem.initializeProblem(blockValue));

        if (extraProps?.problemType && extraProps.problemType !== 'advanced') {
          hooks.onSelect({
            selected: extraProps.problemType,
            updateField,
            setBlockTitle,
            defaultSettings: {},
            formatMessage: intl.formatMessage,
          })();
        }
      }
    };

    // eslint-disable-next-line no-void
    void run();
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
    return (<SelectTypeModal onClose={onClose} openAdvanced={extraProps?.problemType === 'advanced'} />);
  }

  return (<EditProblemView returnFunction={returnFunction} />);
};

export default ProblemEditor;
