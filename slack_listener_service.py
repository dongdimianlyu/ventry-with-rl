#!/usr/bin/env python3
"""
Slack Listener Service

A background service that continuously listens for Y/N responses in Slack
and automatically processes approvals/rejections for RL recommendations.

Usage:
    python slack_listener_service.py --start     # Start the listener service
    python slack_listener_service.py --stop      # Stop the listener service
    python slack_listener_service.py --status    # Check service status
    python slack_listener_service.py --daemon    # Run as daemon process

Requirements:
    - Slack bot token and channel ID configured
    - pending_approvals.json file with pending requests
"""

import json
import os
import time
import logging
import signal
import sys
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import argparse
import ssl

# Fix SSL certificate issues in development
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except:
    pass

# Load Slack configuration
config = {}
config_file = "slack_config.json"
if os.path.exists(config_file):
    with open(config_file, 'r') as f:
        config = json.load(f)

# Set environment variables from config
if config.get("SLACK_BOT_TOKEN"):
    os.environ["SLACK_BOT_TOKEN"] = config["SLACK_BOT_TOKEN"]
if config.get("SLACK_CHANNEL_ID"):
    os.environ["SLACK_CHANNEL_ID"] = config["SLACK_CHANNEL_ID"]

# Slack SDK imports
try:
    from slack_sdk import WebClient
    from slack_sdk.errors import SlackApiError
except ImportError:
    print("❌ Slack SDK not installed!")
    print("Install with: pip install slack-sdk")
    exit(1)


