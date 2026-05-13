# Location Finder App

A responsive web application built with **Material Design 3 (Material Web)** that allows users to search and view location details.

## Features

- 🔍 **Predictive Search**: Real-time search with dropdown suggestions using Material Filled Text Field
- ⚡ **Quick Actions**: One-tap actions for selected locations (navigate, call when available, copy ID, toggle help status)
- 🕘 **Recent Locations**: Automatically shows your latest selected locations for faster repeat tasks
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Material Design 3**: Modern UI using Google's official Material Web Components
- ⚡ **Fast**: Built with Vite for optimal performance
- 🔒 **Type-Safe**: Written in TypeScript
- 🎯 **Material Components**: Uses authentic Material Design components (Cards, Lists, Chips, Icons, Dividers)

## Material Design Components Used

- **md-filled-text-field**: Search input with Material Design styling
- **md-elevated-card**: Main card container with elevation
- **md-list** & **md-list-item**: Dropdown search results
- **md-assist-chip**: Status badges (Help Needed/No Help Needed)
- **md-icon**: Material Icons throughout the interface
- **md-divider**: Visual separation between sections

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will automatically open in your browser at `http://localhost:3000`.

### Build

Create a production build:

```bash
npm run build
```

### Test

Run unit tests:

```bash
npm run test
```

### Preview

Preview the production build:

```bash
npm run preview
```

## Usage

1. Type in the search box to find locations
2. A dropdown will appear with matching results as you type
3. Click on a result to view detailed information
4. The search matches against location IDs, names, and addresses

## Data Structure

The application reads from `src/data.json`. Each entry should follow this structure:

```json
{
  "locationId": {
    "name": "Location Name",
    "location": "Physical Address",
    "help": true/false,
    "phone": "+441234567890",
    "mapLabel": "Optional map search label"
  }
}
```

- **locationId**: Unique identifier for the location
- **name**: Display name of the location
- **location**: Physical address or description
- **help**: Boolean indicating if help is needed at this location
- **phone** *(optional)*: Phone number used to enable the Call quick action
- **mapLabel** *(optional)*: Override label used for map navigation queries

## Recent Locations Behavior

- Recent locations are stored in `localStorage` under `recent-location-ids`
- Recents are deduplicated and limited to 5 most recent items
- If browser storage is unavailable, the app continues to work without recents

## Technology Stack

- **TypeScript**: Type-safe JavaScript
- **Vite**: Next-generation frontend tooling
- **Material Design 3**: Google's latest design system
- **@material/web**: Official Material Web Components library
- **CSS3**: Modern styling with CSS custom properties (design tokens)

## Design Tokens

The application uses Material Design 3's color system with CSS custom properties:
- Primary colors for main actions and focus states
- Surface colors for backgrounds and containers
- Semantic colors for error states and success indicators
- Proper contrast ratios for accessibility

## Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px and above)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

