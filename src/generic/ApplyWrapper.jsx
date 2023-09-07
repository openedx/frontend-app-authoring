const ApplyWrapper = ({ condition, wrapper, children }) => (condition ? wrapper(children) : children);

export default ApplyWrapper;
