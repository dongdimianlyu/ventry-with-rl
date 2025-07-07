#!/usr/bin/env python3
"""
QuickBooks Task Executor

This script connects to QuickBooks Online and executes approved tasks from the Slack approval system.
It reads from approved_tasks.json and performs real actions in QuickBooks based on the task content.

Usage:
    python quickbooks_executor.py --execute           # Execute all pending tasks
    python quickbooks_executor.py --dry-run           # Show what would be executed
    python quickbooks_executor.py --status            # Show task status
    python quickbooks_executor.py --task TASK_ID      # Execute specific task

Requirements:
    - QuickBooks Online account
    - QuickBooks app with OAuth credentials
    - Access tokens for your QuickBooks company

Setup:
    1. Create QuickBooks app at https://developer.intuit.com/app/developer/myapps
    2. Get Client ID, Client Secret, and Access Token
    3. Set environment variables or create quickbooks_config.json
    4. Install dependencies: pip install -r requirements_quickbooks.txt
"""

import json
import os
import logging
import re
from datetime import datetime, date
from typing import Dict, List, Any, Optional, Tuple
import argparse

# QuickBooks SDK imports
try:
    from intuitlib.client import AuthClient
    from intuitlib.enums import Scopes
    from quickbooks import QuickBooks
    from quickbooks.objects import Item, Invoice, Bill, Vendor, Customer, Account
    import requests
except ImportError:
    print("❌ QuickBooks SDK not installed!")
    print("Install with: pip install -r requirements_quickbooks.txt")
    exit(1)

# Try to load .env file support
try:
    from dotenv import load_dotenv
    load_dotenv(".env")
    load_dotenv(".env.local")
except ImportError:
    pass


