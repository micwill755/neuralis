import json
import os
import subprocess
import sys
from IPython.core.magic import (Magics, magics_class, line_cell_magic)
from IPython.display import display, Markdown

@magics_class
class QCodeMagic(Magics):
    """
    Magic command to query Amazon Q CLI using MCP server.
    Usage:
        %qcode What is the best way to create a scatter plot in matplotlib?
        %%qcode
        How do I create a pandas DataFrame from a dictionary?
    """
    
    @line_cell_magic
    def qcode(self, line, cell=None):
        """
        Send a query to Amazon Q CLI and display the response.
        
        Args:
            line (str): The line input for the magic command
            cell (str, optional): The cell input if used as cell magic
        
        Returns:
            The formatted response from Amazon Q
        """
        # Determine if this is line or cell magic
        if cell is None:
            query = line
        else:
            query = cell
            
        if not query.strip():
            return Markdown("Error: Please provide a query for Amazon Q.")
            
        try:
            # Create a temporary file to store the query
            temp_file = "/tmp/qcode_query.txt"
            with open(temp_file, "w") as f:
                f.write(query)
                
            # Call the Q CLI with the query
            # Note: This is a simplified approach. In a real implementation,
            # you might want to use a more direct API if available.
            result = self._call_q_cli(query)
            
            # Format and display the result
            return Markdown(f"## Amazon Q Response\n\n{result}")
            
        except Exception as e:
            return Markdown(f"Error querying Amazon Q: {str(e)}")
    
    def _call_q_cli(self, query):
        """
        Call the Amazon Q CLI with the given query.
        
        In a real implementation, you would use the MCP server API directly.
        This is a simplified version that simulates the interaction.
        
        Args:
            query (str): The query to send to Amazon Q
            
        Returns:
            str: The response from Amazon Q
        """
        try:
            # In a real implementation, you would use the MCP server API
            # This is a simplified example that could be replaced with actual API calls
            
            # Simulate a response for demonstration purposes
            # In a real implementation, you would call the Q CLI or MCP server
            
            # Example of how you might call the Q CLI (commented out)
            # process = subprocess.Popen(
            #     ["q", "chat", "--non-interactive"],
            #     stdin=subprocess.PIPE,
            #     stdout=subprocess.PIPE,
            #     stderr=subprocess.PIPE,
            #     text=True
            # )
            # stdout, stderr = process.communicate(input=query)
            # return stdout
            
            # For now, return a simulated response
            if "matplotlib" in query.lower() or "plot" in query.lower():
                return """
```python
import matplotlib.pyplot as plt
import numpy as np

# Generate sample data
x = np.random.rand(50)
y = np.random.rand(50)
colors = np.random.rand(50)
sizes = 1000 * np.random.rand(50)

# Create scatter plot
plt.figure(figsize=(10, 6))
plt.scatter(x, y, c=colors, s=sizes, alpha=0.6, cmap='viridis')
plt.colorbar(label='Color Value')
plt.title('Scatter Plot Example')
plt.xlabel('X Values')
plt.ylabel('Y Values')
plt.grid(True, alpha=0.3)
plt.show()
```

This code creates a scatter plot with random data points. The points have:
- Random positions (x and y)
- Colors mapped from a color scale (viridis)
- Different sizes
- Partial transparency (alpha=0.6)

You can customize the plot by changing the parameters.
                """
            elif "pandas" in query.lower() or "dataframe" in query.lower():
                return """
```python
import pandas as pd

# Create a DataFrame from a dictionary
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David'],
    'Age': [25, 30, 35, 40],
    'City': ['New York', 'San Francisco', 'Los Angeles', 'Chicago'],
    'Salary': [70000, 80000, 90000, 100000]
}

df = pd.DataFrame(data)
print(df)
```

This creates a pandas DataFrame from a dictionary where:
- Each key becomes a column name
- Each value (which should be a list) becomes the data for that column
- All lists should have the same length

You can then manipulate the DataFrame using pandas functions.
                """
            else:
                return """
I'd be happy to help with your coding question. In a real implementation, 
this would connect to Amazon Q CLI through the MCP server and provide a 
detailed response to your specific query.

For now, this is a simulated response. Try asking about matplotlib plots 
or pandas DataFrames to see more specific examples.
                """
        except Exception as e:
            return f"Error: {str(e)}"

def load_ipython_extension(ipython):
    """
    Load the extension in IPython.
    """
    ipython.register_magics(QCodeMagic)
