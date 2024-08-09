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

  test('renders raw editor', () => {
    const wrapper = shallow(<EditProblemView
      problemType={ProblemTypeKeys.ADVANCED}
      problemState={{}}
      assets={{}}
      intl={{ formatMessage }}
    />);
    expect(wrapper.snapshot).toMatchSnapshot();
    expect(wrapper.instance.findByType(AnswerWidget).length).toBe(0);
    expect(wrapper.instance.findByType(RawEditor).length).toBe(1);
  });
});
