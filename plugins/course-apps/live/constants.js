// These logos are full-color raster images, so they are stored here as PNGs rather than being
// rendered via Paragon's (monochrome, SVG-only) <Icon> component.
import bbbLogo from './images/bbb.png';
import googleMeetLogo from './images/google-meet.png';
import microsoftTeamsLogo from './images/microsoft-teams.png';
import zoomLogo from './images/zoom.png';

export const iconsSrc = {
  googleMeet: googleMeetLogo,
  microsoftTeams: microsoftTeamsLogo,
  zoom: zoomLogo,
  bigBlueButton: bbbLogo,
};

export const providerNames = {
  zoom: 'Zoom',
  big_blue_button: 'BigBlueButton',
};

export const bbbPlanTypes = {
  free: 'Free',
  commercial: 'Commercial/self-hosted',
};
