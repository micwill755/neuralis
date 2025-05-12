# Neuralis - A Jupyter Lab Clone with Real Python Execution

This project is a React-based clone of Jupyter Lab with real Python code execution capabilities. It provides an interactive development environment for data science, scientific computing, and machine learning.

## Features

- Notebook-based interface for code execution
- Real Python code execution (not simulated)
- Support for matplotlib visualizations
- File browser
- Markdown support
- Code editor with syntax highlighting
- AI Assistant for natural language code generation

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Python (version 3.6 or higher)
- Required Python packages: matplotlib, numpy (for visualization examples)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/neuralis.git
   cd neuralis
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd server
   npm install
   cd ..
   ```

4. Install required Python packages:
   ```
   pip install matplotlib numpy
   ```

### Running the Application

1. Start the backend server:
   ```
   npm run server
   ```

2. In a new terminal, start the frontend development server:
   ```
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## How It Works

The application consists of two main parts:

1. **Frontend (React)**: Provides the user interface for creating and editing notebooks, running code, and displaying results.

2. **Backend (Node.js)**: Handles Python code execution by:
   - Creating temporary Python files with the user's code
   - Executing the code using the Python interpreter
   - Capturing stdout, stderr, and image outputs
   - Returning the results to the frontend

## Using the Application

1. Select or create a notebook
2. Choose a kernel (Python 3)
3. Add code or markdown cells
4. Write Python code in code cells
5. Run cells to execute the code
6. View the output, including text and visualizations

## Example Python Code

Here are some examples to test the Python execution:

### Basic Example
```python
print('Hello, world!')
```

### Variable Example
```python
x = 10
y = 20
print(f'The sum of {x} and {y} is {x + y}')
```

### Matplotlib Example
```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(8, 4))
plt.plot(x, y, 'b-', linewidth=2)
plt.title('Sine Wave')
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.grid(True)
plt.show()
```

### Data Analysis Example
```python
import numpy as np

# Create sample data
data = np.random.normal(0, 1, 1000)

# Calculate statistics
mean = np.mean(data)
median = np.median(data)
std_dev = np.std(data)

print(f'Mean: {mean:.4f}')
print(f'Median: {median:.4f}')
print(f'Standard Deviation: {std_dev:.4f}')

# Create a histogram
import matplotlib.pyplot as plt
plt.figure(figsize=(8, 4))
plt.hist(data, bins=30, alpha=0.7)
plt.axvline(mean, color='r', linestyle='dashed', linewidth=1, label=f'Mean: {mean:.4f}')
plt.title('Normal Distribution Histogram')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

## Technical Details

### State Management

The application maintains Python session state between cell executions, allowing variables defined in one cell to be used in subsequent cells.

### Image Handling

Matplotlib plots are captured as base64-encoded PNG images and displayed inline within the notebook.

### Error Handling

Python errors are captured and displayed in the cell output with appropriate formatting.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
