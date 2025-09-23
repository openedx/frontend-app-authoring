import styled from 'styled-components';
import { cn } from 'shared/lib/utils';

export type LoaderSize = 'tiny' | 'small' | 'medium' | 'large' | 'extraLarge';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  size?: LoaderSize;
  duration?: number;
}

export function Loader({
  color = '#D444F1',
  size = 'medium',
  duration = 1000,
  ...props
}: LoaderProps) {
  const sizeMap = {
    tiny: 2.4,
    small: 4,
    medium: 5.6,
    large: 7.2,
    extraLarge: 8.8,
  };

  const boxShadowMap = {
    tiny: [
      '6px 0px 0 0',
      '4.85px 3.55px 0 0',
      '1.8599999999999999px 5.7px 0 0',
      '-1.8599999999999999px 5.7px 0 0',
      '-4.85px 3.55px 0 0',
    ],
    small: [
      '10px 0px 0 0',
      '8.1px 5.9px 0 0',
      '3.1px 9.5px 0 0',
      '-3.1px 9.5px 0 0',
      '-8.1px 5.9px 0 0',
    ],
    medium: [
      '14px 0px 0 0',
      '11.35px 8.25px 0 0',
      '4.34px 13.3px 0 0',
      '-4.34px 13.3px 0 0',
      '-11.35px 8.25px 0 0',
    ],
    large: [
      '18px 0px 0 0',
      '14.6px 10.6px 0 0',
      '5.58px 17.1px 0 0',
      '-5.58px 17.1px 0 0',
      '-14.6px 10.6px 0 0',
    ],
    extraLarge: [
      '22px 0px 0 0',
      '17.8px 13px 0 0',
      '6.82px 20.9px 0 0',
      '-6.82px 20.9px 0 0',
      '-17.8px 13px 0 0',
    ],
  };

  const convertToRGB = (hex: string) => {
    const hexCode = hex.replace('#', '');
    const r = parseInt(hexCode.substring(0, 2), 16);
    const g = parseInt(hexCode.substring(2, 4), 16);
    const b = parseInt(hexCode.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  };

  const spinnerWrapperSize = sizeMap[size] * 7;
  const { className, ...rest } = props;
  const rgbColor = convertToRGB(color);

  return (
    <LoaderWrapper className="is-loader-wrapper">
      <SpinnerWrapper
        data-testid="spinner-wrapper"
        className={cn('is-spinner-wrapper', {
          'is-tiny-wrapper': size === 'tiny',
          'is-small-wrapper': size === 'small',
          'is-medium-wrapper': size === 'medium',
          'is-large-wrapper': size === 'large',
          'is-extra-large-wrapper': size === 'extraLarge',
        })}
        style={{ '--spinner-wrapper-size': `${spinnerWrapperSize}px` } as React.CSSProperties}
      >
        <Spinner
          data-testid="spinner"
          className={cn(
            'is-spinner',
            {
              'is-tiny': size === 'tiny',
              'is-small': size === 'small',
              'is-medium': size === 'medium',
              'is-large': size === 'large',
              'is-extra-large': size === 'extraLarge',
              'is-colored': color !== '#375de7',
            },
            className,
          )}
          style={
            {
              '--spinner-size': `${sizeMap[size]}px`,
              '--spinner-color': `rgb(${rgbColor})`,
              '--spinner-duration': `${duration}ms`,
              '--spinner-shadow': boxShadowMap[size]
                .map((boxShadow, index) => `rgba(${rgbColor}, ${0.2 * (index + 1)}) ${boxShadow}`)
                .join(', '),
            } as React.CSSProperties
          }
          {...rest}
        />
      </SpinnerWrapper>
    </LoaderWrapper>
  );
}

const LoaderWrapper = styled.div`
  display: inline-block;
`;

const SpinnerWrapper = styled.div`
  width: var(--spinner-wrapper-size);
  height: var(--spinner-wrapper-size);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Spinner = styled.div`
  width: var(--spinner-size);
  height: var(--spinner-size);
  border-radius: var(--spinner-size);
  box-shadow: var(--spinner-shadow);
  animation: spinner var(--spinner-duration) infinite linear;
  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }
`;
