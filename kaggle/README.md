# Kaggle MCP Server for Amazon Q CLI

This MCP server provides integration with Kaggle, allowing you to search, download, and interact with Kaggle datasets and competitions directly from Amazon Q CLI.

## Installation

1. Ensure you have the required dependencies installed:

```bash
cd ~/Documents/amazon-q/mcp/gitlab/kaggle
pip install -r requirements.txt
```

2. Make the MCP server executable:

```bash
chmod +x ~/Documents/amazon-q/mcp/gitlab/kaggle/mcp_server.py
```

3. Set up your Kaggle API credentials:
   - Go to your Kaggle account settings (https://www.kaggle.com/account)
   - Create a new API token (this will download a kaggle.json file)
   - Place this file in ~/.kaggle/kaggle.json
   - Ensure proper permissions: `chmod 600 ~/.kaggle/kaggle.json`

## Configuration

Add the Kaggle MCP server to your Amazon Q CLI configuration by editing the `mcp.json` file:

```bash
mkdir -p ~/.aws/amazonq
```

Edit or create the file `~/.aws/amazonq/mcp.json`:

```json
{
  "mcpServers": {
    "kaggle": {
      "command": "uv",
      "args": [
        "run",
        "/Users/mcwlm/Documents/amazon-q/mcp/gitlab/kaggle/mcp_server.py"
      ],
      "env": {
      }
    }
  }
}
```

## Available Tools

The Kaggle MCP server provides the following tools:

1. **List Datasets**: `kaggle___list_datasets`
2. **Download Dataset**: `kaggle___download_dataset`
3. **List Competitions**: `kaggle___list_competitions`
4. **Download Competition Files**: `kaggle___download_competition_files`
5. **Submit to Competition**: `kaggle___submit_to_competition`
6. **Create Dataset**: `kaggle___create_dataset`
7. **Get Dataset Metadata**: `kaggle___get_dataset_metadata`

## Example Usage

Here are some examples of how to use the Kaggle MCP server with Amazon Q CLI:

```
q chat
> Search for datasets related to COVID-19
> Download the Titanic dataset
> List active Kaggle competitions
> Download files for the House Prices competition
```

## Troubleshooting

If you encounter issues:

1. Check that your Kaggle API credentials are correctly set up
2. Verify that all dependencies are installed
3. Ensure the path in your `mcp.json` is correct
4. Check the Q CLI logs for any error messages

## Advanced Usage

You can combine the Kaggle MCP server with other MCP servers to create powerful workflows. For example, you could use it with the Jupyter Lab MCP server to download datasets from Kaggle and analyze them in Jupyter notebooks.
