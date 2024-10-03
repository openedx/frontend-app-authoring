import React from 'react';
import { connect } from 'react-redux';
import { Spinner } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import SelectTypeModal from './components/SelectTypeModal';
import EditProblemView from './components/EditProblemView';
import { selectors, thunkActions } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import messages from './messages';
import { ProblemType } from '../../data/constants/problem';
import type { EditorComponent } from '../../EditorComponent';

export interface Props extends EditorComponent {
  // redux
  advancedSettingsFinished: boolean;
  blockFinished: boolean;
  blockFailed: boolean;
  /** null if this is a new problem */
  problemType: ProblemType | null;
  initializeProblemEditor: (blockValue: any) => void;
  blockValue: Record<string, any> | null;
}

const ProblemEditor: React.FC<Props> = ({
  onClose,
  returnFunction = null,
  // Redux
  problemType,
  blockFinished,
  blockFailed,
  blockValue,
  initializeProblemEditor,
  advancedSettingsFinished,
}) => {
  React.useEffect(() => {
    if (blockFinished && !blockFailed) {
      initializeProblemEditor(blockValue);
    }
  }, [blockFinished, blockFailed]);

  if (!blockFinished || !advancedSettingsFinished) {
    return (
      <div className="text-center p-6">
        <Spinner
          animation="border"
          className="m-3"
          screenreadertext="Loading Problem Editor"
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
    return (<SelectTypeModal {...{ onClose }} />);
  }
  return (<EditProblemView {...{ onClose, returnFunction }} />);
};

export const mapStateToProps = (state) => ({
  blockFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
  blockFailed: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  problemType: selectors.problem.problemType(state),
  blockValue: selectors.app.blockValue(state),
  advancedSettingsFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchAdvancedSettings }),
});

export const mapDispatchToProps = {
  initializeProblemEditor: thunkActions.problem.initializeProblem,
};

export const ProblemEditorInternal = ProblemEditor; // For testing only
export default connect(mapStateToProps, mapDispatchToProps)(ProblemEditor);
