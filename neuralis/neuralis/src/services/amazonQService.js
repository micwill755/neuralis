/**
 * Service to interact with Amazon Q CLI
 * In a production environment, this would make actual calls to Amazon Q
 * through a backend service or API
 */

// Mock implementation - in a real app, this would call your backend
export const generateCodeFromPrompt = async (prompt) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, return different responses based on prompt keywords
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('matplotlib') || promptLower.includes('plot') || promptLower.includes('graph')) {
    return `I can help you create a matplotlib graph with dummy data. Here's a sample code:

\`\`\`python
import matplotlib.pyplot as plt
import numpy as np

# Generate dummy data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create a simple plot
plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2)
plt.title('Sine Wave Visualization')
plt.xlabel('X axis')
plt.ylabel('Y axis')
plt.grid(True)

# Add some random data points
np.random.seed(42)
scatter_x = np.random.uniform(0, 10, 20)
scatter_y = np.random.uniform(-1, 1, 20)
plt.scatter(scatter_x, scatter_y, color='red', s=50, alpha=0.6)

plt.legend(['Sine wave', 'Random data points'])
plt.show()
\`\`\`

You can modify this to create different types of plots like bar charts, histograms, or scatter plots based on your needs.`;
  } 
  
  if (promptLower.includes('pandas') || promptLower.includes('dataframe')) {
    return `Here's how you can create and manipulate a pandas DataFrame with dummy data:

\`\`\`python
import pandas as pd
import numpy as np

# Create a sample DataFrame
np.random.seed(42)
dates = pd.date_range('20230101', periods=6)
df = pd.DataFrame(np.random.randn(6, 4), index=dates, columns=list('ABCD'))

# Display the DataFrame
print("Sample DataFrame:")
print(df)

# Basic statistics
print("\\nBasic statistics:")
print(df.describe())

# Data manipulation
print("\\nFiltered data (A > 0):")
print(df[df.A > 0])

# Grouping and aggregation
df['category'] = ['X', 'Y', 'Z', 'X', 'Y', 'Z']
print("\\nGrouped mean by category:")
print(df.groupby('category').mean())
\`\`\`

This code creates a DataFrame with random data, performs basic statistics, filtering, and demonstrates grouping operations.`;
  }
  
  if (promptLower.includes('machine learning') || promptLower.includes('model')) {
    return `Here's a simple machine learning example using scikit-learn:

\`\`\`python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.datasets import make_classification
import pandas as pd

# Generate a synthetic classification dataset
X, y = make_classification(
    n_samples=1000, 
    n_features=10,
    n_informative=5,
    n_redundant=2,
    random_state=42
)

# Convert to DataFrame for better visualization
feature_names = [f'feature_{i}' for i in range(10)]
df = pd.DataFrame(X, columns=feature_names)
df['target'] = y

print("Dataset preview:")
print(df.head())

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Create and train the model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate the model
print(f"\\nAccuracy: {accuracy_score(y_test, y_pred):.4f}")
print("\\nClassification Report:")
print(classification_report(y_test, y_pred))

# Feature importance
feature_importance = pd.DataFrame({
    'Feature': feature_names,
    'Importance': model.feature_importances_
}).sort_values('Importance', ascending=False)

print("\\nFeature Importance:")
print(feature_importance)
\`\`\`

This example creates a synthetic dataset, trains a Random Forest classifier, and evaluates its performance.`;
  }

  if (promptLower.includes('neural network') || promptLower.includes('deep learning')) {
    return `Here's a simple neural network example using TensorFlow/Keras:

\`\`\`python
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.utils import to_categorical
import numpy as np
import matplotlib.pyplot as plt

# Generate synthetic data
np.random.seed(42)
X_train = np.random.random((1000, 20))
y_train = np.random.randint(0, 10, (1000, 1))
y_train_cat = to_categorical(y_train, num_classes=10)

X_test = np.random.random((300, 20))
y_test = np.random.randint(0, 10, (300, 1))
y_test_cat = to_categorical(y_test, num_classes=10)

# Create a simple neural network
model = Sequential([
    Dense(64, activation='relu', input_shape=(20,)),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dropout(0.2),
    Dense(10, activation='softmax')
])

# Compile the model
model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Print model summary
model.summary()

# Train the model
history = model.fit(
    X_train, y_train_cat,
    epochs=20,
    batch_size=32,
    validation_split=0.2,
    verbose=1
)

# Evaluate the model
test_loss, test_acc = model.evaluate(X_test, y_test_cat)
print(f'Test accuracy: {test_acc:.4f}')

# Plot training history
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'])
plt.plot(history.history['val_accuracy'])
plt.title('Model accuracy')
plt.ylabel('Accuracy')
plt.xlabel('Epoch')
plt.legend(['Train', 'Validation'], loc='lower right')

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'])
plt.plot(history.history['val_loss'])
plt.title('Model loss')
plt.ylabel('Loss')
plt.xlabel('Epoch')
plt.legend(['Train', 'Validation'], loc='upper right')
plt.tight_layout()
plt.show()
\`\`\`

This example creates a simple neural network with TensorFlow/Keras, trains it on synthetic data, and visualizes the training progress.`;
  }
  
  // Default response for other prompts
  return `I can help you with that! Here's some sample code based on your request:

\`\`\`python
# Generated code based on your prompt: "${prompt}"
def analyze_data(data):
    """
    Analyze the provided data and return summary statistics
    
    Args:
        data (list): List of numerical values
        
    Returns:
        dict: Dictionary containing summary statistics
    """
    if not data:
        return {"error": "Empty data provided"}
        
    n = len(data)
    total = sum(data)
    mean = total / n
    
    # Calculate variance and standard deviation
    variance = sum((x - mean) ** 2 for x in data) / n
    std_dev = variance ** 0.5
    
    return {
        "count": n,
        "sum": total,
        "mean": mean,
        "min": min(data),
        "max": max(data),
        "variance": variance,
        "std_dev": std_dev
    }

# Example usage
sample_data = [12, 15, 23, 7, 42, 39, 15, 21]
results = analyze_data(sample_data)
print(results)
\`\`\`

Let me know if you need any modifications or have questions about this code!`;
};
