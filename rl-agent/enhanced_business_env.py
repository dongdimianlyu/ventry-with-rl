import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random
from typing import Dict, Any, Tuple, Optional, List
from dataclasses import dataclass
from enum import Enum

class MarketCondition(Enum):
    RECESSION = 0
    SLOW = 1
    NORMAL = 2
    GROWTH = 3
    BOOM = 4

class SeasonType(Enum):
    WINTER = 0
    SPRING = 1
    SUMMER = 2
    FALL = 3

@dataclass
class ProductInfo:
    name: str
    category: str
    cost_price: float
    selling_price: float
    storage_cost_per_unit: float
    base_demand: float
    seasonality_factor: Dict[SeasonType, float]
    demand_elasticity: float
    lead_time: int
    supplier_reliability: float

class EnhancedBusinessEnv(gym.Env):
    """
    Enhanced business environment simulating realistic SME operations for a $200k/month business.
    
    Features:
    - Multiple product categories with different dynamics
    - Complex cash flow simulation
    - Supplier relationships and lead times
    - Seasonal demand patterns
    - Market volatility
    - Customer satisfaction metrics
    - Inventory turnover optimization
    - Cost of goods sold (COGS) tracking
    - Gross margin optimization
    """
    
    metadata = {"render_modes": ["human"]}
    
    def __init__(self, render_mode: Optional[str] = None):
        super().__init__()
        
        # Environment parameters
        self.max_days = 90  # Longer episodes for better learning
        self.target_monthly_revenue = 200000  # $200k/month target
        self.max_inventory_value = 100000  # $100k max inventory value
        
        # Initialize product catalog
        self.products = self._create_product_catalog()
        self.num_products = len(self.products)
        
        # Action space: For each product: [no_action, restock_small, restock_medium, restock_large]
        # Also includes pricing actions and supplier management
        self.action_space = spaces.MultiDiscrete([4] * self.num_products + [3, 3, 3])  # Actions + price/supplier decisions
        
        # Observation space: Complex state representation
        obs_low = np.concatenate([
            [0] * self.num_products,  # Inventory levels
            [0] * self.num_products,  # Days since last restock
            [0],  # Cash flow
            [0],  # Days remaining
            [0.1, 0.5, 0.0, 0.0, 0.0],  # Market conditions
            [0] * self.num_products,  # Demand trend per product
            [0],  # Customer satisfaction
            [0],  # Monthly revenue
            [0]   # Inventory turnover rate
        ])
        
        obs_high = np.concatenate([
            [1000] * self.num_products,  # Max inventory
            [30] * self.num_products,  # Max days since restock
            [500000],  # Max cash flow
            [self.max_days],  # Max days
            [1.0, 2.0, 1.0, 1.0, 1.0],  # Market condition ranges
            [3.0] * self.num_products,  # Max demand multiplier
            [1.0],  # Max customer satisfaction
            [300000],  # Max monthly revenue
            [20.0]  # Max inventory turnover rate
        ])
        
        self.observation_space = spaces.Box(
            low=np.array(obs_low, dtype=np.float32),
            high=np.array(obs_high, dtype=np.float32),
            dtype=np.float32
        )
        
        # Initialize business state
        self.business_state = self._create_business_state()
        self.episode_actions: List[Dict[str, Any]] = []
        self.render_mode = render_mode
        
    def _create_product_catalog(self) -> List[ProductInfo]:
        """Create a realistic product catalog for a $200k/month business"""
        products = [
            ProductInfo(
                name="Tech Pro Wireless Mouse",
                category="Electronics",
                cost_price=25.0,
                selling_price=49.99,
                storage_cost_per_unit=0.75,
                base_demand=45,  # Units per day
                seasonality_factor={
                    SeasonType.WINTER: 1.3,  # Holiday shopping
                    SeasonType.SPRING: 1.0,
                    SeasonType.SUMMER: 0.8,
                    SeasonType.FALL: 1.1
                },
                demand_elasticity=1.2,
                lead_time=7,
                supplier_reliability=0.95
            ),
            ProductInfo(
                name="Organic Garden Fertilizer",
                category="Home & Garden", 
                cost_price=18.0,
                selling_price=34.99,
                storage_cost_per_unit=1.2,
                base_demand=30,
                seasonality_factor={
                    SeasonType.WINTER: 0.4,
                    SeasonType.SPRING: 1.8,  # Peak gardening season
                    SeasonType.SUMMER: 1.5,
                    SeasonType.FALL: 0.8
                },
                demand_elasticity=0.9,
                lead_time=14,
                supplier_reliability=0.88
            ),
            ProductInfo(
                name="Premium Athletic Socks",
                category="Fashion",
                cost_price=8.0,
                selling_price=19.99,
                storage_cost_per_unit=0.25,
                base_demand=60,
                seasonality_factor={
                    SeasonType.WINTER: 1.1,
                    SeasonType.SPRING: 1.2,
                    SeasonType.SUMMER: 1.0,
                    SeasonType.FALL: 0.9
                },
                demand_elasticity=1.5,
                lead_time=10,
                supplier_reliability=0.92
            ),
            ProductInfo(
                name="Protein Powder Vanilla",
                category="Health & Fitness",
                cost_price=32.0,
                selling_price=59.99,
                storage_cost_per_unit=1.0,
                base_demand=25,
                seasonality_factor={
                    SeasonType.WINTER: 1.1,  # New Year resolutions
                    SeasonType.SPRING: 1.3,  # Summer prep
                    SeasonType.SUMMER: 1.0,
                    SeasonType.FALL: 0.8
                },
                demand_elasticity=1.1,
                lead_time=12,
                supplier_reliability=0.90
            ),
            ProductInfo(
                name="Ergonomic Desk Organizer",
                category="Office",
                cost_price=22.0,
                selling_price=42.99,
                storage_cost_per_unit=0.8,
                base_demand=20,
                seasonality_factor={
                    SeasonType.WINTER: 0.8,
                    SeasonType.SPRING: 1.0,
                    SeasonType.SUMMER: 0.9,
                    SeasonType.FALL: 1.3  # Back to school/work
                },
                demand_elasticity=1.0,
                lead_time=8,
                supplier_reliability=0.94
            )
        ]
        
        return products
    
    def _create_business_state(self):
        """Initialize business state for new episode"""
        return {
            'inventory_levels': [random.randint(50, 200) for _ in range(self.num_products)],
            'days_since_restock': [random.randint(0, 10) for _ in range(self.num_products)],
            'cash_flow': random.uniform(20000, 50000),
            'accounts_receivable': random.uniform(15000, 35000),
            'accounts_payable': random.uniform(8000, 20000),
            'customer_satisfaction': random.uniform(0.7, 0.9),
            'supplier_relationships': [random.uniform(0.8, 1.0) for _ in range(self.num_products)],
            'market_condition': random.choice(list(MarketCondition)),
            'season': random.choice(list(SeasonType)),
            'demand_trends': [random.uniform(0.8, 1.2) for _ in range(self.num_products)],
            'monthly_revenue': 0.0,
            'monthly_costs': 0.0,
            'inventory_turnover': 0.0,
            'pending_orders': {i: [] for i in range(self.num_products)},  # Orders in transit
            'stockout_days': [0] * self.num_products,
            'total_profit': 0.0
        }
    
    def reset(self, seed: Optional[int] = None, options: Optional[Dict] = None) -> Tuple[np.ndarray, Dict]:
        super().reset(seed=seed)
        
        # Initialize business state
        self.business_state = self._create_business_state()
        self.days_remaining = self.max_days
        self.episode_actions = []
        
        observation = self._get_observation()
        info = self._get_info()
        
        return observation, info
    
    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, bool, Dict]:
        """Execute one step in the business simulation"""
        
        # Parse actions
        product_actions = action[:self.num_products]
        business_actions = action[self.num_products:]
        
        # Process supplier orders (deliveries from previous orders)
        self._process_supplier_deliveries()
        
        # Execute product restocking actions
        restock_costs = 0
        for i, product in enumerate(self.products):
            action_type = product_actions[i]
            if action_type > 0:  # Some restocking action
                restock_cost = self._execute_restock_action(product, action_type)
                restock_costs += restock_cost
        
        # Execute business actions (pricing, supplier management)
        self._execute_business_actions(business_actions)
        
        # Simulate daily business operations
        daily_results = self._simulate_daily_operations()
        
        # Calculate comprehensive reward
        reward = self._calculate_enhanced_reward(daily_results, restock_costs)
        
        # Update business state
        self._update_business_state(daily_results)
        
        # Record actions for recommendations
        if any(a > 0 for a in product_actions):
            self._record_action(product_actions, daily_results)
        
        # Update time
        self.days_remaining -= 1
        
        # Check if episode is done
        terminated = self.days_remaining <= 0
        truncated = self.business_state['cash_flow'] < -50000  # Bankruptcy condition
        
        observation = self._get_observation()
        info = self._get_info()
        info.update(daily_results)
        
        return observation, reward, terminated, truncated, info
    
    def _process_supplier_deliveries(self):
        """Process orders that are arriving today"""
        for product_idx in range(self.num_products):
            orders = self.business_state['pending_orders'][product_idx]
            delivered_orders = []
            
            for order in orders:
                order['days_remaining'] -= 1
                if order['days_remaining'] <= 0:
                    # Order arrives
                    self.business_state['inventory_levels'][product_idx] += order['quantity']
                    delivered_orders.append(order)
            
            # Remove delivered orders
            for order in delivered_orders:
                orders.remove(order)
    
    def _execute_restock_action(self, product: ProductInfo, action_type: int) -> float:
        """Execute restocking action for a specific product"""
        product_idx = self.products.index(product)
        
        # Determine restock quantity based on action
        if action_type == 1:  # Small restock
            quantity = 50
        elif action_type == 2:  # Medium restock
            quantity = 100
        elif action_type == 3:  # Large restock
            quantity = 200
        else:
            return 0.0
        
        # Calculate cost
        cost = quantity * product.cost_price
        
        # Check if we have cash for the order
        if self.business_state['cash_flow'] < cost:
            quantity = int(self.business_state['cash_flow'] / product.cost_price)
            cost = quantity * product.cost_price
            
        if quantity > 0:
            # Create pending order with lead time
            order = {
                'quantity': quantity,
                'days_remaining': product.lead_time,
                'cost': cost
            }
            self.business_state['pending_orders'][product_idx].append(order)
            
            # Deduct cash immediately
            self.business_state['cash_flow'] -= cost
            self.business_state['days_since_restock'][product_idx] = 0
        
        return cost
    
    def _execute_business_actions(self, business_actions: np.ndarray):
        """Execute general business actions like pricing strategy"""
        # Business actions could include:
        # - Marketing spend adjustments
        # - Price optimization
        # - Supplier relationship management
        
        # For now, implement basic effects
        marketing_action = business_actions[0]
        if marketing_action == 1:  # Increase marketing
            marketing_cost = 1000
            if self.business_state['cash_flow'] >= marketing_cost:
                self.business_state['cash_flow'] -= marketing_cost
                # Boost demand trends
                for i in range(self.num_products):
                    self.business_state['demand_trends'][i] *= 1.1
        elif marketing_action == 2:  # Premium marketing
            marketing_cost = 2500
            if self.business_state['cash_flow'] >= marketing_cost:
                self.business_state['cash_flow'] -= marketing_cost
                # Significant demand boost
                for i in range(self.num_products):
                    self.business_state['demand_trends'][i] *= 1.2
    
    def _simulate_daily_operations(self) -> Dict[str, Any]:
        """Simulate one day of business operations"""
        daily_revenue = 0
        daily_costs = 0
        daily_units_sold = 0
        stockouts = 0
        
        for i, product in enumerate(self.products):
            # Calculate demand based on multiple factors
            base_demand = product.base_demand
            seasonal_factor = product.seasonality_factor[self.business_state['season']]
            market_factor = self._get_market_factor(self.business_state['market_condition'])
            trend_factor = self.business_state['demand_trends'][i]
            
            # Add some randomness
            demand_variance = np.random.normal(1.0, 0.15)
            
            daily_demand = int(base_demand * seasonal_factor * market_factor * trend_factor * demand_variance)
            daily_demand = max(0, daily_demand)
            
            # Calculate sales (limited by inventory)
            current_inventory = self.business_state['inventory_levels'][i]
            units_sold = min(daily_demand, current_inventory)
            
            # Update inventory
            self.business_state['inventory_levels'][i] -= units_sold
            
            # Calculate revenue
            product_revenue = units_sold * product.selling_price
            daily_revenue += product_revenue
            
            # Calculate storage costs
            storage_cost = current_inventory * product.storage_cost_per_unit
            daily_costs += storage_cost
            
            # Track stockouts
            if daily_demand > units_sold and current_inventory == 0:
                stockouts += 1
                self.business_state['stockout_days'][i] += 1
                # Customer satisfaction impact
                self.business_state['customer_satisfaction'] *= 0.98
            
            daily_units_sold += units_sold
            
            # Update days since restock
            self.business_state['days_since_restock'][i] += 1
        
        # Update customer satisfaction based on stockouts
        if stockouts == 0:
            self.business_state['customer_satisfaction'] = min(1.0, self.business_state['customer_satisfaction'] * 1.001)
        
        # Calculate daily profit
        daily_profit = daily_revenue - daily_costs
        
        return {
            'daily_revenue': daily_revenue,
            'daily_costs': daily_costs,
            'daily_profit': daily_profit,
            'daily_units_sold': daily_units_sold,
            'stockouts': stockouts,
            'demand_fulfillment_rate': (daily_units_sold / max(sum(product.base_demand for product in self.products), 1))
        }
    
    def _calculate_enhanced_reward(self, daily_results: Dict[str, Any], restock_costs: float) -> float:
        """Calculate sophisticated reward based on multiple business metrics"""
        
        # Base profit component
        profit_reward = daily_results['daily_profit'] / 1000  # Scale down
        
        # Revenue efficiency (revenue per inventory unit)
        total_inventory_value = sum(
            self.business_state['inventory_levels'][i] * self.products[i].cost_price
            for i in range(self.num_products)
        )
        if total_inventory_value > 0:
            revenue_efficiency = daily_results['daily_revenue'] / total_inventory_value
        else:
            revenue_efficiency = 0
        
        # Inventory optimization bonus/penalty
        inventory_penalty = 0
        for i, product in enumerate(self.products):
            inventory_level = self.business_state['inventory_levels'][i]
            # Penalty for excessive inventory
            if inventory_level > 300:
                inventory_penalty += (inventory_level - 300) * 0.1
            # Penalty for stockouts
            if inventory_level == 0:
                inventory_penalty += 50
        
        # Customer satisfaction component
        satisfaction_bonus = (self.business_state['customer_satisfaction'] - 0.5) * 100
        
        # Cash flow management
        cash_flow_reward = 0
        if self.business_state['cash_flow'] > 10000:
            cash_flow_reward = 10
        elif self.business_state['cash_flow'] < 0:
            cash_flow_reward = -50
        
        # Inventory turnover bonus
        turnover_bonus = 0
        for i in range(self.num_products):
            if self.business_state['days_since_restock'][i] < 20:  # Fast turnover
                turnover_bonus += 5
        
        # Combine all components
        total_reward = (
            profit_reward +
            revenue_efficiency * 50 +
            satisfaction_bonus +
            cash_flow_reward +
            turnover_bonus -
            inventory_penalty -
            restock_costs / 1000
        )
        
        return total_reward
    
    def _update_business_state(self, daily_results: Dict[str, Any]):
        """Update business state with daily results"""
        self.business_state['monthly_revenue'] += daily_results['daily_revenue']
        self.business_state['monthly_costs'] += daily_results['daily_costs']
        self.business_state['total_profit'] += daily_results['daily_profit']
        
        # Update cash flow with daily revenue
        self.business_state['cash_flow'] += daily_results['daily_profit']
        
        # Update inventory turnover rate
        if self.business_state['monthly_costs'] > 0:
            avg_inventory_value = sum(
                self.business_state['inventory_levels'][i] * self.products[i].cost_price
                for i in range(self.num_products)
            )
            if avg_inventory_value > 0:
                self.business_state['inventory_turnover'] = self.business_state['monthly_costs'] / avg_inventory_value
    
    def _record_action(self, product_actions: np.ndarray, daily_results: Dict[str, Any]):
        """Record action for recommendation generation"""
        for i, action in enumerate(product_actions):
            if action > 0:
                product = self.products[i]
                action_types = ["none", "restock_small", "restock_medium", "restock_large"]
                quantities = [0, 50, 100, 200]
                
                # Calculate more accurate profit projections
                restock_cost = quantities[action] * product.cost_price
                # Estimate sales based on current demand and inventory levels
                estimated_units_sold = min(quantities[action], product.base_demand * 7)  # Weekly demand estimate
                estimated_revenue = estimated_units_sold * product.selling_price
                predicted_profit_usd = estimated_revenue - restock_cost
                expected_roi = (predicted_profit_usd / max(restock_cost, 1)) * 100
                
                self.episode_actions.append({
                    "day": self.max_days - self.days_remaining + 1,
                    "action": action_types[action],
                    "product": product.name,
                    "quantity": quantities[action],
                    "expected_roi": f"{expected_roi:.1f}%",
                    "predicted_profit_usd": predicted_profit_usd,
                    "inventory_level": self.business_state['inventory_levels'][i],
                    "customer_satisfaction": self.business_state['customer_satisfaction'],
                    "cash_flow": self.business_state['cash_flow']
                })
    
    def _get_market_factor(self, market_condition: MarketCondition) -> float:
        """Get demand multiplier based on market conditions"""
        factors = {
            MarketCondition.RECESSION: 0.6,
            MarketCondition.SLOW: 0.8,
            MarketCondition.NORMAL: 1.0,
            MarketCondition.GROWTH: 1.2,
            MarketCondition.BOOM: 1.5
        }
        return factors[market_condition]
    
    def _get_observation(self) -> np.ndarray:
        """Get current observation vector"""
        obs = np.concatenate([
            np.array(self.business_state['inventory_levels'], dtype=np.float32),
            np.array(self.business_state['days_since_restock'], dtype=np.float32),
            [self.business_state['cash_flow']],
            [self.days_remaining],
            [
                self.business_state['market_condition'].value / 4.0,  # Normalize 0-1
                self._get_market_factor(self.business_state['market_condition']),
                self.business_state['season'].value / 3.0,  # Normalize 0-1
                self.business_state['customer_satisfaction'],
                self.business_state['inventory_turnover'] / 10.0  # Normalize
            ],
            np.array(self.business_state['demand_trends'], dtype=np.float32),
            [self.business_state['customer_satisfaction']],
            [self.business_state['monthly_revenue']],
            [self.business_state['inventory_turnover']]
        ])
        
        return obs.astype(np.float32)
    
    def _get_info(self) -> Dict[str, Any]:
        """Get additional information about current state"""
        return {
            "total_profit": self.business_state['total_profit'],
            "monthly_revenue": self.business_state['monthly_revenue'],
            "cash_flow": self.business_state['cash_flow'],
            "customer_satisfaction": self.business_state['customer_satisfaction'],
            "inventory_levels": self.business_state['inventory_levels'].copy(),
            "stockout_days": self.business_state['stockout_days'].copy(),
            "market_condition": self.business_state['market_condition'].name,
            "season": self.business_state['season'].name,
            "episode_actions": self.episode_actions.copy()
        }
    
    def render(self, mode: str = "human"):
        """Render the environment state"""
        if mode == "human":
            print(f"\n=== Day {self.max_days - self.days_remaining + 1} ===")
            print(f"Cash Flow: ${self.business_state['cash_flow']:.2f}")
            print(f"Monthly Revenue: ${self.business_state['monthly_revenue']:.2f}")
            print(f"Customer Satisfaction: {self.business_state['customer_satisfaction']:.2f}")
            print(f"Market: {self.business_state['market_condition'].name}")
            print(f"Season: {self.business_state['season'].name}")
            
            print("\nInventory Levels:")
            for i, product in enumerate(self.products):
                level = self.business_state['inventory_levels'][i]
                print(f"  {product.name}: {level} units") 