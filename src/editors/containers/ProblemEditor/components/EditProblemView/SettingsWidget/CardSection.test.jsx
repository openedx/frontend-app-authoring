import { shallow } from 'enzyme';
import CardSection from './CardSection';

describe('CardSection', () => {
  test('open', () => {
    expect(shallow(<CardSection summary="summary" isCardCollapsibleOpen><h1>Section Text</h1></CardSection>)).toMatchSnapshot();
  });

  test('closed', () => {
    expect(shallow(<CardSection isCardCollapsibleOpen={false}><h1>Section Text</h1></CardSection>)).toMatchSnapshot();
  });
});
