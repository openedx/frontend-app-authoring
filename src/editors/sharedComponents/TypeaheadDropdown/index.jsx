import React from 'react';
import {
  Icon,
  IconButton,
  Button,
  ActionRow,
} from '@openedx/paragon';
import { Add, ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
// eslint-disable-next-line import/no-unresolved
import onClickOutside from 'react-onclickoutside';
import FormGroup from './FormGroup';

class TypeaheadDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
      displayValue: '',
      icon: this.expandMoreButton(),
      dropDownItems: [],
    };

    this.handleFocus = this.handleFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.value !== nextProps.value && nextProps.value !== '') {
      const opt = this.props.options.find((o) => o === nextProps.value);
      if (opt && opt !== this.state.displayValue) {
        this.setState({ displayValue: opt });
      }
      return false;
    }

    return true;
  }

  // eslint-disable-next-line react/sort-comp
  getItems(strToFind = '') {
    let { options } = this.props;

    if (strToFind.length > 0) {
      options = options.filter((option) => (option.toLowerCase().includes(strToFind.toLowerCase())));
    }

    const sortedOptions = sortBy(options, (option) => option.toLowerCase());

    return sortedOptions.map((opt) => {
      let value = opt;
      if (value.length > 30) {
        value = value.substring(0, 30).concat('...');
      }

      return (
        <button
          type="button"
          className="dropdown-item data-hj-suppress"
          value={value}
          key={value}
          onClick={(e) => { this.handleItemClick(e); }}
        >
          {value}
        </button>
      );
    });
  }

  setValue(value) {
    if (this.props.value === value) {
      return;
    }

    if (this.props.handleChange) {
      this.props.handleChange(value);
    }

    const opt = this.props.options.find((o) => o === value);
    if (opt && opt !== this.state.displayValue) {
      this.setState({ displayValue: opt });
    }
  }

  setDisplayValue(value) {
    const normalized = value.toLowerCase();
    const opt = this.props.options.find((o) => o.toLowerCase() === normalized);
    if (opt) {
      this.setValue(opt);
      this.setState({ displayValue: opt });
    } else {
      this.setValue(value);
      this.setState({ displayValue: value });
    }
  }

  handleClick = (e) => {
    const dropDownItems = this.getItems(e.target.value);
    if (dropDownItems.length > 1) {
      this.setState({ dropDownItems, icon: this.expandLessButton() });
    }

    if (this.state.dropDownItems.length > 0) {
      this.setState({ dropDownItems: '', icon: this.expandMoreButton() });
    }
  };

  handleOnChange = (e) => {
    const findstr = e.target.value;

    if (findstr.length) {
      const filteredItems = this.getItems(findstr);
      this.setState({ dropDownItems: filteredItems, icon: this.expandLessButton() });
    } else {
      this.setState({ dropDownItems: '', icon: this.expandMoreButton() });
    }

    this.setDisplayValue(e.target.value);
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  handleClickOutside = () => {
    if (this.state.dropDownItems.length > 0) {
      this.setState(() => ({
        icon: this.expandMoreButton(),
        dropDownItems: '',
      }));
    }
  };

  handleExpandLess() {
    this.setState({ dropDownItems: '', icon: this.expandMoreButton() });
  }

  handleExpandMore(e) {
    const dropDownItems = this.getItems(e.target.value);
    this.setState({ dropDownItems, icon: this.expandLessButton() });
  }

  handleFocus(e) {
    this.setState({ isFocused: true });
    if (this.props.handleFocus) { this.props.handleFocus(e); }
  }

  handleOnBlur(e) {
    this.setState({ isFocused: false });
    if (this.props.handleBlur) { this.props.handleBlur(e); }
  }

  handleItemClick(e) {
    this.setValue(e.target.value);
    this.setState({ dropDownItems: '', icon: this.expandMoreButton() });
  }

  expandMoreButton() {
    return (
      <IconButton
        className="expand-more"
        data-testid="expand-more-button"
        src={ExpandMore}
        iconAs={Icon}
        size="sm"
        variant="secondary"
        alt="expand-more"
        onClick={(e) => { this.handleExpandMore(e); }}
      />
    );
  }

  expandLessButton() {
    return (
      <IconButton
        className="expand-less"
        data-testid="expand-less-button"
        src={ExpandLess}
        iconAs={Icon}
        size="sm"
        variant="secondary"
        alt="expand-less"
        onClick={(e) => { this.handleExpandLess(e); }}
      />
    );
  }

  render() {
    const noOptionsMessage = (
      <ActionRow className="p-2 pl-3">
        <div className="muted">{this.props.noOptionsMessage}</div>
        <ActionRow.Spacer />
        {this.props.allowNewOption && (
          <Button
            data-testid="add-option-button"
            iconBefore={Add}
            onClick={this.props.addNewOption}
          >
            {this.props.newOptionButtonLabel}
          </Button>
        )}
      </ActionRow>
    );
    const dropDownEmptyList = this.state.dropDownItems && this.state.isFocused ? noOptionsMessage : null;
    return (
      <div className="dropdown-group-wrapper">
        <FormGroup
          name={this.props.name}
          type="text"
          value={this.state.displayValue}
          readOnly={this.props.readOnly}
          controlClassName={this.props.controlClassName}
          errorMessage={this.props.errorMessage}
          trailingElement={this.state.icon}
          floatingLabel={this.props.floatingLabel}
          placeholder={this.props.placeholder}
          helpText={this.props.helpMessage}
          handleChange={this.handleOnChange}
          handleClick={this.handleClick}
          handleBlur={this.handleOnBlur}
          handleFocus={this.handleFocus}
          isFocused={this.state.isFocused}
        >
          <div
            data-testid="dropdown-container"
            className="dropdown-container mt-2 rounded bg-light-100 box-shadow-centered-1 mr-2"
            style={{ maxHeight: '300px', overflowY: 'scroll' }}
          >
            { this.state.dropDownItems.length > 0 ? this.state.dropDownItems : dropDownEmptyList }
          </div>
        </FormGroup>
      </div>
    );
  }
}

TypeaheadDropdown.defaultProps = {
  options: null,
  floatingLabel: null,
  handleFocus: null,
  handleChange: null,
  handleBlur: null,
  helpMessage: '',
  placeholder: '',
  value: null,
  errorMessage: null,
  readOnly: false,
  controlClassName: '',
  allowNewOption: false,
  newOptionButtonLabel: '',
  addNewOption: null,
};

TypeaheadDropdown.propTypes = {
  noOptionsMessage: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
  floatingLabel: PropTypes.string,
  handleFocus: PropTypes.func,
  handleChange: PropTypes.func,
  handleBlur: PropTypes.func,
  helpMessage: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  errorMessage: PropTypes.string,
  readOnly: PropTypes.bool,
  controlClassName: PropTypes.string,
  allowNewOption: PropTypes.bool,
  newOptionButtonLabel: PropTypes.string,
  addNewOption: PropTypes.func,
};

export default onClickOutside(TypeaheadDropdown);
