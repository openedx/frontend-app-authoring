import { initializeMocks, render, screen } from '@src/testUtils';
import { NotificationStatusIcon } from './NotificationStatusIcon';

let mockCount = 0;

jest.mock('./hooks.ts', () => ({
  useDynamicHookShim: () => () => ({
    notificationAppData: {
      tabsCount: {
        count: mockCount,
      },
    },
  }),
}));

const renderComponent = () => render(
  <NotificationStatusIcon />,
);

describe('NotificationStatusIcon', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('should display a status icon', async () => {
    mockCount = 2;
    renderComponent();
    expect(await screen.findByText('2 notifications')).toBeInTheDocument();
  });

  test('check 1 notification text', async () => {
    mockCount = 1;
    renderComponent();
    expect(await screen.findByText('1 notification')).toBeInTheDocument();
  });

  test('should not display a status icon if 0 notifications', async () => {
    mockCount = 0;
    renderComponent();
    expect(await screen.findByTestId('redux-provider')).toBeEmptyDOMElement();
  });
});
