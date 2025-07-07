#!/usr/bin/env python3
"""
Simple test to create a customer in QuickBooks
"""

import json
import os
import requests

def test_create_customer():
    """Test creating a customer with minimal data"""
    print("🧪 **Testing Customer Creation**")
    print("=" * 40)
    
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
    
    # Build API URL
    base_url = "https://sandbox-quickbooks.api.intuit.com" if config.get('QB_SANDBOX') == 'true' else "https://quickbooks.api.intuit.com"
    api_url = f"{base_url}/v3/company/{config['QB_COMPANY_ID']}"
    
    # Build headers
    headers = {
        'Authorization': f'Bearer {config["QB_ACCESS_TOKEN"]}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    # Test 1: Try minimal customer data
    print("\n📋 **Test 1: Minimal Customer Data**")
    customer_data = {
        'DisplayName': 'Test Customer 1'
    }
    
    payload = {'Customer': customer_data}
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    url = f"{api_url}/customer"
    response = requests.post(url, headers=headers, json=payload)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Success!")
        return
    
    # Test 2: Try with Name instead of DisplayName
    print("\n📋 **Test 2: Using Name instead of DisplayName**")
    customer_data = {
        'Name': 'Test Customer 2'
    }
    
    payload = {'Customer': customer_data}
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, headers=headers, json=payload)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Success!")
        return
    
    # Test 3: Try with both Name and DisplayName
    print("\n📋 **Test 3: Using both Name and DisplayName**")
    customer_data = {
        'Name': 'Test Customer 3',
        'DisplayName': 'Test Customer 3'
    }
    
    payload = {'Customer': customer_data}
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, headers=headers, json=payload)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Success!")
    else:
        print("❌ All tests failed")

if __name__ == "__main__":
    test_create_customer() 