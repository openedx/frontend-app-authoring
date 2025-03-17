import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Icon, Sheet, Stack,
} from '@openedx/paragon';

import { AutoGraph, Close, SchoolOutline } from '@openedx/paragon/icons';

const UnitAnalytics = ({ unitTitle, isUnitVerticalType, verticalBlocks }) => {
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
            {unitTitle}
          </h3>
          <hr />
          <h4>Component Analytics</h4>
          {isUnitVerticalType
            && verticalBlocks.length
            && verticalBlocks.map((c) => <div key={c.id}>{c.name} - {c.blockType}</div>)}
        </Stack>
      </Sheet>
    </>
  );
};

UnitAnalytics.propTypes = {
  unitTitle: PropTypes.string.isRequired,
  isUnitVerticalType: PropTypes.bool.isRequired,
  verticalBlocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      blockId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      blockType: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default UnitAnalytics;
