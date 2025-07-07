#!/usr/bin/env python3
"""
Test QuickBooks Integration

This script helps test the QuickBooks integration by creating sample approved tasks
and testing the connection without affecting real data.

Usage:
    python test_quickbooks_integration.py --create-sample-tasks
    python test_quickbooks_integration.py --test-connection
    python test_quickbooks_integration.py --test-parsing
"""

import json
import os
import argparse
from datetime import datetime
from typing import Dict, List, Any

def create_sample_approved_tasks() -> List[Dict[str, Any]]:
    """Create sample approved tasks for testing"""
    sample_tasks = [
        {
            "id": "task_20250106_140000",
            "approved_at": "2025-01-06T14:00:00.000000",
            "status": "approved",
            "executed": False,
            "recommendation": {
                "action": "restock",
                "quantity": 50,
                "expected_roi": "25.5%",
                "confidence": "high",
                "reasoning": "Based on demand analysis - need to restock Product X inventory",
                "timestamp": "2025-01-06T13:55:00.000000"
            }
        },
        {
            "id": "task_20250106_140001",
            "approved_at": "2025-01-06T14:00:01.000000",
            "status": "approved", 
            "executed": False,
            "recommendation": {
                "action": "invoice",
                "quantity": 1,
                "expected_roi": "100.0%",
                "confidence": "high",
                "reasoning": "Send invoice for $500 to Client ABC for consulting services",
                "timestamp": "2025-01-06T13:55:01.000000"
            }
        },
        {
            "id": "task_20250106_140002",
            "approved_at": "2025-01-06T14:00:02.000000",
            "status": "approved",
            "executed": False,
            "recommendation": {
                "action": "expense",
                "quantity": 200,
                "expected_roi": "15.0%",
                "confidence": "medium",
                "reasoning": "Log expense for $200 marketing spend on social media advertising",
                "timestamp": "2025-01-06T13:55:02.000000"
            }
        },
        {
            "id": "task_20250106_140003",
            "approved_at": "2025-01-06T14:00:03.000000",
            "status": "approved",
            "executed": False,
            "recommendation": {
                "action": "restock",
                "quantity": 75,
                "expected_roi": "30.2%",
                "confidence": "high",
                "reasoning": "Restock 75 units of Office Supplies based on inventory analysis",
                "timestamp": "2025-01-06T13:55:03.000000"
            }
        }
    ]
    
    return sample_tasks

def save_sample_tasks():
    """Save sample tasks to approved_tasks.json"""
    try:
        sample_tasks = create_sample_approved_tasks()
        
        # Check if file already exists
        if os.path.exists("approved_tasks.json"):
            response = input("approved_tasks.json already exists. Overwrite? (y/N): ")
            if response.lower() != 'y':
                print("❌ Cancelled - not overwriting existing file")
                return False
        
        # Save sample tasks
        with open("approved_tasks.json", 'w') as f:
            json.dump(sample_tasks, f, indent=2)
        
        print("✅ Created approved_tasks.json with sample data:")
        for task in sample_tasks:
            rec = task["recommendation"]
            print(f"   - {task['id']}: {rec['action']} {rec['quantity']} units")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample tasks: {e}")
        return False

def test_task_parsing():
    """Test the task parsing logic"""
    try:
        # Import the QuickBooks executor
        from quickbooks_executor import QuickBooksExecutor
        
        # Create executor (won't initialize QB client for parsing test)
        executor = QuickBooksExecutor()
        
        # Load sample tasks
        sample_tasks = create_sample_approved_tasks()
        
        print("🔍 Testing Task Parsing Logic")
        print("=" * 50)
        
        for task in sample_tasks:
            task_id = task["id"]
            rec = task["recommendation"]
            
            print(f"\n📋 Task: {task_id}")
            print(f"   Original: {rec['action']} {rec['quantity']} units")
            print(f"   Reasoning: {rec['reasoning']}")
            
            # Parse intent
            intent, params = executor.parse_task_intent(task)
            
            print(f"   Parsed Intent: {intent}")
            print(f"   Parsed Params: {params}")
            
            # Show what would be executed
            if intent == "inventory_update":
                print(f"   → Would update inventory: {params['item_name']} +{params['quantity']} units")
            elif intent == "create_invoice":
                print(f"   → Would create invoice: ${params['amount']} for {params['customer']}")
            elif intent == "record_expense":
                print(f"   → Would record expense: ${params['amount']} for {params['category']}")
        
        print(f"\n✅ Task parsing test completed successfully!")
        return True
        
    except ImportError:
        print("❌ Could not import quickbooks_executor.py")
        print("   Make sure the file exists and has no syntax errors")
        return False
    except Exception as e:
        print(f"❌ Error testing task parsing: {e}")
        return False

