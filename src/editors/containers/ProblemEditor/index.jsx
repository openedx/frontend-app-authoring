import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spinner } from '@openedx/paragon';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import SelectTypeModal from './components/SelectTypeModal';
import EditProblemView from './components/EditProblemView';
import { selectors, thunkActions } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import messages from './messages';

export const ProblemEditor = ({
  onClose,
  returnFunction,
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

ProblemEditor.defaultProps = {
  returnFunction: null,
};
ProblemEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  returnFunction: PropTypes.func,
  // redux
  advancedSettingsFinished: PropTypes.bool.isRequired,
  blockFinished: PropTypes.bool.isRequired,
  blockFailed: PropTypes.bool.isRequired,
  problemType: PropTypes.string.isRequired,
  initializeProblemEditor: PropTypes.func.isRequired,
  blockValue: PropTypes.objectOf(PropTypes.shape({})).isRequired,
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

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ProblemEditor));
