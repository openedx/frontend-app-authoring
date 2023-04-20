import React from 'react';
import { shallow } from 'enzyme';
import { EditProblemView } from '.';
import AnswerWidget from './AnswerWidget';
import { ProblemTypeKeys } from '../../../../data/constants/problem';
import RawEditor from '../../../../sharedComponents/RawEditor';
import { formatMessage } from '../../../../../testUtils';

describe('EditorProblemView component', () => {
  test('renders simple view', () => {
    const wrapper = shallow(<EditProblemView
      problemType={ProblemTypeKeys.SINGLESELECT}
      problemState={{}}
      assets={{}}
      intl={{ formatMessage }}
    />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(AnswerWidget).length).toBe(1);
    expect(wrapper.find(RawEditor).length).toBe(0);
  });

  test('renders raw editor', () => {
    const wrapper = shallow(<EditProblemView
      problemType={ProblemTypeKeys.ADVANCED}
      problemState={{}}
      assets={{}}
      intl={{ formatMessage }}
    />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(AnswerWidget).length).toBe(0);
    expect(wrapper.find(RawEditor).length).toBe(1);
  });
});
