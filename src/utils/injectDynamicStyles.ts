interface ThemeBackground {
  type: 'color' | 'image';
  value: string;
}

interface ThemeColors {
  C1: string;
  C2: string;
  C3: string;
  C4: string;
  C5: string;
  C6: string;
  C7: string;
  C8: string;
  C9: string;
}

interface ThemeData {
  colors: ThemeColors;
  background: ThemeBackground
}

export function getDynamicStyles(themeData: ThemeData): string {
  const backgroundStyle = themeData.background.type === 'image' ? `url(${themeData.background.value})` : themeData.background.value;
  return `
        :root {
          --c1: ${themeData.colors.C1};
          --c2: ${themeData.colors.C2};
          --c3: ${themeData.colors.C3};
          --c4: ${themeData.colors.C4};
          --c5: ${themeData.colors.C5};
          --c6: ${themeData.colors.C6};
          --c7: ${themeData.colors.C7};
          --c8: ${themeData.colors.C8};
          --c9: ${themeData.colors.C9};
          --background: ${backgroundStyle};
        }
      `;
}
