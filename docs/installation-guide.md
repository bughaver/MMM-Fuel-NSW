# Installation Guide

## Prerequisites

- MagicMirror² installed and running
- Node.js (comes with MagicMirror)
- Internet connection for API access

## Step-by-Step Installation

### 1. Navigate to Modules Directory

```bash
cd ~/MagicMirror/modules
```

### 2. Clone the Repository

```bash
git clone https://github.com/bughaver/MMM-Fuel-NSW.git
```

### 3. Install Dependencies

```bash
cd MMM-Fuel-NSW
npm install
```

### 4. Build the Module

```bash
npm run build
```

### 5. Configure MagicMirror

Add the module to your `~/MagicMirror/config/config.js`:

```javascript
{
    module: 'MMM-Fuel-NSW',
    position: 'top_left',
    config: {
        lat: -33.8688,
        long: 151.2093
    }
}
```

### 6. Restart MagicMirror

```bash
# From MagicMirror root directory
npm start
```

## Getting Location Coordinates

### Using Google Maps

1. Open [Google Maps](https://maps.google.com) in your browser
2. Navigate to your home or work location
3. Right-click on the exact spot on the map
4. Select "What's here?" or look at the URL/search bar
5. Copy the coordinates (latitude,longitude) - e.g., `-33.8688,151.2093`

## Getting Valid Fuel Types and Brands

The module includes a helper script to fetch current valid fuel types and brand names from the NSW Fuel API:

```bash
cd MMM-Fuel-NSW
npm run get-valid-data
```

This will output JSON with current valid options:

```json
{
  "fuelTypes": ["P95", "E10", "DL", ...],
  "brands": ["Caltex", "Shell", "BP", ...]
}
```

Use these values in your configuration to ensure compatibility.

## Updating the Module

```bash
cd ~/MagicMirror/modules/MMM-Fuel-NSW
git pull
npm install
npm run build
```

## Troubleshooting Installation

### Build Fails

- Ensure Node.js is installed
- Check for missing dependencies: `npm install`
- Verify TypeScript is available

### Module Not Loading

- Check MagicMirror logs for errors
- Verify config.js syntax
- Ensure coordinates are valid numbers

### API Connection Issues

- Check internet connectivity
- Verify NSW Fuel API is accessible
- Review firewall settings

## Development Installation

For contributors:

```bash
git clone https://github.com/bughaver/MMM-Fuel-NSW.git
cd MMM-Fuel-NSW
npm install
npm run dev:watch  # For development with auto-rebuild
```
