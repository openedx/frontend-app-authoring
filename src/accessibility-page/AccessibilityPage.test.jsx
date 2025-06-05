// @ts-check
import { initializeMocks, render, screen } from '../testUtils';
import AccessibilityPage from './index';

const renderComponent = () => render(<AccessibilityPage />);

describe('<AccessibilityPolicyPage />', () => {
  describe('renders', () => {
    beforeEach(async () => {
      initializeMocks();
    });
    it('contains the policy body', () => {
      renderComponent();
      expect(screen.getByText('Individualized Accessibility Process for Course Creators')).toBeVisible();
    });
  });
});
