# Slack Approval System Setup Guide

A complete guide to set up the Slack approval flow for your RL agent recommendations.

## 🎯 Overview

This system creates a real Slack bot that:
1. **Loads** recommendations from your RL agent's `recommendations.json`
2. **Formats** them into clear, actionable Slack messages
3. **Sends** approval requests to your Slack channel or DM
4. **Listens** for Y/N responses from users
5. **Saves** approved tasks to `approved_tasks.json`
6. **Logs** rejected tasks for analysis

## 📋 Prerequisites

- A Slack workspace where you have admin permissions
- Python 3.7 or higher
- Your RL agent generating `recommendations.json` files

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Slack SDK
pip install -r requirements_slack.txt

# Or install manually
pip install slack-sdk slack-bolt
```

### 2. Create Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Name your app: `"RL Approval Bot"`
5. Select your workspace

### 3. Configure Bot Permissions

In your Slack app settings:

1. Go to **"OAuth & Permissions"**
2. Add these **Bot Token Scopes**:
   - `chat:write` - Send messages
   - `channels:read` - Read channel info
   - `channels:history` - Read message history
   - `im:read` - Read direct messages
   - `im:write` - Send direct messages
   - `im:history` - Read DM history

3. Click **"Install to Workspace"**
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### 4. Enable Socket Mode (for Full Bot)

1. Go to **"Socket Mode"** in your app settings
2. Enable Socket Mode
3. Generate an **App-Level Token** with `connections:write` scope
4. Copy the token (starts with `xapp-`)

### 5. Set Environment Variables

```bash
# Required
export SLACK_BOT_TOKEN="xoxb-your-bot-token-here"
export SLACK_CHANNEL_ID="C1234567890"  # Channel ID or User ID for DMs

# Optional (for full async bot)
export SLACK_APP_TOKEN="xapp-your-app-token-here"
export SLACK_SIGNING_SECRET="your-signing-secret"
```

### 6. Test the Setup

```bash
# Check current status
python simple_slack_approval.py --status

# Send a recommendation for approval
python simple_slack_approval.py --send

# Send and listen for response
python simple_slack_approval.py --send-and-listen
```

## 📁 File Structure

After setup, you'll have:

```
your-project/
├── slack_approval_bot.py          # Full async bot
├── simple_slack_approval.py       # Simple sync version
├── requirements_slack.txt          # Dependencies
├── slack_config.json              # Config template
├── recommendations.json           # RL agent output
├── approved_tasks.json            # Approved tasks
├── rejected_tasks.json            # Rejected tasks
├── pending_approvals.json         # Temporary pending state
└── slack_approval_bot.log         # Bot logs
```

## 🛠️ Configuration Options

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SLACK_BOT_TOKEN` | Yes | Bot token from Slack app | `xoxb-123-456-abc` |
| `SLACK_CHANNEL_ID` | Yes | Channel or user ID | `C1234567890` |
| `SLACK_APP_TOKEN` | No* | App token for Socket Mode | `xapp-123-abc` |
| `SLACK_SIGNING_SECRET` | No* | Signing secret for verification | `abc123def456` |
| `RECOMMENDATIONS_FILE` | No | Path to recommendations | `recommendations.json` |
| `APPROVED_TASKS_FILE` | No | Path to approved tasks | `approved_tasks.json` |
| `RL_AGENT_PATH` | No | Path to RL agent directory | `rl-agent` |

*Required for full async bot, optional for simple version

### Configuration File

Create `slack_config.json`:

```json
{
  "SLACK_BOT_TOKEN": "xoxb-your-bot-token-here",
  "SLACK_APP_TOKEN": "xapp-your-app-token-here",
  "SLACK_CHANNEL_ID": "C1234567890",
  "RECOMMENDATIONS_FILE": "recommendations.json",
  "APPROVED_TASKS_FILE": "approved_tasks.json",
  "RL_AGENT_PATH": "rl-agent"
}
```

## 🎮 Usage Examples

### Simple One-Shot Approval

```bash
# Generate recommendation with your RL agent
cd rl-agent
python inference.py

# Send for approval
cd ..
python simple_slack_approval.py --send-and-listen
```

### Continuous Bot Mode

```bash
# Start the full bot (runs continuously)
python slack_approval_bot.py

# Send specific recommendation
python slack_approval_bot.py --send-now
```

### Check Status

```bash
# Show current status
python simple_slack_approval.py --status
```

## 📱 Slack Usage

### Getting Channel/User IDs

