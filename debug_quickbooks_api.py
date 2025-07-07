#!/usr/bin/env python3
"""
Debug QuickBooks API Structure
Examines existing entities to understand correct JSON format
"""

import json
import os
from quickbooks_simple_client import SimpleQuickBooksClient

def debug_api_structure():
    """Debug the QuickBooks API structure"""
    print("🔍 **QuickBooks API Structure Debug**")
    print("=" * 50)
    
    # Load config
    config = {}
    if os.path.exists('quickbooks_config.json'):
        with open('quickbooks_config.json', 'r') as f:
            config = json.load(f)
    
    # Override with environment variables
    env_vars = ['QB_CLIENT_ID', 'QB_CLIENT_SECRET', 'QB_ACCESS_TOKEN', 'QB_COMPANY_ID', 'QB_SANDBOX']
    for var in env_vars:
        if var in os.environ:
            config[var] = os.environ[var]
    
    client = SimpleQuickBooksClient(config)
    
    if not client.test_connection():
        print("❌ Connection failed")
        return
    
    # Check existing customers
    print("\n📋 **Sample Customer Structure:**")
    customers = client.query('Customer')
    if customers:
        sample_customer = customers[0]
        print(json.dumps(sample_customer, indent=2))
    else:
        print("No customers found")
    
    # Check existing vendors
    print("\n📋 **Sample Vendor Structure:**")
    vendors = client.query('Vendor')
    if vendors:
        sample_vendor = vendors[0]
        print(json.dumps(sample_vendor, indent=2))
    else:
        print("No vendors found")
    
    # Check existing items
    print("\n📋 **Sample Item Structure:**")
    items = client.query('Item')
    if items:
        sample_item = items[0]
        print(json.dumps(sample_item, indent=2))
    else:
        print("No items found")
    
    # Check existing accounts
    print("\n📋 **Sample Account Structure:**")
    accounts = client.query('Account')
    if accounts:
        sample_account = accounts[0]
        print(json.dumps(sample_account, indent=2))
    else:
        print("No accounts found")

if __name__ == "__main__":
    debug_api_structure() 