#!/usr/bin/env python3
"""
Enhanced QuickBooks Mock Data Generator

Creates comprehensive mock data for a $200k/month business matching the enhanced Shopify data:
- Professional chart of accounts
- Inventory items matching Shopify products
- Customer database with proper segmentation
- Vendor relationships
- Realistic transaction history
- Financial reports and analytics
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

@dataclass
class QBAccount:
    id: str
    name: str
    account_type: str
    account_subtype: str
    classification: str
    balance: float = 0.0
    active: bool = True
    description: str = ""

@dataclass
class QBItem:
    id: str
    name: str
    sku: str
    type: str  # Inventory, Service, Non-inventory
    unit_price: float
    cost_price: float
    income_account_id: str
    expense_account_id: str
    asset_account_id: str
    quantity_on_hand: int = 0
    reorder_point: int = 50
    description: str = ""
    active: bool = True

@dataclass
class QBCustomer:
    id: str
    name: str
    company_name: str
    email: str
    phone: str
    billing_address: Dict[str, str]
    shipping_address: Dict[str, str]
    payment_terms: str
    credit_limit: float
    balance: float = 0.0
    segment: str = "Regular"  # VIP, Loyal, Regular, Occasional, New
    active: bool = True

@dataclass
class QBVendor:
    id: str
    name: str
    company_name: str
    email: str
    phone: str
    address: Dict[str, str]
    payment_terms: str
    tax_id: str
    balance: float = 0.0
    active: bool = True

@dataclass
class QBInvoice:
    id: str
    customer_id: str
    invoice_number: str
    date: str
    due_date: str
    status: str  # Draft, Sent, Paid, Overdue
    subtotal: float
    tax_amount: float
    total_amount: float
    line_items: List[Dict[str, Any]]
    payment_terms: str = "Net 30"

@dataclass
class QBBill:
    id: str
    vendor_id: str
    bill_number: str
    date: str
    due_date: str
    status: str  # Open, Paid, Overdue
    subtotal: float
    tax_amount: float
    total_amount: float
    line_items: List[Dict[str, Any]]

@dataclass
class QBPayment:
    id: str
    type: str  # CustomerPayment, BillPayment
    reference_id: str  # Invoice or Bill ID
    customer_id: Optional[str]
    vendor_id: Optional[str]
    date: str
    amount: float
    payment_method: str
    reference_number: str

@dataclass
class QBJournalEntry:
    id: str
    date: str
    reference_number: str
    description: str
    line_items: List[Dict[str, Any]]
    total_amount: float

class EnhancedQuickBooksDataGenerator:
    """Generate comprehensive QuickBooks data for a $200k/month business"""
    
    def __init__(self):
        self.company_name = "TechHome Solutions LLC"
        self.target_monthly_revenue = 200000
        self.current_date = datetime.now()
        
    def generate_chart_of_accounts(self) -> List[QBAccount]:
        """Generate professional chart of accounts"""
        accounts = [
            # Assets
            QBAccount("1000", "Checking Account", "Bank", "Checking", "Asset", 85000, description="Primary operating account"),
            QBAccount("1010", "Savings Account", "Bank", "Savings", "Asset", 125000, description="Business savings"),
            QBAccount("1020", "Petty Cash", "Bank", "Cash", "Asset", 500, description="Petty cash fund"),
            QBAccount("1100", "Accounts Receivable", "Accounts Receivable", "AccountsReceivable", "Asset", 45000, description="Customer receivables"),
            QBAccount("1200", "Inventory Asset", "Other Current Asset", "Inventory", "Asset", 75000, description="Product inventory"),
            QBAccount("1300", "Prepaid Expenses", "Other Current Asset", "PrepaidExpenses", "Asset", 12000, description="Prepaid insurance, rent"),
            QBAccount("1400", "Equipment", "Fixed Asset", "Equipment", "Asset", 65000, description="Office and warehouse equipment"),
            QBAccount("1450", "Accumulated Depreciation - Equipment", "Fixed Asset", "AccumulatedDepreciation", "Asset", -15000, description="Equipment depreciation"),
            QBAccount("1500", "Vehicles", "Fixed Asset", "Vehicles", "Asset", 45000, description="Delivery vehicles"),
            QBAccount("1550", "Accumulated Depreciation - Vehicles", "Fixed Asset", "AccumulatedDepreciation", "Asset", -10000, description="Vehicle depreciation"),
            
            # Liabilities
            QBAccount("2000", "Accounts Payable", "Accounts Payable", "AccountsPayable", "Liability", 25000, description="Vendor payables"),
            QBAccount("2100", "Sales Tax Payable", "Other Current Liability", "SalesTaxPayable", "Liability", 8500, description="Collected sales tax"),
            QBAccount("2200", "Payroll Liabilities", "Other Current Liability", "PayrollTaxPayable", "Liability", 6200, description="Payroll taxes and withholdings"),
            QBAccount("2300", "Credit Card Payable", "Credit Card", "CreditCard", "Liability", 15000, description="Business credit card"),
            QBAccount("2400", "Line of Credit", "Long Term Liability", "LineOfCredit", "Liability", 50000, description="Business line of credit"),
            QBAccount("2500", "Equipment Loan", "Long Term Liability", "NotesPayable", "Liability", 35000, description="Equipment financing"),
            
            # Equity
            QBAccount("3000", "Owner's Equity", "Equity", "OpeningBalanceEquity", "Equity", 280000, description="Owner investment"),
            QBAccount("3100", "Retained Earnings", "Equity", "RetainedEarnings", "Equity", 45000, description="Accumulated earnings"),
            QBAccount("3200", "Owner Draws", "Equity", "PartnerDistributions", "Equity", -25000, description="Owner distributions"),
            
            # Income
            QBAccount("4000", "Product Sales", "Income", "SalesOfProductIncome", "Revenue", 0, description="Product revenue"),
            QBAccount("4100", "Service Revenue", "Income", "ServiceFeeIncome", "Revenue", 0, description="Service revenue"),
            QBAccount("4200", "Shipping Revenue", "Income", "OtherPrimaryIncome", "Revenue", 0, description="Shipping charges"),
            QBAccount("4300", "Interest Income", "Other Income", "InterestEarned", "Revenue", 0, description="Bank interest"),
            QBAccount("4400", "Other Income", "Other Income", "OtherMiscellaneousIncome", "Revenue", 0, description="Miscellaneous income"),
            
            # Cost of Goods Sold
            QBAccount("5000", "Cost of Goods Sold", "Cost of Goods Sold", "SuppliesMaterialsCogs", "Expense", 0, description="Product costs"),
            QBAccount("5100", "Freight In", "Cost of Goods Sold", "SuppliesMaterialsCogs", "Expense", 0, description="Inbound shipping"),
            QBAccount("5200", "Inventory Adjustments", "Cost of Goods Sold", "SuppliesMaterialsCogs", "Expense", 0, description="Inventory write-offs"),
            
            # Operating Expenses
            QBAccount("6000", "Rent Expense", "Expense", "Rent", "Expense", 0, description="Office and warehouse rent"),
            QBAccount("6100", "Utilities", "Expense", "Utilities", "Expense", 0, description="Electric, gas, water"),
            QBAccount("6200", "Phone & Internet", "Expense", "OfficeGeneralAdministrativeExpenses", "Expense", 0, description="Communications"),
            QBAccount("6300", "Insurance", "Expense", "Insurance", "Expense", 0, description="Business insurance"),
            QBAccount("6400", "Marketing & Advertising", "Expense", "AdvertisingPromotional", "Expense", 0, description="Marketing campaigns"),
            QBAccount("6500", "Office Supplies", "Expense", "OfficeGeneralAdministrativeExpenses", "Expense", 0, description="Office supplies"),
            QBAccount("6600", "Professional Fees", "Expense", "ProfessionalFees", "Expense", 0, description="Legal, accounting"),
            QBAccount("6700", "Bank Fees", "Expense", "BankCharges", "Expense", 0, description="Banking fees"),
            QBAccount("6800", "Depreciation Expense", "Expense", "Depreciation", "Expense", 0, description="Asset depreciation"),
            QBAccount("6900", "Meals & Entertainment", "Expense", "MealsEntertainment", "Expense", 0, description="Business meals"),
            QBAccount("7000", "Travel Expense", "Expense", "Travel", "Expense", 0, description="Business travel"),
            QBAccount("7100", "Vehicle Expenses", "Expense", "AutomobileExpense", "Expense", 0, description="Vehicle costs"),
            QBAccount("7200", "Equipment Rental", "Expense", "RentExpense", "Expense", 0, description="Equipment rental"),
            QBAccount("7300", "Software & Subscriptions", "Expense", "OfficeGeneralAdministrativeExpenses", "Expense", 0, description="Software licenses"),
            QBAccount("7400", "Training & Development", "Expense", "OfficeGeneralAdministrativeExpenses", "Expense", 0, description="Employee training"),
            QBAccount("7500", "Warehouse & Shipping", "Expense", "ShippingFreightDelivery", "Expense", 0, description="Outbound shipping"),
            QBAccount("7600", "Bad Debt", "Expense", "BadDebts", "Expense", 0, description="Uncollectible accounts"),
            
            # Payroll
            QBAccount("8000", "Salaries & Wages", "Expense", "Payroll", "Expense", 0, description="Employee wages"),
            QBAccount("8100", "Payroll Taxes", "Expense", "PayrollTaxes", "Expense", 0, description="Employer payroll taxes"),
            QBAccount("8200", "Employee Benefits", "Expense", "PayrollExpenses", "Expense", 0, description="Health insurance, 401k"),
            QBAccount("8300", "Workers Compensation", "Expense", "PayrollExpenses", "Expense", 0, description="Workers comp insurance"),
            
            # Other Expenses
            QBAccount("9000", "Interest Expense", "Other Expense", "InterestPaid", "Expense", 0, description="Loan interest"),
            QBAccount("9100", "Tax Penalties", "Other Expense", "PenaltiesSettlements", "Expense", 0, description="Tax penalties"),
            QBAccount("9200", "Miscellaneous Expense", "Other Expense", "OtherMiscellaneousServiceCost", "Expense", 0, description="Other expenses")
        ]
        
        return accounts
    
    def generate_inventory_items(self) -> List[QBItem]:
        """Generate inventory items matching Shopify products"""
        items = [
            QBItem(
                id="item-001",
                name="Tech Pro Wireless Mouse - Black",
                sku="TST-PRO-BLK-001",
                type="Inventory",
                unit_price=49.99,
                cost_price=25.00,
                income_account_id="4000",
                expense_account_id="5000",
                asset_account_id="1200",
                quantity_on_hand=150,
                reorder_point=75,
                description="Professional wireless mouse in black"
            ),
            QBItem(
                id="item-002",
                name="Tech Pro Wireless Mouse - White",
                sku="TST-PRO-WHT-001",
                type="Inventory",
                unit_price=49.99,
                cost_price=25.00,
                income_account_id="4000",
                expense_account_id="5000",
                asset_account_id="1200",
                quantity_on_hand=75,
                reorder_point=40,
                description="Professional wireless mouse in white"
            ),
            QBItem(
                id="item-003",
                name="Premium Air Purifier HEPA - Small",
                sku="PAP-HEPA-SM-001",
                type="Inventory",
                unit_price=199.99,
                cost_price=120.00,
                income_account_id="4000",
                expense_account_id="5000",
                asset_account_id="1200",
                quantity_on_hand=45,
                reorder_point=25,
                description="HEPA air purifier for small rooms"
            ),
            QBItem(
                id="item-004",
                name="Premium Air Purifier HEPA - Large",
                sku="PAP-HEPA-LG-001",
                type="Inventory",
                unit_price=299.99,
                cost_price=180.00,
                income_account_id="4000",
                expense_account_id="5000",
                asset_account_id="1200",
                quantity_on_hand=25,
                reorder_point=15,
                description="HEPA air purifier for large rooms"
            ),
            QBItem(
                id="item-005",
                name="Premium Athletic Socks 3-Pack - Medium Black",
                sku="PAS-ATH-MD-BLK",
                type="Inventory",
                unit_price=19.99,
                cost_price=8.00,
                income_account_id="4000",
                expense_account_id="5000",
                asset_account_id="1200",
                quantity_on_hand=200,
                reorder_point=100,
                description="Athletic socks 3-pack, medium, black"
            ),
            QBItem(
                id="item-006",
                name="Premium Athletic Socks 3-Pack - Large White",
                sku="PAS-ATH-LG-WHT",
                type="Inventory",
                unit_price=19.99,
                cost_price=8.00,
                income_account_id="4000",
                expense_account_id="5000",
                asset_account_id="1200",
                quantity_on_hand=150,
                reorder_point=75,
                description="Athletic socks 3-pack, large, white"
            ),
            QBItem(
                id="item-007",
                name="Protein Powder Vanilla 2lb",
                sku="PPV-VAN-2LB-001",
                type="Inventory",
                unit_price=59.99,
                cost_price=32.00,
                income_account_id="4000",
                expense_account_id="5000",
                asset_account_id="1200",
                quantity_on_hand=80,
                reorder_point=40,
                description="Vanilla protein powder, 2 pound container"
            ),
            QBItem(
                id="item-008",
                name="Ergonomic Desk Organizer - Bamboo",
                sku="EDO-BAMB-001",
                type="Inventory",
                unit_price=42.99,
                cost_price=22.00,
                income_account_id="4000",
                expense_account_id="5000",
                asset_account_id="1200",
                quantity_on_hand=65,
                reorder_point=35,
                description="Bamboo desk organizer with compartments"
            ),
            QBItem(
                id="item-009",
                name="Ergonomic Desk Organizer - Black Wood",
                sku="EDO-BLKW-001",
                type="Inventory",
                unit_price=42.99,
                cost_price=22.00,
                income_account_id="4000",
                expense_account_id="5000",
                asset_account_id="1200",
                quantity_on_hand=40,
                reorder_point=25,
                description="Black wood desk organizer with compartments"
            ),
            QBItem(
                id="item-010",
                name="Adjustable Standing Desk Converter",
                sku="ASD-STAN-001",
                type="Inventory",
                unit_price=149.99,
                cost_price=75.00,
                income_account_id="4000",
                expense_account_id="5000",
                asset_account_id="1200",
                quantity_on_hand=35,
                reorder_point=20,
                description="Height-adjustable standing desk converter"
            ),
            QBItem(
                id="item-011",
                name="Shipping - Standard",
                sku="SHIP-STD",
                type="Service",
                unit_price=8.99,
                cost_price=5.50,
                income_account_id="4200",
                expense_account_id="7500",
                asset_account_id="",
                description="Standard shipping service"
            ),
            QBItem(
                id="item-012",
                name="Shipping - Expedited",
                sku="SHIP-EXP",
                type="Service",
                unit_price=18.99,
                cost_price=12.00,
                income_account_id="4200",
                expense_account_id="7500",
                asset_account_id="",
                description="Expedited shipping service"
            ),
            QBItem(
                id="item-013",
                name="Installation Service",
                sku="SERV-INST",
                type="Service",
                unit_price=75.00,
                cost_price=35.00,
                income_account_id="4100",
                expense_account_id="8000",
                asset_account_id="",
                description="Professional installation service"
            )
        ]
        
        return items
    
    def generate_customers(self) -> List[QBCustomer]:
        """Generate customer database with segmentation matching Shopify"""
        customers = []
        
        # Customer segments matching Shopify data
        segments = [
            {"type": "VIP", "count": 200, "credit_limit": [5000, 10000], "terms": "Net 15"},
            {"type": "Loyal", "count": 500, "credit_limit": [2000, 5000], "terms": "Net 30"},
            {"type": "Regular", "count": 800, "credit_limit": [1000, 2000], "terms": "Net 30"},
            {"type": "Occasional", "count": 400, "credit_limit": [500, 1000], "terms": "Net 30"},
            {"type": "New", "count": 100, "credit_limit": [250, 500], "terms": "Net 30"}
        ]
        
        customer_id = 1
        
        for segment in segments:
            for i in range(segment["count"]):
                credit_limit = random.uniform(segment["credit_limit"][0], segment["credit_limit"][1])
                balance = random.uniform(0, credit_limit * 0.3) if random.random() > 0.7 else 0
                
                customers.append(QBCustomer(
                    id=f"cust-{customer_id:04d}",
                    name=f"{segment['type']}Customer{i + 1} Smith",
                    company_name=f"{segment['type']} Business {i + 1}",
                    email=f"customer{customer_id}@{segment['type'].lower()}mail.com",
                    phone=f"({random.randint(200, 999)}) {random.randint(200, 999)}-{random.randint(1000, 9999)}",
                    billing_address={
                        "address1": f"{random.randint(100, 9999)} Main St",
                        "city": random.choice(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]),
                        "state": random.choice(["NY", "CA", "IL", "TX", "AZ"]),
                        "postal_code": f"{random.randint(10000, 99999)}",
                        "country": "USA"
                    },
                    shipping_address={
                        "address1": f"{random.randint(100, 9999)} Business Ave",
                        "city": random.choice(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]),
                        "state": random.choice(["NY", "CA", "IL", "TX", "AZ"]),
                        "postal_code": f"{random.randint(10000, 99999)}",
                        "country": "USA"
                    },
                    payment_terms=segment["terms"],
                    credit_limit=credit_limit,
                    balance=balance,
                    segment=segment["type"]
                ))
                
                customer_id += 1
        
        return customers
    
    def generate_vendors(self) -> List[QBVendor]:
        """Generate vendor database"""
        vendors = [
            QBVendor(
                id="vend-001",
                name="TechSource Manufacturing",
                company_name="TechSource Manufacturing Inc.",
                email="orders@techsource.com",
                phone="(555) 123-4567",
                address={
                    "address1": "1234 Industrial Blvd",
                    "city": "Shenzhen",
                    "state": "GD",
                    "postal_code": "518000",
                    "country": "China"
                },
                payment_terms="Net 30",
                tax_id="CHN-123456789",
                balance=25000
            ),
            QBVendor(
                id="vend-002", 
                name="HomeLife Products",
                company_name="HomeLife Products LLC",
                email="purchasing@homelife.com",
                phone="(555) 234-5678",
                address={
                    "address1": "5678 Commerce St",
                    "city": "Portland",
                    "state": "OR",
                    "postal_code": "97201",
                    "country": "USA"
                },
                payment_terms="Net 30",
                tax_id="12-3456789",
                balance=18000
            ),
            QBVendor(
                id="vend-003",
                name="Athletic Gear Supply",
                company_name="Athletic Gear Supply Co.",
                email="sales@athleticgear.com", 
                phone="(555) 345-6789",
                address={
                    "address1": "9012 Sports Way",
                    "city": "Charlotte",
                    "state": "NC",
                    "postal_code": "28201",
                    "country": "USA"
                },
                payment_terms="Net 15",
                tax_id="12-4567890",
                balance=8500
            ),
            QBVendor(
                id="vend-004",
                name="Wellness Direct",
                company_name="Wellness Direct Inc.",
                email="orders@wellnessdirect.com",
                phone="(555) 456-7890",
                address={
                    "address1": "3456 Health Blvd",
                    "city": "San Diego",
                    "state": "CA",
                    "postal_code": "92101",
                    "country": "USA"
                },
                payment_terms="Net 30",
                tax_id="12-5678901",
                balance=12000
            ),
            QBVendor(
                id="vend-005",
                name="Office Solutions Pro",
                company_name="Office Solutions Pro Ltd.",
                email="procurement@officesolutions.com",
                phone="(555) 567-8901",
                address={
                    "address1": "7890 Business Park Dr",
                    "city": "Austin",
                    "state": "TX",
                    "postal_code": "73301",
                    "country": "USA"
                },
                payment_terms="Net 30",
                tax_id="12-6789012",
                balance=15500
            ),
            QBVendor(
                id="vend-006",
                name="FastShip Logistics",
                company_name="FastShip Logistics Corp.",
                email="billing@fastship.com",
                phone="(555) 678-9012",
                address={
                    "address1": "1111 Logistics Way",
                    "city": "Memphis",
                    "state": "TN",
                    "postal_code": "38101",
                    "country": "USA"
                },
                payment_terms="Net 15",
                tax_id="12-7890123",
                balance=5200
            ),
            QBVendor(
                id="vend-007",
                name="City Electric & Gas",
                company_name="City Electric & Gas Utility",
                email="business@cityelectric.com",
                phone="(555) 789-0123",
                address={
                    "address1": "2222 Utility Ave",
                    "city": "Local City",
                    "state": "NY", 
                    "postal_code": "10001",
                    "country": "USA"
                },
                payment_terms="Due on Receipt",
                tax_id="12-8901234",
                balance=2800
            ),
            QBVendor(
                id="vend-008",
                name="Metro Insurance Group",
                company_name="Metro Insurance Group Inc.",
                email="commercial@metroinsurance.com",
                phone="(555) 890-1234",
                address={
                    "address1": "3333 Insurance Plaza",
                    "city": "Chicago",
                    "state": "IL",
                    "postal_code": "60601",
                    "country": "USA"
                },
                payment_terms="Net 30",
                tax_id="12-9012345",
                balance=4200
            ),
            QBVendor(
                id="vend-009",
                name="Property Management LLC",
                company_name="Property Management LLC",
                email="rent@propertymanagement.com",
                phone="(555) 901-2345",
                address={
                    "address1": "4444 Real Estate Blvd",
                    "city": "Local City",
                    "state": "NY",
                    "postal_code": "10002",
                    "country": "USA"
                },
                payment_terms="Due on Receipt",
                tax_id="12-0123456",
                balance=12000
            ),
            QBVendor(
                id="vend-010",
                name="Business Services Pro",
                company_name="Business Services Pro Inc.",
                email="billing@bizservices.com",
                phone="(555) 012-3456",
                address={
                    "address1": "5555 Professional Way",
                    "city": "Atlanta",
                    "state": "GA",
                    "postal_code": "30301",
                    "country": "USA"
                },
                payment_terms="Net 30", 
                tax_id="12-1234567",
                balance=3800
            )
        ]
        
        return vendors
    
    def generate_invoices(self, customers: List[QBCustomer], items: List[QBItem]) -> List[QBInvoice]:
        """Generate realistic invoices for the last 3 months"""
        invoices = []
        invoice_number = 10001
        
        # Generate invoices for last 90 days to reach ~$200k/month
        for days_ago in range(90):
            invoice_date = self.current_date - timedelta(days=days_ago)
            
            # More invoices on weekdays
            if invoice_date.weekday() < 5:  # Monday to Friday
                daily_invoices = random.randint(15, 25)
            else:
                daily_invoices = random.randint(8, 15)
            
            for _ in range(daily_invoices):
                customer = random.choice(customers)
                
                # Generate line items based on customer segment
                line_items = []
                inventory_items = [item for item in items if item.type == "Inventory"]
                
                # Number of items based on customer segment
                if customer.segment == "VIP":
                    num_items = random.randint(2, 5)
                elif customer.segment == "Loyal":
                    num_items = random.randint(1, 4)
                elif customer.segment == "Regular":
                    num_items = random.randint(1, 3)
                else:
                    num_items = random.randint(1, 2)
                
                for _ in range(num_items):
                    item = random.choice(inventory_items)
                    quantity = random.randint(1, 3) if customer.segment in ["VIP", "Loyal"] else 1
                    
                    line_items.append({
                        "item_id": item.id,
                        "description": item.name,
                        "quantity": quantity,
                        "rate": item.unit_price,
                        "amount": quantity * item.unit_price,
                        "tax_amount": quantity * item.unit_price * 0.08  # 8% tax
                    })
                
                # Add shipping if order value is under $100
                subtotal = sum(item["amount"] for item in line_items)
                if subtotal < 100:
                    shipping_item = next((item for item in items if item.sku == "SHIP-STD"), None)
                    if shipping_item:
                        line_items.append({
                            "item_id": shipping_item.id,
                            "description": shipping_item.name,
                            "quantity": 1,
                            "rate": shipping_item.unit_price,
                            "amount": shipping_item.unit_price,
                            "tax_amount": 0
                        })
                
                subtotal = sum(item["amount"] for item in line_items)
                tax_amount = sum(item["tax_amount"] for item in line_items)
                total = subtotal + tax_amount
                
                # Determine status based on invoice age
                if days_ago < 5:
                    status = "Sent"
                elif days_ago < 30:
                    status = "Paid" if random.random() > 0.15 else "Sent"
                elif days_ago < 60:
                    status = "Paid" if random.random() > 0.05 else "Overdue"
                else:
                    status = "Paid"
                
                due_date = invoice_date + timedelta(days=30)
                
                invoices.append(QBInvoice(
                    id=f"inv-{invoice_number}",
                    customer_id=customer.id,
                    invoice_number=f"INV-{invoice_number}",
                    date=invoice_date.strftime("%Y-%m-%d"),
                    due_date=due_date.strftime("%Y-%m-%d"),
                    status=status,
                    subtotal=subtotal,
                    tax_amount=tax_amount,
                    total_amount=total,
                    line_items=line_items
                ))
                
                invoice_number += 1
        
        return invoices
    
    def generate_bills(self, vendors: List[QBVendor]) -> List[QBBill]:
        """Generate vendor bills for expenses"""
        bills = []
        bill_number = 20001
        
        for days_ago in range(90):
            bill_date = self.current_date - timedelta(days=days_ago)
            
            # Generate regular monthly bills
            if bill_date.day == 1:  # Monthly bills on 1st
                monthly_bills = [
                    {"vendor_id": "vend-009", "amount": 12000, "description": "Monthly rent"},
                    {"vendor_id": "vend-007", "amount": 1800, "description": "Utilities"},
                    {"vendor_id": "vend-008", "amount": 2400, "description": "Insurance premium"}
                ]
                
                for bill_info in monthly_bills:
                    vendor = next(v for v in vendors if v.id == bill_info["vendor_id"])
                    
                    bills.append(QBBill(
                        id=f"bill-{bill_number}",
                        vendor_id=vendor.id,
                        bill_number=f"BILL-{bill_number}",
                        date=bill_date.strftime("%Y-%m-%d"),
                        due_date=(bill_date + timedelta(days=30)).strftime("%Y-%m-%d"),
                        status="Paid" if days_ago > 30 else "Open",
                        subtotal=bill_info["amount"],
                        tax_amount=0,
                        total_amount=bill_info["amount"],
                        line_items=[{
                            "description": bill_info["description"],
                            "quantity": 1,
                            "rate": bill_info["amount"],
                            "amount": bill_info["amount"],
                            "account_id": "6000" if "rent" in bill_info["description"] else "6100"
                        }]
                    ))
                    bill_number += 1
            
            # Weekly inventory purchases
            if bill_date.weekday() == 1:  # Tuesdays
                inventory_vendors = ["vend-001", "vend-002", "vend-003", "vend-004", "vend-005"]
                vendor_id = random.choice(inventory_vendors)
                vendor = next(v for v in vendors if v.id == vendor_id)
                
                # Generate purchase bill
                purchase_amount = random.uniform(5000, 15000)
                
                bills.append(QBBill(
                    id=f"bill-{bill_number}",
                    vendor_id=vendor.id,
                    bill_number=f"BILL-{bill_number}",
                    date=bill_date.strftime("%Y-%m-%d"),
                    due_date=(bill_date + timedelta(days=30)).strftime("%Y-%m-%d"),
                    status="Paid" if days_ago > 20 else "Open",
                    subtotal=purchase_amount,
                    tax_amount=0,
                    total_amount=purchase_amount,
                    line_items=[{
                        "description": "Inventory purchase",
                        "quantity": 1,
                        "rate": purchase_amount,
                        "amount": purchase_amount,
                        "account_id": "5000"
                    }]
                ))
                bill_number += 1
        
        return bills
    
    def generate_payments(self, invoices: List[QBInvoice], bills: List[QBBill], customers: List[QBCustomer], vendors: List[QBVendor]) -> List[QBPayment]:
        """Generate payment records"""
        payments = []
        payment_id = 1
        
        # Customer payments for paid invoices
        paid_invoices = [inv for inv in invoices if inv.status == "Paid"]
        for invoice in paid_invoices:
            payment_date = datetime.strptime(invoice.date, "%Y-%m-%d") + timedelta(days=random.randint(1, 25))
            
            payments.append(QBPayment(
                id=f"pay-{payment_id}",
                type="CustomerPayment",
                reference_id=invoice.id,
                customer_id=invoice.customer_id,
                vendor_id=None,
                date=payment_date.strftime("%Y-%m-%d"),
                amount=invoice.total_amount,
                payment_method=random.choice(["Check", "Credit Card", "Bank Transfer", "Cash"]),
                reference_number=f"PMT-{payment_id}"
            ))
            payment_id += 1
        
        # Vendor payments for paid bills
        paid_bills = [bill for bill in bills if bill.status == "Paid"]
        for bill in paid_bills:
            payment_date = datetime.strptime(bill.date, "%Y-%m-%d") + timedelta(days=random.randint(1, 30))
            
            payments.append(QBPayment(
                id=f"pay-{payment_id}",
                type="BillPayment",
                reference_id=bill.id,
                customer_id=None,
                vendor_id=bill.vendor_id,
                date=payment_date.strftime("%Y-%m-%d"),
                amount=bill.total_amount,
                payment_method=random.choice(["Check", "Bank Transfer", "ACH"]),
                reference_number=f"PMT-{payment_id}"
            ))
            payment_id += 1
        
        return payments
    
    def generate_journal_entries(self) -> List[QBJournalEntry]:
        """Generate month-end journal entries"""
        entries = []
        entry_id = 1
        
        for month_offset in range(3):  # Last 3 months
            entry_date = self.current_date.replace(day=28) - timedelta(days=month_offset * 30)
            
            # Depreciation entry
            entries.append(QBJournalEntry(
                id=f"je-{entry_id}",
                date=entry_date.strftime("%Y-%m-%d"),
                reference_number=f"JE-{entry_id}",
                description="Monthly depreciation expense",
                line_items=[
                    {"account_id": "6800", "debit": 2000, "credit": 0, "description": "Depreciation expense"},
                    {"account_id": "1450", "debit": 0, "credit": 1200, "description": "Accumulated depreciation - equipment"},
                    {"account_id": "1550", "debit": 0, "credit": 800, "description": "Accumulated depreciation - vehicles"}
                ],
                total_amount=2000
            ))
            entry_id += 1
            
            # Prepaid expense allocation
            entries.append(QBJournalEntry(
                id=f"je-{entry_id}",
                date=entry_date.strftime("%Y-%m-%d"),
                reference_number=f"JE-{entry_id}",
                description="Prepaid expense allocation",
                line_items=[
                    {"account_id": "6300", "debit": 1000, "credit": 0, "description": "Insurance expense"},
                    {"account_id": "1300", "debit": 0, "credit": 1000, "description": "Prepaid expenses"}
                ],
                total_amount=1000
            ))
            entry_id += 1
        
        return entries
    
    def generate_all_data(self) -> Dict[str, Any]:
        """Generate complete QuickBooks dataset"""
        print("Generating comprehensive QuickBooks data for $200k/month business...")
        
        accounts = self.generate_chart_of_accounts()
        items = self.generate_inventory_items()
        customers = self.generate_customers()
        vendors = self.generate_vendors()
        invoices = self.generate_invoices(customers, items)
        bills = self.generate_bills(vendors)
        payments = self.generate_payments(invoices, bills, customers, vendors)
        journal_entries = self.generate_journal_entries()
        
        # Calculate summary statistics
        total_revenue = sum(inv.total_amount for inv in invoices if inv.status == "Paid")
        monthly_revenue = total_revenue / 3  # 3 months of data
        total_expenses = sum(bill.total_amount for bill in bills)
        
        print(f"Generated QuickBooks data:")
        print(f"  - {len(accounts)} accounts")
        print(f"  - {len(items)} items")
        print(f"  - {len(customers)} customers") 
        print(f"  - {len(vendors)} vendors")
        print(f"  - {len(invoices)} invoices")
        print(f"  - {len(bills)} bills")
        print(f"  - {len(payments)} payments")
        print(f"  - Total revenue: ${total_revenue:,.2f}")
        print(f"  - Monthly revenue: ${monthly_revenue:,.2f}")
        
        return {
            "company_info": {
                "name": self.company_name,
                "generated_at": self.current_date.isoformat(),
                "target_monthly_revenue": self.target_monthly_revenue,
                "actual_monthly_revenue": monthly_revenue
            },
            "accounts": [asdict(account) for account in accounts],
            "items": [asdict(item) for item in items],
            "customers": [asdict(customer) for customer in customers],
            "vendors": [asdict(vendor) for vendor in vendors],
            "invoices": [asdict(invoice) for invoice in invoices],
            "bills": [asdict(bill) for bill in bills],
            "payments": [asdict(payment) for payment in payments],
            "journal_entries": [asdict(entry) for entry in journal_entries],
            "summary": {
                "total_revenue": total_revenue,
                "monthly_revenue": monthly_revenue,
                "total_expenses": total_expenses,
                "gross_profit": total_revenue - sum(bill.total_amount for bill in bills if any("5000" in item.get("account_id", "") for item in bill.line_items)),
                "customer_count": len(customers),
                "vendor_count": len(vendors),
                "invoice_count": len(invoices),
                "data_period": "90 days"
            }
        }

def main():
    """Generate and save enhanced QuickBooks data"""
    generator = EnhancedQuickBooksDataGenerator()
    data = generator.generate_all_data()
    
    # Save to JSON file
    output_file = "enhanced_quickbooks_data.json"
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2, default=str)
    
    print(f"\nEnhanced QuickBooks data saved to {output_file}")
    return data

if __name__ == "__main__":
    main() 