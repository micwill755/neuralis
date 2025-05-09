# Jupyter Lab MCP Server for Amazon Q CLI

This MCP server allows you to interact with Jupyter Lab and notebooks directly from Amazon Q CLI.

## Installation

1. Ensure you have the required dependencies installed:

```bash
cd ~/Documents/amazon-q/mcp/gitlab/jupyter-lab
pip install -r requirements.txt
```

2. Make the MCP server executable:

```bash
chmod +x ~/Documents/amazon-q/mcp/gitlab/jupyter-lab/mcp_server.py
```

## Configuration

Add the Jupyter Lab MCP server to your Amazon Q CLI configuration by editing the `mcp.json` file:

```bash
mkdir -p ~/.aws/amazonq
```

Edit or create the file `~/.aws/amazonq/mcp.json`:

```json
{
  "mcpServers": {
    "jupyter": {
      "command": "uv",
      "args": [
        "run",
        "/Users/mcwlm/Documents/amazon-q/mcp/gitlab/jupyter-lab/mcp_server.py"
      ],
      "env": {
      }
    }
  }
} 
```

## Available Tools

The Jupyter Lab MCP server provides the following tools:

1. **List Notebooks**: `jupyter___list_notebooks`
2. **Execute Cell**: `jupyter___execute_cell`
3. **Start Jupyter Lab**: `jupyter___start_lab`
4. **Stop Jupyter Lab**: `jupyter___stop_lab`
5. **Get Notebook Content**: `jupyter___get_notebook`
6. **Create Notebook**: `jupyter___create_notebook`

## Example Usage

Here are some examples of how to use the Jupyter Lab MCP server with Amazon Q CLI:

```
q chat
> Start a Jupyter Lab instance on port 8889
> Create a new notebook called data_analysis.ipynb with pandas import
> Execute a cell that creates a simple plot
> List all running notebooks
> Stop Jupyter Lab
```

## Testing Locally

You can test the MCP server locally using the MCP Inspector:

```bash
mcp dev mcp_server.py
```

Then open a browser and navigate to http://127.0.0.1:6274/#tools to interact with the tools.

## Troubleshooting

If you encounter issues:

1. Check that the MCP server is executable
2. Verify that all dependencies are installed
3. Ensure the path in your `mcp.json` is correct
4. Check the Q CLI logs for any error messages

## Advanced Usage

You can combine the Jupyter Lab MCP server with other MCP servers to create powerful workflows. For example, you could use it with the AWS MCP server to analyze AWS data in Jupyter notebooks.

### Using qcode Magic

The Jupyter Lab MCP server supports the `%qcode` magic command, which allows you to leverage Amazon Q's code generation capabilities directly within your notebooks:

1. **Install the qcode magic extension**:

```bash
pip install amazon-q-jupyter-magic
```

2. **Load the extension in your notebook**:

```python
%load_ext amazon_q_magic
```

3. **Use the qcode magic to generate code**:

```python
%qcode Create a pandas DataFrame with sample data and visualize it using a scatter plot
```

4. **Multi-line qcode magic**:

```python
%%qcode
Load the iris dataset
Split it into training and testing sets
Train a RandomForest classifier
Evaluate the model and show a confusion matrix
```

5. **Passing context to qcode**:

```python
# Define some variables
data_path = "data/sales.csv"
target_column = "revenue"

%%qcode
Using the data from {data_path}, build a regression model to predict {target_column}
```

The qcode magic integrates seamlessly with your Jupyter workflow, allowing you to quickly generate code snippets and complete solutions without leaving your notebook environment.

## License

This MCP server is licensed under the MIT License.
