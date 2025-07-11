# QuickBooks Execution Control

## 🔧 For Beta Testing - Disable QuickBooks Execution

To disable QuickBooks automatic execution during beta testing, add this to your `.env` file:

```bash
# 🔧 BETA TESTING: Set to 'true' to disable QuickBooks execution
QUICKBOOKS_DISABLED=true
```

## ✅ To Re-enable QuickBooks Execution

To re-enable QuickBooks execution after beta testing:

**Option 1: Change the value**
```bash
# Re-enable QuickBooks execution
QUICKBOOKS_DISABLED=false
```

**Option 2: Remove the line entirely**
```bash
# Just delete or comment out the QUICKBOOKS_DISABLED line
# QUICKBOOKS_DISABLED=true
```

## 🔍 How It Works

When `QUICKBOOKS_DISABLED=true`:
- ✅ Slack notifications still work
- ✅ Task approval/rejection still works  
- ✅ All UI functionality remains the same
- ❌ Tasks are NOT written to `approved_tasks.json`
- ❌ QuickBooks executor will NOT process tasks
- 📝 Slack messages indicate "QuickBooks execution disabled for beta testing"

When `QUICKBOOKS_DISABLED=false` or not set:
- ✅ Full QuickBooks integration works as normal
- ✅ Tasks are written to `approved_tasks.json`
- ✅ QuickBooks executor processes approved tasks
- 📝 Slack messages indicate "queued for QuickBooks execution"

## 🚀 Quick Commands

**Disable QuickBooks:**
```bash
echo "QUICKBOOKS_DISABLED=true" >> .env
```

**Enable QuickBooks:**
```bash
sed -i '' 's/QUICKBOOKS_DISABLED=true/QUICKBOOKS_DISABLED=false/' .env
```

**Remove the setting entirely:**
```bash
sed -i '' '/QUICKBOOKS_DISABLED/d' .env
```

## 📋 Current Status

You can check if QuickBooks is disabled by looking at the API responses:
- `quickbooksQueued: false` = QuickBooks is disabled
- `quickbooksDisabled: true` = QuickBooks is disabled
- `quickbooksQueued: true` = QuickBooks is enabled 