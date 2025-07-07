#!/usr/bin/env python3
"""
Task Manager for Slack Approval System

Utility script to manage approved tasks, check status, and handle task execution.

Usage:
    python task_manager.py --list                    # List all tasks
    python task_manager.py --pending                 # Show pending tasks
    python task_manager.py --execute TASK_ID         # Mark task as executed
    python task_manager.py --stats                   # Show statistics
    python task_manager.py --cleanup                 # Clean up old files
"""

import json
import os
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging


class TaskManager:
    """Manage approved tasks from Slack approval system"""
    
    def __init__(self, approved_tasks_file: str = "approved_tasks.json"):
        """Initialize task manager"""
        self.approved_tasks_file = approved_tasks_file
        self.rejected_tasks_file = "rejected_tasks.json"
        self.pending_approvals_file = "pending_approvals.json"
        self.setup_logging()
    
    def setup_logging(self):
        """Setup logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def load_approved_tasks(self) -> List[Dict[str, Any]]:
        """Load approved tasks from file"""
        try:
            if os.path.exists(self.approved_tasks_file):
                with open(self.approved_tasks_file, 'r') as f:
                    return json.load(f)
            return []
        except Exception as e:
            self.logger.error(f"Error loading approved tasks: {e}")
            return []
    
    def save_approved_tasks(self, tasks: List[Dict[str, Any]]) -> bool:
        """Save approved tasks to file"""
        try:
            with open(self.approved_tasks_file, 'w') as f:
                json.dump(tasks, f, indent=2)
            return True
        except Exception as e:
            self.logger.error(f"Error saving approved tasks: {e}")
            return False
    
    def list_all_tasks(self) -> None:
        """List all approved tasks"""
        tasks = self.load_approved_tasks()
        
        if not tasks:
            print("📋 No approved tasks found")
            return
        
        print(f"📋 **Approved Tasks ({len(tasks)} total)**\n")
        
        for i, task in enumerate(tasks, 1):
            task_id = task.get("id", f"task_{i}")
            approved_at = task.get("approved_at", "Unknown")
            executed = task.get("executed", False)
            status = "✅ Executed" if executed else "⏳ Pending"
            
            rec = task.get("recommendation", {})
            action = rec.get("action", "unknown")
            quantity = rec.get("quantity", 0)
            expected_roi = rec.get("expected_roi", "N/A")
            
            print(f"{i}. **{task_id}**")
            print(f"   Status: {status}")
            print(f"   Action: {action.title()} {quantity} units")
            print(f"   Expected ROI: {expected_roi}")
            print(f"   Approved: {self._format_datetime(approved_at)}")
            print()
    
    def list_pending_tasks(self) -> None:
        """List tasks pending execution"""
        tasks = self.load_approved_tasks()
        pending_tasks = [task for task in tasks if not task.get("executed", False)]
        
        if not pending_tasks:
            print("✅ No pending tasks - all approved tasks have been executed")
            return
        
        print(f"⏳ **Pending Tasks ({len(pending_tasks)} total)**\n")
        
        for i, task in enumerate(pending_tasks, 1):
            task_id = task.get("id", f"task_{i}")
            approved_at = task.get("approved_at", "Unknown")
            
            rec = task.get("recommendation", {})
            action = rec.get("action", "unknown")
            quantity = rec.get("quantity", 0)
            expected_roi = rec.get("expected_roi", "N/A")
            reasoning = rec.get("reasoning", "No reasoning provided")
            
            print(f"{i}. **{task_id}**")
            print(f"   Action: {action.title()} {quantity} units")
            print(f"   Expected ROI: {expected_roi}")
            print(f"   Reasoning: {reasoning}")
            print(f"   Approved: {self._format_datetime(approved_at)}")
            print()
    
    def execute_task(self, task_id: str) -> bool:
        """Mark a task as executed"""
        tasks = self.load_approved_tasks()
        
        # Find the task
        task_found = False
        for task in tasks:
            if task.get("id") == task_id:
                if task.get("executed", False):
                    print(f"⚠️  Task {task_id} is already marked as executed")
                    return False
                
                # Mark as executed
                task["executed"] = True
                task["executed_at"] = datetime.now().isoformat()
                task_found = True
                
                rec = task.get("recommendation", {})
                action = rec.get("action", "unknown")
                quantity = rec.get("quantity", 0)
                
                print(f"✅ Task {task_id} marked as executed")
                print(f"   Action: {action.title()} {quantity} units")
                break
        
        if not task_found:
            print(f"❌ Task {task_id} not found")
            return False
        
        # Save updated tasks
        if self.save_approved_tasks(tasks):
            print(f"💾 Task status saved successfully")
            return True
        else:
            print(f"❌ Failed to save task status")
            return False
    
    def show_statistics(self) -> None:
        """Show task statistics"""
        print("📊 **Task Statistics**\n")
        
        # Approved tasks
        approved_tasks = self.load_approved_tasks()
        total_approved = len(approved_tasks)
        executed_tasks = [task for task in approved_tasks if task.get("executed", False)]
        pending_tasks = [task for task in approved_tasks if not task.get("executed", False)]
        
        print(f"✅ **Approved Tasks:** {total_approved}")
        print(f"🎯 **Executed Tasks:** {len(executed_tasks)}")
        print(f"⏳ **Pending Tasks:** {len(pending_tasks)}")
        
        # Rejected tasks
        rejected_count = 0
        if os.path.exists(self.rejected_tasks_file):
            try:
                with open(self.rejected_tasks_file, 'r') as f:
                    rejected_tasks = json.load(f)
                    rejected_count = len(rejected_tasks)
            except:
                pass
        
        print(f"❌ **Rejected Tasks:** {rejected_count}")
        
        # Pending approvals
        pending_approvals = 0
        if os.path.exists(self.pending_approvals_file):
            pending_approvals = 1  # Simple check for file existence
        
        print(f"⏳ **Pending Approvals:** {pending_approvals}")
        
        # Success rate
        total_decisions = total_approved + rejected_count
        if total_decisions > 0:
            approval_rate = (total_approved / total_decisions) * 100
            print(f"📈 **Approval Rate:** {approval_rate:.1f}%")
        
        # Execution rate
        if total_approved > 0:
            execution_rate = (len(executed_tasks) / total_approved) * 100
            print(f"⚡ **Execution Rate:** {execution_rate:.1f}%")
        
        # Recent activity
        print(f"\n📅 **Recent Activity:**")
        
        # Most recent approved task
        if approved_tasks:
            latest_task = max(approved_tasks, key=lambda x: x.get("approved_at", ""))
            latest_time = latest_task.get("approved_at", "Unknown")
            print(f"   Last Approval: {self._format_datetime(latest_time)}")
        
        # Action breakdown
        if approved_tasks:
            actions = {}
            for task in approved_tasks:
                action = task.get("recommendation", {}).get("action", "unknown")
                actions[action] = actions.get(action, 0) + 1
            
            print(f"\n🎯 **Action Breakdown:**")
            for action, count in actions.items():
                print(f"   {action.title()}: {count}")
    
    def cleanup_old_files(self, days: int = 30) -> None:
        """Clean up old log files and temporary files"""
        print(f"🧹 **Cleaning up files older than {days} days**\n")
        
        cutoff_date = datetime.now() - timedelta(days=days)
        cleaned_files = []
        
        # Clean up log files
        for filename in os.listdir("."):
            if filename.endswith(".log") and os.path.isfile(filename):
                try:
                    file_time = datetime.fromtimestamp(os.path.getmtime(filename))
                    if file_time < cutoff_date:
                        os.remove(filename)
                        cleaned_files.append(filename)
                except Exception as e:
                    print(f"⚠️  Could not remove {filename}: {e}")
        
        # Archive old approved tasks
        try:
            tasks = self.load_approved_tasks()
            if tasks:
                old_tasks = []
                recent_tasks = []
                
                for task in tasks:
                    approved_at = task.get("approved_at", "")
                    try:
                        task_date = datetime.fromisoformat(approved_at.replace('Z', '+00:00'))
                        if task_date < cutoff_date and task.get("executed", False):
                            old_tasks.append(task)
                        else:
                            recent_tasks.append(task)
                    except:
                        recent_tasks.append(task)  # Keep if can't parse date
                
                if old_tasks:
                    # Archive old tasks
                    archive_file = f"archived_tasks_{datetime.now().strftime('%Y%m%d')}.json"
                    with open(archive_file, 'w') as f:
                        json.dump(old_tasks, f, indent=2)
                    
                    # Keep only recent tasks
                    self.save_approved_tasks(recent_tasks)
                    
                    print(f"📦 Archived {len(old_tasks)} old tasks to {archive_file}")
                    cleaned_files.append(f"archived {len(old_tasks)} tasks")
        
        except Exception as e:
            print(f"⚠️  Error during task cleanup: {e}")
        
        if cleaned_files:
            print(f"✅ Cleaned up: {', '.join(cleaned_files)}")
        else:
            print("✅ No files needed cleanup")
    
    def validate_tasks(self) -> None:
        """Validate task file integrity"""
        print("🔍 **Validating Task Files**\n")
        
        files_to_check = [
            (self.approved_tasks_file, "Approved Tasks"),
            (self.rejected_tasks_file, "Rejected Tasks"),
            (self.pending_approvals_file, "Pending Approvals")
        ]
        
        for filename, description in files_to_check:
            if os.path.exists(filename):
                try:
                    with open(filename, 'r') as f:
                        data = json.load(f)
                    
                    if isinstance(data, list):
                        print(f"✅ {description}: {len(data)} items")
                    elif isinstance(data, dict):
                        print(f"✅ {description}: Valid structure")
                    else:
                        print(f"⚠️  {description}: Unexpected format")
                        
                except json.JSONDecodeError as e:
                    print(f"❌ {description}: Invalid JSON - {e}")
                except Exception as e:
                    print(f"❌ {description}: Error reading file - {e}")
            else:
                print(f"ℹ️  {description}: File not found (normal if no data yet)")
    
    def export_tasks(self, format_type: str = "json") -> None:
        """Export tasks to different formats"""
        tasks = self.load_approved_tasks()
        
        if not tasks:
            print("❌ No tasks to export")
            return
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format_type.lower() == "json":
            filename = f"tasks_export_{timestamp}.json"
            with open(filename, 'w') as f:
                json.dump(tasks, f, indent=2)
            print(f"📄 Exported {len(tasks)} tasks to {filename}")
        
        elif format_type.lower() == "csv":
            import csv
            filename = f"tasks_export_{timestamp}.csv"
            
            with open(filename, 'w', newline='') as f:
                writer = csv.writer(f)
                
                # Header
                writer.writerow([
                    "Task ID", "Approved At", "Executed", "Action", 
                    "Quantity", "Expected ROI", "Confidence", "Reasoning"
                ])
                
                # Data
                for task in tasks:
                    rec = task.get("recommendation", {})
                    writer.writerow([
                        task.get("id", ""),
                        task.get("approved_at", ""),
                        task.get("executed", False),
                        rec.get("action", ""),
                        rec.get("quantity", 0),
                        rec.get("expected_roi", ""),
                        rec.get("confidence", ""),
                        rec.get("reasoning", "")
                    ])
            
            print(f"📊 Exported {len(tasks)} tasks to {filename}")
        
        else:
            print(f"❌ Unsupported format: {format_type}")
    
    def _format_datetime(self, dt_string: str) -> str:
        """Format datetime string for display"""
        try:
            dt = datetime.fromisoformat(dt_string.replace('Z', '+00:00'))
            return dt.strftime("%Y-%m-%d %H:%M")
        except:
            return dt_string


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Task Manager for Slack Approval System")
    parser.add_argument("--list", action="store_true", help="List all approved tasks")
    parser.add_argument("--pending", action="store_true", help="Show pending tasks")
    parser.add_argument("--execute", type=str, help="Mark task as executed (provide task ID)")
    parser.add_argument("--stats", action="store_true", help="Show task statistics")
    parser.add_argument("--cleanup", type=int, nargs='?', const=30, help="Clean up old files (default: 30 days)")
    parser.add_argument("--validate", action="store_true", help="Validate task file integrity")
    parser.add_argument("--export", type=str, choices=["json", "csv"], help="Export tasks to file")
    parser.add_argument("--file", type=str, default="approved_tasks.json", help="Path to approved tasks file")
    
    args = parser.parse_args()
    
    # Create task manager
    task_manager = TaskManager(approved_tasks_file=args.file)
    
    # Execute commands
    if args.list:
        task_manager.list_all_tasks()
    elif args.pending:
        task_manager.list_pending_tasks()
    elif args.execute:
        task_manager.execute_task(args.execute)
    elif args.stats:
        task_manager.show_statistics()
    elif args.cleanup is not None:
        task_manager.cleanup_old_files(args.cleanup)
    elif args.validate:
        task_manager.validate_tasks()
    elif args.export:
        task_manager.export_tasks(args.export)
    else:
        # Default: show status
        task_manager.show_statistics()


if __name__ == "__main__":
    main() 