#!/usr/bin/env python3
# mcp_server.py
from mcp.server.fastmcp import FastMCP
import subprocess
import json
import os
import time
from typing import Dict, List, Optional, Any, Union

# Create an MCP server
mcp = FastMCP("Kaggle MCP Server")


@mcp.tool()
async def list_datasets(search_term: Optional[str] = None) -> Dict:
    """
    List Kaggle datasets based on an optional search term.
    
    Args:
        search_term (str, optional): Term to search for datasets
        
    Returns:
        Dict: Information about datasets
    """
    try:
        cmd = ["kaggle", "datasets", "list"]
        if search_term:
            cmd.extend(["--search", search_term])
        
        cmd.append("--csv")
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        # Parse CSV output
        lines = result.stdout.strip().split('\n')
        headers = lines[0].split(',')
        datasets = []
        
        for line in lines[1:]:
            values = line.split(',')
            dataset = {headers[i]: values[i] for i in range(min(len(headers), len(values)))}
            datasets.append(dataset)
            
        return {
            "datasets": datasets
        }
    except Exception as e:
        return {
            "error": str(e)
        }


@mcp.tool()
async def download_dataset(dataset_ref: str, path: Optional[str] = None, unzip: bool = True) -> Dict:
    """
    Download a Kaggle dataset.
    
    Args:
        dataset_ref (str): Reference to the dataset (username/dataset-name)
        path (str, optional): Path to download the dataset to
        unzip (bool, optional): Whether to unzip the dataset. Defaults to True.
        
    Returns:
        Dict: Status of the download
    """
    try:
        cmd = ["kaggle", "datasets", "download", dataset_ref]
        
        if path:
            cmd.extend(["--path", path])
            
        if unzip:
            cmd.append("--unzip")
            
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return {
                "message": f"Dataset {dataset_ref} downloaded successfully",
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
async def list_competitions() -> Dict:
    """
    List active Kaggle competitions.
    
    Returns:
        Dict: Information about active competitions
    """
    try:
        cmd = ["kaggle", "competitions", "list", "--csv"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        # Parse CSV output
        lines = result.stdout.strip().split('\n')
        headers = lines[0].split(',')
        competitions = []
        
        for line in lines[1:]:
            values = line.split(',')
            competition = {headers[i]: values[i] for i in range(min(len(headers), len(values)))}
            competitions.append(competition)
            
        return {
            "competitions": competitions
        }
    except Exception as e:
        return {
            "error": str(e)
        }


@mcp.tool()
async def download_competition_files(competition: str, path: Optional[str] = None) -> Dict:
    """
    Download files for a Kaggle competition.
    
    Args:
        competition (str): Competition name
        path (str, optional): Path to download the files to
        
    Returns:
        Dict: Status of the download
    """
    try:
        cmd = ["kaggle", "competitions", "download", competition]
        
        if path:
            cmd.extend(["--path", path])
            
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return {
                "message": f"Competition files for {competition} downloaded successfully",
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
async def submit_to_competition(competition: str, file_path: str, message: str) -> Dict:
    """
    Submit a file to a Kaggle competition.
    
    Args:
        competition (str): Competition name
        file_path (str): Path to the submission file
        message (str): Submission message/description
        
    Returns:
        Dict: Status of the submission
    """
    try:
        cmd = [
            "kaggle", "competitions", "submit",
            competition,
            "-f", file_path,
            "-m", message
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return {
                "message": f"Submission to {competition} successful",
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
async def create_dataset(folder: str, dataset_name: Optional[str] = None, public: bool = False) -> Dict:
    """
    Create and upload a new Kaggle dataset.
    
    Args:
        folder (str): Path to the folder containing dataset files
        dataset_name (str, optional): Name for the dataset (defaults to folder name)
        public (bool, optional): Whether to make the dataset public. Defaults to False.
        
    Returns:
        Dict: Status of the dataset creation
    """
    try:
        cmd = ["kaggle", "datasets", "create", "-p", folder]
        
        if dataset_name:
            cmd.extend(["-d", dataset_name])
            
        if public:
            cmd.append("--public")
            
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return {
                "message": "Dataset created successfully",
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
async def get_dataset_metadata(dataset_ref: str) -> Dict:
    """
    Get metadata for a Kaggle dataset.
    
    Args:
        dataset_ref (str): Reference to the dataset (username/dataset-name)
        
    Returns:
        Dict: Dataset metadata
    """
    try:
        cmd = ["kaggle", "datasets", "metadata", dataset_ref]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            try:
                metadata = json.loads(result.stdout)
                return {
                    "metadata": metadata
                }
            except json.JSONDecodeError:
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


@mcp.resource("http://kaggle/info")
def get_kaggle_info() -> Dict:
    """
    Get information about the Kaggle CLI installation
    
    Returns:
        Dict: Kaggle version and configuration information
    """
    try:
        cmd = ["kaggle", "--version"]
        version_result = subprocess.run(cmd, capture_output=True, text=True)
        
        cmd = ["kaggle", "config", "view"]
        config_result = subprocess.run(cmd, capture_output=True, text=True)
        
        return {
            "version": version_result.stdout.strip(),
            "config_status": "configured" if config_result.returncode == 0 else "not configured",
            "status": "active"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error"
        }


if __name__ == "__main__":
    # Run the server
    print("Starting Kaggle MCP Server...")
    # For stdio transport:
    mcp.run(transport="stdio")
