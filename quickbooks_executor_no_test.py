#!/usr/bin/env python3
"""
QuickBooks Task Executor (No Connection Test)

Modified version that skips connection test and executes tasks directly.
Use this if the connection test fails but you want to try executing tasks anyway.

Usage:
    python quickbooks_executor_no_test.py --execute           # Execute all pending tasks
    python quickbooks_executor_no_test.py --dry-run           # Show what would be executed
    python quickbooks_executor_no_test.py --status            # Show task status
"""

import json
import os
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import argparse

# Import the original executor
from quickbooks_executor import QuickBooksExecutor

class QuickBooksExecutorNoTest(QuickBooksExecutor):
    """Modified QuickBooks executor that skips connection test"""
    
    def initialize_quickbooks_client(self) -> bool:
        """Initialize QuickBooks client WITHOUT connection test"""
        try:
            self.logger.info("Initializing QuickBooks client (skipping connection test)...")
            
            # Import the simple client
            from quickbooks_simple_client import SimpleQuickBooksClient
            
            # Initialize simple client
            self.qb_client = SimpleQuickBooksClient(self.config)
            self.company_id = self.config["QB_COMPANY_ID"]
            
            # Skip connection test - just assume it will work
            self.logger.info("✅ QuickBooks client initialized (connection test skipped)")
            return True
                
        except Exception as e:
            self.logger.error(f"❌ Error initializing QuickBooks client: {e}")
            return False
    
    def show_status(self):
        """Show current status of tasks (modified to skip connection test)"""
        print("📊 **QuickBooks Task Executor Status (No Connection Test)**")
        print("=" * 50)
        
        # Check tasks file
        if not os.path.exists(self.approved_tasks_file):
            print(f"❌ No approved tasks file found: {self.approved_tasks_file}")
            print("   Run the Slack approval system first to generate tasks")
            return
        
        # Load and analyze tasks
        with open(self.approved_tasks_file, 'r') as f:
            all_tasks = json.load(f)
        
        pending_tasks = [t for t in all_tasks if t.get("status") == "approved" and not t.get("executed", False)]
        executed_tasks = [t for t in all_tasks if t.get("executed", False)]
        
        print(f"📋 **Task Summary:**")
        print(f"   Total Tasks: {len(all_tasks)}")
        print(f"   Pending Execution: {len(pending_tasks)}")
        print(f"   Already Executed: {len(executed_tasks)}")
        
        if pending_tasks:
            print(f"\n⏳ **Pending Tasks:**")
            for i, task in enumerate(pending_tasks, 1):
                task_id = task.get("id", "unknown")
                rec = task.get("recommendation", {})
                action = rec.get("action", "unknown")
                quantity = rec.get("quantity", 0)
                
                print(f"{i}. {task_id}: {action} {quantity} units")
        
        # Check QuickBooks configuration
        print(f"\n🔗 **QuickBooks Configuration:**")
        required_vars = ["QB_CLIENT_ID", "QB_CLIENT_SECRET", "QB_ACCESS_TOKEN", "QB_COMPANY_ID"]
        missing = [var for var in required_vars if not self.config.get(var)]
        
        if missing:
            print(f"   ❌ Missing: {', '.join(missing)}")
            print(f"   📖 See setup guide for configuration help")
        else:
            print(f"   ✅ All required configuration present")
            print(f"   ⚠️  Connection test skipped - will attempt execution anyway")


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="QuickBooks Task Executor (No Connection Test)")
    parser.add_argument("--execute", action="store_true", help="Execute all pending tasks")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be executed without doing it")
    parser.add_argument("--task", type=str, help="Execute specific task by ID")
    parser.add_argument("--status", action="store_true", help="Show current status")
    parser.add_argument("--config", type=str, help="Path to configuration file")
    
    args = parser.parse_args()
    
    # Create executor
    executor = QuickBooksExecutorNoTest(config_file=args.config)
    
    if args.status:
        executor.show_status()
    elif args.dry_run:
        executor.execute_all_tasks(dry_run=True)
    elif args.execute:
        executor.execute_all_tasks(dry_run=False)
    elif args.task:
        result = executor.execute_specific_task(args.task, dry_run=False)
        if result:
            print(f"✅ Task executed: {result.get('message', 'Success')}")
        else:
            print(f"❌ Task execution failed")
    else:
        # Default: show status
        executor.show_status()


if __name__ == "__main__":
    main() 