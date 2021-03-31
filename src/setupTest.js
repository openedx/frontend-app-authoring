import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

configure({ testIdAttribute: 'data-test-id' });
