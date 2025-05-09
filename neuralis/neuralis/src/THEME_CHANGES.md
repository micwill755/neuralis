# Neuralis Theme Changes

## Overview
This document outlines the changes made to update the Neuralis UI to match Jupyter Lab's grey and white color scheme and to add colored icons based on document type.

## Key Changes

### 1. Added Jupyter Theme CSS Variables
Created a new file `src/styles/jupyter-theme.css` with CSS variables that match Jupyter Lab's color palette:
- Layout colors (backgrounds, panels)
- UI font colors (text with various opacity levels)
- Border colors
- Brand colors (blue tones)
- Accent colors (orange tones)
- Status colors (warning, success, info)
- File type specific colors

### 2. Updated Color Scheme
- Changed background colors to use lighter greys (#f5f5f5) for panels
- Updated border colors to be more subtle
- Implemented consistent spacing and padding
- Adjusted text colors for better readability
- Made active elements more visible with brand colors

### 3. Colored Icons by Document Type
Updated icons in the file browser to use colors based on document type:
- Notebooks: Orange (#F37626)
- Python files: Blue (#3776AB)
- JavaScript files: Yellow (#F7DF1E)
- JSON files: Black (#000000)
- CSV files: Green (#217346)
- Markdown files: Blue (#083FA1)
- Images: Coral (#FF6F61)
- Folders: Blue (#2196f3)

### 4. Sidebar Improvements
- Updated sidebar tab icons with meaningful colors
- File browser icon: Blue
- Running kernels icon: Green
- Commands icon: Orange

### 5. Component-Specific Styling
- **TopBar**: Added a subtle grey background with border
- **MainContent**: Improved tab styling with active indicators
- **Notebook**: Enhanced cell styling with better visual hierarchy
- **Cell**: Added proper styling for code, markdown, and output cells
- **StatusBar**: Added status indicators with appropriate colors

### 6. CSS Organization
- Created separate CSS files for each component
- Imported the theme variables in the main index.css
- Removed hardcoded color values in favor of CSS variables

## Implementation
All styles now reference the CSS variables defined in the Jupyter theme file, making it easy to adjust the entire application's appearance by modifying a single file.

## Future Improvements
- Add dark mode support
- Implement theme switching capability
- Further refine cell output styling for different output types (plots, tables, etc.)
