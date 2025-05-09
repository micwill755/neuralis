#!/usr/bin/env python3
# mcp_server.py
from mcp.server.fastmcp import FastMCP
import subprocess
import json
import os
import time
from typing import Dict, List, Optional, Any, Union

# Create an MCP server
mcp = FastMCP("Jupyter Lab MCP Server")


@mcp.tool()
async def list_notebooks(path: Optional[str] = None) -> Dict:
    """
    List Jupyter notebooks in the specified path or current directory.
    
    Args:
        path (str, optional): Path to list notebooks from
        
    Returns:
        Dict: Information about running notebooks
    """
    try:
        cmd = ["jupyter", "notebook", "list", "--json"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        notebooks = json.loads(result.stdout)
        return {
            "notebooks": notebooks
        }
    except Exception as e:
        return {
            "error": str(e)
        }


@mcp.tool()
async def execute_cell(notebook_path: str, cell_content: str) -> Dict:
    """
    Execute a cell in a Jupyter notebook.
    
    Args:
        notebook_path (str): Path to the notebook
        cell_content (str): Content of the cell to execute
        
    Returns:
        Dict: Output from cell execution
    """
    try:
        # Create a temporary Python script with the cell content
        temp_script = f"/tmp/jupyter_cell_{os.getpid()}.py"
        with open(temp_script, "w") as f:
            f.write(cell_content)
        
        # Execute the script using jupyter nbconvert
        cmd = [
            "jupyter", "nbconvert", 
            "--to", "notebook", 
            "--execute", temp_script,
            "--stdout"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        # Clean up
        if os.path.exists(temp_script):
            os.remove(temp_script)
            
        if result.returncode == 0:
            return {
                "output": result.stdout
            }
        else:
            return {
                "error": result.stderr
            }
    except Exception as e:
        return {
            "error": str(e)
        }


@mcp.tool()
async def start_lab(port: int = 8888, directory: Optional[str] = None) -> Dict:
    """
    Start a Jupyter Lab instance.
    
    Args:
        port (int, optional): Port to run Jupyter Lab on. Defaults to 8888.
        directory (str, optional): Directory to start Jupyter Lab in
        
    Returns:
        Dict: Information about the started Jupyter Lab instance
    """
    try:
        cmd = ["jupyter", "lab", "--no-browser"]
        
        if port:
            cmd.extend(["--port", str(port)])
        
        if directory:
            cmd.extend(["--notebook-dir", directory])
            
        # Run Jupyter Lab in the background
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a bit for Jupyter to start and get the URL
        time.sleep(3)
        
        # Check if Jupyter Lab is running
        check_cmd = ["jupyter", "lab", "list", "--json"]
        check_result = subprocess.run(check_cmd, capture_output=True, text=True)
        
        if check_result.returncode == 0:
            try:
                servers = json.loads(check_result.stdout)
                return {
                    "message": "Jupyter Lab started successfully",
                    "servers": servers
                }
            except json.JSONDecodeError:
                # Fall back to text output if JSON parsing fails
                return {
                    "message": "Jupyter Lab started successfully",
                    "output": check_result.stdout
                }
        else:
            return {
                "error": check_result.stderr
            }
    except Exception as e:
        return {
            "error": str(e)
        }


@mcp.tool()
async def stop_lab() -> Dict:
    """
    Stop all running Jupyter Lab instances.
    
    Returns:
        Dict: Status message
    """
    try:
        cmd = ["jupyter", "lab", "stop"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return {
                "message": "Jupyter Lab stopped successfully"
            }
        else:
            return {
                "error": result.stderr
            }
    except Exception as e:
        return {
            "error": str(e)
        }


@mcp.tool()
async def get_notebook(notebook_path: str) -> Dict:
    """
    Get the content of a Jupyter notebook.
    
    Args:
        notebook_path (str): Path to the notebook
        
    Returns:
        Dict: Notebook content
    """
    try:
        with open(notebook_path, 'r') as f:
            notebook_content = json.load(f)
        
        return {
            "content": notebook_content
        }
    except Exception as e:
        return {
            "error": str(e)
        }


@mcp.tool()
async def create_notebook(notebook_path: str, cells: Optional[List[str]] = None) -> Dict:
    """
    Create a new Jupyter notebook.
    
    Args:
        notebook_path (str): Path where the notebook should be created
        cells (List[str], optional): Optional list of cell contents to add to the notebook
        
    Returns:
        Dict: Status message
    """
    try:
        # Create a basic notebook structure
        notebook = {
            "cells": [],
            "metadata": {
                "kernelspec": {
                    "display_name": "Python 3",
                    "language": "python",
                    "name": "python3"
                },
                "language_info": {
                    "codemirror_mode": {
                        "name": "ipython",
                        "version": 3
                    },
                    "file_extension": ".py",
                    "mimetype": "text/x-python",
                    "name": "python",
                    "nbconvert_exporter": "python",
                    "pygments_lexer": "ipython3",
                    "version": "3.8.0"
                }
            },
            "nbformat": 4,
            "nbformat_minor": 4
        }
        
        # Add cells if provided
        if cells:
            for cell_content in cells:
                notebook["cells"].append({
                    "cell_type": "code",
                    "execution_count": None,
                    "metadata": {},
                    "source": cell_content,
                    "outputs": []
                })
        
        # Write the notebook to file
        with open(notebook_path, 'w') as f:
            json.dump(notebook, f, indent=2)
        
        return {
            "message": f"Notebook created at {notebook_path}"
        }
    except Exception as e:
        return {
            "error": str(e)
        }


@mcp.resource("http://jupyter/info")
def get_jupyter_info() -> Dict:
    """
    Get information about the Jupyter installation
    
    Returns:
        Dict: Jupyter version and configuration information
    """
    try:
        cmd = ["jupyter", "--version"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        return {
            "version_info": result.stdout,
            "status": "active"
        }
    except Exception as e:
        return {
            "error": str(e)
        }


if __name__ == "__main__":
    # Run the server
    print("Starting Jupyter Lab MCP Server...")
    # For stdio transport:
    mcp.run(transport="stdio")
