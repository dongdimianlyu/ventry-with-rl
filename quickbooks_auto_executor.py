#!/usr/bin/env python3
"""
QuickBooks Auto-Executor
Automatically refreshes tokens when needed and executes approved tasks.
"""

import json
import os
import logging
import subprocess
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class QuickBooksAutoExecutor:
    """Auto-executing QuickBooks system with token management"""
    
    def __init__(self, config_file: str = "quickbooks_config.json"):
        self.config_file = config_file
        self.config = {}
        self.load_config()
    
    def load_config(self) -> None:
        """Load configuration from file"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    self.config = json.load(f)
                logger.info(f"✅ Loaded configuration from {self.config_file}")
            else:
                logger.error(f"❌ Config file {self.config_file} not found")
                self.config = {}
        except Exception as e:
            logger.error(f"❌ Error loading config: {e}")
            self.config = {}
    
    def is_token_expired(self) -> bool:
        """Check if the current token is expired or will expire soon"""
        try:
            token_refreshed_at = self.config.get('TOKEN_REFRESHED_AT')
            token_expires_in = self.config.get('TOKEN_EXPIRES_IN', 3600)
            
            if not token_refreshed_at:
                logger.warning("⚠️ No token refresh timestamp found")
                return True
            
            # Parse the refresh timestamp
            refresh_time = datetime.fromisoformat(token_refreshed_at)
            
            # Calculate expiry time (with 5 minute buffer)
            expiry_time = refresh_time + timedelta(seconds=token_expires_in - 300)
            
            current_time = datetime.now()
            
            if current_time >= expiry_time:
                logger.info(f"🕐 Token expired or expiring soon (refreshed at {refresh_time}, expires around {expiry_time})")
                return True
            else:
                time_left = expiry_time - current_time
                logger.info(f"✅ Token still valid for approximately {time_left}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error checking token expiry: {e}")
            return True
    
    def refresh_token_if_needed(self) -> bool:
        """Refresh token if it's expired or expiring soon"""
        if not self.is_token_expired():
            logger.info("✅ Token is still valid")
            return True
        
        logger.info("🔄 Token needs refresh, attempting to refresh...")
        
        try:
            # Run the token refresh script
            result = subprocess.run(
                [sys.executable, 'refresh_quickbooks_token.py'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                logger.info("✅ Token refresh successful")
                # Reload config to get new token
                self.load_config()
                return True
            else:
                logger.error(f"❌ Token refresh failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Token refresh timed out")
            return False
        except Exception as e:
            logger.error(f"❌ Error during token refresh: {e}")
            return False
    
    def count_pending_tasks(self) -> int:
        """Count the number of pending tasks"""
        try:
            approved_tasks_file = self.config.get('APPROVED_TASKS_FILE', 'approved_tasks.json')
            
            if not os.path.exists(approved_tasks_file):
                return 0
            
            with open(approved_tasks_file, 'r') as f:
                tasks = json.load(f)
            
            # Count tasks that haven't been executed
            pending_count = sum(1 for task in tasks if not task.get('executed', False))
            
            return pending_count
            
        except Exception as e:
            logger.error(f"❌ Error counting pending tasks: {e}")
            return 0
    
    def execute_tasks(self, dry_run: bool = False) -> Tuple[bool, Dict]:
        """Execute approved tasks using the main executor"""
        try:
            # Choose the executor based on what's available
            executor_script = 'quickbooks_executor_no_test.py'
            if not os.path.exists(executor_script):
                executor_script = 'quickbooks_executor.py'
            
            # Prepare command
            cmd = [sys.executable, executor_script]
            if dry_run:
                cmd.append('--dry-run')
            else:
                cmd.append('--execute')
            
            logger.info(f"🚀 Running QuickBooks executor: {' '.join(cmd)}")
            
            # Execute the command
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            # Parse the result
            success = result.returncode == 0
            
            execution_result = {
                'success': success,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'executed_at': datetime.now().isoformat()
            }
            
            if success:
                logger.info("✅ Task execution completed successfully")
            else:
                logger.error(f"❌ Task execution failed: {result.stderr}")
            
            return success, execution_result
            
        except subprocess.TimeoutExpired:
            logger.error("❌ Task execution timed out")
            return False, {'error': 'Execution timed out'}
        except Exception as e:
            logger.error(f"❌ Error during task execution: {e}")
            return False, {'error': str(e)}
    
    def run_auto_execution(self, dry_run: bool = False) -> Dict:
        """Run the complete auto-execution process"""
        print("🚀 **QuickBooks Auto-Executor**")
        print("=" * 40)
        
        result = {
            'timestamp': datetime.now().isoformat(),
            'token_refresh_needed': False,
            'token_refresh_success': False,
            'pending_tasks_count': 0,
            'execution_attempted': False,
            'execution_success': False,
            'execution_details': {}
        }
        
        # Step 1: Check and refresh token if needed
        if self.is_token_expired():
            result['token_refresh_needed'] = True
            
            if self.refresh_token_if_needed():
                result['token_refresh_success'] = True
                print("✅ Token refreshed successfully")
            else:
                result['token_refresh_success'] = False
                print("❌ Token refresh failed - cannot proceed")
                return result
        else:
            print("✅ Token is valid")
        
        # Step 2: Count pending tasks
        pending_count = self.count_pending_tasks()
        result['pending_tasks_count'] = pending_count
        
        print(f"📊 Found {pending_count} pending tasks")
        
        if pending_count == 0:
            print("ℹ️ No pending tasks to execute")
            return result
        
        # Step 3: Execute tasks
        result['execution_attempted'] = True
        
        if dry_run:
            print("🧪 Running in DRY-RUN mode...")
        else:
            print("⚡ Executing tasks...")
        
        execution_success, execution_details = self.execute_tasks(dry_run=dry_run)
        
        result['execution_success'] = execution_success
        result['execution_details'] = execution_details
        
        # Step 4: Summary
        print("\n📋 **Execution Summary:**")
        if result['token_refresh_needed']:
            print(f"   Token Refresh: {'✅ Success' if result['token_refresh_success'] else '❌ Failed'}")
        
        print(f"   Pending Tasks: {result['pending_tasks_count']}")
        
        if result['execution_attempted']:
            print(f"   Execution: {'✅ Success' if result['execution_success'] else '❌ Failed'}")
        
        return result
    
    def get_status(self) -> Dict:
        """Get current system status"""
        status = {
            'timestamp': datetime.now().isoformat(),
            'token_valid': not self.is_token_expired(),
            'pending_tasks': self.count_pending_tasks(),
            'config_loaded': bool(self.config),
            'required_files_exist': {
                'config': os.path.exists(self.config_file),
                'approved_tasks': os.path.exists(self.config.get('APPROVED_TASKS_FILE', 'approved_tasks.json')),
                'refresh_script': os.path.exists('refresh_quickbooks_token.py'),
                'executor': os.path.exists('quickbooks_executor.py') or os.path.exists('quickbooks_executor_no_test.py')
            }
        }
        
        return status


def main():
    """Main function with command line interface"""
    parser = argparse.ArgumentParser(description='QuickBooks Auto-Executor')
    parser.add_argument('--execute', action='store_true', help='Execute pending tasks')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be executed without actually executing')
    parser.add_argument('--status', action='store_true', help='Show system status')
    parser.add_argument('--refresh', action='store_true', help='Force token refresh')
    
    args = parser.parse_args()
    
    # Create auto-executor instance
    auto_executor = QuickBooksAutoExecutor()
    
    try:
        if args.status:
            # Show status
            status = auto_executor.get_status()
            print("📊 **QuickBooks System Status**")
            print("=" * 40)
            print(f"Config Loaded: {'✅' if status['config_loaded'] else '❌'}")
            print(f"Token Valid: {'✅' if status['token_valid'] else '❌'}")
            print(f"Pending Tasks: {status['pending_tasks']}")
            print(f"Required Files:")
            for file_name, exists in status['required_files_exist'].items():
                print(f"  {file_name}: {'✅' if exists else '❌'}")
        
        elif args.refresh:
            # Force token refresh
            print("🔄 **Forcing Token Refresh**")
            print("=" * 40)
            success = auto_executor.refresh_token_if_needed()
            if success:
                print("✅ Token refresh completed successfully")
            else:
                print("❌ Token refresh failed")
        
        elif args.execute:
            # Execute tasks
            result = auto_executor.run_auto_execution(dry_run=False)
            
            # Exit with appropriate code
            if result['execution_attempted'] and result['execution_success']:
                sys.exit(0)
            elif result['pending_tasks_count'] == 0:
                sys.exit(0)  # No tasks to execute is not an error
            else:
                sys.exit(1)  # Execution failed
        
        elif args.dry_run:
            # Dry run
            result = auto_executor.run_auto_execution(dry_run=True)
        
        else:
            # Default: show help
            parser.print_help()
            
    except KeyboardInterrupt:
        print("\n\n⏹️ Auto-executor cancelled by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 