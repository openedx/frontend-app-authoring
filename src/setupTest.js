import 'babel-polyfill';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-test-id' });
jest.mock('@edx/frontend-platform/auth');
getAuthenticatedHttpClient.mockReturnValue(axios);
