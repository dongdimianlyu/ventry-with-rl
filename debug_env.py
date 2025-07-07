#!/usr/bin/env python3
"""
Environment Variable Debug Script

This script helps debug environment variable issues with the Slack bot.
Run this first to check what's happening with your environment variables.

Usage:
    python debug_env.py
"""

import os
import sys
from pathlib import Path

def check_environment_variables():
    """Check all environment variables"""
    print("🔍 **Environment Variable Debug Report**")
    print("=" * 60)
    
    # Check current working directory
    print(f"📁 Current Directory: {os.getcwd()}")
    print(f"🐍 Python Version: {sys.version}")
    print(f"📄 Python Path: {sys.executable}")
    print()
    
    # Check for .env file
    env_files = [".env", ".env.local", ".env.development"]
    print("🔍 **Checking for .env files:**")
    for env_file in env_files:
        if os.path.exists(env_file):
            print(f"   ✅ Found: {env_file}")
            try:
                with open(env_file, 'r') as f:
                    lines = f.readlines()
                print(f"      📄 Contains {len(lines)} lines")
                
                # Show non-sensitive lines
                for i, line in enumerate(lines[:5], 1):
                    line = line.strip()
                    if line and not line.startswith('#'):
                        if any(secret in line.upper() for secret in ['TOKEN', 'SECRET', 'KEY']):
                            # Hide sensitive values
                            if '=' in line:
                                key, _ = line.split('=', 1)
                                print(f"      {i}. {key}=***HIDDEN***")
                            else:
                                print(f"      {i}. {line[:20]}...")
                        else:
                            print(f"      {i}. {line}")
                if len(lines) > 5:
                    print(f"      ... and {len(lines) - 5} more lines")
            except Exception as e:
                print(f"      ❌ Error reading file: {e}")
        else:
            print(f"   ❌ Not found: {env_file}")
    print()
    
    # Check Slack environment variables
    slack_vars = {
        "SLACK_BOT_TOKEN": "Bot token (starts with xoxb-)",
        "SLACK_CHANNEL_ID": "Channel ID (starts with C) or User ID (starts with U)",
        "SLACK_APP_TOKEN": "App token (starts with xapp-) - needed for full bot",
        "SLACK_SIGNING_SECRET": "Signing secret - needed for full bot"
    }
    
    print("🔍 **Slack Environment Variables:**")
    found_count = 0
    
    for var, description in slack_vars.items():
        value = os.getenv(var)
        if value:
            found_count += 1
            # Show partial value for security
            if len(value) > 12:
                display_value = f"{value[:12]}..."
            else:
                display_value = value
            print(f"   ✅ {var}: {display_value}")
            print(f"      📝 {description}")
        else:
            print(f"   ❌ {var}: Not set")
            print(f"      📝 {description}")
        print()
    
    print(f"📊 **Summary:** {found_count}/{len(slack_vars)} variables found")
    
    # Check if minimum requirements are met
    bot_token = os.getenv("SLACK_BOT_TOKEN")
    channel_id = os.getenv("SLACK_CHANNEL_ID")
    
    print("\n🎯 **Readiness Check:**")
    if bot_token and channel_id:
        print("   ✅ Ready for simple Slack bot (has BOT_TOKEN and CHANNEL_ID)")
        
        # Validate token format
        if bot_token.startswith("xoxb-"):
            print("   ✅ Bot token format looks correct")
        else:
            print("   ⚠️  Bot token should start with 'xoxb-'")
        
        # Validate channel ID format
        if channel_id.startswith(("C", "U", "D")):
            print("   ✅ Channel/User ID format looks correct")
        else:
            print("   ⚠️  Channel ID should start with 'C' (channel) or 'U' (user)")
            
    else:
        print("   ❌ Missing required variables for simple bot")
        print("       Need: SLACK_BOT_TOKEN and SLACK_CHANNEL_ID")
    
    app_token = os.getenv("SLACK_APP_TOKEN")
    if app_token:
        print("   ✅ Ready for full async bot (has APP_TOKEN)")
    else:
        print("   ⚠️  No APP_TOKEN - can only use simple bot")
    
    return bot_token, channel_id

