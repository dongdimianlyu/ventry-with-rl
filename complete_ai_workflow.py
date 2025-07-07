#!/usr/bin/env python3
"""
Complete AI to QuickBooks Workflow

This script demonstrates the complete workflow from AI recommendations to QuickBooks execution:
1. Generate RL recommendations (or use existing ones)
2. Send for Slack approval
3. Execute approved tasks in QuickBooks

Usage:
    python complete_ai_workflow.py --full-workflow
    python complete_ai_workflow.py --demo-mode
    python complete_ai_workflow.py --status-check
"""

import subprocess
import time
import json
import os
import argparse
from datetime import datetime
from typing import Dict, List, Any, Optional

class AIWorkflowManager:
    """Manage the complete AI to QuickBooks workflow"""
    
    def __init__(self):
        self.setup_files()
        self.workflow_stats = {
            "started_at": None,
            "completed_at": None,
            "steps_completed": 0,
            "steps_failed": 0,
            "total_steps": 4
        }
    
    def setup_files(self):
        """Check for required files and scripts"""
        self.files = {
            "rl_agent": "rl-agent/inference.py",
            "slack_approval": "simple_slack_approval.py",
            "quickbooks_executor": "quickbooks_executor.py",
            "test_integration": "test_quickbooks_integration.py"
        }
        
        self.missing_files = []
        for name, path in self.files.items():
            if not os.path.exists(path):
                self.missing_files.append((name, path))
    
    def print_status(self):
        """Print current workflow status"""
        print("🤖 AI to QuickBooks Workflow Status")
        print("=" * 50)
        
        # Check files
        print("📁 Required Files:")
        for name, path in self.files.items():
            exists = os.path.exists(path)
            print(f"   {'✅' if exists else '❌'} {name}: {path}")
        
        # Check data files
        print(f"\n📊 Data Files:")
        data_files = [
            ("recommendations.json", "RL agent output"),
            ("approved_tasks.json", "Slack approved tasks"),
            ("quickbooks_execution_log.json", "QB execution log")
        ]
        
        for filename, description in data_files:
            exists = os.path.exists(filename)
            print(f"   {'✅' if exists else '❌'} {filename} - {description}")
        
        # Check environment
        print(f"\n🔧 Environment:")
        slack_vars = ["SLACK_BOT_TOKEN", "SLACK_CHANNEL_ID"]
        qb_vars = ["QB_CLIENT_ID", "QB_CLIENT_SECRET", "QB_ACCESS_TOKEN", "QB_COMPANY_ID"]
        
        print(f"   Slack: {sum(1 for var in slack_vars if os.getenv(var))}/{len(slack_vars)} configured")
        print(f"   QuickBooks: {sum(1 for var in qb_vars if os.getenv(var))}/{len(qb_vars)} configured")
        
        # Workflow readiness
        print(f"\n🚀 Workflow Readiness:")
        if self.missing_files:
            print(f"   ❌ Missing files: {len(self.missing_files)}")
            for name, path in self.missing_files:
                print(f"      - {name}: {path}")
        else:
            print(f"   ✅ All required files present")
        
        missing_env = len([var for var in slack_vars + qb_vars if not os.getenv(var)])
        if missing_env > 0:
            print(f"   ⚠️  Missing {missing_env} environment variables")
        else:
            print(f"   ✅ All environment variables configured")
    
    def run_rl_agent(self) -> bool:
        """Step 1: Run RL agent to generate recommendations"""
        print("\n🤖 Step 1: Generating AI Recommendations")
        print("-" * 40)
        
        if not os.path.exists("rl-agent/inference.py"):
            print("❌ RL agent not found - using existing recommendations.json")
            if os.path.exists("recommendations.json"):
                print("✅ Using existing recommendations.json")
                return True
            else:
                print("❌ No recommendations.json found")
                return False
        
        try:
            # Run RL agent
            result = subprocess.run(
                ["python", "inference.py"],
                cwd="rl-agent",
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                print("✅ RL agent completed successfully")
                
                # Check if recommendations were generated
                if os.path.exists("recommendations.json"):
                    with open("recommendations.json", 'r') as f:
                        recommendations = json.load(f)
                    print(f"   📊 Generated {len(recommendations)} recommendations")
                    return True
                else:
                    print("❌ No recommendations.json generated")
                    return False
            else:
                print(f"❌ RL agent failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print("❌ RL agent timed out")
            return False
        except Exception as e:
            print(f"❌ Error running RL agent: {e}")
            return False
    
    def run_slack_approval(self, listen_time: int = 60) -> bool:
        """Step 2: Send for Slack approval"""
        print(f"\n📤 Step 2: Sending for Slack Approval")
        print("-" * 40)
        
        if not os.path.exists("simple_slack_approval.py"):
            print("❌ Slack approval script not found")
            return False
        
        try:
            # Send recommendations for approval
            result = subprocess.run(
                ["python", "simple_slack_approval.py", "--send-and-listen", "--listen", str(listen_time)],
                capture_output=True,
                text=True,
                timeout=listen_time + 30
            )
            
            if result.returncode == 0:
                print("✅ Slack approval process completed")
                
                # Check if tasks were approved
                if os.path.exists("approved_tasks.json"):
                    with open("approved_tasks.json", 'r') as f:
                        approved_tasks = json.load(f)
                    
                    approved_count = len([t for t in approved_tasks if t.get("status") == "approved"])
                    print(f"   📊 {approved_count} tasks approved")
                    
                    if approved_count > 0:
                        return True
                    else:
                        print("   ⚠️  No tasks were approved")
                        return False
                else:
                    print("❌ No approved_tasks.json generated")
                    return False
            else:
                print(f"❌ Slack approval failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print("❌ Slack approval timed out")
            return False
        except Exception as e:
            print(f"❌ Error in Slack approval: {e}")
            return False
    
    def run_quickbooks_execution(self, dry_run: bool = False) -> bool:
        """Step 3: Execute approved tasks in QuickBooks"""
        mode = "Dry Run" if dry_run else "Execution"
        print(f"\n⚙️ Step 3: QuickBooks {mode}")
        print("-" * 40)
        
        if not os.path.exists("quickbooks_executor.py"):
            print("❌ QuickBooks executor not found")
            return False
        
        try:
            # Execute tasks
            cmd = ["python", "quickbooks_executor.py"]
            if dry_run:
                cmd.append("--dry-run")
            else:
                cmd.append("--execute")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                print(f"✅ QuickBooks {mode.lower()} completed successfully")
                print(result.stdout)
                return True
            else:
                print(f"❌ QuickBooks {mode.lower()} failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print(f"❌ QuickBooks {mode.lower()} timed out")
            return False
        except Exception as e:
            print(f"❌ Error in QuickBooks {mode.lower()}: {e}")
            return False
    
    def run_full_workflow(self, dry_run: bool = False, listen_time: int = 60) -> bool:
        """Run the complete workflow"""
        self.workflow_stats["started_at"] = datetime.now().isoformat()
        
        print("🚀 Starting Complete AI to QuickBooks Workflow")
        print("=" * 60)
        
        if self.missing_files:
            print("❌ Cannot start workflow - missing required files:")
            for name, path in self.missing_files:
                print(f"   - {name}: {path}")
            return False
        
        steps = [
            ("Generate AI Recommendations", lambda: self.run_rl_agent()),
            ("Slack Approval Process", lambda: self.run_slack_approval(listen_time)),
            ("QuickBooks Execution", lambda: self.run_quickbooks_execution(dry_run))
        ]
        
        for i, (step_name, step_func) in enumerate(steps, 1):
            print(f"\n{'='*60}")
            print(f"STEP {i}/{len(steps)}: {step_name}")
            print(f"{'='*60}")
            
            success = step_func()
            
            if success:
                self.workflow_stats["steps_completed"] += 1
                print(f"✅ Step {i} completed successfully")
            else:
                self.workflow_stats["steps_failed"] += 1
                print(f"❌ Step {i} failed")
                
                # Ask if user wants to continue
                if i < len(steps):
                    response = input(f"\nContinue to next step anyway? (y/N): ")
                    if response.lower() != 'y':
                        print("❌ Workflow stopped by user")
                        break
        
        self.workflow_stats["completed_at"] = datetime.now().isoformat()
        
        # Summary
        print(f"\n{'='*60}")
        print("WORKFLOW SUMMARY")
        print(f"{'='*60}")
        
        success_rate = (self.workflow_stats["steps_completed"] / len(steps)) * 100
        print(f"📊 Steps completed: {self.workflow_stats['steps_completed']}/{len(steps)} ({success_rate:.1f}%)")
        print(f"📊 Steps failed: {self.workflow_stats['steps_failed']}")
        
        if self.workflow_stats["steps_completed"] == len(steps):
            print("🎉 Complete workflow executed successfully!")
            print("   Your AI recommendations have been approved and executed in QuickBooks!")
        else:
            print("⚠️  Workflow completed with some failures")
            print("   Check the logs above for details")
        
        return self.workflow_stats["steps_completed"] == len(steps)
    
    def run_demo_mode(self) -> bool:
        """Run a demo with sample data"""
        print("🎭 Demo Mode: AI to QuickBooks Workflow")
        print("=" * 50)
        
        print("This demo will:")
        print("1. Create sample recommendations")
        print("2. Create sample approved tasks")
        print("3. Run QuickBooks dry-run execution")
        print()
        
        response = input("Continue with demo? (Y/n): ")
        if response.lower() == 'n':
            print("❌ Demo cancelled")
            return False
        
        # Step 1: Create sample recommendations
        print("\n🤖 Creating sample recommendations...")
        sample_recommendations = [
            {
                "action": "restock",
                "quantity": 100,
                "expected_roi": "25.5%",
                "confidence": "high",
                "reasoning": "Based on demand analysis for Product X",
                "timestamp": datetime.now().isoformat()
            },
            {
                "action": "invoice",
                "quantity": 1,
                "expected_roi": "100.0%",
                "confidence": "high",
                "reasoning": "Send invoice for $750 to Client ABC",
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        with open("recommendations.json", 'w') as f:
            json.dump(sample_recommendations, f, indent=2)
        print("✅ Sample recommendations created")
        
        # Step 2: Create sample approved tasks
        print("\n📤 Creating sample approved tasks...")
        sample_approved_tasks = [
            {
                "id": f"demo_task_{int(time.time())}",
                "approved_at": datetime.now().isoformat(),
                "status": "approved",
                "executed": False,
                "recommendation": rec
            }
            for rec in sample_recommendations
        ]
        
        with open("approved_tasks.json", 'w') as f:
            json.dump(sample_approved_tasks, f, indent=2)
        print("✅ Sample approved tasks created")
        
        # Step 3: Run QuickBooks dry-run
        print("\n⚙️ Running QuickBooks dry-run...")
        success = self.run_quickbooks_execution(dry_run=True)
        
        if success:
            print("\n🎉 Demo completed successfully!")
            print("   Ready to run the real workflow with actual data")
        else:
            print("\n❌ Demo failed - check QuickBooks configuration")
        
        return success


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Complete AI to QuickBooks Workflow")
    parser.add_argument("--full-workflow", action="store_true", help="Run complete workflow")
    parser.add_argument("--demo-mode", action="store_true", help="Run demo with sample data")
    parser.add_argument("--status-check", action="store_true", help="Check workflow status")
    parser.add_argument("--dry-run", action="store_true", help="Run workflow in dry-run mode")
    parser.add_argument("--listen-time", type=int, default=60, help="Time to listen for Slack approvals (seconds)")
    
    args = parser.parse_args()
    
    # Create workflow manager
    workflow = AIWorkflowManager()
    
    if args.status_check:
        workflow.print_status()
    elif args.demo_mode:
        workflow.run_demo_mode()
    elif args.full_workflow:
        workflow.run_full_workflow(dry_run=args.dry_run, listen_time=args.listen_time)
    else:
        # Default: show status
        workflow.print_status()
        print(f"\n💡 Usage:")
        print(f"   python complete_ai_workflow.py --demo-mode        # Run demo")
        print(f"   python complete_ai_workflow.py --full-workflow    # Run real workflow")
        print(f"   python complete_ai_workflow.py --status-check     # Check status")


if __name__ == "__main__":
    main() 