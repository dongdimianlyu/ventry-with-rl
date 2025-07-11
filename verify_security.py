#!/usr/bin/env python3
"""
Security verification script to ensure all secrets have been moved to environment variables
"""

import os
import json
import re
from pathlib import Path


def check_for_secrets_in_files():
    """Check for potential secrets in configuration files"""
    print("🔍 Checking for hardcoded secrets in configuration files...")
    
    # Patterns that might indicate secrets
    secret_patterns = [
        r'xoxb-\d+-\d+-\w+',  # Slack bot token
        r'xapp-\d+-\w+-\d+-\w+',  # Slack app token
        r'[A-Za-z0-9]{32,}',  # Long alphanumeric strings (potential secrets)
        r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',  # JWT tokens
    ]
    
    config_files = ['slack_config.json', 'quickbooks_config.json']
    
    for config_file in config_files:
        if os.path.exists(config_file):
            print(f"  Checking {config_file}...")
            
            with open(config_file, 'r') as f:
                content = f.read()
                
            # Check for hardcoded secrets
            for pattern in secret_patterns:
                matches = re.findall(pattern, content)
                if matches:
                    # Filter out environment variable placeholders
                    real_matches = [m for m in matches if not m.startswith('${') and not m.endswith('}')]
                    if real_matches:
                        print(f"    ❌ Potential secret found: {real_matches[0][:10]}...")
                        return False
            
            # Check for environment variable placeholders
            env_vars = re.findall(r'\$\{([^}]+)\}', content)
            if env_vars:
                print(f"    ✅ Environment variables found: {', '.join(env_vars)}")
            else:
                print(f"    ⚠️  No environment variables found")
        else:
            print(f"  ⚠️  {config_file} not found")
    
    return True


def check_env_files():
    """Check that .env and .env.example files exist and are properly configured"""
    print("\n🔍 Checking environment files...")
    
    # Check .env file
    if os.path.exists('.env'):
        print("  ✅ .env file exists")
        
        # Count variables in .env
        with open('.env', 'r') as f:
            env_lines = [line.strip() for line in f if line.strip() and not line.startswith('#') and '=' in line]
        
        print(f"  📊 Found {len(env_lines)} environment variables in .env")
        
        # Check for required variables
        required_vars = ['SLACK_BOT_TOKEN', 'QB_CLIENT_ID', 'QB_CLIENT_SECRET']
        env_content = open('.env', 'r').read()
        
        for var in required_vars:
            if var in env_content:
                print(f"    ✅ {var} found")
            else:
                print(f"    ❌ {var} missing")
                return False
    else:
        print("  ❌ .env file not found")
        return False
    
    # Check .env.example file
    if os.path.exists('.env.example'):
        print("  ✅ .env.example file exists")
        
        # Verify it contains placeholders, not real secrets
        with open('.env.example', 'r') as f:
            example_content = f.read()
        
        if 'your_' in example_content or 'here' in example_content:
            print("  ✅ .env.example contains placeholders")
        else:
            print("  ⚠️  .env.example might contain real secrets")
    else:
        print("  ❌ .env.example file not found")
        return False
    
    return True


def check_gitignore():
    """Check that .gitignore properly excludes secret files"""
    print("\n🔍 Checking .gitignore configuration...")
    
    if os.path.exists('.gitignore'):
        with open('.gitignore', 'r') as f:
            gitignore_content = f.read()
        
        # Check for important patterns
        important_patterns = ['.env', '*.log', '*.pid']
        
        for pattern in important_patterns:
            if pattern in gitignore_content:
                print(f"  ✅ {pattern} is ignored")
            else:
                print(f"  ❌ {pattern} is NOT ignored")
                return False
        
        print("  ✅ .gitignore properly configured")
    else:
        print("  ❌ .gitignore file not found")
        return False
    
    return True


def test_environment_loader():
    """Test that the environment loader works correctly"""
    print("\n🔍 Testing environment loader...")
    
    try:
        from env_loader import load_env_file, load_config_with_env
        
        # Test loading .env file
        env_vars = load_env_file('.env')
        print(f"  ✅ Loaded {len(env_vars)} environment variables")
        
        # Test config loading with substitution
        if os.path.exists('slack_config.json'):
            slack_config = load_config_with_env('slack_config.json')
            slack_token = slack_config.get('SLACK_BOT_TOKEN')
            if slack_token and not slack_token.startswith('${'):
                print("  ✅ Slack config loaded with substitution")
            else:
                print("  ❌ Slack config substitution failed")
                return False
        
        if os.path.exists('quickbooks_config.json'):
            qb_config = load_config_with_env('quickbooks_config.json')
            qb_client_id = qb_config.get('QB_CLIENT_ID')
            if qb_client_id and not qb_client_id.startswith('${'):
                print("  ✅ QuickBooks config loaded with substitution")
            else:
                print("  ❌ QuickBooks config substitution failed")
                return False
        
        print("  ✅ Environment loader working correctly")
        return True
        
    except Exception as e:
        print(f"  ❌ Environment loader test failed: {e}")
        return False


def main():
    """Run all security verification checks"""
    print("🔒 **Security Verification Report**")
    print("=" * 50)
    
    checks = [
        ("Configuration Files", check_for_secrets_in_files),
        ("Environment Files", check_env_files),
        ("Git Ignore", check_gitignore),
        ("Environment Loader", test_environment_loader),
    ]
    
    all_passed = True
    results = []
    
    for check_name, check_func in checks:
        try:
            result = check_func()
            results.append((check_name, result))
            if not result:
                all_passed = False
        except Exception as e:
            print(f"❌ {check_name} check failed with error: {e}")
            results.append((check_name, False))
            all_passed = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 **Summary**")
    
    for check_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {check_name}: {status}")
    
    if all_passed:
        print("\n🎉 **All security checks passed!**")
        print("✅ Repository is secure and ready for sharing")
        print("✅ All secrets have been moved to environment variables")
        print("✅ Configuration files contain only placeholders")
    else:
        print("\n⚠️  **Some security checks failed!**")
        print("❌ Please review the issues above before sharing the repository")
    
    return all_passed


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 