def test_dotenv_loading():
    """Test if dotenv is working"""
    print("\n🔍 **Testing .env file loading:**")
    
    try:
        from dotenv import load_dotenv
        print("   ✅ python-dotenv is installed")
        
        # Try to load .env file
        if os.path.exists(".env"):
            result = load_dotenv(".env")
            print(f"   {'✅' if result else '❌'} load_dotenv('.env') returned: {result}")
        else:
            print("   ℹ️  No .env file to load")
            
        # Try to load .env.local
        if os.path.exists(".env.local"):
            result = load_dotenv(".env.local")
            print(f"   {'✅' if result else '❌'} load_dotenv('.env.local') returned: {result}")
        else:
            print("   ℹ️  No .env.local file to load")
            
    except ImportError:
        print("   ❌ python-dotenv not installed")
        print("   💡 Install with: pip install python-dotenv")

def suggest_solutions(bot_token, channel_id):
    """Suggest solutions based on what's missing"""
    print("\n💡 **Suggested Solutions:**")
    
    if not bot_token and not channel_id:
        print("1. **Create .env file** (recommended):")
        print("   echo 'SLACK_BOT_TOKEN=xoxb-your-token-here' > .env")
        print("   echo 'SLACK_CHANNEL_ID=C1234567890' >> .env")
        print()
        print("2. **Or set environment variables directly:**")
        print("   export SLACK_BOT_TOKEN=xoxb-your-token-here")
        print("   export SLACK_CHANNEL_ID=C1234567890")
        print()
        
    elif not bot_token:
        print("1. **Set SLACK_BOT_TOKEN:**")
        print("   export SLACK_BOT_TOKEN=xoxb-your-token-here")
        print("   # Or add to .env file")
        print()
        
    elif not channel_id:
        print("1. **Set SLACK_CHANNEL_ID:**")
        print("   export SLACK_CHANNEL_ID=C1234567890")
        print("   # Or add to .env file")
        print()
    
    print("3. **Test the fix:**")
    print("   python debug_env.py")
    print("   python simple_slack_approval.py --status")
    print()
    
    print("4. **If still having issues:**")
    print("   - Make sure you're running from the same terminal where you set variables")
    print("   - Try restarting your terminal/shell")
    print("   - Check if you have multiple Python environments")

def create_sample_env_file():
    """Create a sample .env file"""
    print("\n📝 **Creating sample .env file:**")
    
    if os.path.exists(".env"):
        print("   ⚠️  .env file already exists, not overwriting")
        return
    
    sample_content = """# Slack Bot Configuration
# Replace these with your actual values

# Required: Bot User OAuth Token (starts with xoxb-)
SLACK_BOT_TOKEN=xoxb-your-bot-token-here

# Required: Channel ID (starts with C) or User ID (starts with U)
SLACK_CHANNEL_ID=C1234567890

# Optional: App-Level Token for full bot features (starts with xapp-)
# SLACK_APP_TOKEN=xapp-your-app-token-here

# Optional: Signing Secret for webhook verification
# SLACK_SIGNING_SECRET=your-signing-secret-here

# Optional: File paths (defaults shown)
# RECOMMENDATIONS_FILE=recommendations.json
# APPROVED_TASKS_FILE=approved_tasks.json
# RL_AGENT_PATH=rl-agent
"""
    
    try:
        with open(".env", "w") as f:
            f.write(sample_content)
        print("   ✅ Created .env file with sample configuration")
        print("   📝 Edit .env file and add your actual tokens")
        print("   🔐 Don't commit .env to git!")
    except Exception as e:
        print(f"   ❌ Error creating .env file: {e}")

def main():
    """Main debug function"""
    bot_token, channel_id = check_environment_variables()
    test_dotenv_loading()
    suggest_solutions(bot_token, channel_id)
    
    # Offer to create sample .env file
    if not bot_token and not channel_id:
        print("\n❓ **Would you like me to create a sample .env file?**")
        print("   This will help you get started with the configuration.")
        print("   Run: python debug_env.py --create-env")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--create-env":
        create_sample_env_file()
    else:
        main() 