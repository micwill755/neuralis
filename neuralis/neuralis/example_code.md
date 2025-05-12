# Example Python Code for Testing
Here are some Python code examples to test the real Python execution in the Neuralis app:

## Basic Example
```python
print('Hello, world!')
```


## Variable Example
```python
x = 10
y = 20
print(f'The sum of {x} and {y} is {x + y}')
```


## Matplotlib Example
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


## Data Analysis Example
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

