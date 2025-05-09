import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Notebook from '../components/notebook/Notebook';

// Mock the AmazonQPanel component
jest.mock('../components/assistant/AmazonQPanel', () => {
  return function MockAmazonQPanel({ onInsertCode }) {
    return (
      <div data-testid="amazon-q-panel">
        <button 
          data-testid="mock-insert-button" 
          onClick={() => onInsertCode('// Mock code inserted from Amazon Q')}
        >
          Mock Insert Code
        </button>
      </div>
    );
  };
});

// Mock SplitPane component
jest.mock('react-split-pane', () => {
  return function MockSplitPane({ children }) {
    return <div data-testid="split-pane">{children}</div>;
  };
});

describe('Notebook Component with Amazon Q Integration', () => {
  const mockNotebook = {
    id: 'notebook-1',
    name: 'Test Notebook',
    cells: [
      { id: 'cell-1', type: 'code', content: '// Existing code cell' },
      { id: 'cell-2', type: 'markdown', content: '# Markdown cell' }
    ]
  };
  
  test('renders notebook with Amazon Q panel', () => {
    render(<Notebook notebook={mockNotebook} />);
    
    // Check if the notebook title is rendered
    expect(screen.getByText('Test Notebook')).toBeInTheDocument();
    
    // Check if the split pane is rendered
    expect(screen.getByTestId('split-pane')).toBeInTheDocument();
    
    // Check if the Amazon Q panel is rendered
    expect(screen.getByTestId('amazon-q-panel')).toBeInTheDocument();
    
    // Check if existing cells are rendered
    expect(screen.getByText('// Existing code cell')).toBeInTheDocument();
  });
  
  test('inserts code from Amazon Q panel into notebook', () => {
    render(<Notebook notebook={mockNotebook} />);
    
    // Get the initial cell count
    const initialCellCount = mockNotebook.cells.length;
    
    // Click the mock insert button in the Amazon Q panel
    const insertButton = screen.getByTestId('mock-insert-button');
    fireEvent.click(insertButton);
    
    // Check if the new code cell was added with the generated code
    expect(screen.getByText('// Mock code inserted from Amazon Q')).toBeInTheDocument();
  });
  
  test('handles notebook without cells', () => {
    const emptyNotebook = {
      id: 'empty-notebook',
      name: 'Empty Notebook',
      cells: []
    };
    
    render(<Notebook notebook={emptyNotebook} />);
    
    // Check if the notebook title is rendered
    expect(screen.getByText('Empty Notebook')).toBeInTheDocument();
    
    // Click the mock insert button in the Amazon Q panel
    const insertButton = screen.getByTestId('mock-insert-button');
    fireEvent.click(insertButton);
    
    // Check if the new code cell was added with the generated code
    expect(screen.getByText('// Mock code inserted from Amazon Q')).toBeInTheDocument();
  });
  
  test('handles no notebook selected', () => {
    render(<Notebook notebook={null} />);
    
    // Check if the no notebook message is displayed
    expect(screen.getByText('No notebook selected')).toBeInTheDocument();
  });
});
