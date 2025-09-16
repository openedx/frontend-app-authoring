export type AppNavigation = {
  title?: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  activeIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive?: boolean;
};
