import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Icon, IconButton, Sheet, Stack,
} from '@openedx/paragon';

import { AutoGraph, Close, SchoolOutline } from '@openedx/paragon/icons';

const OutlineAnalytics = ({ hasSections, sections }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <Button
        variant={showSidebar ? 'primary' : 'outline-primary'}
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <Icon src={AutoGraph} />
        Analytics
      </Button>
      <Sheet
        position="right"
        show={showSidebar}
        onClose={() => setShowSidebar(false)}
      >
        <Stack>
          <div className="d-flex flex-row justify-content-between">
            <p className="font-weight-bold text-secondary">
              Analytics
              <Icon
                src={AutoGraph}
                className="d-inline-block align-middle ml-1"
                size="xs"
              />
            </p>

            <Button
              variant="outline-secondary"
              alt="Close"
              onClick={() => setShowSidebar(false)}
              size="xs"
            >
              <Icon src={Close} size="xs" />
            </Button>
          </div>
          <h3 className="h3">
            <Icon src={SchoolOutline} className="d-inline-block align-middle mr-1" />
            Course Outline
          </h3>
          <hr />
          <h4>Graded Subsection Analytics</h4>
          {hasSections
            && sections.length
            && sections.map((s) => <div key={s.id}>{s.displayName}</div>)}
        </Stack>
      </Sheet>
    </>
  );
};

OutlineAnalytics.propTypes = {
  hasSections: PropTypes.bool.isRequired,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default OutlineAnalytics;
