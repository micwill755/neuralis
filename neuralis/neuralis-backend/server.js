const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Execute shell command
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executing command: ${command}`);
    const process = spawn('bash', ['-c', command]);
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
    
    process.on('error', (err) => {
      reject(err);
    });
  });
}

// API endpoints
app.get('/api/docker/check', async (req, res) => {
  try {
    const result = await executeCommand('docker --version');
    res.json({ available: true, version: result });
  } catch (error) {
    res.json({ available: false, error: error.message });
  }
});

app.get('/api/containers', async (req, res) => {
  try {
    const result = await executeCommand(
      'docker ps --filter "name=neuralis-kernel" --format "{{.Names}}|{{.Ports}}"'
    );
    
    if (!result.trim()) {
      return res.json([]);
    }
    
    const containers = result.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [name, ports] = line.split('|');
        const portMatch = ports.match(/0\.0\.0\.0:(\d+)/);
        const port = portMatch ? parseInt(portMatch[1]) : null;
        
        return {
          name,
          port,
          url: port ? `http://localhost:${port}` : null,
          status: 'running'
        };
      });
    
    res.json(containers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/containers', async (req, res) => {
  try {
    const { pythonVersion, port, name, packages } = req.body;
    const scriptPath = path.resolve(__dirname, '../neuralis/scripts/build_kernel_container.sh');
    
    // Make sure the script is executable
    await executeCommand(`chmod +x ${scriptPath}`);
    
    let command = `${scriptPath} --python-version ${pythonVersion} --port ${port} --name ${name}`;
    
    // Add packages if provided
    if (packages && packages.trim()) {
      // Escape the packages string to avoid command injection
      const escapedPackages = packages.replace(/[;&|<>]/g, '');
      command += ` --packages "${escapedPackages}"`;
    }
    
    const result = await executeCommand(command);
    
    res.json({ success: true, output: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/containers/:name/restart', async (req, res) => {
  try {
    const { name } = req.params;
    await executeCommand(`docker restart ${name}`);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/containers/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await executeCommand(`docker stop ${name}`);
    await executeCommand(`docker rm ${name}`);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/containers/:name/logs', async (req, res) => {
  try {
    const { name } = req.params;
    const logs = await executeCommand(`docker logs ${name} --tail 100`);
    
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
