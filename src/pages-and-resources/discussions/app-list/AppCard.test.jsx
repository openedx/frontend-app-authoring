import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import AppCard from './AppCard';
import messages from './messages';
import '../data/__factories__/index';

describe('AppCard', () => {
  const partailSupportApp = Factory.build('app');
  const fullSupportApp = Factory.build('app', { hasFullSupport: true });
  const selected = true;

  test('checkbox input is checked when AppCard is selected', () => {
    render(
      <IntlProvider locale="en">
        <AppCard
          app={fullSupportApp}
          onClick={() => jest.fn()}
          selected={selected}
        />
      </IntlProvider>,
    );

    const radioInput = screen.getByRole('radio');
    expect(radioInput.getAttribute('aria-checked')).toBe(selected.toString());
    expect(screen.getByTestId('checkbox').checked).toBe(selected);
  });

  test('title, subtitle, and text from app are displayed', () => {
    const support = partailSupportApp.hasFullSupport
      ? messages.appFullSupport : messages.appPartialSupport;
    const title = messages[`appName-${partailSupportApp.id}`].defaultMessage;
    const subtitle = support.defaultMessage;
    const text = messages[`appDescription-${partailSupportApp.id}`].defaultMessage;

    render(
      <IntlProvider locale="en">
        <AppCard
          app={partailSupportApp}
          onClick={() => jest.fn()}
          selected={selected}
        />
      </IntlProvider>,
    );

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  test('full support message shown when hasFullSupport is true', () => {
    const subtitle = messages.appFullSupport.defaultMessage;

    render(
      <IntlProvider locale="en">
        <AppCard
          app={fullSupportApp}
          onClick={() => jest.fn()}
          selected={selected}
        />
      </IntlProvider>,
    );

    expect(screen.getByText(subtitle)).toHaveTextContent(subtitle);
  });

  test('partial support message shown when hasFullSupport is false', () => {
    const subtitle = messages.appPartialSupport.defaultMessage;

    render(
      <IntlProvider locale="en">
        <AppCard
          app={partailSupportApp}
          onClick={() => jest.fn()}
          selected={selected}
        />
      </IntlProvider>,
    );

    expect(screen.getByText(subtitle)).toHaveTextContent(subtitle);
  });
});
