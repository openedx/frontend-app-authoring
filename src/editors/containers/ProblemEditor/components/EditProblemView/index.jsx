import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { Col, Container, Row } from '@edx/paragon';
import AnswerWidget from './AnswerWidget';
import SettingsWidget from './SettingsWidget';
import QuestionWidget from './QuestionWidget';
import { EditorContainer } from '../../../EditorContainer';
import { selectors } from '../../../../data/redux';
import RawEditor from '../../../../sharedComponents/RawEditor';
import { ProblemTypeKeys } from '../../../../data/constants/problem';

import { parseState } from './hooks';

export const EditProblemView = ({
  problemType,
  problemState,
}) => {
  const editorRef = useRef(null);
  const isAdvancedProblemType = problemType === ProblemTypeKeys.ADVANCED;

  const getContent = parseState(problemState, isAdvancedProblemType, editorRef);

  return (
    <EditorContainer getContent={getContent}>
      <Container fluid>
        <Row>
          <Col xs={9}>
            {isAdvancedProblemType ? (
              <RawEditor editorRef={editorRef} lang="xml" content={problemState.rawOLX} />
            ) : (
              <>
                <QuestionWidget />
                <AnswerWidget problemType={problemType} />
              </>
            )}
          </Col>
          <Col xs={3}>
            <SettingsWidget problemType={problemType} />
          </Col>
        </Row>
      </Container>
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
