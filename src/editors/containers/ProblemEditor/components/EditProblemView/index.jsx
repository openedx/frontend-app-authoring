import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { Col, Container, Row } from '@edx/paragon';
import AnswerWidget from './AnswerWidget';
import SettingsWidget from './SettingsWidget';
import QuestionWidget from './QuestionWidget';
import { EditorContainer } from '../../../EditorContainer';
import { selectors } from '../../../../data/redux';
import ReactStateSettingsParser from '../../data/ReactStateSettingsParser';
import ReactStateOLXParser from '../../data/ReactStateOLXParser';

export const EditProblemView = ({
  problemType,
  problemState,
}) => {
  const parseState = (problem) => () => {
    const reactSettingsParser = new ReactStateSettingsParser(problem);
    const reactOLXParser = new ReactStateOLXParser({ problem });
    return {
      settings: reactSettingsParser.getSettings(),
      olx: reactOLXParser.buildOLX(),
    };
  };
  return (
    <EditorContainer getContent={parseState(problemState)}>
      <Container fluid>
        <Row>
          <Col xs={9}>
            <QuestionWidget />
            <AnswerWidget problemType={problemType} />
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
