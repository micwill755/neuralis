from setuptools import setup

setup(
    name="qcode_magic",
    version="0.1",
    description="Jupyter magic command to query Amazon Q CLI using MCP server",
    author="Amazon Q User",
    packages=["qcode_magic"],
    install_requires=[
        "ipython",
        "jupyter",
        "requests"
    ],
)
