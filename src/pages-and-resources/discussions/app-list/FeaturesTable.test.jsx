import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, queryAllByText, queryAllByTestId } from '@testing-library/react';

import FeaturesTable from './FeaturesTable';
import messages from './messages';

describe('FeaturesTable', () => {
  let apps;
  let features;
  let container;

  beforeEach(() => {
    apps = [
      {
        documentationUrl: 'http://example.com',
        featureIds: ['discussion-page', 'embedded-course-sections', 'wcag-2.1'],
        hasFullSupport: false,
        id: 'legacy',
      },
      {
        documentationUrl: 'http://example.com',
        featureIds: ['discussion-page', 'lti'],
        hasFullSupport: false,
        id: 'piazza',
      }];

    features = [
      { id: 'lti' },
      { id: 'wcag-2.1' },
      { id: 'discussion-page' },
      { id: 'embedded-course-sections' },
    ];

    const wrapper = render(
      <IntlProvider locale="en">
        <FeaturesTable
          apps={apps}
          features={features}
        />
      </IntlProvider>,
    );
    container = wrapper.container;
  });

  test('displays a table, a thead, a tbody', () => {
    expect(container.querySelectorAll('table')).toHaveLength(1);
    expect(container.querySelectorAll('table > thead')).toHaveLength(1);
    expect(container.querySelectorAll('table > tbody')).toHaveLength(1);
  });

  test('displays a row for each available feature', () => {
    expect(container.querySelectorAll('tbody > tr')).toHaveLength(features.length);

    features.forEach((feature) => {
      const featureNodes = queryAllByText(
        container, messages[`featureName-${feature.id}`].defaultMessage,
      );
      expect(featureNodes.map(node => node.closest('tr'))).toHaveLength(1);
    });
  });

  test('apps columns receive a check for each feature they support', () => {
    features.forEach((feature) => {
      apps.forEach(app => {
        const columnId = `${app.id}-${feature.id.replaceAll('.', '-')}`;
        const columnCells = queryAllByTestId(container, columnId);

        if (app.featureIds.includes(feature.id)) {
          expect(columnCells.map(cell => cell.querySelectorAll('check-icon'))).toHaveLength(1);
        }
      });
    });
  });

  test('apps columns receive a dash for each unsupported feature', () => {
    features.forEach((feature) => {
      apps.forEach(app => {
        const columnId = `${app.id}-${feature.id.replaceAll('.', '-')}`;
        const columnCells = queryAllByTestId(container, columnId);

        if (!app.featureIds.includes(feature.id)) {
          expect(columnCells.map(cell => cell.querySelectorAll('remove-icon'))).toHaveLength(1);
        }
      });
    });
  });
});
