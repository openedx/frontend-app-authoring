import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import AppCard from './AppCard';
import messages from './messages';
import '../data/__factories__/index';

describe('AppCard', () => {
  let app;
  let selected;
  let wrapper;

  beforeEach(() => {
    app = Factory.build('app');
    selected = true;
    wrapper = (data) => {
      render(
        <IntlProvider locale="en">
          <AppCard
            app={data}
            onClick={() => jest.fn()}
            selected={selected}
          />
        </IntlProvider>,
      );
    };
  });

  test('checkbox input is checked when AppCard is selected', () => {
    wrapper(app);

    const radioInput = screen.getByRole('radio');
    expect(radioInput.getAttribute('aria-checked')).toBe(selected.toString());
    expect(screen.getByTestId('checkbox').checked).toBe(selected);
  });

  test.each(
    [
      ['partial', Factory.build('app')],
      ['full', Factory.build('app', { hasFullSupport: true })],
    ],
  )(
    'title, subtitle, and text from the app are displayed with %s support', (type, data) => {
      const support = data.hasFullSupport
        ? messages.appFullSupport : messages.appPartialSupport;
      const title = messages[`appName-${data.id}`].defaultMessage;
      const subtitle = support.defaultMessage;
      const text = messages[`appDescription-${data.id}`].defaultMessage;

      wrapper(data);

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
      expect(screen.getByText(text)).toBeInTheDocument();
    },
  );

  test('full support message shown when hasFullSupport is true', () => {
    const subtitle = messages.appFullSupport.defaultMessage;
    app.hasFullSupport = true;
    wrapper(app);

    expect(screen.getByText(subtitle)).toHaveTextContent(subtitle);
  });

  test('partial support message shown when hasFullSupport is false', () => {
    const subtitle = messages.appPartialSupport.defaultMessage;
    wrapper(app);

    expect(screen.getByText(subtitle)).toHaveTextContent(subtitle);
  });
});
