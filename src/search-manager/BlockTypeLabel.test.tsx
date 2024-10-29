import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import BlockTypeLabel from './BlockTypeLabel';
import messages from './messages';

const testCases = [
  {
    blockType: 'annotatable',
    count: undefined,
    expectedLabel: messages['blockType.annotatable'].defaultMessage,
  },
  {
    blockType: 'chapter',
    count: undefined,
    expectedLabel: messages['blockType.chapter'].defaultMessage,
  },
  {
    blockType: 'chapter',
    count: 10,
    expectedLabel: messages['blockType.chapter'].defaultMessage,
  },
  {
    blockType: 'drag-and-drop-v2',
    count: undefined,
    expectedLabel: messages['blockType.drag-and-drop-v2'].defaultMessage,
  },
  {
    blockType: 'multiplechoiceresponse',
    count: undefined,
    expectedLabel: messages['blockType.multiplechoiceresponse'].defaultMessage,
  },
  {
    blockType: 'html',
    count: undefined,
    expectedLabel: messages['blockType.html'].defaultMessage,
  },
  {
    blockType: 'collection',
    count: undefined,
    expectedLabel: messages['blockType.collection'].defaultMessage,
  },
  {
    blockType: 'collection',
    count: 0,
    expectedLabel: messages['blockType.collection'].defaultMessage,
  },
  {
    blockType: 'collection',
    count: 10,
    expectedLabel: 'Collection (10)',
  },
  // XBlock types without an explicit label are capitalized using the textTransform style
  {
    blockType: 'survey',
    count: undefined,
    expectedLabel: 'survey',
  },
];

describe('<BlockTypeLabel />', () => {
  test.each(testCases)(
    'render BlockTypeLabel for $blockType (count=$count)',
    ({ blockType, expectedLabel, count }) => {
      render(
        <IntlProvider locale="en">
          <BlockTypeLabel blockType={blockType} count={count} />
        </IntlProvider>,
      );
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    },
  );
});
