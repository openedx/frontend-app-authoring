import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import MockAdapter from 'axios-mock-adapter';
import { waitFor } from '@testing-library/react';
import { DivisionSchemes } from '../../../data/constants';
import { LOADED } from '../../../data/slice';
import initializeStore from '../../../store';
import { executeThunk } from '../../../utils';
import { generateProvidersApiResponse, legacyApiResponse, piazzaApiResponse } from '../factories/mockApiResponses';
import { getDiscussionsProvidersUrl, getDiscussionsSettingsUrl } from './api';
import {
  DENIED, FAILED, SAVED, selectApp, updateValidationStatus,
} from './slice';
import { fetchDiscussionSettings, fetchProviders, saveProviderConfig } from './thunks';

const courseId = 'course-v1:edX+TestX+Test_Course';
const pagesAndResourcesPath = `/course/${courseId}/pages-and-resources`;
const mockedNavigator = jest.fn();

const featuresState = {
  'discussion-page': {
    id: 'discussion-page',
    featureSupportType: 'basic',
  },
  'embedded-course-sections': {
    id: 'embedded-course-sections',
    featureSupportType: 'full',
  },
  'wcag-2.1': {
    id: 'wcag-2.1',
    featureSupportType: 'partial',

  },
  'basic-configuration': {
    id: 'basic-configuration',
    featureSupportType: 'common',

  },
};

const featureIds = [
  'discussion-page',
  'embedded-course-sections',
  'wcag-2.1',
  'basic-configuration',
];

const legacyApp = {
  id: 'legacy',
  featureIds: [
    'discussion-page',
    'embedded-course-sections',
    'wcag-2.1',
  ],
  externalLinks: {
    learnMore: '',
    configuration: '',
    general: '',
    accessibility: '',
    contactEmail: '',
  },
  hasFullSupport: true,
  messages: [],
  adminOnlyConfig: false,
};

const piazzaApp = {
  id: 'piazza',
  adminOnlyConfig: false,
  featureIds: [
    'discussion-page',
    'embedded-course-sections',
    'wcag-2.1',
    'basic-configuration',
  ],
  externalLinks: {
    learnMore: '',
    configuration: '',
    general: '',
    accessibility: '',
    contactEmail: '',
  },
  hasFullSupport: false,
  messages: [],
};

let axiosMock;
let store;
let divideDiscussionIds;
let discussionTopicIds;

