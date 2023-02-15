import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { Container } from '@edx/paragon';

import AnswerWidget from './AnswerWidget';
import SettingsWidget from './SettingsWidget';
import QuestionWidget from './QuestionWidget';
import EditorContainer from '../../../EditorContainer';
import { selectors } from '../../../../data/redux';
import RawEditor from '../../../../sharedComponents/RawEditor';
import { ProblemTypeKeys } from '../../../../data/constants/problem';

import { parseState } from './hooks';
import './index.scss';

export const EditProblemView = ({
  problemType,
  problemState,
}) => {
  const editorRef = useRef(null);
  const isAdvancedProblemType = problemType === ProblemTypeKeys.ADVANCED;

  const getContent = parseState(problemState, isAdvancedProblemType, editorRef);

  return (
    <EditorContainer getContent={getContent}>
      <div className="editProblemView d-flex flex-row flex-nowrap justify-content-end">
        {isAdvancedProblemType ? (
          <Container fluid className="advancedEditorTopMargin p-0">
            <RawEditor editorRef={editorRef} lang="xml" content={problemState.rawOLX} />
          </Container>
        ) : (
          <span className="flex-grow-1">
            <QuestionWidget />
            <AnswerWidget problemType={problemType} />
          </span>
        )}
        <span className="editProblemView-settingsColumn">
          <SettingsWidget problemType={problemType} />
        </span>
      </div>
    </EditorContainer>
  );
};

EditProblemView.propTypes = {
  problemType: PropTypes.string.isRequired,
  // eslint-disable-next-line
  problemState: PropTypes.any.isRequired,
};

export const mapStateToProps = (state) => ({
  problemType: selectors.problem.problemType(state),
  problemState: selectors.problem.completeState(state),
});

export default connect(mapStateToProps)(EditProblemView);
