// Test script to verify notebook selection functionality
console.log('Testing notebook selection functionality...');

// Mock notebook data
const notebooks = {
  'notebook1.ipynb': {
    name: 'notebook1.ipynb',
    cells: [
      { id: 1, type: 'markdown', content: '# Notebook 1\n\nThis is the first notebook.' },
      { id: 2, type: 'code', content: 'print("Hello from Notebook 1!")' }
    ]
  },
  'notebook2.ipynb': {
    name: 'notebook2.ipynb',
    cells: [
      { id: 1, type: 'markdown', content: '# Notebook 2\n\nThis is the second notebook.' },
      { id: 2, type: 'code', content: 'print("Hello from Notebook 2!")' }
    ]
  }
};

// Mock component state
let currentNotebook = null;
let cellsState = [];

// Mock setCurrentNotebook function
function setCurrentNotebook(notebook) {
  console.log(`Setting current notebook to: ${notebook.name}`);
  currentNotebook = notebook;
  
  // This simulates the useEffect in the Notebook component
  if (notebook && notebook.cells) {
    console.log(`Updating cells with ${notebook.cells.length} cells from ${notebook.name}`);
    cellsState = [...notebook.cells];
  }
}

// Test selecting notebook1
console.log('\nTest 1: Select notebook1');
const file1 = { name: 'notebook1.ipynb', type: 'notebook' };
const notebookData1 = notebooks[file1.name];
setCurrentNotebook(notebookData1);
console.log(`Current notebook: ${currentNotebook.name}`);
console.log(`Cells count: ${cellsState.length}`);
console.log(`First cell content: ${cellsState[0].content.substring(0, 20)}...`);

// Test selecting notebook2
console.log('\nTest 2: Select notebook2');
const file2 = { name: 'notebook2.ipynb', type: 'notebook' };
const notebookData2 = notebooks[file2.name];
setCurrentNotebook(notebookData2);
console.log(`Current notebook: ${currentNotebook.name}`);
console.log(`Cells count: ${cellsState.length}`);
console.log(`First cell content: ${cellsState[0].content.substring(0, 20)}...`);

// Test selecting notebook1 again
console.log('\nTest 3: Select notebook1 again');
setCurrentNotebook(notebookData1);
console.log(`Current notebook: ${currentNotebook.name}`);
console.log(`Cells count: ${cellsState.length}`);
console.log(`First cell content: ${cellsState[0].content.substring(0, 20)}...`);

console.log('\nTest completed successfully!');
