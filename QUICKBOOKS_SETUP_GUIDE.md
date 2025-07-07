# QuickBooks Integration Setup Guide

A complete guide to connect your approved tasks from the Slack approval system to QuickBooks Online.

## 🎯 Overview

This integration automatically executes approved tasks in QuickBooks Online:
- **Inventory Updates**: Restock items based on RL recommendations
- **Invoice Creation**: Generate invoices for billing tasks
- **Expense Recording**: Log business expenses and purchases

## 📋 Prerequisites

- QuickBooks Online account (or Sandbox for testing)
- Admin access to create QuickBooks apps
- Python 3.7 or higher
- Approved tasks from the Slack approval system

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install QuickBooks SDK
pip3 install -r requirements_quickbooks.txt

# Or install manually
pip3 install python-quickbooks intuitlib requests python-dotenv
```

### 2. Create QuickBooks App

1. Go to [Intuit Developer Dashboard](https://developer.intuit.com/app/developer/myapps)
2. Click **"Create an app"**
3. Choose **"QuickBooks Online and Payments"**
4. Fill in your app details:
   - **App name**: `"RL Task Executor"`
   - **Description**: `"Execute AI-recommended tasks in QuickBooks"`
5. Click **"Create app"**

### 3. Configure App Settings

In your QuickBooks app dashboard:

1. Go to **"Keys & OAuth"**
2. Copy these values:
   - **Client ID** 
   - **Client Secret**
3. Set **Redirect URIs** (for OAuth):
   - `https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl`
4. Set **Scopes**:
   - `com.intuit.quickbooks.accounting`

### 4. Get Access Tokens

**Option A: OAuth 2.0 Playground (Recommended)**
1. Go to [OAuth 2.0 Playground](https://developer.intuit.com/app/developer/playground)
2. Enter your Client ID and Client Secret
3. Select scope: `com.intuit.quickbooks.accounting`
4. Click **"Connect to QuickBooks"**
5. Authorize your app
6. Copy the **Access Token** and **Company ID**

**Option B: Manual OAuth Flow**
```python
# Use this script to get tokens manually
from intuitlib.client import AuthClient

auth_client = AuthClient(
    client_id='your-client-id',
    client_secret='your-client-secret',
    environment='sandbox',  # or 'production'
    redirect_uri='https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl'
)

# Get authorization URL
auth_url = auth_client.get_authorization_url([Scopes.ACCOUNTING])
print(f"Visit: {auth_url}")
# Follow the URL, authorize, and get the authorization code
# Then exchange it for tokens
```

### 5. Configure Environment Variables

**Option A: Environment Variables**
```bash
export QB_CLIENT_ID=ABIbhWe0pBXQfPzbu16e9OhU599bhFent0kEDNPpX2DgZvUi40
export QB_CLIENT_SECRET=KvtfwQzhzthxGs35XKAw4DKOi29R18FTH6eVCQLV
export QB_ACCESS_TOKEN=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..7Dlb5EcU8ojLTi3Gafad3A.mBK1mEq6I6uztKFSdrL_k8vJO6WI2zhEFXPpTBFgkTcuO7DcD2t3MSFC_2Nvanp5Ft5meggxohgvaFiAtD9qfXAnfJ4W6JtOMlWAJCgCGwxJBvZm_YUXoAu_yhn3npckY1bTwBNpWOx6rFbD0tVa25e6ljHd06ituUqvh48HB1FH7HHZYV8VvBmgvNfzH05Xd2njL7rre2gKMYic1meHojfeYZocxPYp9YfEBes5x2RFWpgMYTG40xYeS8n-hSz9NIAoCVxlrjTviArEVH4-tnEMlCesRaCudd2ACU8Aaa3NKF3isGr4q7A5iflSa_E-eTmytz0YNjw2fUC_tnsjLFjAmagcaAgjHaC4Tg8XbVOm7ikGk06p-Lkasa4vGvKZKRuzYag1gGsqF6HTVU92bNOQ05eI15_rb9BITWsU5kD3flXziXymfm1qNWFYLHKkjw_28xrMTmZSax59o8wYkGFjzFscnKcl5Qtff9V1zko.hyXWaEq47hkEcB6CPORshw
export QB_COMPANY_ID=9341454967406675
export QB_SANDBOX=true  # false for production
```

**Option B: Configuration File**
```bash
# Create config file
cp quickbooks_config.json my_qb_config.json

# Edit with your actual values
nano my_qb_config.json
```

### 6. Test the Setup

```bash
# Check configuration and connection
python quickbooks_executor.py --status

