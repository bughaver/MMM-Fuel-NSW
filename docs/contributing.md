# Contributing to MMM-Fuel-NSW

Thank you for your interest in contributing to MMM-Fuel-NSW! This document provides guidelines and information for contributors.

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please be respectful and constructive in all interactions.

## Ways to Contribute

### Bug Reports

- Use GitHub Issues to report bugs
- Include detailed steps to reproduce
- Provide configuration, error messages, and environment details
- Check existing issues first to avoid duplicates

### Feature Requests

- Open GitHub Issues with "Feature Request" label
- Describe the use case and benefits
- Provide examples or mockups if possible
- Consider if the feature fits the module's scope

### Code Contributions

- Fix bugs or implement features
- Improve documentation
- Add tests
- Refactor code for better maintainability

### Documentation

- Improve existing docs
- Translate to other languages
- Create tutorials or guides
- Update screenshots

## Development Commands

- `npm install` - Install dependencies
- `npm run build` - Build the module from TypeScript sources
- `npm run dev` - Build with source maps for development
- `npm run dev:watch` - Watch mode for development
- `npm run lint` - Run linting and formatter checks
- `npm run lint:fix` - Fix linting and formatter issues
- `npm test` - Run tests

## Development Setup

### Prerequisites

- **Node.js** v14 or higher
- **MagicMirror²** development environment
- **Git** for version control

### Local Development

1. **Fork and Clone**

   ```bash
   git clone https://github.com/yourusername/MMM-Fuel-NSW.git
   cd MMM-Fuel-NSW
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Development Build**

   ```bash
   # Watch mode for auto-rebuild
   npm run dev:watch

   # Or build once
   npm run build
   ```

4. **Testing**

   ```bash
   # Run all tests
   npm test

   # Run tests in watch mode
   npm run test:watch

   # Check code style
   npm run lint

   # Fix linting issues
   npm run lint:fix
   ```

### MagicMirror Integration

1. **Link Module** (recommended for development)

   ```bash
   # From MMM-Fuel-NSW directory
   ln -s $(pwd) ~/MagicMirror/modules/

   # Or copy to modules directory
   cp -r . ~/MagicMirror/modules/
   ```

2. **Basic Configuration**

   ```javascript
   // Add to ~/MagicMirror/config/config.js
   {
       module: 'MMM-Fuel-NSW',
       position: 'top_left',
       config: {
           lat: -33.8688,
           long: 151.2093,
           fuelType: 'P95'
       }
   }
   ```

3. **Start MagicMirror**
   ```bash
   cd ~/MagicMirror
   npm start
   ```

## Development Workflow

### 1. Choose an Issue

- Check GitHub Issues for open tasks
- Comment on issues you're working on
- Create issues for new features/bugs

### 2. Create Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description
```

### 3. Make Changes

- Write clean, readable code
- Follow existing code style
- Add/update tests
- Update documentation

### 4. Test Thoroughly

```bash
# Run test suite
npm test

# Manual testing in MagicMirror
# - Test various configurations
# - Check different display modes
# - Verify error handling
```

### 5. Commit Changes

Follow conventional commit format:

```bash
# Feature commits
git commit -m "feat: add fuel price comparison feature"

# Bug fixes
git commit -m "fix: resolve location parsing bug"

# Documentation
git commit -m "docs: update installation guide"

# Refactoring
git commit -m "refactor: simplify address processing logic"
```

### 6. Create Pull Request

- Push branch to your fork
- Create PR against main branch
- Fill out PR template completely
- Link to related issues
- Request review from maintainers

## Code Standards

### TypeScript/JavaScript

- **Strict TypeScript**: Full type safety required
- **ES6+ Features**: Use modern JavaScript features
- **Async/Await**: Prefer over Promise chains
- **Arrow Functions**: Use for concise expressions
- **Template Literals**: Prefer over string concatenation

### Code Style

- **ESLint**: All code must pass linting
- **Prettier**: Consistent formatting enforced
- **Descriptive Names**: Clear variable/function names
- **Comments**: Document complex logic, not obvious code

### File Organization

- **PascalCase**: Classes (`BackendService.ts`)
- **camelCase**: Variables/functions (`backendService`)
- **kebab-case**: Files (`fuel-api-connector.ts`)
- **Consistent Structure**: Follow existing patterns

### Imports

```typescript
// Order: external → internal → relative → types
import { Request } from 'express';
import { FuelStation } from '../../Types';
import { AddressUtils } from './Util/AddressUtils';
import type { RawFuelStation } from '../BackendTypes';
```

## Testing Guidelines

### Test Coverage

- **Unit Tests**: Individual functions/classes
- **Integration Tests**: Component interactions
- **E2E Tests**: Full user workflows
- **Target**: 100% code coverage

### Test Structure

```typescript
describe('LocationUtils', () => {
  describe('removeBrandPrefix', () => {
    it('should remove brand prefix from station name', () => {
      // Test implementation
    });
  });
});
```

### Test Best Practices

- **Descriptive Names**: Clear what each test validates
- **Arrange-Act-Assert**: Structure tests clearly
- **Independent Tests**: No test should depend on others
- **Fast Execution**: Tests should run quickly
- **Realistic Data**: Use representative test data

## Documentation

### Code Documentation

- **JSDoc**: Public APIs and complex functions
- **Inline Comments**: Complex business logic
- **README Updates**: For new features/configuration

### Examples

```typescript
/**
 * Removes brand prefix from fuel station name
 * @param name - Raw station name
 * @param brand - Brand name to remove
 * @returns Cleaned station name
 */
static removeBrandPrefix(name: string, brand?: string): string {
  // Implementation with inline comments for complex logic
}
```

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Code linting passes (`npm run lint`)
- [ ] Documentation updated
- [ ] Commit messages follow conventional format
- [ ] Branch is up to date with main

### PR Template

Fill out all sections:

- **Description**: What changes and why
- **Related Issues**: Links to issues this resolves
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes
- **Breaking Changes**: Any breaking changes

### Review Process

1. **Automated Checks**: CI tests and linting
2. **Code Review**: Maintainers review code
3. **Testing**: Manual testing may be requested
4. **Approval**: At least one maintainer approval
5. **Merge**: Squash merge with clean commit message

## Release Process

### Versioning

Follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

### Changelog

- **CHANGELOG.md**: Updated with each release
- **Release Notes**: Detailed in GitHub releases
- **Breaking Changes**: Clearly marked

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and help
- **Pull Request Comments**: Code review discussions

### Resources

- **Documentation**: Check the docs/ directory
- **Existing Code**: Study similar implementations
- **Tests**: Look at test examples
- **Issues**: Search for similar problems/solutions

## Recognition

Contributors are recognized in:

- CHANGELOG.md for significant contributions
- GitHub's contributor insights
- Release notes for major contributions

Thank you for contributing to MMM-Fuel-NSW! Your efforts help make this module better for the MagicMirror community.
