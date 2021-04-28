import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, queryByLabelText } from '@testing-library/react';

import AppCard from './AppCard';
import messages from './messages';

describe('AppCard', () => {
  let app;
  let selected;
  let wrapper;

  beforeEach(() => {
    selected = true;
    app = {
      id: 'legacy',
      hasFullSupport: false,
      featureIds: ['discussion-page', 'embedded-course-sections', 'wcag-2.1'],
    };

    wrapper = (data) => render(
      <IntlProvider locale="en">
        <AppCard
          app={data}
          onClick={() => jest.fn()}
          selected={selected}
        />
      </IntlProvider>,
    );
  });

  test('checkbox input is checked when AppCard is selected', () => {
    const labelText = new RegExp(`Select ${messages[`appName-${app.id}`].defaultMessage}`, 'i');
    const { container } = wrapper(app);

    expect(container.querySelector('[role="radio"]')).toBeChecked();
    expect(queryByLabelText(container, labelText, { selector: 'input' })).toBeChecked();
  });

  test('title, subtitle, and text from the app are displayed with partial support', () => {
    const title = messages[`appName-${app.id}`].defaultMessage;
    const subtitle = messages.appPartialSupport.defaultMessage;
    const text = messages[`appDescription-${app.id}`].defaultMessage;
    const { container } = wrapper(app);

    expect(container.querySelector('.card-title')).toHaveTextContent(title);
    expect(container.querySelector('.card-subtitle')).toHaveTextContent(subtitle);
    expect(container.querySelector('.card-text')).toHaveTextContent(text);
  });

  test('title, subtitle, and text from the app are displayed with full support', () => {
    const title = messages[`appName-${app.id}`].defaultMessage;
    const subtitle = messages.appFullSupport.defaultMessage;
    const text = messages[`appDescription-${app.id}`].defaultMessage;
    app.hasFullSupport = true;
    const { container } = wrapper(app);

    expect(container.querySelector('.card-title')).toHaveTextContent(title);
    expect(container.querySelector('.card-subtitle')).toHaveTextContent(subtitle);
    expect(container.querySelector('.card-text')).toHaveTextContent(text);
  });

  test('full support message shown when hasFullSupport is true', () => {
    const subtitle = messages.appFullSupport.defaultMessage;
    app.hasFullSupport = true;
    const { container } = wrapper(app);

    expect(container.querySelector('.card-subtitle')).toHaveTextContent(subtitle);
  });

  test('partial support message shown when hasFullSupport is false', () => {
    const subtitle = messages.appPartialSupport.defaultMessage;
    const { container } = wrapper(app);

    expect(container.querySelector('.card-subtitle')).toHaveTextContent(subtitle);
  });
});
