#!/usr/bin/env python3
"""
Enhanced ROI Calculator for RL Agent

This module provides sophisticated ROI calculation based on:
1. Historical sales rates of products
2. Unit profit margins
3. Estimated likelihood of selling out in the next time window
4. Seasonal and market factors

Formula: Projected ROI = (Expected Revenue - Expected Cost) / Expected Cost
Where:
- Expected Revenue = (Units Likely to Sell) × (Selling Price per Unit)
- Expected Cost = (Restock Quantity) × (Cost per Unit)
- Units Likely to Sell = min(Restock Quantity, Projected Demand × Sell-through Rate)
"""

import json
import os
import logging
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SeasonType(Enum):
    SPRING = "spring"
    SUMMER = "summer"
    FALL = "fall"
    WINTER = "winter"


@dataclass
class ProductMetrics:
    """Historical metrics for a product"""
    product_id: str
    product_name: str
    category: str
    
    # Cost and pricing
    cost_per_unit: float
    selling_price: float
    unit_profit_margin: float  # selling_price - cost_per_unit
    
    # Historical sales data
    avg_daily_sales: float
    sales_velocity_trend: float  # -1 to 1 (declining to growing)
    seasonal_factors: Dict[SeasonType, float]  # Seasonal multipliers
    
    # Inventory metrics
    current_inventory: int
    reorder_point: int
    lead_time_days: int
    
    # Performance metrics
    historical_sell_through_rate: float  # 0 to 1
    stockout_probability: float  # 0 to 1
    demand_volatility: float  # Standard deviation of daily demand
    
    # Last updated
    last_updated: datetime


@dataclass
class ROICalculationResult:
    """Result of ROI calculation"""
    product_id: str
    restock_quantity: int
    
    # Cost calculations
    total_restock_cost: float
    cost_per_unit: float
    
    # Revenue calculations
    projected_units_sold: int
    expected_revenue: float
    selling_price_per_unit: float
    
    # ROI calculation
    expected_profit: float
    projected_roi: float
    
    # Supporting metrics
    sell_through_rate: float
    stockout_probability: float
    confidence_score: float
    time_to_stockout_days: float
    
    # Calculation details
    calculation_factors: Dict[str, Any]
    calculated_at: datetime