**For Channels:**
1. Right-click on channel name in Slack
2. Select "Copy link"
3. ID is at the end: `https://workspace.slack.com/archives/C1234567890`

**For Users (DMs):**
1. Click on user's profile
2. Click "More" → "Copy member ID"
3. Use the ID: `U1234567890`

### Bot Commands

When the bot is running, you can use:

- `/approve` - Check for new recommendations
- `/status` - Show approval status
- Reply with `Y`, `yes`, `N`, or `no` to approve/reject

## 🔧 Troubleshooting

### Common Issues

**1. "Token not found" error**
```bash
# Check environment variables
echo $SLACK_BOT_TOKEN
echo $SLACK_CHANNEL_ID

# Set them if missing
export SLACK_BOT_TOKEN="xoxb-your-token"
export SLACK_CHANNEL_ID="C1234567890"
```

**2. "Channel not found" error**
- Make sure the bot is added to the channel
- Use channel ID, not name
- For DMs, use user ID instead

**3. "No recommendations found"**
```bash
# Check if file exists
ls -la recommendations.json
ls -la rl-agent/recommendations.json

# Generate new recommendations
cd rl-agent
python inference.py
```

**4. Bot doesn't respond**
- Check bot permissions in Slack
- Verify Socket Mode is enabled (for full bot)
- Check logs in `slack_approval_bot.log`

### Debug Mode

```bash
# Run with debug logging
python simple_slack_approval.py --status
python simple_slack_approval.py --send --debug
```

## 📊 Output Examples

### Slack Message Format

```
🤖 AI Recommendation Alert

Suggested Action: Restock 20 units
Expected ROI: 370.0%
Confidence: High
Reasoning: Based on 5 simulation episodes with average profit of $6251.00

Alternative Options:
  1. Restock 20 units (ROI: 350.0%)
  2. Restock 20 units (ROI: 310.0%)

Generated: 2025-01-06 20:24

Approve this action?
Reply with Y (Yes) or N (No)
```

### Approved Tasks File

```json
[
  {
    "id": "task_20250106_142530",
    "approved_at": "2025-01-06T14:25:30.123456",
    "status": "approved",
    "executed": false,
    "recommendation": {
      "action": "restock",
      "quantity": 20,
      "expected_roi": "370.0%",
      "confidence": "high",
      "reasoning": "Based on 5 simulation episodes...",
      "timestamp": "2025-01-06T20:24:43.804848"
    }
  }
]
```

## 🔄 Integration with Your System

### Automatic Workflow

Create a script that runs your complete pipeline:

```bash
#!/bin/bash
# complete_workflow.sh

echo "🤖 Running RL Agent..."
cd rl-agent
python inference.py

echo "📤 Sending for approval..."
cd ..
python simple_slack_approval.py --send-and-listen --listen 30

echo "✅ Workflow complete!"
```

### Scheduled Recommendations

```bash
# Add to crontab for daily recommendations
# Run at 9 AM every day
0 9 * * * /path/to/your/complete_workflow.sh
```

### Python Integration

```python
import subprocess
import json
import os

def run_approval_workflow():
    """Run the complete approval workflow"""
    
    # Generate recommendations
    result = subprocess.run([
        "python", "rl-agent/inference.py"
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Recommendations generated")
        
        # Send for approval
        result = subprocess.run([
            "python", "simple_slack_approval.py", "--send"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Approval request sent")
            return True
    
    return False

# Usage
if __name__ == "__main__":
    run_approval_workflow()
```

## 🔐 Security Best Practices

1. **Never commit tokens to git**
   ```bash
   # Add to .gitignore
   echo "slack_config.json" >> .gitignore
   echo "*.log" >> .gitignore
   echo "approved_tasks.json" >> .gitignore
   ```

2. **Use environment variables in production**
   ```bash
   # In production, set via environment
   export SLACK_BOT_TOKEN="xoxb-production-token"
   ```

3. **Restrict bot permissions**
   - Only add necessary scopes
   - Use specific channels, not entire workspace

## 📈 Next Steps

1. **Test the basic flow** with simple_slack_approval.py
2. **Set up the full bot** for continuous operation
3. **Integrate with your RL pipeline**
4. **Add monitoring and alerts**
5. **Scale to multiple channels/users**

## 🆘 Support

If you encounter issues:

1. Check the logs: `tail -f slack_approval_bot.log`
2. Verify Slack app permissions
3. Test with simple version first
4. Check file paths and permissions

The system is designed to be flexible and work with different setups. Adjust file paths and configuration as needed for your specific environment. 