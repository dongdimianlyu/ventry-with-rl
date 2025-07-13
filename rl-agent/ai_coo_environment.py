#!/usr/bin/env python3
"""
AI COO Environment for Comprehensive Business Operations

This environment expands beyond simple restocking to include:
- Marketing actions (ad spend, campaign management)
- Financial actions (invoice management, cost reviews)
- Pricing actions (discounts, pricing optimization)
- Inventory actions (restocking, optimization)
- Operational actions (expense checks, supplier management)

The agent learns to be a comprehensive AI-powered COO making diverse high-impact decisions.
"""

import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ActionType(Enum):
    """Types of business actions the AI COO can take"""
    INVENTORY_RESTOCK = "inventory_restock"
    MARKETING_AD_SPEND = "marketing_ad_spend"
    MARKETING_CAMPAIGN = "marketing_campaign"
    FINANCIAL_INVOICE = "financial_invoice"
    FINANCIAL_COST_REVIEW = "financial_cost_review"
    PRICING_DISCOUNT = "pricing_discount"
    PRICING_OPTIMIZATION = "pricing_optimization"
    OPERATIONAL_EXPENSE_CHECK = "operational_expense_check"
    OPERATIONAL_SUPPLIER_REVIEW = "operational_supplier_review"
    MONITOR = "monitor"


@dataclass
class BusinessMetrics:
    """Current business state metrics"""
    # Financial metrics
    monthly_revenue: float = 0.0
    monthly_expenses: float = 0.0
    cash_flow: float = 0.0
    outstanding_invoices: float = 0.0
    
    # Marketing metrics
    current_ad_spend: float = 0.0
    campaign_performance: float = 0.0
    customer_acquisition_cost: float = 0.0
    
    # Inventory metrics
    inventory_value: float = 0.0
    inventory_turnover: float = 0.0
    stockout_incidents: int = 0
    
    # Operational metrics
    supplier_performance: float = 0.0
    operational_efficiency: float = 0.0
    customer_satisfaction: float = 0.0
    
    # Time tracking
    days_in_month: int = 0
    season_factor: float = 1.0


@dataclass
class ActionResult:
    """Result of a business action"""
    action_type: ActionType
    success: bool
    impact_score: float
    cost: float
    revenue_impact: float
    description: str
    roi: float
    confidence: float
    details: Dict[str, Any]


