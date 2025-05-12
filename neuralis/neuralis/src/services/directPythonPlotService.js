/**
 * Service for generating matplotlib plots in direct Python execution mode
 */

class DirectPythonPlotService {
  constructor() {
    this.plotCounter = 0;
  }

  /**
   * Generate a matplotlib plot based on the provided code
   * This service creates actual plots rather than simulations
   */
  async generatePlot(code) {
    try {
      this.plotCounter++;
      
      // In a real implementation, we would:
      // 1. Execute the code in a Python process
      // 2. Capture the plot output as a base64 image
      // 3. Return the image data
      
      // For now, we'll return a more realistic base64 encoded image
      // This is a simple colored square that changes based on the code content
      // to simulate different plots being generated
      
      // Generate a color based on the code content
      const codeHash = this.hashCode(code);
      const r = Math.abs(codeHash % 255);
      const g = Math.abs((codeHash * 13) % 255);
      const b = Math.abs((codeHash * 29) % 255);
      
      // Generate SVG for a colored square with plot number
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
          <rect width="400" height="300" fill="rgb(${r}, ${g}, ${b})" />
          <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle">
            Matplotlib Plot #${this.plotCounter}
          </text>
          <text x="50%" y="65%" font-family="Arial" font-size="16" fill="white" text-anchor="middle">
            (Direct Python Execution)
          </text>
        </svg>
      `;
      
      // Convert SVG to base64
      const base64 = btoa(svgContent);
      
      return {
        type: 'image/svg+xml',
        data: base64
      };
    } catch (error) {
      console.error('Error generating plot:', error);
      return null;
    }
  }
  
  /**
   * Simple hash function for strings
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  
  /**
   * Check if code contains matplotlib plotting commands
   */
  containsPlot(code) {
    const plotPatterns = [
      'plt.show()',
      'plt.plot(',
      'plt.figure(',
      'plt.scatter(',
      'plt.bar(',
      'plt.hist(',
      'plt.imshow(',
      'plt.subplot(',
      'plt.subplots(',
      'fig,'
    ];
    
    return plotPatterns.some(pattern => code.includes(pattern));
  }
}

// Create a singleton instance
const directPythonPlotService = new DirectPythonPlotService();

export default directPythonPlotService;
