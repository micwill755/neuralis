FROM python:3.12-slim

WORKDIR /app

# Install jupyter_kernel_gateway which provides kernel connectivity without the full Jupyter interface
RUN pip install --no-cache-dir jupyter_kernel_gateway ipykernel

# Create a kernel specifically for the application
RUN python -m ipykernel install --name "python3.12" --display-name "Python 3.12"

# Install common data science packages (optional - add what you need)
RUN pip install --no-cache-dir numpy pandas matplotlib scikit-learn

# Set up the configuration to allow connections from external sources
RUN mkdir -p /etc/jupyter && \
    echo "c.KernelGatewayApp.ip = '0.0.0.0'" > /etc/jupyter/jupyter_kernel_gateway_config.py && \
    echo "c.KernelGatewayApp.allow_origin = '*'" >> /etc/jupyter/jupyter_kernel_gateway_config.py && \
    echo "c.KernelGatewayApp.allow_credentials = True" >> /etc/jupyter/jupyter_kernel_gateway_config.py && \
    echo "c.KernelGatewayApp.auth_token = ''" >> /etc/jupyter/jupyter_kernel_gateway_config.py

# Expose the kernel gateway port
EXPOSE 8888

# Start the kernel gateway
CMD ["jupyter", "kernelgateway", "--KernelGatewayApp.api=kernel_gateway.notebook_http", "--KernelGatewayApp.seed_uri=/app/api_endpoints.ipynb"]