class AICOOEnvironment(gym.Env):
    """
    Comprehensive AI COO Environment for diverse business operations
    
    Action Space:
    - Inventory actions (0-10): Restocking different quantities
    - Marketing actions (11-20): Ad spend adjustments, campaign management
    - Financial actions (21-30): Invoice management, cost reviews
    - Pricing actions (31-40): Discounts, pricing optimization
    - Operational actions (41-50): Expense checks, supplier management
    - Monitor action (51): No action, just observe
    """
    
    metadata = {"render_modes": ["human"]}
    
    def __init__(self, render_mode: Optional[str] = None, mock_mode: bool = True):
        super().__init__()
        
        self.mock_mode = mock_mode
        self.render_mode = render_mode
        
        # Environment parameters
        self.max_days = 90  # 3 months per episode
        self.target_monthly_revenue = 50000  # $50k/month target
        self.max_cash_flow = 200000  # $200k max cash flow
        
        # Action space: 52 possible actions (0-51)
        self.action_space = spaces.Discrete(52)
        
        # Observation space: Comprehensive business state
        self.observation_space = spaces.Box(
            low=np.array([
                -100000,  # cash_flow (can be negative)
                0,        # monthly_revenue
                0,        # monthly_expenses
                0,        # outstanding_invoices
                0,        # current_ad_spend
                0,        # campaign_performance
                0,        # inventory_value
                0,        # inventory_turnover
                0,        # stockout_incidents
                0,        # supplier_performance
                0,        # operational_efficiency
                0,        # customer_satisfaction
                0,        # days_in_month
                0.5,      # season_factor
            ]),
            high=np.array([
                200000,   # cash_flow
                200000,   # monthly_revenue
                100000,   # monthly_expenses
                50000,    # outstanding_invoices
                20000,    # current_ad_spend
                1.0,      # campaign_performance
                100000,   # inventory_value
                12.0,     # inventory_turnover
                50,       # stockout_incidents
                1.0,      # supplier_performance
                1.0,      # operational_efficiency
                1.0,      # customer_satisfaction
                30,       # days_in_month
                2.0,      # season_factor
            ]),
            dtype=np.float32
        )
        
        # Initialize business state
        self.business_metrics = BusinessMetrics()
        self.days_remaining = self.max_days
        self.episode_actions = []
        self.total_profit = 0.0
        
        # Mock data for different business operations
        self.mock_data = self._initialize_mock_data()
        
        logger.info("AI COO Environment initialized")
    
    def _initialize_mock_data(self) -> Dict[str, Any]:
        """Initialize mock data for different business operations"""
        return {
            'products': [
                {'id': 'PROD-001', 'name': 'Wireless Headphones', 'category': 'Electronics', 'cost': 45, 'price': 89, 'inventory': 120},
                {'id': 'PROD-002', 'name': 'Smart Watch', 'category': 'Electronics', 'cost': 120, 'price': 249, 'inventory': 85},
                {'id': 'PROD-003', 'name': 'Bluetooth Speaker', 'category': 'Electronics', 'cost': 35, 'price': 79, 'inventory': 200},
                {'id': 'PROD-004', 'name': 'Phone Case', 'category': 'Accessories', 'cost': 8, 'price': 24, 'inventory': 500},
                {'id': 'PROD-005', 'name': 'Charging Cable', 'category': 'Accessories', 'cost': 12, 'price': 29, 'inventory': 300}
            ],
            'marketing_campaigns': [
                {'id': 'CAMP-001', 'name': 'Summer Electronics Sale', 'budget': 5000, 'performance': 0.75, 'active': True},
                {'id': 'CAMP-002', 'name': 'Back to School', 'budget': 3000, 'performance': 0.85, 'active': False},
                {'id': 'CAMP-003', 'name': 'Holiday Promotion', 'budget': 8000, 'performance': 0.65, 'active': False}
            ],
            'invoices': [
                {'id': 'INV-001', 'amount': 2500, 'days_overdue': 15, 'customer': 'TechCorp'},
                {'id': 'INV-002', 'amount': 1800, 'days_overdue': 8, 'customer': 'StartupXYZ'},
                {'id': 'INV-003', 'amount': 4200, 'days_overdue': 25, 'customer': 'Enterprise Ltd'}
            ],
            'expenses': [
                {'category': 'Marketing', 'monthly_budget': 8000, 'current_spend': 6200},
                {'category': 'Operations', 'monthly_budget': 12000, 'current_spend': 9800},
                {'category': 'Technology', 'monthly_budget': 3000, 'current_spend': 2100}
            ],
            'suppliers': [
                {'id': 'SUP-001', 'name': 'ElectroSupply Co', 'performance': 0.85, 'cost_efficiency': 0.75},
                {'id': 'SUP-002', 'name': 'TechParts Inc', 'performance': 0.92, 'cost_efficiency': 0.68},
                {'id': 'SUP-003', 'name': 'ComponentWorld', 'performance': 0.78, 'cost_efficiency': 0.82}
            ]
        }
    
    def reset(self, seed: Optional[int] = None, options: Optional[Dict[str, Any]] = None) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Reset the environment to initial state"""
        super().reset(seed=seed)
        
        # Reset business metrics
        self.business_metrics = BusinessMetrics(
            monthly_revenue=np.random.uniform(30000, 70000),
            monthly_expenses=np.random.uniform(20000, 40000),
            cash_flow=np.random.uniform(10000, 50000),
            outstanding_invoices=np.random.uniform(5000, 15000),
            current_ad_spend=np.random.uniform(2000, 8000),
            campaign_performance=np.random.uniform(0.6, 0.9),
            inventory_value=np.random.uniform(20000, 80000),
            inventory_turnover=np.random.uniform(3.0, 8.0),
            stockout_incidents=np.random.randint(0, 5),
            supplier_performance=np.random.uniform(0.7, 0.95),
            operational_efficiency=np.random.uniform(0.6, 0.9),
            customer_satisfaction=np.random.uniform(0.7, 0.95),
            days_in_month=0,
            season_factor=self._get_seasonal_factor()
        )
        
        self.days_remaining = self.max_days
        self.episode_actions = []
        self.total_profit = 0.0
        
        return self._get_observation(), self._get_info()
    
    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        """Execute one step in the business simulation"""
        
        # Execute the selected action
        action_result = self._execute_action(action)
        
        # Simulate daily business operations
        daily_results = self._simulate_daily_operations()
        
        # Calculate reward based on action result and daily operations
        reward = self._calculate_reward(action_result, daily_results)
        
        # Update business state
        self._update_business_state(action_result, daily_results)
        
        # Record action for recommendations
        if action_result.action_type != ActionType.MONITOR:
            self._record_action(action_result)
        
        # Update time
        self.days_remaining -= 1
        self.business_metrics.days_in_month = (self.max_days - self.days_remaining) % 30
        
        # Check if episode is done
        terminated = self.days_remaining <= 0
        truncated = self.business_metrics.cash_flow < -50000  # Bankruptcy condition
        
        observation = self._get_observation()
        info = self._get_info()
        info.update({
            'action_result': action_result,
            'daily_results': daily_results,
            'total_profit': self.total_profit
        })
        
        return observation, reward, terminated, truncated, info
    
    def _execute_action(self, action: int) -> ActionResult:
        """Execute a business action and return the result"""
        
        if action <= 10:  # Inventory actions (0-10)
            return self._execute_inventory_action(action)
        elif action <= 20:  # Marketing actions (11-20)
            return self._execute_marketing_action(action - 11)
        elif action <= 30:  # Financial actions (21-30)
            return self._execute_financial_action(action - 21)
        elif action <= 40:  # Pricing actions (31-40)
            return self._execute_pricing_action(action - 31)
        elif action <= 50:  # Operational actions (41-50)
            return self._execute_operational_action(action - 41)
        else:  # Monitor action (51)
            return ActionResult(
                action_type=ActionType.MONITOR,
                success=True,
                impact_score=0.0,
                cost=0.0,
                revenue_impact=0.0,
                description="Monitor business operations",
                roi=0.0,
                confidence=1.0,
                details={'action': 'monitor'}
            )
    
    def _execute_inventory_action(self, sub_action: int) -> ActionResult:
        """Execute inventory-related actions"""
        if sub_action == 0:
            return self._create_monitor_result()
        
        # Select a random product to restock
        product = random.choice(self.mock_data['products'])
        quantities = [0, 25, 50, 75, 100, 150, 200, 300, 400, 500, 750]
        quantity = quantities[min(sub_action, len(quantities) - 1)]
        
        if quantity == 0:
            return self._create_monitor_result()
        
        # Calculate costs and expected revenue
        restock_cost = quantity * product['cost']
        expected_revenue = quantity * product['price'] * np.random.uniform(0.4, 0.8)  # Realistic sell-through
        expected_profit = expected_revenue - restock_cost
        roi = (expected_profit / restock_cost) * 100 if restock_cost > 0 else 0
        
        # Ensure realistic ROI (10-30% range)
        roi = max(8.0, min(35.0, roi))
        
        return ActionResult(
            action_type=ActionType.INVENTORY_RESTOCK,
            success=True,
            impact_score=0.7,
            cost=restock_cost,
            revenue_impact=expected_revenue,
            description=f"Restock {quantity} units of {product['name']}",
            roi=roi,
            confidence=0.8,
            details={
                'product_id': product['id'],
                'product_name': product['name'],
                'quantity': quantity,
                'unit_cost': product['cost'],
                'unit_price': product['price']
            }
        )
    
    def _execute_marketing_action(self, sub_action: int) -> ActionResult:
        """Execute marketing-related actions"""
        if sub_action == 0:  # Increase ad spend
            increase_amount = np.random.uniform(500, 2000)
            expected_revenue = increase_amount * np.random.uniform(2.5, 4.0)  # 2.5-4x ROAS
            roi = ((expected_revenue - increase_amount) / increase_amount) * 100
            
            return ActionResult(
                action_type=ActionType.MARKETING_AD_SPEND,
                success=True,
                impact_score=0.8,
                cost=increase_amount,
                revenue_impact=expected_revenue,
                description=f"Increase ad spend by ${increase_amount:.0f}",
                roi=roi,
                confidence=0.7,
                details={
                    'action': 'increase_ad_spend',
                    'amount': increase_amount,
                    'expected_roas': expected_revenue / increase_amount
                }
            )
        
        elif sub_action == 1:  # Decrease ad spend
            decrease_amount = np.random.uniform(300, 1500)
            cost_savings = decrease_amount
            revenue_loss = decrease_amount * np.random.uniform(2.0, 3.5)  # Revenue lost
            roi = ((cost_savings - revenue_loss) / decrease_amount) * 100
            
            return ActionResult(
                action_type=ActionType.MARKETING_AD_SPEND,
                success=True,
                impact_score=0.6,
                cost=-decrease_amount,  # Negative cost = savings
                revenue_impact=-revenue_loss,
                description=f"Decrease ad spend by ${decrease_amount:.0f}",
                roi=roi,
                confidence=0.8,
                details={
                    'action': 'decrease_ad_spend',
                    'amount': decrease_amount,
                    'cost_savings': cost_savings
                }
            )
        
        elif sub_action == 2:  # Pause underperforming campaign
            campaign = random.choice([c for c in self.mock_data['marketing_campaigns'] if c['active']])
            if campaign:
                cost_savings = campaign['budget'] * 0.3  # Save 30% of remaining budget
                revenue_loss = cost_savings * campaign['performance']
                roi = ((cost_savings - revenue_loss) / cost_savings) * 100 if cost_savings > 0 else 0
                
                return ActionResult(
                    action_type=ActionType.MARKETING_CAMPAIGN,
                    success=True,
                    impact_score=0.5,
                    cost=-cost_savings,
                    revenue_impact=-revenue_loss,
                    description=f"Pause campaign: {campaign['name']}",
                    roi=roi,
                    confidence=0.9,
                    details={
                        'action': 'pause_campaign',
                        'campaign_id': campaign['id'],
                        'campaign_name': campaign['name'],
                        'cost_savings': cost_savings
                    }
                )
        
        # Default monitor action
        return self._create_monitor_result()
    
    def _execute_financial_action(self, sub_action: int) -> ActionResult:
        """Execute financial-related actions"""
        if sub_action == 0:  # Send invoice reminders
            overdue_invoices = [inv for inv in self.mock_data['invoices'] if inv['days_overdue'] > 0]
            if overdue_invoices:
                invoice = random.choice(overdue_invoices)
                collection_probability = 0.6 if invoice['days_overdue'] < 30 else 0.3
                expected_collection = invoice['amount'] * collection_probability
                cost = 50  # Cost of sending reminders
                roi = ((expected_collection - cost) / cost) * 100
                
                return ActionResult(
                    action_type=ActionType.FINANCIAL_INVOICE,
                    success=True,
                    impact_score=0.7,
                    cost=cost,
                    revenue_impact=expected_collection,
                    description=f"Send invoice reminder to {invoice['customer']} for ${invoice['amount']:.0f}",
                    roi=roi,
                    confidence=0.6,
                    details={
                        'action': 'invoice_reminder',
                        'invoice_id': invoice['id'],
                        'customer': invoice['customer'],
                        'amount': invoice['amount'],
                        'days_overdue': invoice['days_overdue']
                    }
                )
        
        elif sub_action == 1:  # Create batch invoices
            batch_size = np.random.randint(5, 15)
            invoice_value = np.random.uniform(500, 2000)
            total_value = batch_size * invoice_value
            processing_cost = batch_size * 25  # $25 per invoice processing
            roi = ((total_value - processing_cost) / processing_cost) * 100
            
            return ActionResult(
                action_type=ActionType.FINANCIAL_INVOICE,
                success=True,
                impact_score=0.8,
                cost=processing_cost,
                revenue_impact=total_value,
                description=f"Create batch of {batch_size} invoices worth ${total_value:.0f}",
                roi=roi,
                confidence=0.9,
                details={
                    'action': 'batch_invoices',
                    'batch_size': batch_size,
                    'avg_invoice_value': invoice_value,
                    'total_value': total_value
                }
            )
        
        elif sub_action == 2:  # Schedule cost review
            review_cost = 200  # Cost of conducting review
            expected_savings = np.random.uniform(1000, 5000)  # Monthly savings found
            roi = ((expected_savings - review_cost) / review_cost) * 100
            
            return ActionResult(
                action_type=ActionType.FINANCIAL_COST_REVIEW,
                success=True,
                impact_score=0.9,
                cost=review_cost,
                revenue_impact=expected_savings,
                description=f"Schedule comprehensive cost review (expected savings: ${expected_savings:.0f})",
                roi=roi,
                confidence=0.8,
                details={
                    'action': 'cost_review',
                    'review_cost': review_cost,
                    'expected_monthly_savings': expected_savings
                }
            )
        
        return self._create_monitor_result()
    
    def _execute_pricing_action(self, sub_action: int) -> ActionResult:
        """Execute pricing-related actions"""
        if sub_action == 0:  # Offer discount on slow-moving inventory
            product = random.choice(self.mock_data['products'])
            discount_percent = np.random.uniform(10, 30)  # 10-30% discount
            discount_amount = product['price'] * (discount_percent / 100)
            
            # Estimate increased sales from discount
            sales_increase = np.random.uniform(1.5, 3.0)  # 1.5-3x sales increase
            base_units = np.random.randint(20, 100)
            additional_units = base_units * (sales_increase - 1)
            
            revenue_loss = base_units * discount_amount  # Lost revenue on base sales
            additional_revenue = additional_units * (product['price'] - discount_amount)
            net_revenue_impact = additional_revenue - revenue_loss
            
            roi = (net_revenue_impact / revenue_loss) * 100 if revenue_loss > 0 else 0
            
            return ActionResult(
                action_type=ActionType.PRICING_DISCOUNT,
                success=True,
                impact_score=0.6,
                cost=revenue_loss,
                revenue_impact=additional_revenue,
                description=f"Offer {discount_percent:.1f}% discount on {product['name']}",
                roi=roi,
                confidence=0.7,
                details={
                    'action': 'discount_offer',
                    'product_id': product['id'],
                    'product_name': product['name'],
                    'discount_percent': discount_percent,
                    'expected_sales_increase': sales_increase
                }
            )
        
        elif sub_action == 1:  # Optimize pricing strategy
            optimization_cost = 300  # Cost of pricing analysis
            expected_revenue_increase = np.random.uniform(2000, 8000)  # Monthly increase
            roi = ((expected_revenue_increase - optimization_cost) / optimization_cost) * 100
            
            return ActionResult(
                action_type=ActionType.PRICING_OPTIMIZATION,
                success=True,
                impact_score=0.8,
                cost=optimization_cost,
                revenue_impact=expected_revenue_increase,
                description=f"Optimize pricing strategy (expected revenue increase: ${expected_revenue_increase:.0f})",
                roi=roi,
                confidence=0.8,
                details={
                    'action': 'pricing_optimization',
                    'analysis_cost': optimization_cost,
                    'expected_monthly_increase': expected_revenue_increase
                }
            )
        
        return self._create_monitor_result()
    
    def _execute_operational_action(self, sub_action: int) -> ActionResult:
        """Execute operational-related actions"""
        if sub_action == 0:  # Expense audit
            audit_cost = 150
            expected_savings = np.random.uniform(800, 3000)  # Monthly savings
            roi = ((expected_savings - audit_cost) / audit_cost) * 100
            
            return ActionResult(
                action_type=ActionType.OPERATIONAL_EXPENSE_CHECK,
                success=True,
                impact_score=0.7,
                cost=audit_cost,
                revenue_impact=expected_savings,
                description=f"Conduct expense audit (expected savings: ${expected_savings:.0f})",
                roi=roi,
                confidence=0.8,
                details={
                    'action': 'expense_audit',
                    'audit_cost': audit_cost,
                    'expected_monthly_savings': expected_savings
                }
            )
        
        elif sub_action == 1:  # Supplier performance review
            review_cost = 100
            supplier = random.choice(self.mock_data['suppliers'])
            
            # Potential cost savings from better supplier terms
            if supplier['cost_efficiency'] < 0.8:
                expected_savings = np.random.uniform(1500, 4000)
            else:
                expected_savings = np.random.uniform(500, 1500)
            
            roi = ((expected_savings - review_cost) / review_cost) * 100
            
            return ActionResult(
                action_type=ActionType.OPERATIONAL_SUPPLIER_REVIEW,
                success=True,
                impact_score=0.8,
                cost=review_cost,
                revenue_impact=expected_savings,
                description=f"Review supplier performance: {supplier['name']}",
                roi=roi,
                confidence=0.7,
                details={
                    'action': 'supplier_review',
                    'supplier_id': supplier['id'],
                    'supplier_name': supplier['name'],
                    'current_performance': supplier['performance'],
                    'expected_savings': expected_savings
                }
            )
        
        return self._create_monitor_result()
    
    def _create_monitor_result(self) -> ActionResult:
        """Create a monitor action result"""
        return ActionResult(
            action_type=ActionType.MONITOR,
            success=True,
            impact_score=0.0,
            cost=0.0,
            revenue_impact=0.0,
            description="Monitor business operations",
            roi=0.0,
            confidence=1.0,
            details={'action': 'monitor'}
        )
    
    def _simulate_daily_operations(self) -> Dict[str, Any]:
        """Simulate daily business operations"""
        # Random daily fluctuations
        daily_revenue = np.random.normal(self.business_metrics.monthly_revenue / 30, 500)
        daily_expenses = np.random.normal(self.business_metrics.monthly_expenses / 30, 200)
        daily_profit = daily_revenue - daily_expenses
        
        # Update running totals
        self.total_profit += daily_profit
        
        return {
            'daily_revenue': daily_revenue,
            'daily_expenses': daily_expenses,
            'daily_profit': daily_profit,
            'market_conditions': self._get_market_conditions()
        }
    
    def _calculate_reward(self, action_result: ActionResult, daily_results: Dict[str, Any]) -> float:
        """Calculate reward for the action and daily operations"""
        # Base reward from daily profit
        base_reward = daily_results['daily_profit'] / 1000.0  # Normalize
        
        # Action impact reward
        action_reward = 0.0
        if action_result.action_type != ActionType.MONITOR:
            # Reward based on ROI and impact
            roi_reward = action_result.roi / 100.0  # Normalize ROI
            impact_reward = action_result.impact_score
            confidence_reward = action_result.confidence
            
            action_reward = 0.4 * roi_reward + 0.3 * impact_reward + 0.3 * confidence_reward
        
        # Total reward
        total_reward = base_reward + action_reward
        
        return total_reward
    
    def _update_business_state(self, action_result: ActionResult, daily_results: Dict[str, Any]):
        """Update business state based on action and daily operations"""
        # Update financial metrics
        self.business_metrics.cash_flow += daily_results['daily_profit']
        self.business_metrics.cash_flow -= action_result.cost
        self.business_metrics.cash_flow += action_result.revenue_impact
        
        # Update based on action type
        if action_result.action_type == ActionType.MARKETING_AD_SPEND:
            self.business_metrics.current_ad_spend += action_result.cost
        elif action_result.action_type == ActionType.INVENTORY_RESTOCK:
            self.business_metrics.inventory_value += action_result.cost
        
        # Update seasonal factor
        self.business_metrics.season_factor = self._get_seasonal_factor()
    
    def _record_action(self, action_result: ActionResult):
        """Record action for recommendation generation"""
        self.episode_actions.append({
            'day': self.max_days - self.days_remaining + 1,
            'action': action_result.action_type.value,
            'description': action_result.description,
            'quantity': action_result.details.get('quantity', 0),
            'expected_roi': f"{action_result.roi:.1f}%",
            'predicted_profit_usd': action_result.revenue_impact - action_result.cost,
            'confidence': action_result.confidence,
            'impact_score': action_result.impact_score,
            'cost': action_result.cost,
            'revenue_impact': action_result.revenue_impact,
            'details': action_result.details
        })
    
    def _get_observation(self) -> np.ndarray:
        """Get current observation state"""
        return np.array([
            self.business_metrics.cash_flow,
            self.business_metrics.monthly_revenue,
            self.business_metrics.monthly_expenses,
            self.business_metrics.outstanding_invoices,
            self.business_metrics.current_ad_spend,
            self.business_metrics.campaign_performance,
            self.business_metrics.inventory_value,
            self.business_metrics.inventory_turnover,
            self.business_metrics.stockout_incidents,
            self.business_metrics.supplier_performance,
            self.business_metrics.operational_efficiency,
            self.business_metrics.customer_satisfaction,
            self.business_metrics.days_in_month,
            self.business_metrics.season_factor,
        ], dtype=np.float32)
    
    def _get_info(self) -> Dict[str, Any]:
        """Get environment info"""
        return {
            'business_metrics': self.business_metrics,
            'days_remaining': self.days_remaining,
            'episode_actions': self.episode_actions,
            'total_profit': self.total_profit,
            'mock_mode': self.mock_mode
        }
    
    def _get_seasonal_factor(self) -> float:
        """Get current seasonal factor"""
        month = datetime.now().month
        if month in [11, 12, 1]:  # Winter/Holiday season
            return 1.3
        elif month in [6, 7, 8]:  # Summer
            return 1.1
        elif month in [3, 4, 5]:  # Spring
            return 1.0
        else:  # Fall
            return 0.9
    
    def _get_market_conditions(self) -> Dict[str, float]:
        """Get current market conditions"""
        return {
            'demand_multiplier': np.random.uniform(0.8, 1.2),
            'competition_factor': np.random.uniform(0.9, 1.1),
            'economic_indicator': np.random.uniform(0.85, 1.15)
        }
    
    def render(self):
        """Render the environment state"""
        if self.render_mode == "human":
            print(f"\n=== AI COO Business Dashboard ===")
            print(f"Day {self.max_days - self.days_remaining + 1}/{self.max_days}")
            print(f"Cash Flow: ${self.business_metrics.cash_flow:.2f}")
            print(f"Monthly Revenue: ${self.business_metrics.monthly_revenue:.2f}")
            print(f"Monthly Expenses: ${self.business_metrics.monthly_expenses:.2f}")
            print(f"Total Profit: ${self.total_profit:.2f}")
            print(f"Customer Satisfaction: {self.business_metrics.customer_satisfaction:.2f}")
            print(f"Actions Taken: {len(self.episode_actions)}")
    
    def get_recommendations(self) -> List[Dict[str, Any]]:
        """Get current recommendations based on episode actions"""
        if not self.episode_actions:
            return [{
                'action': 'monitor',
                'description': 'Monitor business operations',
                'expected_roi': '0%',
                'confidence': 'high',
                'reasoning': 'No immediate actions needed'
            }]
        
        # Return top 3 actions by ROI
        sorted_actions = sorted(
            self.episode_actions, 
            key=lambda x: float(x['expected_roi'].replace('%', '')), 
            reverse=True
        )
        
        return sorted_actions[:3]


# Example usage and testing
if __name__ == "__main__":
    # Create environment
    env = AICOOEnvironment(render_mode="human", mock_mode=True)
    
    # Test environment
    obs, info = env.reset()
    print(f"Initial observation shape: {obs.shape}")
    print(f"Action space: {env.action_space}")
    
    # Test different action types
    test_actions = [5, 15, 25, 35, 45, 51]  # Different action categories
    
    for action in test_actions:
        obs, reward, terminated, truncated, info = env.step(action)
        print(f"\nAction {action}: Reward = {reward:.3f}")
        if 'action_result' in info:
            result = info['action_result']
            print(f"  {result.description}")
            print(f"  ROI: {result.roi:.1f}%, Cost: ${result.cost:.2f}")
        
        env.render()
        
        if terminated or truncated:
            break
    
    # Get recommendations
    recommendations = env.get_recommendations()
    print(f"\n=== Top Recommendations ===")
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec['description']}")
        print(f"   ROI: {rec['expected_roi']}, Confidence: {rec['confidence']}") 