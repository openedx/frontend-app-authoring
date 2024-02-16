import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Dropdown, Icon } from '@edx/paragon';
import {
  ArrowDropDown as ArrowDropDownIcon,
  ChevronRight as ChevronRightIcon,
} from '@edx/paragon/icons';

import { createCorrectInternalRoute } from '../../utils';
import { getCourseSectionVertical } from '../data/selectors';
import messages from './messages';

const Breadcrumbs = () => {
  const intl = useIntl();
  const { ancestorXblocks } = useSelector(getCourseSectionVertical);
  const [section, subsection] = ancestorXblocks ?? [];

  return (
    <nav className="d-flex align-center mb-2.5">
      <ol className="p-0 m-0 d-flex align-center">
        <li className="d-flex">
          <Dropdown>
            <Dropdown.Toggle id="breadcrumbs-dropdown-section" variant="link" className="p-0 text-primary small">
              <span className="small text-gray-700">{section.title}</span>
              <Icon
                src={ArrowDropDownIcon}
                className="text-primary ml-1"
              />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {section.children.map(({ url, displayName }) => (
                <Dropdown.Item
                  key={url}
                  href={createCorrectInternalRoute(url)}
                  className="small"
                  data-testid="breadcrumbs-section-dropdown-item"
                >
                  {displayName}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Icon
            src={ChevronRightIcon}
            size="md"
            className="text-primary mx-2"
            alt={intl.formatMessage(messages.altIconChevron)}
          />
        </li>
        <li className="d-flex">
          <Dropdown>
            <Dropdown.Toggle id="breadcrumbs-dropdown-subsection" variant="link" className="p-0 text-primary">
              <span className="small text-gray-700">{subsection.title}</span>
              <Icon
                src={ArrowDropDownIcon}
                className="text-primary ml-1"
              />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {subsection.children.map(({ url, displayName }) => (
                <Dropdown.Item
                  key={url}
                  href={createCorrectInternalRoute(url)}
                  className="small"
                  data-testid="breadcrumbs-subsection-dropdown-item"
                >
                  {displayName}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
