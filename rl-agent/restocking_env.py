import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random
from typing import Dict, Any, Tuple, Optional


class RestockingEnv(gym.Env):
    """
    Custom environment for SME restocking decisions.
    
    The agent decides how many units to restock based on:
    - Current inventory level
    - Recent sales data
    - Seasonal trends
    - Storage costs
    - Demand forecasting
    
    Actions: 0 = no restock, 1-10 = restock 10-100 units (in increments of 10)
    """
    
    metadata = {"render_modes": ["human"]}
    
    def __init__(self, render_mode: Optional[str] = None):
        super().__init__()
        
        # Environment parameters
        self.max_inventory = 500
        self.max_days = 30  # Episode length
        self.storage_cost_per_unit = 0.5  # Daily storage cost
        self.unit_cost = 10.0  # Cost to purchase one unit
        self.selling_price = 20.0  # Revenue per unit sold
        self.stockout_penalty = 50.0  # Penalty for running out of stock
        
        # Action space: 0 = no restock, 1-10 = restock 10-100 units
        self.action_space = spaces.Discrete(11)
        
        # Observation space: [inventory_level, days_remaining, demand_trend, season_factor]
        self.observation_space = spaces.Box(
            low=np.array([0, 0, 0.1, 0.5]),
            high=np.array([self.max_inventory, self.max_days, 3.0, 2.0]),
            dtype=np.float32
        )
        
        # Initialize state
        self.current_inventory = 0
        self.days_remaining = 0
        self.demand_trend = 1.0
        self.season_factor = 1.0
        self.total_profit = 0.0
        self.episode_actions = []
        
        self.render_mode = render_mode
        
    def reset(self, seed: Optional[int] = None, options: Optional[Dict] = None) -> Tuple[np.ndarray, Dict]:
        super().reset(seed=seed)
        
        # Reset environment state
        self.current_inventory = random.randint(20, 100)
        self.days_remaining = self.max_days
        self.demand_trend = random.uniform(0.8, 1.5)  # Market demand multiplier
        self.season_factor = random.uniform(0.7, 1.8)  # Seasonal adjustment
        self.total_profit = 0.0
        self.episode_actions = []
        
        observation = self._get_observation()
        info = self._get_info()
        
        return observation, info
    
    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict]:
        # Calculate restock quantity
        restock_quantity = action * 10  # 0, 10, 20, ..., 100
        
        # Apply restocking
        if restock_quantity > 0:
            self.current_inventory += restock_quantity
            self.current_inventory = min(self.current_inventory, self.max_inventory)
        
        # Calculate daily demand with some randomness
        base_demand = 15 * self.demand_trend * self.season_factor
        daily_demand = max(0, int(np.random.normal(base_demand, base_demand * 0.3)))
        
        # Calculate sales (limited by inventory)
        units_sold = min(daily_demand, self.current_inventory)
        self.current_inventory -= units_sold
        
        # Calculate reward components
        revenue = units_sold * self.selling_price
        restock_cost = restock_quantity * self.unit_cost
        storage_cost = self.current_inventory * self.storage_cost_per_unit
        
        # Stockout penalty if demand exceeds inventory
        stockout_penalty = 0
        if daily_demand > units_sold and self.current_inventory == 0:
            stockout_penalty = self.stockout_penalty
        
        # Calculate daily profit
        daily_profit = revenue - restock_cost - storage_cost - stockout_penalty
        self.total_profit += daily_profit
        
        # Store action for recommendations
        if restock_quantity > 0:
            expected_roi = ((revenue - restock_cost) / max(restock_cost, 1)) * 100
            self.episode_actions.append({
                "day": self.max_days - self.days_remaining + 1,
                "action": "restock",
                "quantity": restock_quantity,
                "expected_roi": f"{expected_roi:.1f}%",
                "inventory_before": self.current_inventory + units_sold,
                "daily_demand": daily_demand,
                "units_sold": units_sold
            })
        
        # Calculate reward (normalized daily profit)
        reward = daily_profit / 100.0  # Normalize reward
        
        # Update time
        self.days_remaining -= 1
        
        # Check if episode is done
        terminated = self.days_remaining <= 0
        truncated = False
        
        observation = self._get_observation()
        info = self._get_info()
        info["daily_profit"] = daily_profit
        info["units_sold"] = units_sold
        info["daily_demand"] = daily_demand
        info["restock_quantity"] = restock_quantity
        
        return observation, reward, terminated, truncated, info
    
    def _get_observation(self) -> np.ndarray:
        return np.array([
            self.current_inventory,
            self.days_remaining,
            self.demand_trend,
            self.season_factor
        ], dtype=np.float32)
    
    def _get_info(self) -> Dict[str, Any]:
        return {
            "total_profit": self.total_profit,
            "current_inventory": self.current_inventory,
            "days_remaining": self.days_remaining,
            "episode_actions": self.episode_actions
        }
    
    def render(self):
        if self.render_mode == "human":
            print(f"Day {self.max_days - self.days_remaining + 1}: "
                  f"Inventory: {self.current_inventory}, "
                  f"Total Profit: ${self.total_profit:.2f}")
    
    def get_recommendations(self) -> Dict[str, Any]:
        """Get the latest recommendation based on current state"""
        if not self.episode_actions:
            return {
                "action": "monitor",
                "quantity": 0,
                "expected_roi": "0%",
                "reason": "No restocking needed"
            }
        
        latest_action = self.episode_actions[-1]
        return {
            "action": latest_action["action"],
            "quantity": latest_action["quantity"],
            "expected_roi": latest_action["expected_roi"],
            "reason": f"Based on demand trend {self.demand_trend:.2f} and season factor {self.season_factor:.2f}"
        } 