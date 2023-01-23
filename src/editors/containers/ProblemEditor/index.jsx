import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spinner } from '@edx/paragon';
import { injectIntl } from '@edx/frontend-platform/i18n';
import SelectTypeModal from './components/SelectTypeModal';
import EditProblemView from './components/EditProblemView';
import { selectors, thunkActions } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

export const ProblemEditor = ({
  onClose,
  // Redux
  problemType,
  blockFinished,
  studioViewFinished,
  blockValue,
  initializeProblemEditor,
}) => {
  React.useEffect(() => initializeProblemEditor(blockValue), [blockValue]);
  // TODO: INTL MSG, Add LOAD FAILED ERROR using BLOCKFAILED
  if (!blockFinished || !studioViewFinished) {
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
  // once data is loaded, init store

  if (problemType === null) {
    return (<SelectTypeModal onClose={onClose} />);
  }
  return (<EditProblemView onClose={onClose} />);
};

ProblemEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  // redux
  blockFinished: PropTypes.bool.isRequired,
  studioViewFinished: PropTypes.bool.isRequired,
  problemType: PropTypes.string.isRequired,
  initializeProblemEditor: PropTypes.func.isRequired,
  blockValue: PropTypes.objectOf(PropTypes.object).isRequired,
};

export const mapStateToProps = (state) => ({
  blockFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
  studioViewFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchStudioView }),
  problemType: selectors.problem.problemType(state),
  blockValue: selectors.app.blockValue(state),
});

export const mapDispatchToProps = {
  initializeProblemEditor: thunkActions.problem.initializeProblem,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ProblemEditor));
