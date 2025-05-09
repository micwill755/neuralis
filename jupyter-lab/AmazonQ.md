# Using Jupyter Lab MCP Server with Amazon Q CLI

This guide explains how to properly set up and use the Jupyter Lab MCP server with Amazon Q CLI.

## Setup Instructions

1. **Install Dependencies**

First, make sure you have all the required dependencies installed:

```bash
cd ~/Documents/Neuralis/jupyter-lab
uv pip install -r requirements.txt
```

2. **Make the MCP Server Executable**

Ensure the MCP server script is executable:

```bash
chmod +x ~/Documents/Neuralis/jupyter-lab/mcp_server.py
```

3. **Configure Amazon Q CLI**

Create the necessary directory for Amazon Q configuration:

```bash
mkdir -p ~/.aws/amazonq
```

Create or edit the `~/.aws/amazonq/mcp.json` file:

```json
{
  "mcpServers": {
    "jupyter": {
      "command": "uv",
      "args": [
        "run",
        "/Users/Wiggum/Documents/Neuralis/jupyter-lab/mcp_server.py"
      ],
      "env": {
      }
    }
  }
}
```

Make sure to update the path to match your actual file location.

## Testing the MCP Server

There are two ways to test your MCP server:

1. **Using the MCP Inspector**

```bash
npx @modelcontextprotocol/inspector uv run mcp_server.py
```

This will start the MCP server and connect the inspector to it. You can then open a browser and navigate to http://127.0.0.1:6274/#tools to interact with the tools.

2. **Using Amazon Q CLI**

After configuring the `mcp.json` file, you can start the Amazon Q CLI:

```bash
q chat
```

Then you can interact with the Jupyter Lab MCP server through Amazon Q:

```
> Start a Jupyter Lab instance on port 8889
> Create a new notebook called data_analysis.ipynb with pandas import
> Execute a cell that creates a simple plot
```

## Troubleshooting

If you run `uv run mcp_server.py` directly, it will appear that nothing happens. This is normal because:

1. The MCP server is running and waiting for input on stdin/stdout
2. It needs a client (like Amazon Q CLI or the MCP Inspector) to communicate with it

If you're having issues:

1. Check that all dependencies are installed correctly
2. Verify that the path in your `mcp.json` is correct
3. Make sure the MCP server script is executable
4. Check that the Amazon Q CLI is properly configured

## Available Tools

The Jupyter Lab MCP server provides these tools through Amazon Q:

1. **List Notebooks**: List all running Jupyter notebooks
2. **Execute Cell**: Run code in a notebook cell
3. **Start Jupyter Lab**: Start a new Jupyter Lab instance
4. **Stop Jupyter Lab**: Stop running Jupyter Lab instances
5. **Get Notebook Content**: Retrieve the content of a notebook
6. **Create Notebook**: Create a new Jupyter notebook

## Example Workflow

Here's a complete workflow example using Amazon Q CLI:

```
> Start a Jupyter Lab instance on port 8889
> Create a new notebook called data_analysis.ipynb with pandas and matplotlib imports
> Execute a cell that loads the iris dataset and creates a scatter plot
> List all running notebooks
> Stop Jupyter Lab when I'm done
```