# Test with dry run (won't make real changes)
python quickbooks_executor.py --dry-run
```

## 📁 File Structure

After setup, you'll have:

```
your-project/
├── quickbooks_executor.py              # Main executor script
├── requirements_quickbooks.txt          # Dependencies
├── quickbooks_config.json              # Config template
├── my_qb_config.json                   # Your actual config
├── approved_tasks.json                 # Input from Slack approval
├── quickbooks_execution_log.json       # Execution history
└── quickbooks_executor.log             # Detailed logs
```

## 🛠️ Configuration Options

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `QB_CLIENT_ID` | Yes | QuickBooks app client ID | `Q0123456789abcdefg` |
| `QB_CLIENT_SECRET` | Yes | QuickBooks app client secret | `abcdef123456789` |
| `QB_ACCESS_TOKEN` | Yes | OAuth access token | `eyJhbGciOiJSUzI1...` |
| `QB_COMPANY_ID` | Yes | QuickBooks company ID | `123145816541622` |
| `QB_REFRESH_TOKEN` | No | OAuth refresh token | `L011546037639...` |
| `QB_SANDBOX` | No | Use sandbox environment | `true` or `false` |
| `APPROVED_TASKS_FILE` | No | Path to approved tasks | `approved_tasks.json` |
| `EXECUTION_LOG_FILE` | No | Path to execution log | `quickbooks_execution_log.json` |

### Configuration File

Create `my_qb_config.json`:

```json
{
  "QB_CLIENT_ID": "Q0123456789abcdefg",
  "QB_CLIENT_SECRET": "abcdef123456789",
  "QB_ACCESS_TOKEN": "eyJhbGciOiJSUzI1...",
  "QB_COMPANY_ID": "123145816541622",
  "QB_SANDBOX": "true",
  "APPROVED_TASKS_FILE": "approved_tasks.json"
}
```

## 🎮 Usage Examples

### Execute All Pending Tasks

```bash
# Execute all approved tasks
python quickbooks_executor.py --execute

# Dry run (show what would happen)
python quickbooks_executor.py --dry-run
```

### Execute Specific Task

```bash
# Execute specific task by ID
python quickbooks_executor.py --task task_20250106_142530
```

### Check Status

```bash
# Show current status
python quickbooks_executor.py --status
```

## 🔄 Integration with Slack Approval System

### Complete Workflow

```bash
#!/bin/bash
# complete_ai_workflow.sh

echo "🤖 1. Running RL Agent..."
cd rl-agent
python inference.py

echo "📤 2. Sending for Slack approval..."
cd ..
python simple_slack_approval.py --send-and-listen --listen 10

echo "⚙️ 3. Executing approved tasks in QuickBooks..."
python quickbooks_executor.py --execute

echo "✅ Complete AI-to-QuickBooks workflow finished!"
```

### Automated Pipeline

```python
# automated_pipeline.py
import subprocess
import time

def run_complete_pipeline():
    """Run the complete AI recommendation to QuickBooks execution pipeline"""
    
    # 1. Generate RL recommendations
    print("🤖 Generating AI recommendations...")
    result = subprocess.run(["python", "rl-agent/inference.py"])
    if result.returncode != 0:
        print("❌ RL agent failed")
        return False
    
    # 2. Send for approval
    print("📤 Sending for approval...")
    result = subprocess.run([
        "python", "simple_slack_approval.py", "--send"
    ])
    if result.returncode != 0:
        print("❌ Slack approval failed")
        return False
    
    # 3. Wait for approval (you could also check periodically)
    print("⏳ Waiting for approval...")
    time.sleep(300)  # Wait 5 minutes
    
    # 4. Execute approved tasks
    print("⚙️ Executing in QuickBooks...")
    result = subprocess.run([
        "python", "quickbooks_executor.py", "--execute"
    ])
    
    return result.returncode == 0

if __name__ == "__main__":
    success = run_complete_pipeline()
    print(f"{'✅ Pipeline completed!' if success else '❌ Pipeline failed'}")
