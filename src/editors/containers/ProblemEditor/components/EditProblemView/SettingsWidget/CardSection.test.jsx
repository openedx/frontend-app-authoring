import 'CourseAuthoring/editors/setupEditorTest';
import { shallow } from '@edx/react-unit-test-utils';
import CardSection from './CardSection';

describe('CardSection', () => {
  test('open', () => {
    expect(shallow(<CardSection summary="summary" isCardCollapsibleOpen><h1>Section Text</h1></CardSection>).snapshot).toMatchSnapshot();
  });

  test('closed', () => {
    expect(
      shallow(<CardSection isCardCollapsibleOpen={false}><h1>Section Text</h1></CardSection>).snapshot,
    ).toMatchSnapshot();
  });
});
