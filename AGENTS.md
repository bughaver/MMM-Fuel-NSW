# Agent Information for MagicMirror Development

## Fuel NSW Module

### Overview

This document contains information for working on the Fuel NSW module within the MagicMirror project.

#### Important Paths

- **Fuel NSW module**: `.` (current directory)
- **Config file**: `../../config/config.js` (you don't need to ask for permission to access this file)
- **Reference module**: `../MMM-Jast` (for style and implementation inspiration)

#### Codebase Understanding

- **src/backend/**: Node.js server-side logic, API calls, data processing
- **src/frontend/**: Client-side JavaScript for MagicMirror module display
- **src/types/**: TypeScript interfaces and type definitions
- **templates/**: Nunjucks templates for HTML generation
- **MMM-Fuel-NSW.js**: Main module file (generated from src/frontend/)
- **node_helper.js**: Backend helper (generated from src/backend/)

### Terminal

The terminal commands in this file were written to work with Git Bash (default shell). Commands use Unix-style paths and may need adjustment for Windows PowerShell/CMD.

### Development Workflow

The Magic Mirror project hotloads the server so you don't need to restart the server after making changes.

#### Before Making Changes

1. View the webpage using the MCP to examine the current state
2. Analyze the current state to understand how changes should be made
3. Plan the solution based on the current state

#### Making Changes

1. Implement the necessary changes to the Fuel NSW module code
2. Build the module to generate JavaScript files

#### After Making Changes

1. View the webpage using the MCP to verify that the changes have been implemented correctly (page needs to be reloaded to see the changes)
2. Ask if it has been implemented correctly or if changes are necessary

### Build Process

_Rhis is only required when making changes to src/_

To build the Fuel NSW module, run the following command from this directory:

```
npm run build
```

This compiles TypeScript files and generates the required JavaScript files for MagicMirror.

**Troubleshooting:** Check TypeScript errors or reinstall dependencies if build fails.

### Docker Container Control

**Note:**

- All `docker-compose` commands must be run from the MagicMirror root directory `c:\Dev\MagicMirror` (where docker-compose.yml is located).
- Use `(cd /c/Dev/MagicMirror && <command>)` to execute commands from the MagicMirror root directory

#### Start the container:

```
(cd /c/Dev/MagicMirror && docker-compose up -d)
```

#### Stop the container:

```
(cd /c/Dev/MagicMirror && docker-compose down)
```

#### Restart the container:

```
(cd /c/Dev/MagicMirror && docker-compose restart)
```

#### View container logs:

```
(cd /c/Dev/MagicMirror && docker-compose logs -f)
```

### MCP Usage

Use `playwright` or `chrome-devtools`

- The MCP can be used to navigate the browser
- Always use this for validating changes
- Make sure to reload the browser after you make changes and wait 1 second
- Access MagicMirror at http://localhost:8080

### Development Tasks & Tool Usage

#### When Making Changes:

- **Read source files first**: Use `read_file` on `src/` files to understand current implementation
- **Check types**: Review `src/types/` for interfaces and data structures
- **Examine tests**: Look at test files to understand expected behavior
- **Build and verify**: Run `npm run build` after changes, then use MCP to test

#### Common Patterns:

- **Backend API calls**: Located in `src/backend/BackendService.ts`
- **Data transformation**: Check `src/backend/BackendMapper.ts`
- **Frontend display**: `src/frontend/Frontend.ts` handles DOM manipulation
- **Configuration**: Module config in MagicMirror's `config.js`, not in this module

#### Error Handling:

- **Build fails**: Check TypeScript errors in `src/` files
- **Runtime errors**: Use `browser_console_messages` to see JavaScript errors
- **API issues**: Check network requests with `browser_network_requests`
- **Display problems**: Use `browser_snapshot` to analyze page structure

### IMPORTANT NOTES!

- STRICTLY Follow the development workflow!
- DO NOT READ data\priceByLocation.json IT IS TOO LARGE YOU WILL DIE
