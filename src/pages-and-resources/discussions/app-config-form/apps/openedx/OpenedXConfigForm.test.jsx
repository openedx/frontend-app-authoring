import React, { createRef } from 'react';

import {
  act,
  fireEvent,
  queryAllByText,
  queryByLabelText,
  queryByRole,
  queryByTestId,
  queryByText,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../../../../store';
import { executeThunk } from '../../../../../utils';
import { getDiscussionsProvidersUrl, getDiscussionsSettingsUrl } from '../../../data/api';
import { fetchDiscussionSettings, fetchProviders } from '../../../data/thunks';
import { generateProvidersApiResponse, legacyApiResponse } from '../../../factories/mockApiResponses';
import messages from '../../messages';
import OpenedXConfigForm from './OpenedXConfigForm';
import { selectApp } from '../../../data/slice';
import { DivisionSchemes } from '../../../../../data/constants';

const courseId = 'course-v1:edX+TestX+Test_Course';
const defaultAppConfig = (divideDiscussionIds = []) => ({
  id: 'legacy',
  divideByCohorts: false,
  divideCourseTopicsByCohorts: false,
  alwaysDivideInlineDiscussions: false,
  discussionTopics: [
    { name: 'Edx', id: '13f106c6-6735-4e84-b097-0456cff55960' },
    { name: 'General', id: 'course' },
  ],
  divideDiscussionIds,
  postingRestrictions: 'scheduled',
  enableGradedUnits: undefined,
  enableInContext: true,
  groupAtSubsection: false,
  unitLevelVisibility: true,
  allowAnonymousPosts: false,
  allowAnonymousPostsPeers: false,
  reportedContentEmailNotifications: false,
  allowDivisionByUnit: false,
  restrictedDates: [],
  cohortsEnabled: false,
});
describe('OpenedXConfigForm', () => {
  let axiosMock;
  let store;
  let container;

  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  const createComponent = (onSubmit = jest.fn(), formRef = createRef(), legacy = true) => {
    const wrapper = render(
      <AppProvider store={store}>
        <IntlProvider locale="en">
          <OpenedXConfigForm
            onSubmit={onSubmit}
            formRef={formRef}
            legacy={legacy}
          />
        </IntlProvider>
      </AppProvider>,
    );
    container = wrapper.container;
    return container;
  };

  const mockStore = async (mockResponse) => {
    axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse());
    axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, mockResponse);
    await executeThunk(fetchProviders(courseId), store.dispatch);
    await executeThunk(fetchDiscussionSettings(courseId), store.dispatch);
    store.dispatch(selectApp({ appId: 'legacy' }));
  };

  test('title rendering', async () => {
    await mockStore(legacyApiResponse);
    createComponent();
    expect(container.querySelector('h3')).toHaveTextContent('edX');
  });

  test('new Open edX provider config', async () => {
    await mockStore({ ...legacyApiResponse, enable_in_context: true });
    createComponent(jest.fn(), createRef(), false);
    expect(queryByText(container, messages.visibilityInContext.defaultMessage)).toBeInTheDocument();
    expect(queryByText(container, messages.gradedUnitPagesLabel.defaultMessage)).toBeInTheDocument();
    expect(queryByText(container, messages.groupInContextSubsectionLabel.defaultMessage)).toBeInTheDocument();
  });

  test('calls onSubmit when the formRef is submitted', async () => {
    const formRef = createRef();
    const handleSubmit = jest.fn();

    await mockStore(legacyApiResponse);
    createComponent(handleSubmit, formRef);

    await act(async () => {
      formRef.current.submit();
    });

    expect(handleSubmit).toHaveBeenCalledWith(
      // Because we use defaultAppConfig as the initialValues of the form, and we haven't changed
      // any of the form inputs, this exact object shape is returned back to us, so we're reusing
      // it here.  It's not supposed to be 'the same object', it just happens to be.
      {
        ...defaultAppConfig(),
        divideByCohorts: false,
        divisionScheme: DivisionSchemes.COHORT,
      },
    );
  });

  test('default field states are correct, including removal of folded sub-fields', async () => {
    await mockStore({
      ...legacyApiResponse,
      plugin_configuration: {
        ...legacyApiResponse.plugin_configuration,
        divided_course_wide_discussions: [],
        available_division_schemes: [],
      },
    });
    createComponent();
    const { divideDiscussionIds } = defaultAppConfig(['13f106c6-6735-4e84-b097-0456cff55960', 'course']);

    // DivisionByGroupFields

    expect(container.querySelector('#alert')).toBeInTheDocument();
    expect(container.querySelector('#divideByCohorts')).toBeInTheDocument();
    expect(container.querySelector('#divideByCohorts')).toBeDisabled();
    expect(container.querySelector('#divideCourseTopicsByCohorts')).not.toBeInTheDocument();

    divideDiscussionIds.forEach(id => expect(
      container.querySelector(`#checkbox-${id}`),
    ).not.toBeInTheDocument());

    // AnonymousPostingFields
    expect(
      container.querySelector('#allowAnonymousPostsPeers'),
    ).toBeInTheDocument();
    expect(container.querySelector('#allowAnonymousPostsPeers')).not.toBeChecked();

    // ReportedContentEmailNotifications
    expect(container.querySelector('#reportedContentEmailNotifications')).toBeInTheDocument();
    expect(container.querySelector('#reportedContentEmailNotifications')).not.toBeChecked();

    // Discussion Restriction Field
    expect(queryByText(container, messages.discussionRestrictionLabel.defaultMessage)).toBeInTheDocument();
  });

  test('folded sub-fields are in the DOM when parents are enabled', async () => {
    await mockStore({
      ...legacyApiResponse,
      plugin_configuration: {
        ...legacyApiResponse.plugin_configuration,
        allow_anonymous: true,
        reported_content_email_notifications: true,
        always_divide_inline_discussions: true,
        divided_course_wide_discussions: [],
        available_division_schemes: ['cohorts'],
      },
    });
    createComponent();
    const { divideDiscussionIds } = defaultAppConfig(['13f106c6-6735-4e84-b097-0456cff55960', 'course']);

    // DivisionByGroupFields
    expect(container.querySelector('#divideByCohorts')).toBeInTheDocument();
    expect(container.querySelector('#divideByCohorts')).not.toBeChecked();
    expect(
      container.querySelector('#divideCourseTopicsByCohorts'),
    ).not.toBeInTheDocument();
    divideDiscussionIds.forEach(id => expect(
      container.querySelector(`#checkbox-${id}`),
    ).not.toBeInTheDocument());

    // AnonymousPostingFields
    expect(
      container.querySelector('#allowAnonymousPostsPeers'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('#allowAnonymousPostsPeers'),
    ).not.toBeChecked();

    // ReportedContentEmailNotifications
    expect(container.querySelector('#reportedContentEmailNotifications')).toBeInTheDocument();
    expect(container.querySelector('#reportedContentEmailNotifications')).toBeChecked();
  });

  test(
    'folded discussion topics are in the DOM when divideByCohorts and divideCourseWideTopics are enabled',
    async () => {
      await mockStore({
        ...legacyApiResponse,
        plugin_configuration: {
          ...legacyApiResponse.plugin_configuration,
          allow_anonymous: true,
          reported_content_email_notifications: true,
          always_divide_inline_discussions: true,
          divided_course_wide_discussions: ['13f106c6-6735-4e84-b097-0456cff55960', 'course'],
        },
      });
      createComponent();
      const { divideDiscussionIds } = defaultAppConfig(['13f106c6-6735-4e84-b097-0456cff55960', 'course']);

      // DivisionByGroupFields
      expect(container.querySelector('#divideByCohorts')).toBeInTheDocument();
      expect(container.querySelector('#divideByCohorts')).not.toBeChecked();
      expect(container.querySelector('#divideCourseTopicsByCohorts')).not.toBeInTheDocument();
      divideDiscussionIds.forEach(id => {
        expect(container.querySelector(`#checkbox-${id}`)).not.toBeInTheDocument();
      });
    },
  );

  const updateTopicName = async (topicId, topicName) => {
    const topicCard = queryByTestId(container, topicId);

    await act(async () => { userEvent.click(queryByLabelText(topicCard, 'Expand')); });
    const topicInput = topicCard.querySelector('input');
    topicInput.focus();
    await act(async () => { fireEvent.change(topicInput, { target: { value: topicName } }); });
    topicInput.blur();

    return topicCard;
  };

  const assertTopicNameRequiredValidation = (topicCard, expectExists = true) => {
    const error = queryByText(topicCard, messages.discussionTopicRequired.defaultMessage);
    if (expectExists) { expect(error).toBeInTheDocument(); } else { expect(error).not.toBeInTheDocument(); }
  };

  const assertDuplicateTopicNameValidation = async (topicCard, expectExists = true) => {
    const error = queryByText(topicCard, messages.discussionTopicNameAlreadyExist.defaultMessage);
    if (expectExists) { expect(error).toBeInTheDocument(); } else { expect(error).not.toBeInTheDocument(); }
  };

  const assertHasErrorValidation = (expectExists = true) => {
    expect(store.getState().discussions.hasValidationError).toBe(expectExists);
  };

  test(
    'show required error on field when leaving empty topic name',
    async () => {
      await mockStore(legacyApiResponse);
      createComponent();

      const topicCard = await updateTopicName('13f106c6-6735-4e84-b097-0456cff55960', '');
      await waitForElementToBeRemoved(queryByText(topicCard, messages.addTopicHelpText.defaultMessage));
      assertTopicNameRequiredValidation(topicCard);
      assertHasErrorValidation();
    },
  );

  test('check field is not collapsible in case of error', async () => {
    await mockStore(legacyApiResponse);
    createComponent();

    const topicCard = await updateTopicName('13f106c6-6735-4e84-b097-0456cff55960', '');
    const collapseButton = queryByLabelText(topicCard, 'Collapse');
    await act(async () => userEvent.click(collapseButton));

    expect(collapseButton).toBeInTheDocument();
  });

  describe('Duplicate validation test cases', () => {
    let topicCard;
    let duplicateTopicCard;

    beforeEach(async () => {
      await mockStore(legacyApiResponse);
      createComponent();

      topicCard = await updateTopicName('course', 'edx');
      duplicateTopicCard = await updateTopicName('13f106c6-6735-4e84-b097-0456cff55960', 'EDX');
    });

    test('show duplicate errors on fields when passing duplicate topic name', async () => {
      await assertDuplicateTopicNameValidation(topicCard);
      await assertDuplicateTopicNameValidation(duplicateTopicCard);
      assertHasErrorValidation();
    });

    test('check duplicate error is removed on fields when name is fixed', async () => {
      const duplicateTopicInput = duplicateTopicCard.querySelector('input');
      duplicateTopicInput.focus();
      await act(async () => { userEvent.type(duplicateTopicInput, 'valid'); });
      duplicateTopicInput.blur();

      await waitForElementToBeRemoved(
        queryAllByText(topicCard, messages.discussionTopicNameAlreadyExist.defaultMessage),
      );

      await assertDuplicateTopicNameValidation(duplicateTopicCard, false);
      await assertDuplicateTopicNameValidation(topicCard, false);
      assertHasErrorValidation(false);
    });

    test('check duplicate error is removed on deleting duplicate topic', async () => {
      await act(async () => {
        userEvent.click(
          queryByLabelText(duplicateTopicCard, messages.deleteAltText.defaultMessage, { selector: 'button' }),
        );
      });

      await act(async () => {
        userEvent.click(
          queryByRole(container, 'button', { name: messages.deleteButton.defaultMessage }),
        );
      });

      await waitForElementToBeRemoved(queryByText(topicCard, messages.discussionTopicNameAlreadyExist.defaultMessage));

      expect(duplicateTopicCard).not.toBeInTheDocument();
      await assertDuplicateTopicNameValidation(topicCard, false);
      assertHasErrorValidation(false);
    });
  });
});
