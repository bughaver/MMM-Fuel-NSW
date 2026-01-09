# Troubleshooting

## Common Issues

### Module Not Loading

**Symptoms:**

- Module doesn't appear on MagicMirror
- Error messages in MagicMirror logs

**Solutions:**

1. **Check Configuration Syntax**

   ```bash
   # Validate config.js syntax
   node -c ~/MagicMirror/config/config.js
   ```

2. **Verify Module Installation**

   ```bash
   cd ~/MagicMirror/modules/MMM-Fuel-NSW
   ls -la  # Should see MMM-Fuel-NSW.js and node_helper.js
   ```

3. **Check File Permissions**

   ```bash
   chmod +x MMM-Fuel-NSW.js node_helper.js
   ```

4. **Restart MagicMirror**
   ```bash
   # From MagicMirror directory
   npm start
   ```

### Build Errors

**Symptoms:**

- `npm run build` fails
- TypeScript compilation errors

**Solutions:**

1. **Install Dependencies**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js Version**

   ```bash
   node --version  # Should be v14+
   ```

3. **Clear Build Cache**
   ```bash
   npm run build:clean
   npm run build
   ```

### No Fuel Data Displayed

**Symptoms:**

- Module loads but shows no stations
- Blank fuel price area

**Solutions:**

1. **Verify Location Coordinates**
   - Use Google Maps to confirm lat/long
   - Test with known Sydney coordinates: `lat: -33.8688, long: 151.2093`

2. **Check Fuel Type**

   ```bash
   # Get valid fuel types
   npm run get-valid-data
   ```

3. **Expand Search Radius**

   ```javascript
   config: {
       radius: 10,  // Increase from default 3km
       limit: 5     // Increase result limit
   }
   ```

4. **Check API Connectivity**
   ```bash
   curl "https://api.onegov.nsw.gov.au/FuelCheckApp/v1/fuel/prices?lat=-33.8688&lng=151.2093&fueltype=P95&radius=3"
   ```

### Invalid Configuration Errors

**Symptoms:**

- "Configuration validation failed" messages
- Module fails to initialize

**Common Issues:**

1. **Invalid Fuel Type**

   ```javascript
   // Wrong
   fuelType: 'premium';

   // Correct
   fuelType: 'P95';
   ```

2. **Invalid Brand Names**

   ```javascript
   // Check valid brands
   npm run get-valid-data

   // Example valid brands
   brands: ["Caltex", "Shell", "BP"]
   ```

3. **Coordinate Range Errors**

   ```javascript
   // Valid ranges
   lat: -90 to 90
   long: -180 to 180
   ```

4. **Update Interval Too Low**
   ```javascript
   // Minimum 120 seconds
   updateIntervalInSeconds: 120;
   ```

### Display Issues

**Symptoms:**

- Incorrect formatting
- Missing logos or information
- Alignment problems

**Solutions:**

1. **Logo Loading Issues**
   - Check internet connectivity
   - Verify brand names match exactly

2. **Styling Problems**

   ```javascript
   config: {
       borderStyle: "all",   // Reset borders
       alignment: "center"   // Reset alignment
   }
   ```

3. **Template Rendering**
   - Check browser console for JavaScript errors
   - Verify template files exist in `templates/` directory

### Performance Issues

**Symptoms:**

- Slow updates
- High CPU usage
- Memory leaks

**Solutions:**

1. **Increase Update Interval**

   ```javascript
   config: {
     updateIntervalInSeconds: 900; // 15 minutes
   }
   ```

2. **Reduce Result Limit**

   ```javascript
   config: {
     limit: 3; // Default is 3, don't exceed 10
   }
   ```

3. **Optimize Search Area**
   ```javascript
   config: {
     radius: 3; // Smaller radius = fewer results
   }
   ```

### API-Related Issues

**Symptoms:**

- "API request failed" errors
- Outdated price data
- Geographic boundary errors

**Solutions:**

1. **Rate Limiting**
   - Respect minimum update intervals
   - Avoid rapid configuration changes

2. **Network Issues**
   - Check firewall settings
   - Verify DNS resolution
   - Test with different networks

3. **Geographic Boundaries**
   - NSW Fuel API limited to New South Wales
   - Coordinates must be within NSW boundaries

## Debug Tools

### Enable Debug Logging

Add to MagicMirror config:

```javascript
config: {
    logging: {
        consoleLogs: true,
        fileLogs: true
    }
}
```

### Check Logs

```bash
# MagicMirror logs
tail -f ~/MagicMirror/logs/MagicMirror.log

# Browser console (F12)
# Check for JavaScript errors
```

### Test API Directly

```bash
# Test fuel API
curl "https://api.onegov.nsw.gov.au/FuelCheckApp/v1/fuel/prices?lat=-33.8688&lng=151.2093&fueltype=P95&radius=3" | jq .
```

### Validate Configuration

```javascript
// Test config with minimal setup
{
    module: 'MMM-Fuel-NSW',
    position: 'top_left',
    config: {
        lat: -33.8688,
        long: 151.2093,
        fuelType: 'P95',
        radius: 3,
        limit: 1
    }
}
```

## Getting Help

### Before Reporting Issues

1. **Update to Latest Version**

   ```bash
   cd ~/MagicMirror/modules/MMM-Fuel-NSW
   git pull
   npm install
   npm run build
   ```

2. **Test with Minimal Config**
   - Use the basic configuration example
   - Gradually add options to isolate issues

3. **Check Existing Issues**
   - Search GitHub issues for similar problems
   - Check closed issues for solutions

### Reporting Bugs

When creating a GitHub issue, include:

- **MagicMirror Version**
- **MMM-Fuel-NSW Version** (`git log --oneline -5`)
- **Configuration** (anonymize sensitive data)
- **Error Messages** (from logs)
- **Steps to Reproduce**
- **Expected vs Actual Behavior**

### Feature Requests

- Check if feature already exists
- Describe use case and benefits
- Provide examples if possible
- Consider submitting a pull request

## FAQ

**Q: Why do prices seem outdated?**
A: NSW Fuel API updates vary by station. Some update every few minutes, others hourly.

**Q: Can I use this outside NSW?**
A: No, the API is specific to New South Wales, Australia.

**Q: Why are some stations missing logos?**
A: Brand logo URLs may be unavailable or the brand name doesn't match exactly.

**Q: How often should I update?**
A: Balance between fresh data (5-10 minutes) and API load (15-30 minutes recommended).

**Q: Can I contribute translations?**
A: Yes! Check the `translations/` directory and submit pull requests.
