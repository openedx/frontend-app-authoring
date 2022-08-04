import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  render, queryAllByText, queryByText, getByRole,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeaturesList from './FeaturesList';
import messages from './messages';

describe('FeaturesList', () => {
  const app = {
    externalLinks: {},
    featureIds: ['discussion-page', 'embedded-course-sections', 'wcag-2.1'],
    hasFullSupport: false,
    id: 'legacy',
  };
  let container;

  beforeEach(() => {
    const wrapper = render(
      <IntlProvider locale="en">
        <FeaturesList
          app={app}
        />
      </IntlProvider>,
    );
    container = wrapper.container;
  });

  test('displays show app features message', () => {
    expect(queryByText(container, messages['supportedFeatureList-mobile-show'].defaultMessage)).toBeInTheDocument();
  });

  test('displays hide available feature message on expand', () => {
    const button = getByRole(container, 'button');
    userEvent.click(button);
    expect(queryByText(container, messages['supportedFeatureList-mobile-hide'].defaultMessage)).toBeInTheDocument();
  });

  test('displays a row for each available feature', () => {
    const button = getByRole(container, 'button');
    userEvent.click(button);
    app.featureIds.forEach((id) => {
      const featureNodes = queryAllByText(container, messages[`featureName-${id}`].defaultMessage);
      expect(featureNodes.map(node => node.closest('div'))).toHaveLength(1);
    });
  });

  test('A check icon is shown with each supported feature', () => {
    const button = getByRole(container, 'button');
    userEvent.click(button);
    app.featureIds.forEach((id) => {
      const featureElement = queryByText(container, messages[`featureName-${id}`].defaultMessage);
      expect(featureElement.querySelector('svg')).toHaveAttribute('id', 'check-icon');
    });
  });
});
