# Amazon Q Integration in Neuralis

## Overview

The Amazon Q integration in Neuralis provides a natural language interface for users to interact with their notebooks. This document outlines how Amazon Q was implemented and its capabilities.

## Implementation Details

Amazon Q is implemented as a dedicated panel in the Neuralis interface. Key components include:

1. **AmazonQPanel.js**: The main component that handles:
   - Terminal-like interface for interacting with Amazon Q
   - Processing natural language requests
   - Generating code snippets
   - Inserting code into notebooks

2. **MCPStore.js**: The Model Context Protocol server management component:
   - Allows users to add and manage MCP servers
   - Enables/disables MCP servers for extended functionality
   - Provides a user interface for server configuration

3. **Integration with Notebook.js**:
   - The notebook component listens for custom events from the Amazon Q panel
   - New cells are created with the generated code when the user clicks "Insert into notebook"

## Features

Amazon Q can help users with:

- Creating data visualizations (plots, charts, graphs)
- Data manipulation with pandas
- Statistical analysis
- Machine learning models
- Data cleaning and preprocessing
- Explaining code or concepts
- Accessing external services via MCP servers (e.g., Kaggle)

## User Interface

Amazon Q has a terminal-like interface:

- A dedicated panel on the right side of the notebook
- Command-line style input for natural language queries
- Code snippets with syntax highlighting
- "Insert into notebook" button for each code snippet
- MCP server management interface

## MCP Server Integration

The Amazon Q panel supports the Model Context Protocol (MCP) for extending its capabilities:

1. Users can add MCP servers through the MCP Store interface
2. Servers can be enabled/disabled as needed
3. When enabled, Amazon Q can use the server's capabilities
4. The first supported MCP server is Kaggle, located at `/Users/Wiggum/Documents/Neuralis/kaggle`

## Technical Implementation

The Amazon Q panel uses:

- React for the UI components
- Styled Components for styling
- React hooks for state management
- Custom events for communication between components
- Mock responses for demonstration purposes (to be replaced with actual Amazon Q API calls)

## Future Enhancements

Potential improvements for the Amazon Q integration include:

1. Integration with the actual Amazon Q CLI
2. Context-aware suggestions based on notebook content
3. Ability to explain existing code in the notebook
4. Support for more programming languages
5. Interactive code generation with parameters
6. History of previous conversations
7. Ability to save favorite code snippets
8. Support for additional MCP servers

This implementation demonstrates how natural language interfaces can enhance the notebook experience and make data science more accessible to users of all skill levels.
