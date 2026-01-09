# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-10

### Features

- **Multiple Fuel Types Support**: Allow configuration of multiple fuel types as an array with full backwards compatibility for single fuel type configurations

## [1.0.0] - 2026-01-10

### Features

- **Initial Implementation**: Complete fuel price display module for NSW, Australia
- **Configurable Price Highlighting**: Add ability to highlight price changes with customizable colors
- **Full Tank Price Display**: Option to show total fuel cost for a full tank
- **Price Unit Configuration**: Switch between displaying prices in cents or dollars
- **Hide Closed Stations**: Configuration option to hide stations that are currently closed
- **Multiple Display Modes**: Support for both list and static display formats

### Fixes

- Fix fuel station names wrapping in list display
- Move status colors from prices to station names in static display
- Remove GitHub link references

### Refactoring

- Major code base restructure for better maintainability
- Consolidate types into single file
- Remove unused maxWidth config option
- Improve CSS alignment for static view

### Documentation

- Comprehensive README improvements
- Update documentation images
- Clean up documentation structure
- Improve wording and formatting

### Chores

- Update dependencies
- Add codeowners file
- Improve code readability
- Remove redundant tests
- Update build configuration
- Add gitignore entries
