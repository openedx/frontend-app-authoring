export const isVariantAdd = (variant) => variant === 'add';

export const getButtonProps = ({ variant, className, Add }) => {
  const variantClasses = {
    default: 'shared-button',
    add: 'shared-button pl-0 text-primary-500 button-variant-add',
  };
  const variantMap = {
    add: 'tertiary',
  };
  const classes = [variantClasses[variant]];
  if (className) { classes.push(className); }

  const iconProps = {};
  if (isVariantAdd(variant)) { iconProps.iconBefore = Add; }

  return {
    className: classes.join(' '),
    variant: variantMap[variant] || variant,
    ...iconProps,
  };
};
