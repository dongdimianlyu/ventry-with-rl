#!/usr/bin/env python3
"""
Environment loader utility to load .env files and substitute environment variables in config files
"""

import os
import json
import re
from typing import Dict, Any, Optional
from pathlib import Path


def load_env_file(env_file: str = ".env") -> Dict[str, str]:
    """Load environment variables from .env file"""
    env_vars = {}
    
    if not os.path.exists(env_file):
        return env_vars
    
    try:
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                # Skip empty lines and comments
                if not line or line.startswith('#'):
                    continue
                
                # Parse KEY=VALUE format
                if '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip()
                    
                    # Remove quotes if present
                    if value.startswith('"') and value.endswith('"'):
                        value = value[1:-1]
                    elif value.startswith("'") and value.endswith("'"):
                        value = value[1:-1]
                    
                    env_vars[key] = value
                    # Also set in os.environ for compatibility
                    os.environ[key] = value
    
    except Exception as e:
        print(f"Warning: Error loading .env file: {e}")
    
    return env_vars


def substitute_env_vars(config_data: Dict[str, Any], env_vars: Dict[str, str]) -> Dict[str, Any]:
    """Substitute environment variables in config data"""
    def substitute_value(value: Any) -> Any:
        if isinstance(value, str):
            # Replace ${VAR_NAME} patterns
            pattern = r'\$\{([^}]+)\}'
            matches = re.findall(pattern, value)
            
            for match in matches:
                env_value = env_vars.get(match) or os.environ.get(match, '')
                value = value.replace(f'${{{match}}}', env_value)
            
            return value
        elif isinstance(value, dict):
            return {k: substitute_value(v) for k, v in value.items()}
        elif isinstance(value, list):
            return [substitute_value(item) for item in value]
        else:
            return value
    
    result = substitute_value(config_data)
    return result if isinstance(result, dict) else {}


def load_config_with_env(config_file: str, env_file: str = ".env") -> Dict[str, Any]:
    """Load config file with environment variable substitution"""
    # Load environment variables
    env_vars = load_env_file(env_file)
    
    # Load config file
    if not os.path.exists(config_file):
        return {}
    
    try:
        with open(config_file, 'r') as f:
            config_data = json.load(f)
        
        # Substitute environment variables
        config_data = substitute_env_vars(config_data, env_vars)
        
        return config_data
    
    except Exception as e:
        print(f"Error loading config file {config_file}: {e}")
        return {}


def ensure_env_loaded():
    """Ensure environment variables are loaded from .env file"""
    if not os.path.exists(".env"):
        print("Warning: .env file not found. Please create one based on .env.example")
        return False
    
    load_env_file(".env")
    return True


if __name__ == "__main__":
    # Test the loader
    print("Testing environment loader...")
    
    # Load environment variables
    env_vars = load_env_file(".env")
    print(f"Loaded {len(env_vars)} environment variables")
    
    # Test config loading
    if os.path.exists("slack_config.json"):
        slack_config = load_config_with_env("slack_config.json")
        print(f"Slack config loaded: {bool(slack_config.get('SLACK_BOT_TOKEN'))}")
    
    if os.path.exists("quickbooks_config.json"):
        qb_config = load_config_with_env("quickbooks_config.json")
        print(f"QuickBooks config loaded: {bool(qb_config.get('QB_CLIENT_ID'))}") 