describe('Data layer integration tests', () => {
  beforeEach(() => {
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
    divideDiscussionIds = [
      '13f106c6-6735-4e84-b097-0456cff55960',
      'course',
    ];
    discussionTopicIds = [
      '13f106c6-6735-4e84-b097-0456cff55960',
      'course',
    ];
  });

  afterEach(() => {
    axiosMock.reset();
    jest.clearAllMocks();
  });

  describe('fetchProviders', () => {
    test('network error', async () => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).networkError();

      await executeThunk(fetchProviders(courseId), store.dispatch);

      expect(store.getState().discussions).toEqual(
        expect.objectContaining({
          appIds: [],
          featureIds: [],
          activeAppId: null,
          selectedAppId: null,
          status: FAILED,
          saveStatus: SAVED,
          hasValidationError: false,
        }),
      );
    });

    test('permission denied error', async () => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(403);

      await executeThunk(fetchProviders(courseId), store.dispatch);

      expect(store.getState().discussions).toEqual(
        expect.objectContaining({
          appIds: [],
          featureIds: [],
          activeAppId: null,
          selectedAppId: null,
          status: DENIED,
          saveStatus: SAVED,
          hasValidationError: false,
        }),
      );
    });

    test('successfully loads an LTI configuration', async () => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse());
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, piazzaApiResponse);

      await executeThunk(fetchProviders(courseId), store.dispatch);
      await executeThunk(fetchDiscussionSettings(courseId), store.dispatch);

      expect(store.getState().discussions).toEqual(expect.objectContaining({
        appIds: ['legacy', 'openedx', 'piazza', 'discourse'],
        featureIds,
        activeAppId: 'piazza',
        selectedAppId: null,
        status: LOADED,
        saveStatus: SAVED,
        hasValidationError: false,
        discussionTopicIds: [],
      }));
      expect(store.getState().models.apps.legacy).toEqual(legacyApp);
      expect(store.getState().models.apps.piazza).toEqual(piazzaApp);
      expect(store.getState().models.features).toEqual(featuresState);
      expect(store.getState().models.appConfigs.piazza).toEqual({
        id: 'piazza',
        consumerKey: 'client_key_123',
        consumerSecret: 'client_secret_123',
        launchUrl: 'https://localhost/example',
      });
    });

    test('successfully loads an LTI configuration with PII Sharing', async () => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse());
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, {
        ...piazzaApiResponse,
        lti_configuration: {
          ...piazzaApiResponse.lti_configuration,
          pii_share_username: true,
          pii_share_email: false,
          piiSharing: true,
        },
      });

      await executeThunk(fetchProviders(courseId), store.dispatch);
      await executeThunk(fetchDiscussionSettings(courseId), store.dispatch);

      expect(store.getState().discussions).toEqual(expect.objectContaining({
        appIds: ['legacy', 'openedx', 'piazza', 'discourse'],
        featureIds,
        activeAppId: 'piazza',
        selectedAppId: null,
        status: LOADED,
        saveStatus: SAVED,
        hasValidationError: false,
        discussionTopicIds: [],
      }));
      expect(store.getState().models.apps.legacy).toEqual(legacyApp);
      expect(store.getState().models.apps.piazza).toEqual(piazzaApp);
      expect(store.getState().models.features).toEqual(featuresState);
      expect(store.getState().models.appConfigs.piazza).toEqual({
        id: 'piazza',
        consumerKey: 'client_key_123',
        consumerSecret: 'client_secret_123',
        launchUrl: 'https://localhost/example',
      });
    });

    test('successfully loads a Legacy configuration', async () => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse(false, 'legacy'));
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, legacyApiResponse);

      await executeThunk(fetchProviders(courseId), store.dispatch);
      await executeThunk(fetchDiscussionSettings(courseId), store.dispatch);

      expect(store.getState().discussions).toEqual(expect.objectContaining({
        appIds: ['legacy', 'openedx', 'piazza', 'discourse'],
        featureIds,
        activeAppId: 'legacy',
        selectedAppId: null,
        status: LOADED,
        saveStatus: SAVED,
        hasValidationError: false,
        discussionTopicIds,
        divideDiscussionIds: [],
      }));
      expect(store.getState().models.apps.legacy).toEqual(legacyApp);
      expect(store.getState().models.apps.piazza).toEqual(piazzaApp);
      expect(store.getState().models.features).toEqual(featuresState);
      expect(store.getState().models.appConfigs.legacy).toEqual({
        id: 'legacy',
        allowAnonymousPosts: false,
        allowAnonymousPostsPeers: false,
        reportedContentEmailNotifications: false,
        restrictedDates: [],
        // TODO: Note!  As of this writing, all the data below this line is NOT returned in the API
        // but we add it in during normalization.
        divisionScheme: DivisionSchemes.COHORT,
        divideByCohorts: false,
        alwaysDivideInlineDiscussions: false,
        allowDivisionByUnit: false,
        divideCourseTopicsByCohorts: false,
        cohortsEnabled: false,
      });
    });
  });

  describe('selectApp', () => {
    test('sets selectedAppId', () => {
      const appId = 'piazza';
      store.dispatch(selectApp({ appId }));

      expect(store.getState().discussions.selectedAppId).toEqual(appId);
    });
  });

  describe('updateValidationStatus', () => {
    test.each([true, false])('sets hasValidationError value to %s ', (hasError) => {
      store.dispatch(updateValidationStatus({ hasError }));

      expect(store.getState().discussions.hasValidationError).toEqual(hasError);
    });
  });

  describe('saveAppConfig', () => {
    test('network error', async () => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse());
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, piazzaApiResponse);
      axiosMock.onPost(getDiscussionsSettingsUrl(courseId)).networkError();

      // We call fetchProviders and selectApp here too just to get us into a real state.
      await executeThunk(fetchProviders(courseId), store.dispatch);
      await executeThunk(fetchDiscussionSettings(courseId), store.dispatch);
      store.dispatch(selectApp({ appId: 'piazza' }));
      await executeThunk(saveProviderConfig(courseId, 'piazza', {}, pagesAndResourcesPath, mockedNavigator), store.dispatch);

      expect(store.getState().discussions).toEqual(
        expect.objectContaining({
          appIds: ['legacy', 'openedx', 'piazza', 'discourse'],
          featureIds,
          activeAppId: 'piazza',
          selectedAppId: 'piazza',
          status: LOADED,
          saveStatus: FAILED,
          hasValidationError: false,
        }),
      );
    });

    test('permission denied error', async () => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse());
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, piazzaApiResponse);
      axiosMock.onPost(getDiscussionsSettingsUrl(courseId)).reply(403);

      // We call fetchProviders and selectApp here too just to get us into a real state.
      await executeThunk(fetchProviders(courseId), store.dispatch);
      store.dispatch(selectApp({ appId: 'piazza' }));
      await executeThunk(saveProviderConfig(courseId, 'piazza', {}, pagesAndResourcesPath, mockedNavigator), store.dispatch);

      expect(store.getState().discussions).toEqual(
        expect.objectContaining({
          appIds: ['legacy', 'openedx', 'piazza', 'discourse'],
          featureIds,
          activeAppId: 'piazza',
          selectedAppId: 'piazza',
          status: DENIED, // We set BOTH statuses to DENIED for saveProviderConfig - this removes the UI.
          saveStatus: DENIED,
          hasValidationError: false,
        }),
      );
    });

    test('successfully saves an LTI configuration', async () => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse());
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, piazzaApiResponse);
      axiosMock.onPost(getDiscussionsSettingsUrl(courseId), {
        context_key: courseId,
        enabled: true,
        lti_configuration: {
          lti_1p1_client_key: 'new_consumer_key',
          lti_1p1_client_secret: 'new_consumer_secret',
          lti_1p1_launch_url: 'http://localhost/new_launch_url',
          version: 'lti_1p1',
        },
        plugin_configuration: {},
        provider_type: 'piazza',
      }).reply(200, {
        ...piazzaApiResponse, // This uses the existing configuration but with a replacement
        // lti_configuration that matches what we tried to save.
        lti_configuration: {
          lti_1p1_client_key: 'new_consumer_key',
          lti_1p1_client_secret: 'new_consumer_secret',
          lti_1p1_launch_url: 'https://localhost/new_launch_url',
          version: 'lti_1p1',
        },
      });

      // We call fetchProviders and selectApp here too just to get us into a real state.
      await executeThunk(fetchProviders(courseId), store.dispatch);
      store.dispatch(selectApp({ appId: 'piazza' }));
      await executeThunk(saveProviderConfig(
        courseId,
        'piazza',
        {
          consumerKey: 'new_consumer_key',
          consumerSecret: 'new_consumer_secret',
          launchUrl: 'http://localhost/new_launch_url',
        },
        pagesAndResourcesPath,
        mockedNavigator,
      ), store.dispatch);

      waitFor(() => {
        expect(mockedNavigator).toHaveBeenCalledWith(pagesAndResourcesPath);
        expect(store.getState().discussions).toEqual(
          expect.objectContaining({
            appIds: ['legacy', 'openedx', 'piazza', 'discourse'],
            featureIds,
            activeAppId: 'piazza',
            selectedAppId: 'piazza',
            status: LOADED,
            saveStatus: SAVED,
            hasValidationError: false,
          }),
        );
        expect(store.getState().models.appConfigs.piazza).toEqual({
          id: 'piazza',
          consumerKey: 'new_consumer_key',
          consumerSecret: 'new_consumer_secret',
          launchUrl: 'https://localhost/new_launch_url',
        });
      });
    });

    test('successfully saves a Legacy configuration', async () => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse(false, 'legacy'));
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, legacyApiResponse);
      axiosMock.onPost(getDiscussionsSettingsUrl(courseId), {
        context_key: courseId,
        enabled: true,
        lti_configuration: {},
        plugin_configuration: {
          allow_anonymous: true,
          allow_anonymous_to_peers: true,
          reported_content_email_notifications: true,
          always_divide_inline_discussions: true,
          discussion_blackouts: [],
          division_scheme: DivisionSchemes.COHORT,
          discussion_topics: {
            Edx: { id: '13f106c6-6735-4e84-b097-0456cff55960' },
            General: { id: 'course' },
          },
          divided_course_wide_discussions: [
            '13f106c6-6735-4e84-b097-0456cff55960',
            'course',
          ],
        },
        provider_type: 'legacy',
      }).reply(200, {
        ...legacyApiResponse, // This uses the existing configuration but with a replacement
        // plugin_configuration that matches what we tried to save.
        plugin_configuration: {
          allow_anonymous: true,
          allow_anonymous_to_peers: true,
          reported_content_email_notifications: true,
          always_divide_inline_discussions: true,
          discussion_blackouts: [],
          division_scheme: DivisionSchemes.COHORT,
          discussion_topics: {
            Edx: { id: '13f106c6-6735-4e84-b097-0456cff55960' },
            General: { id: 'course' },
          },
          divided_course_wide_discussions: [
            '13f106c6-6735-4e84-b097-0456cff55960',
            'course',
          ],
        },
      });

      // We call fetchProviders and selectApp here too just to get us into a real state.
      await executeThunk(fetchProviders(courseId), store.dispatch);
      await executeThunk(fetchDiscussionSettings(courseId), store.dispatch);
      store.dispatch(selectApp({ appId: 'legacy' }));
      await executeThunk(saveProviderConfig(
        courseId,
        'legacy',
        {
          allowAnonymousPosts: true,
          allowAnonymousPostsPeers: true,
          reportedContentEmailNotifications: true,
          restrictedDates: [],
          // TODO: Note!  As of this writing, all the data below this line is NOT returned in the API
          // but we technically send it to the thunk, so here it is.
          divideByCohorts: true,
          allowDivisionsByUnit: true,
          alwaysDivideInlineDiscussions: true,
          divideCourseTopicsByCohorts: true,
          divisionScheme: DivisionSchemes.COHORT,
          divideDiscussionIds,
          discussionTopics: [
            { name: 'Edx', id: '13f106c6-6735-4e84-b097-0456cff55960' },
            { name: 'General', id: 'course' },
          ],
        },
        pagesAndResourcesPath,
        mockedNavigator,
      ), store.dispatch);
      waitFor(() => {
        expect(mockedNavigator).toHaveBeenCalledWith(pagesAndResourcesPath);
        expect(store.getState().discussions).toEqual(
          expect.objectContaining({
            appIds: ['legacy', 'openedx', 'piazza', 'discourse'],
            featureIds,
            activeAppId: 'legacy',
            selectedAppId: 'legacy',
            status: LOADED,
            saveStatus: SAVED,
            hasValidationError: false,
            divideDiscussionIds,
            discussionTopicIds,
          }),
        );
        expect(store.getState().models.appConfigs.legacy).toEqual({
          id: 'legacy',
          // These three fields should be updated.
          allowAnonymousPosts: true,
          allowAnonymousPostsPeers: true,
          reportedContentEmailNotifications: true,
          alwaysDivideInlineDiscussions: true,
          restrictedDates: [],
          // TODO: Note!  The values we tried to save were ignored, this test reflects what currently
          // happens, but NOT what we want to have happen!
          divideByCohorts: true,
          divisionScheme: DivisionSchemes.COHORT,
          cohortsEnabled: false,
          allowDivisionByUnit: false,
          divideCourseTopicsByCohorts: true,
        });
      });
    });
  });
});
