import { getConfig } from '@edx/frontend-platform';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';

import { getPluginRoutes, ROUTES_SLOT_ID } from '.';

jest.mock('@edx/frontend-platform', () => ({ getConfig: jest.fn() }));

const renderAt = (path: string) => {
  const router = createMemoryRouter(
    createRoutesFromElements(<Route>{getPluginRoutes()}</Route>),
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
};

describe('RoutesSlot', () => {
  it('renders nothing without configured plugins', () => {
    (getConfig as jest.Mock).mockReturnValue({});
    expect(getPluginRoutes()).toEqual([]);
  });

  it('turns Insert plugins into routes and ignores the rest', () => {
    (getConfig as jest.Mock).mockReturnValue({
      pluginSlots: {
        [ROUTES_SLOT_ID]: {
          plugins: [
            {
              op: PLUGIN_OPERATIONS.Insert,
              widget: { id: 'hello', type: DIRECT_PLUGIN, path: '/hello', RenderWidget: () => <p>hello page</p> },
            },
            { op: PLUGIN_OPERATIONS.Hide, widgetId: 'other' },
          ],
        },
      },
    });
    expect(getPluginRoutes()).toHaveLength(1);
    renderAt('/hello');
    expect(screen.getByText('hello page')).toBeInTheDocument();
  });
});