```

## 📊 Task Types and Actions

### Inventory Updates

**Input Task:**
```json
{
  "action": "restock",
  "quantity": 100,
  "reasoning": "Based on demand analysis for Product X"
}
```

**QuickBooks Action:**
- Updates existing item quantity
- Creates new inventory item if needed
- Sets proper accounts (Income, COGS, Asset)

### Invoice Creation

**Input Task:**
```json
{
  "action": "invoice",
  "quantity": 1,
  "reasoning": "Send invoice for $500 to Client Y"
}
```

**QuickBooks Action:**
- Creates customer if doesn't exist
- Generates invoice with line items
- Sets appropriate service items

### Expense Recording

**Input Task:**
```json
{
  "action": "expense",
  "quantity": 200,
  "reasoning": "Log expense for $200 marketing spend"
}
```

**QuickBooks Action:**
- Creates vendor if doesn't exist
- Records bill/expense
- Categorizes by expense type

## 🔧 Troubleshooting

### Common Issues

**1. "Missing QuickBooks configuration" error**
```bash
# Check environment variables
python -c "import os; print({k:v for k,v in os.environ.items() if 'QB_' in k})"

# Or check config file
cat my_qb_config.json
```

**2. "QuickBooks connection failed" error**
- Check if tokens are expired (access tokens expire in 1 hour)
- Verify company ID is correct
- Ensure app has proper scopes

**3. "No approved tasks found" error**
```bash
# Check if tasks file exists
ls -la approved_tasks.json

# Run Slack approval first
python simple_slack_approval.py --status
```

**4. "Item/Customer/Vendor creation failed" error**
- Check QuickBooks permissions
- Verify account setup in QuickBooks
- Review execution logs

### Debug Mode

```bash
# Run with detailed logging
python quickbooks_executor.py --dry-run

# Check logs
tail -f quickbooks_executor.log
```

### Token Refresh

Access tokens expire every hour. To refresh:

```python
from intuitlib.client import AuthClient

auth_client = AuthClient(
    client_id='your-client-id',
    client_secret='your-client-secret',
    environment='sandbox'
)

# Refresh token
new_tokens = auth_client.refresh(refresh_token='your-refresh-token')
print(f"New access token: {new_tokens['access_token']}")
```

## 🔐 Security Best Practices

1. **Never commit credentials to git**
   ```bash
   # Add to .gitignore
   echo "my_qb_config.json" >> .gitignore
   echo "quickbooks_execution_log.json" >> .gitignore
   echo "*.log" >> .gitignore
   ```

2. **Use environment variables in production**
   ```bash
   # In production, set via environment
   export QB_ACCESS_TOKEN="production-token"
   export QB_SANDBOX="false"
   ```

3. **Rotate tokens regularly**
   - Access tokens expire in 1 hour
   - Refresh tokens expire in 101 days
   - Set up automatic token refresh

4. **Use sandbox for testing**
   - Always test with sandbox first
   - Sandbox data doesn't affect real books

## 📈 Monitoring and Logging

### Execution Logs

The system creates detailed logs:

```json
{
  "session_id": "20250106_142530",
  "executed_at": "2025-01-06T14:25:30.123456",
  "results": [
    {
      "task_id": "task_20250106_142530",
      "success": true,
      "action": "inventory_update",
      "message": "Updated Product X: 50 → 150 units",
      "item_id": "123"
    }
  ],
  "statistics": {
    "total_processed": 1,
    "successful": 1,
    "failed": 0
  }
}
```

### Monitoring Script

```python
# monitor_executions.py
import json
from datetime import datetime, timedelta

def check_recent_executions():
    """Check executions from last 24 hours"""
    try:
        with open('quickbooks_execution_log.json', 'r') as f:
            log = json.load(f)
        
        recent = []
        cutoff = datetime.now() - timedelta(hours=24)
        
        for session in log:
            session_time = datetime.fromisoformat(session['executed_at'])
            if session_time > cutoff:
                recent.append(session)
        
        print(f"📊 Executions in last 24 hours: {len(recent)}")
        for session in recent:
            stats = session['statistics']
            print(f"   {session['session_id']}: {stats['successful']} success, {stats['failed']} failed")
    
    except FileNotFoundError:
        print("No execution log found")

if __name__ == "__main__":
    check_recent_executions()
```

## 🆘 Support

If you encounter issues:

1. Check the logs: `tail -f quickbooks_executor.log`
2. Verify QuickBooks app permissions
3. Test with dry run first: `--dry-run`
4. Check token expiration
5. Verify company ID and sandbox settings

## 📚 Additional Resources

- [QuickBooks API Documentation](https://developer.intuit.com/app/developer/qbo/docs/api/accounting)
- [Python QuickBooks SDK](https://github.com/sidecars/python-quickbooks)
- [OAuth 2.0 Playground](https://developer.intuit.com/app/developer/playground)
- [Intuit Developer Community](https://help.developer.intuit.com/)

The system is designed to be production-ready with comprehensive error handling, logging, and monitoring capabilities. 