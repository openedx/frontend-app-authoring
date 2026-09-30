import { getConfig } from '@edx/frontend-platform';
import { PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Route } from 'react-router-dom';

export const ROUTES_SLOT_ID = 'org.openedx.frontend.authoring.routes.v1';

interface RouteWidget {
  id: string;
  path: string;
  RenderWidget: React.ComponentType;
}

/**
 * Extra top-level routes contributed through `env.config.jsx`.
 *
 * Unlike a regular slot this does not render a <PluginSlot>: react-router needs <Route> elements as
 * direct children of the route tree, so this returns them for `createRoutesFromElements`.
 * Only `Insert` operations are supported.
 */
export const getPluginRoutes = () => {
  const { plugins = [] } = (getConfig() as any).pluginSlots?.[ROUTES_SLOT_ID] ?? {};
  return plugins
    .filter((plugin: any) => plugin.op === PLUGIN_OPERATIONS.Insert && plugin.widget?.path)
    .map(({ widget }: { widget: RouteWidget }) => (
      <Route key={widget.id} path={widget.path} element={<widget.RenderWidget />} />
    ));
};
