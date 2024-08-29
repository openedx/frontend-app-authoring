import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';

import RawEditor from '.';

jest.unmock('@openedx/paragon');

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <RawEditor {...props} />
  </IntlProvider>,
);
describe('RawEditor', () => {
  const defaultProps = {
    editorRef: {
      current: {
        value: 'Ref Value',
      },
    },
    content: { data: { data: 'eDiTablE Text HtmL' } },
    lang: 'html',
  };
  const xmlProps = {
    editorRef: {
      current: {
        value: 'Ref Value',
      },
    },
    content: { data: { data: 'eDiTablE Text XMl' } },
    lang: 'xml',
  };
  const noContentProps = {
    editorRef: {
      current: {
        value: 'Ref Value',
      },
    },
    content: null,
    lang: 'html',
    width: { width: '80%' },
  };

  it('renders as expected with default behavior', () => {
    renderComponent(defaultProps);
    expect(screen.getByRole('alert')).toBeVisible();

    expect(screen.getByText('eDiTablE Text HtmL')).toBeVisible();
  });

  it('updates the assets to static srcs', () => {
    const updatedProps = {
      ...defaultProps,
      content: 'pick <img src="/asset-v1:org+run+term+type@asset+block@img.jpeg" /> or <img src="/assets/courseware/v1/hash/asset-v1:org+run+term+type@asset+block/img2.jpeg" />',
    };
    renderComponent(updatedProps);
    expect(screen.getByText('"/static/img.jpeg"')).toBeVisible();

    expect(screen.getByText('"/static/img2.jpeg"')).toBeVisible();

    expect(screen.queryByText('"/asset-v1:org+run+term+type@asset+block@img.jpeg"')).toBeNull();

    expect(screen.queryByText('"/assets/courseware/v1/hash/asset-v1:org+run+term+type@asset+block/img2.jpeg"')).toBeNull();
  });

  it('renders as expected with lang equal to xml', () => {
    renderComponent(xmlProps);
    expect(screen.queryByRole('alert')).toBeNull();

    expect(screen.getByText('eDiTablE Text XMl')).toBeVisible();
  });

  it('renders as expected with content equal to null', () => {
    renderComponent(noContentProps);
    expect(screen.getByRole('alert')).toBeVisible();

    expect(screen.queryByTestId('code-editor')).toBeNull();
  });
});
