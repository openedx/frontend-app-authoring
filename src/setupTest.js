import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-test-id' });
jest.mock('@edx/frontend-platform/auth');
getAuthenticatedHttpClient.mockReturnValue(axios);
