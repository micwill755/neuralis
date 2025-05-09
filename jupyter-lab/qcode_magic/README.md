# QCode Magic for Jupyter

A Jupyter extension that provides a magic command `%qcode` to query Amazon Q CLI using the MCP server.

## Installation

```bash
pip install -e .
```

## Usage

Load the extension in your Jupyter notebook:

```python
%load_ext qcode_magic
```

Then use the magic command:

```python
%qcode How do I create a scatter plot in matplotlib?
```

Or as a cell magic:

```python
%%qcode
How do I create a pandas DataFrame from a dictionary and filter rows based on a condition?
```

## Features

- Line magic: `%qcode your question here`
- Cell magic: `%%qcode` followed by your question on subsequent lines
- Markdown-formatted responses
- Code examples ready to run

## Integration with Amazon Q CLI

This extension is designed to work with Amazon Q CLI through the MCP server. In the current implementation, responses are simulated for demonstration purposes. To fully implement the integration:

1. Update the `_call_q_cli` method in `qcode_magic.py` to use the actual MCP server API
2. Configure authentication and API endpoints as needed
3. Handle response formatting to ensure proper display in Jupyter

## Requirements

- IPython
- Jupyter
- Amazon Q CLI (for full functionality)

## License

MIT