def test_quickbooks_connection():
    """Test QuickBooks connection without making changes"""
    try:
        # Import the QuickBooks executor
        from quickbooks_executor import QuickBooksExecutor
        
        print("🔗 Testing QuickBooks Connection")
        print("=" * 50)
        
        # Create executor
        executor = QuickBooksExecutor()
        
        # Test configuration
        print("📋 Configuration Check:")
        required_vars = ["QB_CLIENT_ID", "QB_CLIENT_SECRET", "QB_ACCESS_TOKEN", "QB_COMPANY_ID"]
        missing = [var for var in required_vars if not executor.config.get(var)]
        
        if missing:
            print(f"   ❌ Missing: {', '.join(missing)}")
            print(f"   📖 See QUICKBOOKS_SETUP_GUIDE.md for setup instructions")
            return False
        else:
            print(f"   ✅ All required configuration present")
        
        # Test connection
        print(f"\n🔌 Connection Test:")
        if executor.initialize_quickbooks_client():
            print(f"   ✅ QuickBooks connection successful!")
            
            # Try a simple query
            try:
                if executor.qb_client:
                    company_info = executor.qb_client.get('CompanyInfo', executor.company_id)
                    if company_info:
                        company_name = company_info[0].CompanyName
                        print(f"   📊 Connected to: {company_name}")
                    else:
                        print(f"   ⚠️  Connected but could not get company info")
                else:
                    print(f"   ⚠️  QB client not initialized")
            except Exception as e:
                print(f"   ⚠️  Connected but query failed: {e}")
            
            return True
        else:
            print(f"   ❌ QuickBooks connection failed")
            print(f"   💡 Check your tokens and company ID")
            return False
        
    except ImportError:
        print("❌ Could not import quickbooks_executor.py")
        print("   Make sure the file exists and dependencies are installed")
        print("   Run: pip install -r requirements_quickbooks.txt")
        return False
    except Exception as e:
        print(f"❌ Error testing connection: {e}")
        return False

def run_complete_test():
    """Run all tests"""
    print("🧪 Complete QuickBooks Integration Test")
    print("=" * 60)
    
    tests = [
        ("Creating sample tasks", save_sample_tasks),
        ("Testing task parsing", test_task_parsing),
        ("Testing QuickBooks connection", test_quickbooks_connection)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{len(results) + 1}. {test_name}...")
        try:
            result = test_func()
            results.append(result)
            print(f"   {'✅ PASSED' if result else '❌ FAILED'}")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            results.append(False)
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print(f"\n📊 TEST SUMMARY")
    print(f"   Passed: {passed}/{total}")
    print(f"   {'✅ All tests passed!' if passed == total else '❌ Some tests failed'}")
    
    if passed == total:
        print(f"\n🎉 Your QuickBooks integration is ready!")
        print(f"   Next steps:")
        print(f"   1. Run: python quickbooks_executor.py --dry-run")
        print(f"   2. Run: python quickbooks_executor.py --execute")
    else:
        print(f"\n🔧 Fix the failing tests before proceeding")
    
    return passed == total

def show_setup_status():
    """Show current setup status"""
    print("📊 QuickBooks Integration Setup Status")
    print("=" * 50)
    
    # Check files
    files_to_check = [
        ("quickbooks_executor.py", "Main executor script"),
        ("requirements_quickbooks.txt", "Dependencies file"),
        ("quickbooks_config.json", "Config template"),
        ("approved_tasks.json", "Approved tasks (from Slack)")
    ]
    
    print("📁 Files:")
    for filename, description in files_to_check:
        exists = os.path.exists(filename)
        print(f"   {'✅' if exists else '❌'} {filename} - {description}")
    
    # Check environment variables
    print(f"\n🔧 Environment Variables:")
    env_vars = ["QB_CLIENT_ID", "QB_CLIENT_SECRET", "QB_ACCESS_TOKEN", "QB_COMPANY_ID"]
    for var in env_vars:
        value = os.getenv(var)
        print(f"   {'✅' if value else '❌'} {var}: {'SET' if value else 'NOT SET'}")
    
    # Check dependencies
    print(f"\n📦 Dependencies:")
    try:
        import quickbooks  # type: ignore
        print(f"   ✅ python-quickbooks: installed")
    except ImportError:
        print(f"   ❌ python-quickbooks: not installed")
    
    try:
        import intuitlib  # type: ignore
        print(f"   ✅ intuitlib: installed")
    except ImportError:
        print(f"   ❌ intuitlib: not installed")
    
    # Recommendations
    print(f"\n💡 Next Steps:")
    if not os.path.exists("approved_tasks.json"):
        print(f"   1. Create sample tasks: python test_quickbooks_integration.py --create-sample-tasks")
    
    missing_env = [var for var in env_vars if not os.getenv(var)]
    if missing_env:
        print(f"   2. Set environment variables: {', '.join(missing_env)}")
        print(f"      See: QUICKBOOKS_SETUP_GUIDE.md")
    
    try:
        import quickbooks, intuitlib  # type: ignore
    except ImportError:
        print(f"   3. Install dependencies: pip install -r requirements_quickbooks.txt")
    
    print(f"   4. Run tests: python test_quickbooks_integration.py --test-all")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Test QuickBooks Integration")
    parser.add_argument("--create-sample-tasks", action="store_true", help="Create sample approved_tasks.json")
    parser.add_argument("--test-parsing", action="store_true", help="Test task parsing logic")
    parser.add_argument("--test-connection", action="store_true", help="Test QuickBooks connection")
    parser.add_argument("--test-all", action="store_true", help="Run all tests")
    parser.add_argument("--status", action="store_true", help="Show setup status")
    
    args = parser.parse_args()
    
    if args.create_sample_tasks:
        save_sample_tasks()
    elif args.test_parsing:
        test_task_parsing()
    elif args.test_connection:
        test_quickbooks_connection()
    elif args.test_all:
        run_complete_test()
    elif args.status:
        show_setup_status()
    else:
        # Default: show status
        show_setup_status()

if __name__ == "__main__":
    main() 