import React, { useState } from 'react';
import './FileBrowser.css';

const FileBrowser = ({ onSelectNotebook, onCreateNotebook }) => {
  const [files, setFiles] = useState([
    { name: 'notebook1.ipynb', type: 'notebook' },
    { name: 'notebook2.ipynb', type: 'notebook' },
    { name: 'data.csv', type: 'file' },
    { name: 'images', type: 'folder', children: [
      { name: 'image1.png', type: 'file' },
      { name: 'image2.jpg', type: 'file' }
    ]},
    { name: 'scripts', type: 'folder', children: [
      { name: 'script.py', type: 'file' },
      { name: 'script.js', type: 'file' },
      { name: 'data.json', type: 'file' }
    ]}
  ]);
  
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showNewNotebookDialog, setShowNewNotebookDialog] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  
  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };
  
  const handleFileClick = (file) => {
    if (file.type === 'notebook') {
      onSelectNotebook(file);
    }
  };
  
  const handleCreateNotebook = () => {
    if (newNotebookName) {
      // Ensure the notebook has the .ipynb extension
      const notebookName = newNotebookName.endsWith('.ipynb') 
        ? newNotebookName 
        : `${newNotebookName}.ipynb`;
      
      // Create a new notebook file
      const newNotebook = { name: notebookName, type: 'notebook' };
      
      // Add it to the files list
      setFiles([...files, newNotebook]);
      
      // Call the parent handler
      onCreateNotebook(newNotebook);
      
      // Reset the dialog
      setNewNotebookName('');
      setShowNewNotebookDialog(false);
    }
  };
  
  // Function to determine file type based on extension
  const getFileType = (fileName) => {
    if (!fileName.includes('.')) return 'file';
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    const fileTypeMap = {
      // Code files
      'py': 'python',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rb': 'ruby',
      'php': 'php',
      'r': 'r',
      
      // Data files
      'json': 'json',
      'csv': 'csv',
      'xlsx': 'excel',
      'xls': 'excel',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      
      // Notebook files
      'ipynb': 'notebook',
      
      // Image files
      'png': 'image',
      'jpg': 'image',
      'jpeg': 'image',
      'gif': 'image',
      'svg': 'image',
      'webp': 'image',
      
      // Document files
      'pdf': 'pdf',
      'doc': 'document',
      'docx': 'document',
      'txt': 'text',
      'md': 'markdown',
      
      // Archive files
      'zip': 'archive',
      'tar': 'archive',
      'gz': 'archive',
      'rar': 'archive',
    };
    
    return fileTypeMap[extension] || 'file';
  };
  
  const renderFileItem = (file, depth = 0) => {
    const indent = { paddingLeft: `${depth * 16}px` };
    
    if (file.type === 'folder') {
      const isExpanded = expandedFolders[file.name];
      return (
        <React.Fragment key={file.name}>
          <div 
            className="file-item folder" 
            style={indent}
            onClick={() => toggleFolder(file.name)}
          >
            <span className={`folder-icon ${isExpanded ? 'expanded' : ''}`}></span>
            {file.name}
          </div>
          {isExpanded && file.children && file.children.map(child => 
            renderFileItem(child, depth + 1)
          )}
        </React.Fragment>
      );
    } else {
      // Determine file type based on extension
      const fileType = file.type === 'notebook' ? 'notebook' : getFileType(file.name);
      const iconClass = `file-icon ${fileType}-icon`;
      
      return (
        <div 
          className={`file-item ${file.type === 'notebook' ? 'notebook-item' : ''}`}
          style={indent} 
          key={file.name}
          onClick={() => handleFileClick(file)}
        >
          <span className={iconClass}></span>
          {file.name}
        </div>
      );
    }
  };
  
  return (
    <div className="file-browser">
      <div className="file-browser-header">
        <span>File Browser</span>
        <div className="file-browser-actions">
          <button className="action-button refresh" title="Refresh">↻</button>
          <button className="action-button new-folder" title="New Folder">📁+</button>
          <button 
            className="action-button new-notebook" 
            title="New Notebook"
            onClick={() => setShowNewNotebookDialog(true)}
          >
            📓+
          </button>
          <button className="action-button upload" title="Upload">⬆️</button>
        </div>
      </div>
      <div className="file-list">
        {files.map(file => renderFileItem(file))}
      </div>
      
      {showNewNotebookDialog && (
        <div className="new-notebook-dialog">
          <div className="dialog-content">
            <h3>Create New Notebook</h3>
            <input
              type="text"
              placeholder="Notebook name"
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={() => setShowNewNotebookDialog(false)}>Cancel</button>
              <button 
                onClick={handleCreateNotebook}
                disabled={!newNotebookName}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileBrowser;