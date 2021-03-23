import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-test-id' });
