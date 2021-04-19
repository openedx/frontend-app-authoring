import React, { createRef } from 'react';
import { act, render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import LegacyConfigForm from './LegacyConfigForm';

const defaultAppConfig = {
  id: 'legacy',
  divideByCohorts: false,
  divideCourseWideTopics: false,
  divideGeneralTopic: false,
  divideQuestionsForTAsTopic: false,
  allowAnonymousPosts: false,
  allowAnonymousPostsPeers: false,
  blackoutDates: '[]',
};

describe('LegacyConfigForm', () => {
  test('title rendering', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <LegacyConfigForm
          title="Test Legacy edX Discussions"
          appConfig={defaultAppConfig}
          onSubmit={jest.fn()}
          formRef={createRef()}
        />
      </IntlProvider>,
    );

    expect(container.querySelector('h3')).toHaveTextContent('Test Legacy edX Discussions');
  });
  test('calls onSubmit when the formRef is submitted', async () => {
    const formRef = createRef();
    const handleSubmit = jest.fn();

    render(
      <IntlProvider locale="en">
        <LegacyConfigForm
          title="Test Legacy edX Discussions"
          appConfig={defaultAppConfig}
          onSubmit={handleSubmit}
          formRef={formRef}
        />
      </IntlProvider>,
    );

    await act(async () => {
      formRef.current.submit();
    });
    expect(handleSubmit).toHaveBeenCalledWith(
      // Because we use defaultAppConfig as the initialValues of the form, and we haven't changed
      // any of the form inputs, this exact object shape is returned back to us, so we're reusing
      // it here.  It's not supposed to be 'the same object', it just happens to be.
      defaultAppConfig,
      // The second argument is a Formik object with all sorts of functions on it which we don't
      // care about.
      expect.anything(),
    );
  });

  test('default field states are correct, including removal of folded sub-fields', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <LegacyConfigForm
          title="Test Legacy edX Discussions"
          appConfig={defaultAppConfig}
          onSubmit={jest.fn()}
          formRef={createRef()}
        />
      </IntlProvider>,
    );

    // DivisionByGroupFields
    expect(container.querySelector('#divideByCohorts')).toBeInTheDocument();
    expect(container.querySelector('#divideByCohorts')).not.toBeChecked();
    expect(container.querySelector('#divideCourseWideTopics')).not.toBeInTheDocument();
    expect(container.querySelector('#divideGeneralTopic')).not.toBeInTheDocument();
    expect(container.querySelector('#divideQuestionsForTAsTopic')).not.toBeInTheDocument();

    // AnonymousPostingFields
    expect(container.querySelector('#allowAnonymousPosts')).toBeInTheDocument();
    expect(container.querySelector('#allowAnonymousPosts')).not.toBeChecked();
    expect(container.querySelector('#allowAnonymousPostsPeers')).not.toBeInTheDocument();

    // BlackoutDatesField
    expect(container.querySelector('#blackoutDates')).toBeInTheDocument();
    expect(container.querySelector('#blackoutDates')).toHaveValue('[]');
  });

  test('folded sub-fields are in the DOM when parents are enabled', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <LegacyConfigForm
          title="Test Legacy edX Discussions"
          appConfig={{
            ...defaultAppConfig,
            divideByCohorts: true,
            allowAnonymousPosts: true,
          }}
          onSubmit={jest.fn()}
          formRef={createRef()}
        />
      </IntlProvider>,
    );

    // DivisionByGroupFields
    expect(container.querySelector('#divideByCohorts')).toBeInTheDocument();
    expect(container.querySelector('#divideByCohorts')).toBeChecked();
    expect(container.querySelector('#divideCourseWideTopics')).toBeInTheDocument();
    expect(container.querySelector('#divideCourseWideTopics')).not.toBeChecked();
    expect(container.querySelector('#divideGeneralTopic')).toBeInTheDocument();
    expect(container.querySelector('#divideGeneralTopic')).not.toBeChecked();
    expect(container.querySelector('#divideQuestionsForTAsTopic')).toBeInTheDocument();
    expect(container.querySelector('#divideQuestionsForTAsTopic')).not.toBeChecked();

    // AnonymousPostingFields
    expect(container.querySelector('#allowAnonymousPosts')).toBeInTheDocument();
    expect(container.querySelector('#allowAnonymousPosts')).toBeChecked();
    expect(container.querySelector('#allowAnonymousPostsPeers')).toBeInTheDocument();
    expect(container.querySelector('#allowAnonymousPostsPeers')).not.toBeChecked();
  });
});
