# Connectivity Checker for Chrome

The main purpose of this extension is to check whether another machine can access a target URL when your own connection attempt fails.

## Features

- Automatically request a connectivity check from a remote machine when a connection attempt fails.
- Manually request a connectivity check from a remote machine.
- Display your public IP address.
- Check custom URLs with a single click.

The `flask_server` folder contains a test server implemented with Flask, including an example of how to handle requests from the extension.

## How to Test

1. Enable Developer mode in Chrome.
2. Click **Load unpacked** and select the `extension` folder.

## Installing and Running the Flask Server

Create a virtual environment:

```bash
python -m venv venv
```

Activate it:

**Windows (Command Prompt):**
```bat
venv\Scripts\activate.bat
```

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Linux/macOS:**
```bash
source venv/bin/activate
```

Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

Run the server:

```bash
# Local access only
flask --app test_app:create_app run
```

```bash
# Allow connections from other machines
flask --app test_app:create_app run --host 0.0.0.0
```
