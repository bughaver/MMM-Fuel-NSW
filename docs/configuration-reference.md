# Configuration Reference

## Basic Configuration

### Minimal Configuration

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

### Alternative with Bounding Box

```javascript
{
    module: 'MMM-Fuel-NSW',
    position: 'top_left',
    config: {
        bottomLeftLatitude: -33.9,
        bottomLeftLongitude: 151.1,
        topRightLatitude: -33.8,
        topRightLongitude: 151.3
    }
}
```

## Complete Configuration Options

| Option                    | Type      | Default     | Description                                  |
| ------------------------- | --------- | ----------- | -------------------------------------------- |
| `fuelType`                | `string`  | `'P95'`     | Fuel type code (see valid fuel types below)  |
| `brands`                  | `array`   | `[]`        | Array of brand names to filter by            |
| `radius`                  | `number`  | `3`         | Search radius in kilometers                  |
| `sortBy`                  | `string`  | `'price'`   | Sort by 'price' or 'distance'                |
| `limit`                   | `number`  | `3`         | Maximum number of stations to display        |
| `lat`                     | `number`  | `undefined` | Latitude for search center                   |
| `long`                    | `number`  | `undefined` | Longitude for search center                  |
| `bottomLeftLatitude`      | `number`  | `undefined` | Bounding box bottom-left latitude            |
| `bottomLeftLongitude`     | `number`  | `undefined` | Bounding box bottom-left longitude           |
| `topRightLatitude`        | `number`  | `undefined` | Bounding box top-right latitude              |
| `topRightLongitude`       | `number`  | `undefined` | Bounding box top-right longitude             |
| `updateIntervalInSeconds` | `number`  | `600`       | Update frequency (minimum 120)               |
| `maxWidth`                | `string`  | `'100%'`    | CSS width for the module                     |
| `showDistance`            | `boolean` | `true`      | Display distance to stations                 |
| `showAddress`             | `boolean` | `true`      | Display full station addresses               |
| `showLogo`                | `boolean` | `true`      | Display brand logos                          |
| `showOpenStatus`          | `boolean` | `true`      | Display open/closed status                   |
| `showFuelType`            | `boolean` | `true`      | Display fuel type next to price              |
| `showClosedStations`      | `boolean` | `true`      | Display stations that are currently closed   |
| `alignment`               | `string`  | `'center'`  | Text alignment: 'left', 'center', 'right'    |
| `borderStyle`             | `string`  | `'all'`     | Border style: 'none', 'individual', 'all'    |
| `showLastUpdate`          | `boolean` | `true`      | Display last update timestamp                |
| `displayMode`             | `string`  | `'list'`    | Display mode: 'list' or 'static'             |
| `showTankPrice`           | `number`  | `undefined` | Tank size in liters for full tank price calc |
| `priceUnit`               | `string`  | `'cents'`   | Price display unit: 'cents' or 'dollars'     |

## Location Configuration

### Coordinate-Based Search

Use latitude and longitude for circular search area:

```javascript
config: {
    lat: -33.8688,    // Sydney CBD
    long: 151.2093,   // Sydney CBD
    radius: 5         // 5km radius
}
```

### Bounding Box Search

Define a rectangular search area:

```javascript
config: {
    bottomLeftLatitude: -33.9,
    bottomLeftLongitude: 151.1,
    topRightLatitude: -33.8,
    topRightLongitude: 151.3
}
```

## Fuel Types and Brands

### Valid Fuel Types

Use `npm run get-valid-data` to get current values:

```json
["E10-U91", "E10", "U91", "E85", "P95-P98", "P95", "P98", "DL-PDL", "DL", "PDL", "B20", "EV", "LPG", "LNG", "H2", "CNG"]
```

### Valid Brands

```json
["7-Eleven", "AGL", "APCO", "Ampol", "BP", "Caltex", "Coles Express", "Shell", ...]
```

Example brand filtering:

```javascript
config: {
  brands: ['Caltex', 'Shell', 'BP'];
}
```

## Display Customization

### List Mode (Default)

Detailed display with all information:

```javascript
config: {
    displayMode: 'list',
    showDistance: true,
    showAddress: true,
    showLogo: true,
    showOpenStatus: true,
    showFuelType: true,
    alignment: 'center',
    borderStyle: 'all'
}
```

### Static Mode

Compact table format:

```javascript
config: {
    displayMode: 'static',
    showDistance: false,
    showAddress: false,
    showLogo: true,
    borderStyle: 'individual'
}
```

## Advanced Configuration

### High-Frequency Updates

```javascript
config: {
    updateIntervalInSeconds: 300,  // 5 minutes
    limit: 5,
    radius: 2
}
```

### Custom Styling

```javascript
config: {
    maxWidth: '600px',
    alignment: 'left',
    borderStyle: 'none',
    showLastUpdate: false
}
```

### Filtering Examples

```javascript
// Only premium unleaded, specific brands
config: {
    fuelType: 'P95',
    brands: ['Caltex', 'Shell'],
    limit: 3
}

// Diesel only, any brand
config: {
    fuelType: 'DL',
    brands: [],
    sortBy: 'distance'
}

// Show tank price for 50L tank
config: {
    showTankPrice: 50,
    limit: 5
}

// Display prices in cents (default)
config: {
    priceUnit: 'cents'
}

// Display prices in dollars with exact precision (e.g., "$1.6980")
config: {
    priceUnit: 'dollars'
}
```

## Configuration Validation

The module validates configuration on startup. Common issues:

- **Invalid coordinates**: Must be numbers within valid ranges
- **Invalid fuel types**: Must match NSW Fuel API values
- **Invalid brands**: Must match available brand names
- **Update interval too low**: Minimum 120 seconds
- **Missing location**: Must provide either coordinates or bounding box

Check MagicMirror logs for configuration errors.