class SlackListenerService:
    """Background service that listens for Slack Y/N responses"""
    
    def __init__(self):
        """Initialize the Slack listener service"""
        self.setup_logging()
        
        # Get configuration
        self.bot_token = os.getenv("SLACK_BOT_TOKEN")
        self.channel_id = os.getenv("SLACK_CHANNEL_ID")
        
        if not self.bot_token or not self.channel_id:
            self.logger.error("❌ Slack configuration missing!")
            self.logger.error("   Set SLACK_BOT_TOKEN and SLACK_CHANNEL_ID in slack_config.json")
            exit(1)
        
        # Initialize Slack client
        self.client = WebClient(token=self.bot_token)
        
        # Service state
        self.running = False
        self.thread = None
        self.last_checked = time.time()
        
        # File paths
        self.pending_file = "pending_approvals.json"
        self.approved_file = "approved_tasks.json"
        self.rejected_file = "rejected_tasks.json"
        
        # PID file for daemon mode
        self.pid_file = "slack_listener.pid"
        
        self.logger.info("Slack Listener Service initialized")
    
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('slack_listener.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def load_pending_approvals(self) -> Optional[Dict[str, Any]]:
        """Load pending approvals from file"""
        try:
            if not os.path.exists(self.pending_file):
                return None
            
            with open(self.pending_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Error loading pending approvals: {e}")
            return None
    
    def save_approved_task(self, recommendation: Dict[str, Any], source: str = "slack"):
        """Save approved task to approved_tasks.json"""
        try:
            # Load existing approved tasks
            approved_tasks = []
            if os.path.exists(self.approved_file):
                with open(self.approved_file, 'r') as f:
                    approved_tasks = json.load(f)
            
            # Create approved task entry
            approved_task = {
                "id": f"slack-{int(time.time() * 1000)}-{hash(str(recommendation)) % 10000}",
                "approved_at": datetime.now().isoformat(),
                "status": "approved",
                "source": source,
                "executed": False,
                "recommendation": recommendation
            }
            
            # Add to list
            approved_tasks.append(approved_task)
            
            # Save back to file
            with open(self.approved_file, 'w') as f:
                json.dump(approved_tasks, f, indent=2)
            
            self.logger.info(f"✅ Task approved and saved: {approved_task['id']}")
            return approved_task
            
        except Exception as e:
            self.logger.error(f"Error saving approved task: {e}")
            return None
    
    def save_rejected_task(self, recommendation: Dict[str, Any], source: str = "slack"):
        """Save rejected task to rejected_tasks.json"""
        try:
            # Load existing rejected tasks
            rejected_tasks = []
            if os.path.exists(self.rejected_file):
                with open(self.rejected_file, 'r') as f:
                    rejected_tasks = json.load(f)
            
            # Create rejected task entry
            rejected_task = {
                "id": f"slack-rejected-{int(time.time() * 1000)}",
                "rejected_at": datetime.now().isoformat(),
                "status": "rejected",
                "source": source,
                "recommendation": recommendation
            }
            
            # Add to list
            rejected_tasks.append(rejected_task)
            
            # Save back to file
            with open(self.rejected_file, 'w') as f:
                json.dump(rejected_tasks, f, indent=2)
            
            self.logger.info(f"❌ Task rejected and logged: {rejected_task['id']}")
            return rejected_task
            
        except Exception as e:
            self.logger.error(f"Error saving rejected task: {e}")
            return None
    
    def send_confirmation_message(self, approved: bool, recommendation: Dict[str, Any]):
        """Send confirmation message to Slack"""
        try:
            action = recommendation.get("action", "unknown").title()
            quantity = recommendation.get("quantity", 0)
            expected_roi = recommendation.get("expected_roi", "N/A")
            
            if approved:
                message = f"✅ **Task Approved!**\n\n"
                message += f"**Action:** {action} {quantity} units\n"
                message += f"**Expected ROI:** {expected_roi}\n"
                message += f"**Status:** Approved and queued for QuickBooks execution\n\n"
                message += "The task has been added to your approved tasks list and will be executed automatically."
            else:
                message = f"❌ **Task Rejected**\n\n"
                message += f"**Action:** {action} {quantity} units\n"
                message += f"**Expected ROI:** {expected_roi}\n"
                message += f"**Status:** Rejected and logged\n\n"
                message += "The recommendation has been logged as rejected."
            
            self.client.chat_postMessage(
                channel=self.channel_id,
                text=message,
                mrkdwn=True
            )
            
        except Exception as e:
            self.logger.error(f"Error sending confirmation message: {e}")
    
    def check_for_responses(self):
        """Check for Y/N responses in Slack"""
        try:
            # Get recent messages
            result = self.client.conversations_history(
                channel=self.channel_id,
                oldest=str(self.last_checked),
                limit=20
            )
            
            if not result["ok"]:
                self.logger.error(f"Failed to get messages: {result}")
                return
            
            # Process messages
            for message in result["messages"]:
                # Skip bot messages
                if message.get("bot_id") or message.get("user") == "USLACKBOT":
                    continue
                
                text = message.get("text", "").lower().strip()
                user = message.get("user", "unknown")
                message_ts = message.get("ts", "")
                
                # Check for approval/rejection responses
                if text in ["y", "yes", "approve", "approved"]:
                    self.logger.info(f"✅ APPROVED by user {user}")
                    self.handle_response(True, user, message_ts)
                elif text in ["n", "no", "reject", "rejected", "deny"]:
                    self.logger.info(f"❌ REJECTED by user {user}")
                    self.handle_response(False, user, message_ts)
            
            # Update last checked time
            self.last_checked = time.time()
            
        except SlackApiError as e:
            self.logger.error(f"Slack API error: {e.response['error']}")
        except Exception as e:
            self.logger.error(f"Error checking for responses: {e}")
    
    def handle_response(self, approved: bool, user: str, message_ts: str):
        """Handle approval/rejection response"""
        try:
            # Load pending approval
            pending_data = self.load_pending_approvals()
            if not pending_data:
                self.logger.warning("No pending approvals found")
                return
            
            recommendation = pending_data.get("recommendation", {})
            
            if approved:
                # Save to approved tasks
                approved_task = self.save_approved_task(recommendation, "slack")
                if approved_task:
                    self.send_confirmation_message(True, recommendation)
            else:
                # Save to rejected tasks
                rejected_task = self.save_rejected_task(recommendation, "slack")
                if rejected_task:
                    self.send_confirmation_message(False, recommendation)
            
            # Clean up pending approval
            if os.path.exists(self.pending_file):
                os.remove(self.pending_file)
                self.logger.info("Pending approval cleaned up")
            
        except Exception as e:
            self.logger.error(f"Error handling response: {e}")
    
    def cleanup_expired_approvals(self):
        """Clean up expired pending approvals (older than 24 hours)"""
        try:
            pending_data = self.load_pending_approvals()
            if not pending_data:
                return
            
            sent_at = pending_data.get("sent_at", "")
            if not sent_at:
                return
            
            # Check if expired (24 hours)
            sent_time = datetime.fromisoformat(sent_at)
            if datetime.now() - sent_time > timedelta(hours=24):
                self.logger.info("Cleaning up expired pending approval")
                if os.path.exists(self.pending_file):
                    os.remove(self.pending_file)
                
                # Send timeout message
                self.client.chat_postMessage(
                    channel=self.channel_id,
                    text="⏰ **Approval Timeout**\n\nThe pending recommendation has expired (24 hours). Please generate a new recommendation if needed.",
                    mrkdwn=True
                )
            
        except Exception as e:
            self.logger.error(f"Error cleaning up expired approvals: {e}")
    
    def listener_loop(self):
        """Main listener loop"""
        self.logger.info("🎧 Slack listener service started")
        
        while self.running:
            try:
                # Check for responses
                self.check_for_responses()
                
                # Clean up expired approvals
                self.cleanup_expired_approvals()
                
                # Sleep for 5 seconds before next check
                time.sleep(5)
                
            except KeyboardInterrupt:
                self.logger.info("Listener interrupted by user")
                break
            except Exception as e:
                self.logger.error(f"Error in listener loop: {e}")
                time.sleep(10)  # Wait longer on errors
        
        self.logger.info("🛑 Slack listener service stopped")
    
    def start(self, daemon: bool = False):
        """Start the listener service"""
        if self.running:
            self.logger.warning("Service is already running")
            return
        
        if daemon:
            self.start_daemon()
        else:
            self.running = True
            self.listener_loop()
    
    def start_daemon(self):
        """Start as daemon process"""
        try:
            # Fork process
            pid = os.fork()
            if pid > 0:
                # Parent process - save PID and exit
                with open(self.pid_file, 'w') as f:
                    f.write(str(pid))
                print(f"✅ Slack listener daemon started with PID {pid}")
                return
            
            # Child process - run listener
            self.running = True
            self.listener_loop()
            
        except OSError as e:
            self.logger.error(f"Error starting daemon: {e}")
    
    def stop(self):
        """Stop the listener service"""
        if os.path.exists(self.pid_file):
            try:
                with open(self.pid_file, 'r') as f:
                    pid = int(f.read().strip())
                
                os.kill(pid, signal.SIGTERM)
                os.remove(self.pid_file)
                print(f"✅ Slack listener daemon stopped (PID {pid})")
                
            except (ValueError, ProcessLookupError, OSError) as e:
                print(f"❌ Error stopping daemon: {e}")
                if os.path.exists(self.pid_file):
                    os.remove(self.pid_file)
        else:
            print("❌ No daemon PID file found")
    
    def status(self):
        """Check service status"""
        if os.path.exists(self.pid_file):
            try:
                with open(self.pid_file, 'r') as f:
                    pid = int(f.read().strip())
                
                # Check if process is running
                os.kill(pid, 0)  # Doesn't actually kill, just checks
                print(f"✅ Slack listener daemon is running (PID {pid})")
                
                # Show pending approvals
                pending_data = self.load_pending_approvals()
                if pending_data:
                    sent_at = pending_data.get("sent_at", "")
                    rec = pending_data.get("recommendation", {})
                    action = rec.get("action", "unknown")
                    quantity = rec.get("quantity", 0)
                    print(f"⏳ Pending approval: {action} {quantity} units (sent at {sent_at})")
                else:
                    print("📭 No pending approvals")
                
                return True
                
            except (ValueError, ProcessLookupError):
                print("❌ Daemon PID file exists but process is not running")
                os.remove(self.pid_file)
                return False
        else:
            print("❌ Slack listener daemon is not running")
            return False


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Slack Listener Service")
    parser.add_argument("--start", action="store_true", help="Start the listener service")
    parser.add_argument("--stop", action="store_true", help="Stop the listener service")
    parser.add_argument("--status", action="store_true", help="Check service status")
    parser.add_argument("--daemon", action="store_true", help="Run as daemon process")
    
    args = parser.parse_args()
    
    # Create service
    service = SlackListenerService()
    
    if args.stop:
        service.stop()
    elif args.status:
        service.status()
    elif args.start:
        service.start(daemon=args.daemon)
    else:
        # Default: show status
        service.status()


if __name__ == "__main__":
    main() 