class EnhancedROICalculator:
    """Enhanced ROI calculator with business intelligence"""
    
    def __init__(self, mock_mode: bool = True):
        """
        Initialize the ROI calculator
        
        Args:
            mock_mode: Whether to use mock data or real integrations
        """
        self.mock_mode = mock_mode
        self.product_metrics = {}
        self.market_conditions = {
            'overall_demand_multiplier': 1.0,
            'economic_factor': 1.0,
            'seasonal_boost': 1.0,
            'competition_factor': 1.0
        }
        
        # Load historical data
        self._load_product_metrics()
        self._load_market_conditions()
        
        logger.info(f"Enhanced ROI Calculator initialized (mock_mode={mock_mode})")
    
    def calculate_roi(self, 
                     product_id: str, 
                     restock_quantity: int,
                     time_window_days: int = 30) -> ROICalculationResult:
        """
        Calculate projected ROI for a restock recommendation
        
        Args:
            product_id: Product identifier
            restock_quantity: Number of units to restock
            time_window_days: Time window for ROI calculation
            
        Returns:
            ROICalculationResult: Detailed ROI calculation
        """
        # Get product metrics
        product_metrics = self._get_product_metrics(product_id)
        
        # Calculate cost components
        total_restock_cost = restock_quantity * product_metrics.cost_per_unit
        
        # Calculate demand projection
        projected_demand = self._calculate_projected_demand(
            product_metrics, time_window_days
        )
        
        # Calculate sell-through probability
        sell_through_rate = self._calculate_sell_through_rate(
            product_metrics, restock_quantity, projected_demand
        )
        
        # Calculate units likely to sell
        projected_units_sold = min(
            restock_quantity,
            int(projected_demand * sell_through_rate)
        )
        
        # Calculate revenue
        expected_revenue = projected_units_sold * product_metrics.selling_price
        
        # Calculate profit and ROI
        expected_profit = expected_revenue - total_restock_cost
        
        # ROI Formula: (Expected Revenue - Expected Cost) / Expected Cost
        if total_restock_cost > 0:
            projected_roi = (expected_profit / total_restock_cost) * 100
        else:
            projected_roi = 0.0
        
        # Calculate supporting metrics
        stockout_probability = self._calculate_stockout_probability(
            product_metrics, restock_quantity, time_window_days
        )
        
        confidence_score = self._calculate_confidence_score(
            product_metrics, projected_demand, sell_through_rate
        )
        
        time_to_stockout = self._calculate_time_to_stockout(
            product_metrics, restock_quantity
        )
        
        # Compile calculation factors for transparency
        calculation_factors = {
            'projected_demand': projected_demand,
            'base_daily_sales': product_metrics.avg_daily_sales,
            'seasonal_factor': self._get_seasonal_factor(product_metrics),
            'market_factor': self.market_conditions['overall_demand_multiplier'],
            'trend_factor': product_metrics.sales_velocity_trend,
            'demand_volatility': product_metrics.demand_volatility,
            'historical_sell_through': product_metrics.historical_sell_through_rate,
            'current_inventory': product_metrics.current_inventory,
            'reorder_point': product_metrics.reorder_point
        }
        
        result = ROICalculationResult(
            product_id=product_id,
            restock_quantity=restock_quantity,
            total_restock_cost=total_restock_cost,
            cost_per_unit=product_metrics.cost_per_unit,
            projected_units_sold=projected_units_sold,
            expected_revenue=expected_revenue,
            selling_price_per_unit=product_metrics.selling_price,
            expected_profit=expected_profit,
            projected_roi=projected_roi,
            sell_through_rate=sell_through_rate,
            stockout_probability=stockout_probability,
            confidence_score=confidence_score,
            time_to_stockout_days=time_to_stockout,
            calculation_factors=calculation_factors,
            calculated_at=datetime.now()
        )
        
        logger.info(f"ROI calculated for {product_id}: {projected_roi:.1f}% "
                   f"(sell {projected_units_sold}/{restock_quantity} units)")
        
        return result
    
    def _get_product_metrics(self, product_id: str) -> ProductMetrics:
        """Get or create product metrics"""
        if product_id not in self.product_metrics:
            # Create mock metrics for new products
            self.product_metrics[product_id] = self._create_mock_product_metrics(product_id)
        
        return self.product_metrics[product_id]
    
    def _create_mock_product_metrics(self, product_id: str) -> ProductMetrics:
        """Create realistic mock product metrics"""
        # Generate realistic product data
        categories = ['Electronics', 'Home & Garden', 'Health & Beauty', 'Sports', 'Kitchen']
        category = np.random.choice(categories)
        
        # Cost and pricing based on category
        cost_ranges = {
            'Electronics': (25, 150),
            'Home & Garden': (15, 80),
            'Health & Beauty': (8, 45),
            'Sports': (20, 120),
            'Kitchen': (12, 90)
        }
        
        cost_range = cost_ranges.get(category, (10, 100))
        cost_per_unit = np.random.uniform(*cost_range)
        
        # More realistic markup (1.2x to 1.8x cost) to achieve 10-30% ROI range
        markup_factor = float(np.random.uniform(1.2, 1.8))
        selling_price = cost_per_unit * markup_factor
        
        # Sales velocity based on category
        base_sales = {
            'Electronics': 12,
            'Home & Garden': 8,
            'Health & Beauty': 15,
            'Sports': 6,
            'Kitchen': 10
        }
        
        avg_daily_sales = base_sales.get(category, 10) + np.random.normal(0, 2)
        avg_daily_sales = max(1, avg_daily_sales)
        
        # Seasonal factors
        seasonal_factors = {
            SeasonType.SPRING: np.random.uniform(0.9, 1.2),
            SeasonType.SUMMER: np.random.uniform(0.8, 1.3),
            SeasonType.FALL: np.random.uniform(0.9, 1.1),
            SeasonType.WINTER: np.random.uniform(0.7, 1.4)
        }
        
        return ProductMetrics(
            product_id=product_id,
            product_name=f"Product {product_id}",
            category=category,
            cost_per_unit=cost_per_unit,
            selling_price=selling_price,
            unit_profit_margin=selling_price - cost_per_unit,
            avg_daily_sales=avg_daily_sales,
            sales_velocity_trend=np.random.normal(0, 0.2),  # Slight trend
            seasonal_factors=seasonal_factors,
            current_inventory=np.random.randint(10, 200),
            reorder_point=int(avg_daily_sales * 7),  # 7 days of sales
            lead_time_days=np.random.randint(3, 14),
            historical_sell_through_rate=float(np.random.uniform(0.45, 0.75)),
            stockout_probability=np.random.uniform(0.05, 0.25),
            demand_volatility=np.random.uniform(0.1, 0.3),
            last_updated=datetime.now()
        )
    
    def _calculate_projected_demand(self, 
                                   product_metrics: ProductMetrics,
                                   time_window_days: int) -> float:
        """Calculate projected demand for the time window"""
        # Base demand
        base_demand = product_metrics.avg_daily_sales * time_window_days
        
        # Apply seasonal factor
        seasonal_factor = self._get_seasonal_factor(product_metrics)
        
        # Apply market conditions
        market_factor = self.market_conditions['overall_demand_multiplier']
        
        # Apply trend factor
        trend_factor = 1.0 + (product_metrics.sales_velocity_trend * 0.1)
        
        # Add demand volatility
        volatility_factor = 1.0 + np.random.normal(0, product_metrics.demand_volatility)
        
        # Calculate projected demand
        projected_demand = (base_demand * 
                          seasonal_factor * 
                          market_factor * 
                          trend_factor * 
                          volatility_factor)
        
        return max(0, projected_demand)
    
    def _calculate_sell_through_rate(self, 
                                   product_metrics: ProductMetrics,
                                   restock_quantity: int,
                                   projected_demand: float) -> float:
        """Calculate expected sell-through rate"""
        # Base sell-through rate from historical data
        base_rate = product_metrics.historical_sell_through_rate
        
        # Adjust based on demand vs. restock quantity
        demand_ratio = projected_demand / max(restock_quantity, 1)
        
        if demand_ratio >= 1.0:
            # High demand - likely to sell everything
            adjusted_rate = min(0.98, base_rate * 1.1)
        elif demand_ratio >= 0.7:
            # Moderate demand
            adjusted_rate = base_rate
        else:
            # Low demand - lower sell-through
            adjusted_rate = base_rate * 0.8
        
        # Consider current inventory level
        inventory_factor = 1.0
        if product_metrics.current_inventory < product_metrics.reorder_point:
            inventory_factor = 1.05  # Slight boost for low inventory
        
        return min(0.98, max(0.3, adjusted_rate * inventory_factor))
    
    def _calculate_stockout_probability(self,
                                      product_metrics: ProductMetrics,
                                      restock_quantity: int,
                                      time_window_days: int) -> float:
        """Calculate probability of stockout during time window"""
        # Current inventory + restock
        total_inventory = product_metrics.current_inventory + restock_quantity
        
        # Expected demand
        expected_demand = product_metrics.avg_daily_sales * time_window_days
        
        # Demand uncertainty
        demand_std = expected_demand * product_metrics.demand_volatility
        
        # Probability that demand exceeds inventory
        if demand_std > 0:
            z_score = (total_inventory - expected_demand) / demand_std
            stockout_prob = 1 - self._normal_cdf(z_score)
        else:
            stockout_prob = 1.0 if expected_demand > total_inventory else 0.0
        
        return min(0.95, max(0.01, stockout_prob))
    
    def _calculate_confidence_score(self,
                                   product_metrics: ProductMetrics,
                                   projected_demand: float,
                                   sell_through_rate: float) -> float:
        """Calculate confidence score for the ROI calculation"""
        factors = []
        
        # Data quality factor
        data_age_days = (datetime.now() - product_metrics.last_updated).days
        data_quality = max(0.5, 1.0 - (data_age_days / 30))  # Decay over 30 days
        factors.append(data_quality)
        
        # Demand predictability
        demand_predictability = 1.0 - product_metrics.demand_volatility
        factors.append(demand_predictability)
        
        # Historical accuracy
        historical_accuracy = product_metrics.historical_sell_through_rate
        factors.append(historical_accuracy)
        
        # Market stability
        market_stability = 0.8  # Assume moderate stability
        factors.append(market_stability)
        
        # Inventory adequacy
        inventory_adequacy = min(1.0, product_metrics.current_inventory / max(projected_demand * 0.1, 1))
        factors.append(inventory_adequacy)
        
        return np.mean(factors)
    
    def _calculate_time_to_stockout(self,
                                   product_metrics: ProductMetrics,
                                   restock_quantity: int) -> float:
        """Calculate estimated days until stockout"""
        total_inventory = product_metrics.current_inventory + restock_quantity
        
        if product_metrics.avg_daily_sales <= 0:
            return 999.0  # Effectively infinite
        
        return total_inventory / product_metrics.avg_daily_sales
    
    def _get_seasonal_factor(self, product_metrics: ProductMetrics) -> float:
        """Get current seasonal factor"""
        current_month = datetime.now().month
        
        if current_month in [3, 4, 5]:  # Spring
            season = SeasonType.SPRING
        elif current_month in [6, 7, 8]:  # Summer
            season = SeasonType.SUMMER
        elif current_month in [9, 10, 11]:  # Fall
            season = SeasonType.FALL
        else:  # Winter
            season = SeasonType.WINTER
        
        return product_metrics.seasonal_factors.get(season, 1.0)
    
    def _normal_cdf(self, x: float) -> float:
        """Approximate normal cumulative distribution function"""
        return 0.5 * (1 + np.tanh(x * np.sqrt(2 / np.pi)))
    
    def _load_product_metrics(self):
        """Load product metrics from file"""
        metrics_file = "product_metrics.json"
        
        if os.path.exists(metrics_file):
            try:
                with open(metrics_file, 'r') as f:
                    data = json.load(f)
                
                for product_id, metrics_data in data.items():
                    # Convert seasonal factors back to enum keys
                    seasonal_factors = {}
                    for season_str, factor in metrics_data.get('seasonal_factors', {}).items():
                        seasonal_factors[SeasonType(season_str)] = factor
                    
                    metrics_data['seasonal_factors'] = seasonal_factors
                    metrics_data['last_updated'] = datetime.fromisoformat(metrics_data['last_updated'])
                    
                    self.product_metrics[product_id] = ProductMetrics(**metrics_data)
                
                logger.info(f"Loaded {len(self.product_metrics)} product metrics")
                
            except Exception as e:
                logger.error(f"Error loading product metrics: {e}")
    
    def _load_market_conditions(self):
        """Load market conditions from file"""
        conditions_file = "market_conditions.json"
        
        if os.path.exists(conditions_file):
            try:
                with open(conditions_file, 'r') as f:
                    self.market_conditions = json.load(f)
                
                logger.info("Loaded market conditions")
                
            except Exception as e:
                logger.error(f"Error loading market conditions: {e}")
    
    def save_product_metrics(self):
        """Save product metrics to file"""
        metrics_file = "product_metrics.json"
        
        try:
            data = {}
            for product_id, metrics in self.product_metrics.items():
                metrics_dict = {
                    'product_id': metrics.product_id,
                    'product_name': metrics.product_name,
                    'category': metrics.category,
                    'cost_per_unit': metrics.cost_per_unit,
                    'selling_price': metrics.selling_price,
                    'unit_profit_margin': metrics.unit_profit_margin,
                    'avg_daily_sales': metrics.avg_daily_sales,
                    'sales_velocity_trend': metrics.sales_velocity_trend,
                    'seasonal_factors': {season.value: factor for season, factor in metrics.seasonal_factors.items()},
                    'current_inventory': metrics.current_inventory,
                    'reorder_point': metrics.reorder_point,
                    'lead_time_days': metrics.lead_time_days,
                    'historical_sell_through_rate': metrics.historical_sell_through_rate,
                    'stockout_probability': metrics.stockout_probability,
                    'demand_volatility': metrics.demand_volatility,
                    'last_updated': metrics.last_updated.isoformat()
                }
                data[product_id] = metrics_dict
            
            with open(metrics_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            logger.info(f"Saved {len(data)} product metrics")
            
        except Exception as e:
            logger.error(f"Error saving product metrics: {e}")
    
    def update_product_metrics(self, product_id: str, **kwargs):
        """Update product metrics with new data"""
        if product_id in self.product_metrics:
            metrics = self.product_metrics[product_id]
            
            # Update specified fields
            for field, value in kwargs.items():
                if hasattr(metrics, field):
                    setattr(metrics, field, value)
            
            # Update timestamp
            metrics.last_updated = datetime.now()
            
            logger.info(f"Updated metrics for {product_id}")
        else:
            logger.warning(f"Product {product_id} not found in metrics")
    
    def get_roi_summary(self, product_id: str, restock_quantity: int) -> Dict[str, Any]:
        """Get a summary of ROI calculation for display"""
        result = self.calculate_roi(product_id, restock_quantity)
        
        return {
            'product_id': product_id,
            'restock_quantity': restock_quantity,
            'projected_roi': f"{result.projected_roi:.1f}%",
            'expected_profit': f"${result.expected_profit:.2f}",
            'total_cost': f"${result.total_restock_cost:.2f}",
            'expected_revenue': f"${result.expected_revenue:.2f}",
            'sell_through_rate': f"{result.sell_through_rate:.1%}",
            'confidence': f"{result.confidence_score:.1%}",
            'time_to_stockout': f"{result.time_to_stockout_days:.1f} days",
            'units_likely_to_sell': f"{result.projected_units_sold}/{restock_quantity}",
            'calculation_method': 'Enhanced ROI Calculator',
            'formula': '(Expected Revenue - Expected Cost) / Expected Cost',
            'factors_considered': [
                'Historical sales rate',
                'Unit profit margin',
                'Seasonal factors',
                'Market conditions',
                'Demand volatility',
                'Inventory levels',
                'Sell-through probability'
            ]
        }


# Example usage and testing
if __name__ == "__main__":
    # Create calculator
    calculator = EnhancedROICalculator(mock_mode=True)
    
    # Test ROI calculation
    product_id = "PROD-001"
    restock_quantity = 100
    
    result = calculator.calculate_roi(product_id, restock_quantity)
    
    print(f"\n=== ROI Calculation Results ===")
    print(f"Product: {product_id}")
    print(f"Restock Quantity: {restock_quantity}")
    print(f"Total Cost: ${result.total_restock_cost:.2f}")
    print(f"Expected Revenue: ${result.expected_revenue:.2f}")
    print(f"Expected Profit: ${result.expected_profit:.2f}")
    print(f"Projected ROI: {result.projected_roi:.1f}%")
    print(f"Sell-through Rate: {result.sell_through_rate:.1%}")
    print(f"Confidence Score: {result.confidence_score:.1%}")
    print(f"Time to Stockout: {result.time_to_stockout_days:.1f} days")
    
    # Get summary
    summary = calculator.get_roi_summary(product_id, restock_quantity)
    print(f"\n=== Summary ===")
    print(f"Formula: {summary['formula']}")
    print(f"Method: {summary['calculation_method']}")
    print(f"Factors: {', '.join(summary['factors_considered'])}")
    
    # Save metrics
    calculator.save_product_metrics() 