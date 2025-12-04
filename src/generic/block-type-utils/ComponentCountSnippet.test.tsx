import {
  initializeMocks, matchInnerText, render, screen,
} from '@src/testUtils';

import { ComponentCountSnippet } from '.';

describe('<ComponentCountSnippet>', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render the component', () => {
    render(<ComponentCountSnippet componentData={{ text: 1, video: 2 }} />);
    expect(screen.getByText('3 Total')).toBeInTheDocument();
    expect(screen.getByText(matchInnerText('DIV', 'text1'))).toBeInTheDocument();
    expect(screen.getByText(matchInnerText('DIV', 'video2'))).toBeInTheDocument();
  });
});
