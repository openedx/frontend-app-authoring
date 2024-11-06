import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Dropdown, Icon } from '@openedx/paragon';
import {
  ArrowDropDown as ArrowDropDownIcon,
  ChevronRight as ChevronRightIcon,
} from '@openedx/paragon/icons';

import { getCourseSectionVertical } from '../data/selectors';
import { adoptCourseSectionUrl } from '../utils';
import messages from './messages';

const Breadcrumbs = ({ courseId, sequenceId }) => {
  const intl = useIntl();
  const { ancestorXblocks = [] } = useSelector(getCourseSectionVertical);

  return (
    <nav className="d-flex align-center mb-2.5">
      <ol className="p-0 m-0 d-flex align-center">
        {ancestorXblocks.map(({ children, title, isLast }) => (
          <li
            className="d-flex"
            key={title}
          >
            <Dropdown>
              <Dropdown.Toggle
                id="breadcrumbs-dropdown-section"
                variant="link"
                className="p-0 text-primary small"
              >
                <span className="small text-gray-700">
                  {title}
                </span>
                <Icon
                  src={ArrowDropDownIcon}
                  className="text-primary ml-1"
                />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {children.map(({ url, displayName }) => (
                  <Dropdown.Item
                    key={url}
                    href={adoptCourseSectionUrl({ url, courseId, sequenceId })}
                    className="small"
                    data-testid="breadcrumbs-section-dropdown-item"
                  >
                    {displayName}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {!isLast && (
              <Icon
                src={ChevronRightIcon}
                size="md"
                className="text-primary mx-2"
                alt={intl.formatMessage(messages.altIconChevron)}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
};

export default Breadcrumbs;
