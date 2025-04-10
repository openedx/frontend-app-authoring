import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { EditProblemViewInternal as EditProblemView } from '.';
import { AnswerWidgetInternal as AnswerWidget } from './AnswerWidget';
import { ProblemTypeKeys } from '../../../../data/constants/problem';
import RawEditor from '../../../../sharedComponents/RawEditor';
import { formatMessage } from '../../../../testUtils';

describe('EditorProblemView component', () => {
  test('renders simple view', () => {
    const wrapper = shallow(<EditProblemView
      problemType={ProblemTypeKeys.SINGLESELECT}
      problemState={{}}
      assets={{}}
      intl={{ formatMessage }}
    />);
    expect(wrapper.snapshot).toMatchSnapshot();

    const AnswerWidgetComponent = wrapper.shallowWrapper.props.children[1].props.children[1].props.children;
    expect(AnswerWidgetComponent.props.problemType).toBe(ProblemTypeKeys.SINGLESELECT);
    expect(wrapper.instance.findByType(RawEditor).length).toBe(0);
  });

  test('renders raw editor for advanced problem type', () => {
    const wrapper = shallow(<EditProblemView
      problemType={ProblemTypeKeys.ADVANCED}
      isMarkdownEditorEnabled={false}
      problemState={{ rawOLX: '<problem>...</problem>' }}
      assets={{}}
      intl={{ formatMessage }}
    />);

    expect(wrapper.snapshot).toMatchSnapshot();

    const rawEditor = wrapper.instance.findByType(RawEditor);
    expect(rawEditor.length).toBe(1);
    expect(rawEditor[0].props.lang).toBe('xml');

    const answerWidget = wrapper.instance.findByType(AnswerWidget);
    expect(answerWidget.length).toBe(0); // since advanced problem type skips AnswerWidget
  });

  test('renders markdown editor when isMarkdownEditorEnabled is true', () => {
    const wrapper = shallow(<EditProblemView
      problemType={ProblemTypeKeys.SINGLESELECT}
      isMarkdownEditorEnabled
      problemState={{ rawMarkdown: '# Markdown content' }}
      assets={{}}
      intl={{ formatMessage }}
    />);

    expect(wrapper.snapshot).toMatchSnapshot();

    const rawEditor = wrapper.instance.findByType(RawEditor);
    expect(rawEditor.length).toBe(1);
    expect(rawEditor[0].props.lang).toBe('markdown');

    const answerWidget = wrapper.instance.findByType(AnswerWidget);
    expect(answerWidget.length).toBe(0); // since markdown view skips AnswerWidget
  });
});
