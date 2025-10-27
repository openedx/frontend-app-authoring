import PropTypes from 'prop-types';
import './AIButton.scss';
import Aibutton from './ai.png';

const AIButton = ({ disabled, onClick, fieldName, fieldValue }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onClick(fieldName, fieldValue)}
    className="ai-button ml-2 p-0"
    aria-label={`AI button for ${fieldName}`}
  >
    <img
      src={Aibutton}
      alt="AI"
      className="ai-button-icon"
    />
  </button>
);

AIButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  fieldName: PropTypes.string.isRequired,
  fieldValue: PropTypes.any.isRequired,
};

export default AIButton;