class QuickBooksExecutor:
    """Execute approved tasks in QuickBooks Online"""
    
    def __init__(self, config_file: Optional[str] = None):
        """Initialize QuickBooks executor"""
        self.config = self._load_config(config_file)
        self.setup_logging()
        
        # File paths
        self.approved_tasks_file = self.config.get("APPROVED_TASKS_FILE", "approved_tasks.json")
        self.execution_log_file = self.config.get("EXECUTION_LOG_FILE", "quickbooks_execution_log.json")
        
        # QuickBooks client (will be initialized when needed)
        self.qb_client = None
        self.company_id = None
        
        # Task execution statistics
        self.execution_stats = {
            "total_processed": 0,
            "successful": 0,
            "failed": 0,
            "skipped": 0
        }
        
        self.logger.info("QuickBooks Executor initialized")
    
    def _load_config(self, config_file: Optional[str] = None) -> Dict[str, str]:
        """Load configuration from file or environment variables"""
        config = {}
        
        # Try to load from config file first
        config_files = [
            config_file,
            "quickbooks_config.json",
            "qb_config.json"
        ]
        
        for file_path in config_files:
            if file_path and os.path.exists(file_path):
                try:
                    with open(file_path, 'r') as f:
                        file_config = json.load(f)
                    config.update(file_config)
                    break
                except Exception as e:
                    print(f"Warning: Could not load config file {file_path}: {e}")
        
        # Override with environment variables
        env_vars = [
            "QB_CLIENT_ID",
            "QB_CLIENT_SECRET", 
            "QB_ACCESS_TOKEN",
            "QB_REFRESH_TOKEN",
            "QB_COMPANY_ID",
            "QB_SANDBOX",
            "APPROVED_TASKS_FILE",
            "EXECUTION_LOG_FILE"
        ]
        
        for var in env_vars:
            if var in os.environ:
                config[var] = os.environ[var]
        
        # Validate required fields
        required = ["QB_CLIENT_ID", "QB_CLIENT_SECRET", "QB_ACCESS_TOKEN", "QB_COMPANY_ID"]
        missing = [var for var in required if not config.get(var)]
        
        if missing:
            print(f"❌ Missing required QuickBooks configuration: {', '.join(missing)}")
            print("\nPlease set these environment variables or provide a config file:")
            print("  QB_CLIENT_ID=your-client-id")
            print("  QB_CLIENT_SECRET=your-client-secret")
            print("  QB_ACCESS_TOKEN=your-access-token")
            print("  QB_COMPANY_ID=your-company-id")
            print("\nOptional:")
            print("  QB_REFRESH_TOKEN=your-refresh-token")
            print("  QB_SANDBOX=true  (for sandbox environment)")
            print("\n📖 See setup guide: QUICKBOOKS_SETUP_GUIDE.md")
            exit(1)
        
        return config
    
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('quickbooks_executor.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def initialize_quickbooks_client(self) -> bool:
        """Initialize QuickBooks client with OAuth"""
        try:
            self.logger.info("Initializing QuickBooks client...")
            
            # Set up sandbox or production
            sandbox = self.config.get("QB_SANDBOX", "false").lower() == "true"
            
            # Initialize QuickBooks client
            self.qb_client = QuickBooks(
                sandbox=sandbox,
                consumer_key=self.config["QB_CLIENT_ID"],
                consumer_secret=self.config["QB_CLIENT_SECRET"],
                access_token=self.config["QB_ACCESS_TOKEN"],
                access_token_secret=self.config.get("QB_REFRESH_TOKEN", ""),
                company_id=self.config["QB_COMPANY_ID"]
            )
            
            self.company_id = self.config["QB_COMPANY_ID"]
            
            # Test connection
            try:
                company_info = self.qb_client.get('CompanyInfo', self.company_id)
                if company_info:
                    company_name = company_info[0].CompanyName if company_info else "Unknown"
                    self.logger.info(f"✅ Connected to QuickBooks company: {company_name}")
                    return True
                else:
                    self.logger.error("❌ Could not retrieve company info")
                    return False
            except Exception as e:
                self.logger.error(f"❌ QuickBooks connection test failed: {e}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error initializing QuickBooks client: {e}")
            return False
    
    def load_approved_tasks(self) -> List[Dict[str, Any]]:
        """Load approved tasks from file"""
        try:
            if not os.path.exists(self.approved_tasks_file):
                self.logger.warning(f"No approved tasks file found: {self.approved_tasks_file}")
                return []
            
            with open(self.approved_tasks_file, 'r') as f:
                tasks = json.load(f)
            
            # Filter for approved, non-executed tasks
            pending_tasks = [
                task for task in tasks 
                if task.get("status") == "approved" and not task.get("executed", False)
            ]
            
            self.logger.info(f"Loaded {len(pending_tasks)} pending tasks from {len(tasks)} total")
            return pending_tasks
            
        except Exception as e:
            self.logger.error(f"Error loading approved tasks: {e}")
            return []
    
    def parse_task_intent(self, task: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """Parse task to determine intent and extract parameters"""
        recommendation = task.get("recommendation", {})
        action = recommendation.get("action", "").lower()
        quantity = recommendation.get("quantity", 0)
        reasoning = recommendation.get("reasoning", "").lower()
        
        # Extract more details from reasoning or other fields
        full_text = f"{action} {reasoning}".lower()
        
        # Inventory/Restocking tasks
        if "restock" in action or "inventory" in full_text:
            return "inventory_update", {
                "action": "restock",
                "quantity": quantity,
                "item_name": self._extract_item_name(full_text),
                "description": f"Restock {quantity} units based on RL recommendation"
            }
        
        # Invoice creation tasks
        elif any(word in full_text for word in ["invoice", "bill", "charge", "payment"]):
            amount = self._extract_amount(full_text)
            customer = self._extract_customer_name(full_text)
            return "create_invoice", {
                "amount": amount or (quantity * 20),  # Default pricing if not specified
                "customer": customer or "Default Customer",
                "description": f"Invoice based on RL recommendation - {reasoning}",
                "quantity": quantity
            }
        
        # Expense recording tasks
        elif any(word in full_text for word in ["expense", "cost", "spend", "purchase"]):
            amount = self._extract_amount(full_text)
            category = self._extract_expense_category(full_text)
            return "record_expense", {
                "amount": amount or (quantity * 10),  # Default cost if not specified
                "category": category or "General Business Expense",
                "description": f"Expense based on RL recommendation - {reasoning}",
                "vendor": "AI Recommended Purchase"
            }
        
        # Default: treat as inventory update
        else:
            return "inventory_update", {
                "action": action,
                "quantity": quantity,
                "item_name": "Default Product",
                "description": f"Default action: {action} {quantity} units"
            }
    
    def _extract_item_name(self, text: str) -> str:
        """Extract item name from text"""
        # Look for patterns like "Product X", "item Y", etc.
        patterns = [
            r"product\s+([a-zA-Z0-9\s]+)",
            r"item\s+([a-zA-Z0-9\s]+)",
            r"units\s+of\s+([a-zA-Z0-9\s]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip().title()
        
        return "Default Product"
    
    def _extract_amount(self, text: str) -> Optional[float]:
        """Extract monetary amount from text"""
        # Look for patterns like $500, 500.00, etc.
        patterns = [
            r"\$(\d+(?:\.\d{2})?)",
            r"(\d+(?:\.\d{2})?)\s*dollars?",
            r"amount\s+(\d+(?:\.\d{2})?)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return float(match.group(1))
        
        return None
    
    def _extract_customer_name(self, text: str) -> Optional[str]:
        """Extract customer name from text"""
        patterns = [
            r"client\s+([a-zA-Z\s]+)",
            r"customer\s+([a-zA-Z\s]+)",
            r"to\s+([a-zA-Z\s]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip().title()
        
        return None
    
    def _extract_expense_category(self, text: str) -> str:
        """Extract expense category from text"""
        categories = {
            "marketing": ["marketing", "advertising", "promotion"],
            "office": ["office", "supplies", "equipment"],
            "travel": ["travel", "transportation", "fuel"],
            "utilities": ["utilities", "internet", "phone"],
            "inventory": ["inventory", "stock", "products"],
        }
        
        for category, keywords in categories.items():
            if any(keyword in text for keyword in keywords):
                return category.title()
        
        return "General Business Expense"
    
    def execute_inventory_update(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute inventory update in QuickBooks"""
        try:
            self.logger.info(f"Executing inventory update: {params}")
            
            item_name = params["item_name"]
            quantity = params["quantity"]
            description = params["description"]
            
            # First, try to find existing item
            items = self.qb_client.query("SELECT * FROM Item WHERE Name = '{}'".format(item_name))
            
            if items:
                # Update existing item
                item = items[0]
                current_qty = getattr(item, 'QtyOnHand', 0) or 0
                new_qty = current_qty + quantity
                
                # Update quantity
                item.QtyOnHand = new_qty
                updated_item = item.save(qb=self.qb_client)
                
                result = {
                    "success": True,
                    "action": "inventory_update",
                    "message": f"Updated {item_name}: {current_qty} → {new_qty} units",
                    "item_id": str(updated_item.Id),
                    "previous_quantity": current_qty,
                    "new_quantity": new_qty
                }
                
            else:
                # Create new item
                new_item = Item()
                new_item.Name = item_name
                new_item.Type = "Inventory"
                new_item.TrackQtyOnHand = True
                new_item.QtyOnHand = quantity
                new_item.InvStartDate = date.today()
                
                # Set default accounts (you may need to adjust these)
                new_item.IncomeAccountRef = self._get_or_create_account("Sales", "Income")
                new_item.ExpenseAccountRef = self._get_or_create_account("Cost of Goods Sold", "Cost of Goods Sold")
                new_item.AssetAccountRef = self._get_or_create_account("Inventory Asset", "Other Current Assets")
                
                created_item = new_item.save(qb=self.qb_client)
                
                result = {
                    "success": True,
                    "action": "inventory_create",
                    "message": f"Created new item {item_name} with {quantity} units",
                    "item_id": str(created_item.Id),
                    "quantity": quantity
                }
            
            self.logger.info(f"✅ {result['message']}")
            return result
            
        except Exception as e:
            error_msg = f"Failed to update inventory: {str(e)}"
            self.logger.error(f"❌ {error_msg}")
            return {
                "success": False,
                "action": "inventory_update",
                "error": error_msg
            }
    
    def execute_create_invoice(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute invoice creation in QuickBooks"""
        try:
            self.logger.info(f"Executing invoice creation: {params}")
            
            customer_name = params["customer"]
            amount = params["amount"]
            description = params["description"]
            quantity = params.get("quantity", 1)
            
            # Get or create customer
            customer = self._get_or_create_customer(customer_name)
            
            # Create invoice
            invoice = Invoice()
            invoice.CustomerRef = customer.to_ref()
            
            # Create line item
            line = invoice.Line.add()
            line.Amount = amount
            line.DetailType = "SalesItemLineDetail"
            
            # Get or create a service item for the invoice
            service_item = self._get_or_create_service_item("AI Recommended Service")
            line.SalesItemLineDetail.ItemRef = service_item.to_ref()
            line.SalesItemLineDetail.Qty = quantity
            line.SalesItemLineDetail.UnitPrice = amount / quantity if quantity > 0 else amount
            
            line.Description = description
            
            # Save invoice
            created_invoice = invoice.save(qb=self.qb_client)
            
            result = {
                "success": True,
                "action": "create_invoice",
                "message": f"Created invoice for {customer_name}: ${amount}",
                "invoice_id": str(created_invoice.Id),
                "invoice_number": created_invoice.DocNumber,
                "customer": customer_name,
                "amount": amount
            }
            
            self.logger.info(f"✅ {result['message']}")
            return result
            
        except Exception as e:
            error_msg = f"Failed to create invoice: {str(e)}"
            self.logger.error(f"❌ {error_msg}")
            return {
                "success": False,
                "action": "create_invoice",
                "error": error_msg
            }
    
    def execute_record_expense(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute expense recording in QuickBooks"""
        try:
            self.logger.info(f"Executing expense recording: {params}")
            
            amount = params["amount"]
            category = params["category"]
            description = params["description"]
            vendor_name = params["vendor"]
            
            # Get or create vendor
            vendor = self._get_or_create_vendor(vendor_name)
            
            # Get or create expense account
            expense_account = self._get_or_create_account(category, "Expense")
            
            # Create bill (expense)
            bill = Bill()
            bill.VendorRef = vendor.to_ref()
            bill.TotalAmt = amount
            
            # Create line item
            line = bill.Line.add()
            line.Amount = amount
            line.DetailType = "AccountBasedExpenseLineDetail"
            line.AccountBasedExpenseLineDetail.AccountRef = expense_account.to_ref()
            line.Description = description
            
            # Save bill
            created_bill = bill.save(qb=self.qb_client)
            
            result = {
                "success": True,
                "action": "record_expense",
                "message": f"Recorded expense: ${amount} for {category}",
                "bill_id": str(created_bill.Id),
                "bill_number": created_bill.DocNumber,
                "vendor": vendor_name,
                "amount": amount,
                "category": category
            }
            
            self.logger.info(f"✅ {result['message']}")
            return result
            
        except Exception as e:
            error_msg = f"Failed to record expense: {str(e)}"
            self.logger.error(f"❌ {error_msg}")
            return {
                "success": False,
                "action": "record_expense",
                "error": error_msg
            }
    
    def _get_or_create_customer(self, customer_name: str) -> Customer:
        """Get existing customer or create new one"""
        try:
            # Search for existing customer
            customers = self.qb_client.query(f"SELECT * FROM Customer WHERE Name = '{customer_name}'")
            
            if customers:
                return customers[0]
            
            # Create new customer
            customer = Customer()
            customer.Name = customer_name
            return customer.save(qb=self.qb_client)
            
        except Exception as e:
            self.logger.warning(f"Error with customer {customer_name}: {e}")
            # Return a default customer if creation fails
            customers = self.qb_client.query("SELECT * FROM Customer")
            if customers:
                return customers[0]
            raise e
    
    def _get_or_create_vendor(self, vendor_name: str) -> Vendor:
        """Get existing vendor or create new one"""
        try:
            # Search for existing vendor
            vendors = self.qb_client.query(f"SELECT * FROM Vendor WHERE Name = '{vendor_name}'")
            
            if vendors:
                return vendors[0]
            
            # Create new vendor
            vendor = Vendor()
            vendor.Name = vendor_name
            return vendor.save(qb=self.qb_client)
            
        except Exception as e:
            self.logger.warning(f"Error with vendor {vendor_name}: {e}")
            # Return a default vendor if creation fails
            vendors = self.qb_client.query("SELECT * FROM Vendor")
            if vendors:
                return vendors[0]
            raise e
    
    def _get_or_create_account(self, account_name: str, account_type: str) -> Account:
        """Get existing account or create new one"""
        try:
            # Search for existing account
            accounts = self.qb_client.query(f"SELECT * FROM Account WHERE Name = '{account_name}'")
            
            if accounts:
                return accounts[0]
            
            # Create new account
            account = Account()
            account.Name = account_name
            account.AccountType = account_type
            return account.save(qb=self.qb_client)
            
        except Exception as e:
            self.logger.warning(f"Error with account {account_name}: {e}")
            # Return a default account if creation fails
            accounts = self.qb_client.query(f"SELECT * FROM Account WHERE AccountType = '{account_type}'")
            if accounts:
                return accounts[0]
            raise e
    
    def _get_or_create_service_item(self, item_name: str) -> Item:
        """Get existing service item or create new one"""
        try:
            # Search for existing item
            items = self.qb_client.query(f"SELECT * FROM Item WHERE Name = '{item_name}'")
            
            if items:
                return items[0]
            
            # Create new service item
            item = Item()
            item.Name = item_name
            item.Type = "Service"
            item.IncomeAccountRef = self._get_or_create_account("Sales", "Income")
            return item.save(qb=self.qb_client)
            
        except Exception as e:
            self.logger.warning(f"Error with service item {item_name}: {e}")
            # Return a default item if creation fails
            items = self.qb_client.query("SELECT * FROM Item WHERE Type = 'Service'")
            if items:
                return items[0]
            raise e
    
    def execute_task(self, task: Dict[str, Any], dry_run: bool = False) -> Dict[str, Any]:
        """Execute a single task"""
        task_id = task.get("id", "unknown")
        
        try:
            # Parse task intent
            intent, params = self.parse_task_intent(task)
            
            if dry_run:
                return {
                    "task_id": task_id,
                    "intent": intent,
                    "params": params,
                    "dry_run": True,
                    "message": f"Would execute {intent} with params: {params}"
                }
            
            # Execute based on intent
            if intent == "inventory_update":
                result = self.execute_inventory_update(params)
            elif intent == "create_invoice":
                result = self.execute_create_invoice(params)
            elif intent == "record_expense":
                result = self.execute_record_expense(params)
            else:
                result = {
                    "success": False,
                    "action": intent,
                    "error": f"Unknown intent: {intent}"
                }
            
            # Add task metadata
            result["task_id"] = task_id
            result["intent"] = intent
            result["params"] = params
            result["executed_at"] = datetime.now().isoformat()
            
            return result
            
        except Exception as e:
            error_msg = f"Failed to execute task {task_id}: {str(e)}"
            self.logger.error(f"❌ {error_msg}")
            return {
                "task_id": task_id,
                "success": False,
                "error": error_msg,
                "executed_at": datetime.now().isoformat()
            }
    
    def mark_task_executed(self, task: Dict[str, Any], execution_result: Dict[str, Any]):
        """Mark task as executed in the approved_tasks.json file"""
        try:
            # Load all tasks
            with open(self.approved_tasks_file, 'r') as f:
                all_tasks = json.load(f)
            
            # Find and update the specific task
            for i, t in enumerate(all_tasks):
                if t.get("id") == task.get("id"):
                    all_tasks[i]["executed"] = True
                    all_tasks[i]["executed_at"] = datetime.now().isoformat()
                    all_tasks[i]["execution_result"] = execution_result
                    break
            
            # Save back to file
            with open(self.approved_tasks_file, 'w') as f:
                json.dump(all_tasks, f, indent=2)
            
            self.logger.info(f"Marked task {task.get('id')} as executed")
            
        except Exception as e:
            self.logger.error(f"Error marking task as executed: {e}")
    
    def log_execution(self, execution_results: List[Dict[str, Any]]):
        """Log execution results to file"""
        try:
            # Load existing log
            execution_log = []
            if os.path.exists(self.execution_log_file):
                with open(self.execution_log_file, 'r') as f:
                    execution_log = json.load(f)
            
            # Add new execution session
            session = {
                "session_id": datetime.now().strftime("%Y%m%d_%H%M%S"),
                "executed_at": datetime.now().isoformat(),
                "results": execution_results,
                "statistics": self.execution_stats
            }
            
            execution_log.append(session)
            
            # Save log
            with open(self.execution_log_file, 'w') as f:
                json.dump(execution_log, f, indent=2)
            
            self.logger.info(f"Execution logged to {self.execution_log_file}")
            
        except Exception as e:
            self.logger.error(f"Error logging execution: {e}")
    
    def execute_all_tasks(self, dry_run: bool = False) -> List[Dict[str, Any]]:
        """Execute all pending approved tasks"""
        if not dry_run and not self.initialize_quickbooks_client():
            self.logger.error("❌ Could not initialize QuickBooks client")
            return []
        
        # Load tasks
        tasks = self.load_approved_tasks()
        
        if not tasks:
            self.logger.info("No pending tasks to execute")
            return []
        
        self.logger.info(f"{'Dry run: Would execute' if dry_run else 'Executing'} {len(tasks)} tasks")
        
        execution_results = []
        
        for task in tasks:
            self.execution_stats["total_processed"] += 1
            
            # Execute task
            result = self.execute_task(task, dry_run=dry_run)
            execution_results.append(result)
            
            # Update statistics
            if result.get("success"):
                self.execution_stats["successful"] += 1
                if not dry_run:
                    self.mark_task_executed(task, result)
            else:
                self.execution_stats["failed"] += 1
        
        # Log results
        if not dry_run:
            self.log_execution(execution_results)
        
        # Print summary
        self.print_execution_summary(execution_results, dry_run)
        
        return execution_results
    
    def execute_specific_task(self, task_id: str, dry_run: bool = False) -> Optional[Dict[str, Any]]:
        """Execute a specific task by ID"""
        if not dry_run and not self.initialize_quickbooks_client():
            self.logger.error("❌ Could not initialize QuickBooks client")
            return None
        
        # Load tasks
        tasks = self.load_approved_tasks()
        
        # Find specific task
        target_task = None
        for task in tasks:
            if task.get("id") == task_id:
                target_task = task
                break
        
        if not target_task:
            self.logger.error(f"Task {task_id} not found")
            return None
        
        # Execute task
        result = self.execute_task(target_task, dry_run=dry_run)
        
        if result.get("success") and not dry_run:
            self.mark_task_executed(target_task, result)
            self.log_execution([result])
        
        return result
    
    def print_execution_summary(self, results: List[Dict[str, Any]], dry_run: bool = False):
        """Print execution summary"""
        mode = "DRY RUN" if dry_run else "EXECUTION"
        print(f"\n📊 **{mode} SUMMARY**")
        print("=" * 50)
        
        print(f"Total Tasks: {len(results)}")
        print(f"Successful: {self.execution_stats['successful']}")
        print(f"Failed: {self.execution_stats['failed']}")
        print(f"Skipped: {self.execution_stats['skipped']}")
        
        if results:
            print(f"\n📋 **Task Details:**")
            for i, result in enumerate(results, 1):
                status = "✅" if result.get("success") else "❌"
                task_id = result.get("task_id", "unknown")
                intent = result.get("intent", "unknown")
                message = result.get("message", result.get("error", "No details"))
                
                print(f"{i}. {status} {task_id} ({intent})")
                print(f"   {message}")
        
        if not dry_run and self.execution_stats['successful'] > 0:
            print(f"\n✅ Successfully executed {self.execution_stats['successful']} tasks in QuickBooks!")
    
    def show_status(self):
        """Show current status of tasks"""
        print("📊 **QuickBooks Task Executor Status**")
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
            
            # Test connection if possible
            if self.initialize_quickbooks_client():
                print(f"   ✅ QuickBooks connection successful")
            else:
                print(f"   ❌ QuickBooks connection failed")


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="QuickBooks Task Executor")
    parser.add_argument("--execute", action="store_true", help="Execute all pending tasks")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be executed without doing it")
    parser.add_argument("--task", type=str, help="Execute specific task by ID")
    parser.add_argument("--status", action="store_true", help="Show current status")
    parser.add_argument("--config", type=str, help="Path to configuration file")
    
    args = parser.parse_args()
    
    # Create executor
    executor = QuickBooksExecutor(config_file=args.config)
    
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