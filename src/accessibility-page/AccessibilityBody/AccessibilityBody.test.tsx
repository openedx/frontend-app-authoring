import {
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';

import AccessibilityBody from './index';

const renderComponent = () => {
  render(
    <AccessibilityBody
      communityAccessibilityLink="http://example.com"
      email="example@example.com"
    />,
  );
};

describe('<AccessibilityBody />', () => {
  describe('renders', () => {
    beforeEach(async () => {
      initializeMocks();
    });
    it('contains links', () => {
      renderComponent();
      expect(screen.getAllByTestId('email-element')).toHaveLength(2);
      expect(screen.getAllByTestId('accessibility-page-link')).toHaveLength(1);
    });
  });
});
