import PropsTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { Button } from '@openedx/paragon';
import { ContentCopy as ContentCopyIcon } from '@openedx/paragon/icons';

const PasteButton = ({ onClick, text, className }) => {
  const { blockId } = useParams();

  const handlePasteXBlockComponent = () => {
    onClick({ stagedContent: 'clipboard', parentLocator: blockId }, null, blockId);
  };

  return (
    <Button
      className={className}
      iconBefore={ContentCopyIcon}
      variant="outline-primary"
      block
      onClick={handlePasteXBlockComponent}
    >
      {text}
    </Button>
  );
};

PasteButton.propTypes = {
  onClick: PropsTypes.func.isRequired,
  text: PropsTypes.string.isRequired,
  className: PropsTypes.string,
};

PasteButton.defaultProps = {
  className: undefined,
};

export default PasteButton;
