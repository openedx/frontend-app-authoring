export interface ImageDimensions {
  width: string | number;
  height: string | number;
}

export interface OrigImageDimensions {
  width: number;
  height: number;
}

export interface AltText {
  altText: string;
  isDecorative: boolean;
}

export interface ImageConfig extends ImageDimensions, AltText {
  isLocked: boolean;
}
