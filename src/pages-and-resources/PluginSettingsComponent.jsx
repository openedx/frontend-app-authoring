import React from 'react';

/**
 * Dynamically load the Settings modal for a "Course App", and display it.
 * @param {{appId: string, history: {push: (url: string) => void}, backUrl: string}} props
 * @returns 
 */
export function CourseAppPluginSettings({ appId, history, backUrl }) {

  // We need to memoize this or it will get initialized hundreds of times:
  const SettingsComponent = React.useMemo(() =>
    React.lazy(async () => {
      try {
        // There seems to be a bug in babel-eslint that causes the checker to crash with the following error
        // if we use a template string here:
        //     TypeError: Cannot read property 'range' of null with using template strings here.
        // Ref: https://github.com/babel/babel-eslint/issues/530
        return await import('@openedx-plugins/course-app-' + appId + '/Settings.jsx'); // eslint-disable-line
      } catch (error) {
        console.trace(error); // eslint-disable-line no-console
        return null;
      }
    }),
    [appId]
  );

  return (
    <React.Suspense fallback="...">
      <SettingsComponent onClose={() => history.push(backUrl)} />
    </React.Suspense>
  );
}
