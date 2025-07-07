#!/usr/bin/env python3
"""
Environment Variable Checker for Slack Bot

This script helps debug environment variable issues.
"""

import os
import sys

def check_env_vars():
    """Check all relevant environment variables"""
    print("🔍 Environment Variable Check")
    print("=" * 40)
    
    # Check Slack variables
    slack_vars = [
        "SLACK_BOT_TOKEN",
        "SLACK_CHANNEL_ID", 
        "SLACK_APP_TOKEN",
        "SLACK_SIGNING_SECRET"
    ]
    
    found_vars = []
    missing_vars = []
    
    for var in slack_vars:
        value = os.getenv(var)
        if value:
            found_vars.append(var)
            # Show partial value for security
            if "TOKEN" in var or "SECRET" in var:
                display_value = f"{value[:12]}..." if len(value) > 12 else value
            else:
                display_value = value
            print(f"✅ {var}: {display_value}")
        else:
            missing_vars.append(var)
            print(f"❌ {var}: Not set")
    
    print(f"\n📊 Summary:")
    print(f"   Found: {len(found_vars)} variables")
    print(f"   Missing: {len(missing_vars)} variables")
    
    if missing_vars:
        print(f"\n💡 To fix missing variables:")
        for var in missing_vars:
            if var == "SLACK_BOT_TOKEN":
                print(f"   export {var}=xoxb-your-bot-token")
            elif var == "SLACK_CHANNEL_ID":
                print(f"   export {var}=C1234567890")
            elif var == "SLACK_APP_TOKEN":
                print(f"   export {var}=xapp-your-app-token")
            elif var == "SLACK_SIGNING_SECRET":
                print(f"   export {var}=your-signing-secret")
    
    # Check if we can run the bot
    bot_token = os.getenv("SLACK_BOT_TOKEN")
    channel_id = os.getenv("SLACK_CHANNEL_ID")
    
    if bot_token and channel_id:
        print(f"\n🎉 Ready to run simple Slack bot!")
        return True
    else:
        print(f"\n⚠️  Need at least SLACK_BOT_TOKEN and SLACK_CHANNEL_ID")
        return False

def check_shell_profile():
    """Check common shell profile files"""
    print(f"\n🔍 Checking shell profile files...")
    
    home = os.path.expanduser("~")
    profile_files = [
        ".bashrc",
        ".bash_profile", 
        ".zshrc",
        ".profile"
    ]
    
    for profile in profile_files:
        path = os.path.join(home, profile)
        if os.path.exists(path):
            print(f"✅ Found: {path}")
            try:
                with open(path, 'r') as f:
                    content = f.read()
                    if "SLACK_BOT_TOKEN" in content:
                        print(f"   📝 Contains SLACK_BOT_TOKEN")
                    else:
                        print(f"   📝 No SLACK_BOT_TOKEN found")
            except:
                print(f"   ❌ Could not read file")
        else:
            print(f"❌ Not found: {path}")

if __name__ == "__main__":
    ready = check_env_vars()
    check_shell_profile()
    
    if not ready:
        print(f"\n🔧 Quick Fix Options:")
        print(f"1. Set in current session:")
        print(f"   export SLACK_BOT_TOKEN=xoxb-your-token")
        print(f"   export SLACK_CHANNEL_ID=C1234567890")
        print(f"")
        print(f"2. Add to your shell profile (~/.zshrc):")
        print(f"   echo 'export SLACK_BOT_TOKEN=xoxb-your-token' >> ~/.zshrc")
        print(f"   echo 'export SLACK_CHANNEL_ID=C1234567890' >> ~/.zshrc")
        print(f"   source ~/.zshrc")
        print(f"")
        print(f"3. Use a .env file (requires python-dotenv):")
        print(f"   Create .env file with your tokens")
        print(f"   Install: pip install python-dotenv") 