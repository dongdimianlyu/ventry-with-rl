#!/usr/bin/env python3
"""
Advanced Business Scenario Generator

Creates realistic business scenarios for RL agent training and evaluation:
- Market volatility events
- Seasonal demand patterns  
- Supply chain disruptions
- Cash flow challenges
- Customer behavior changes
- Competitive pressures
- Economic conditions
"""

import random
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import json

class ScenarioType(Enum):
    MARKET_VOLATILITY = "market_volatility"
    SUPPLY_DISRUPTION = "supply_disruption"
    DEMAND_SHOCK = "demand_shock"
    CASH_FLOW_CRISIS = "cash_flow_crisis"
    SEASONAL_PATTERN = "seasonal_pattern"
    COMPETITIVE_PRESSURE = "competitive_pressure"
    ECONOMIC_DOWNTURN = "economic_downturn"
    GROWTH_OPPORTUNITY = "growth_opportunity"

class Severity(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

@dataclass
class BusinessEvent:
    """Individual business event within a scenario"""
    day: int
    event_type: str
    description: str
    impact_factors: Dict[str, float]
    duration: int  # Days
    severity: Severity

@dataclass 
class BusinessScenario:
    """Complete business scenario with multiple events"""
    name: str
    description: str
    scenario_type: ScenarioType
    duration_days: int
    events: List[BusinessEvent]
    target_metrics: Dict[str, float]
    difficulty_level: float  # 0.0 to 1.0
    learning_objectives: List[str]

class BusinessScenarioGenerator:
    """Generates diverse business scenarios for RL training"""
    
    def __init__(self):
        self.base_demand = {
            "tech_mouse": 45,
            "air_purifier": 20,
            "athletic_socks": 60,
            "protein_powder": 25,
            "desk_organizer": 20
        }
        
        self.base_prices = {
            "tech_mouse": 49.99,
            "air_purifier": 199.99,
            "athletic_socks": 19.99,
            "protein_powder": 59.99,
            "desk_organizer": 42.99
        }
        
    def generate_market_volatility_scenario(self, difficulty: float = 0.5) -> BusinessScenario:
        """Generate market volatility scenario"""
        events = []
        
        # Initial market uncertainty
        events.append(BusinessEvent(
            day=5,
            event_type="market_uncertainty",
            description="Industry reports suggest potential market instability",
            impact_factors={"demand_volatility": 1.2, "customer_confidence": 0.9},
            duration=10,
            severity=Severity.LOW
        ))
        
        # Major market event
        if difficulty > 0.3:
            events.append(BusinessEvent(
                day=15,
                event_type="market_crash",
                description="Major market correction affects consumer spending",
                impact_factors={"demand_multiplier": 0.6, "customer_confidence": 0.7, "payment_delays": 1.4},
                duration=20,
                severity=Severity.HIGH if difficulty > 0.7 else Severity.MEDIUM
            ))
        
        # Recovery phase
        if difficulty < 0.8:
            events.append(BusinessEvent(
                day=40,
                event_type="market_recovery",
                description="Market shows signs of recovery",
                impact_factors={"demand_multiplier": 1.1, "customer_confidence": 0.95},
                duration=15,
                severity=Severity.LOW
            ))
        
        # Competitor response
        events.append(BusinessEvent(
            day=25,
            event_type="competitor_price_war",
            description="Competitors reduce prices to maintain market share",
            impact_factors={"competitive_pressure": 1.3, "price_sensitivity": 1.2},
            duration=30,
            severity=Severity.MEDIUM
        ))
        
        return BusinessScenario(
            name="Market Volatility Challenge",
            description="Navigate through market uncertainty and competitive pressures",
            scenario_type=ScenarioType.MARKET_VOLATILITY,
            duration_days=90,
            events=events,
            target_metrics={
                "total_revenue": 450000,  # Lower due to market conditions
                "gross_margin": 0.35,
                "inventory_turnover": 3.5,
                "cash_flow": 50000
            },
            difficulty_level=difficulty,
            learning_objectives=[
                "Manage inventory during market uncertainty",
                "Adapt pricing strategies to competitive pressure",
                "Maintain cash flow during revenue fluctuations",
                "Balance risk vs. opportunity in volatile conditions"
            ]
        )
    
    def generate_supply_disruption_scenario(self, difficulty: float = 0.5) -> BusinessScenario:
        """Generate supply chain disruption scenario"""
        events = []
        
        # Initial supplier warning
        events.append(BusinessEvent(
            day=8,
            event_type="supplier_warning",
            description="Key supplier reports potential delivery delays",
            impact_factors={"supplier_reliability": 0.8, "lead_time_multiplier": 1.2},
            duration=7,
            severity=Severity.LOW
        ))
        
        # Major disruption
        disruption_day = random.randint(15, 30)
        affected_products = random.sample(list(self.base_demand.keys()), 
                                        2 if difficulty < 0.5 else 3)
        
        events.append(BusinessEvent(
            day=disruption_day,
            event_type="supply_disruption",
            description=f"Major supplier disruption affects {len(affected_products)} product lines",
            impact_factors={
                "supplier_reliability": 0.3 if difficulty > 0.7 else 0.5,
                "lead_time_multiplier": 2.5 if difficulty > 0.7 else 1.8,
                "cost_multiplier": 1.3,
                "affected_products": affected_products
            },
            duration=25 if difficulty > 0.7 else 15,
            severity=Severity.CRITICAL if difficulty > 0.7 else Severity.HIGH
        ))
        
        # Alternative supplier opportunity
        events.append(BusinessEvent(
            day=disruption_day + 10,
            event_type="alternative_supplier",
            description="Alternative supplier offers expedited delivery at premium cost",
            impact_factors={
                "supplier_reliability": 0.9,
                "cost_multiplier": 1.6,
                "lead_time_multiplier": 0.7
            },
            duration=20,
            severity=Severity.MEDIUM
        ))
        
        # Gradual recovery
        if difficulty < 0.8:
            events.append(BusinessEvent(
                day=60,
                event_type="supply_recovery",
                description="Original supplier gradually restores normal operations",
                impact_factors={
                    "supplier_reliability": 0.85,
                    "lead_time_multiplier": 1.1,
                    "cost_multiplier": 1.05
                },
                duration=20,
                severity=Severity.LOW
            ))
        
        return BusinessScenario(
            name="Supply Chain Crisis",
            description="Manage operations through major supply chain disruptions",
            scenario_type=ScenarioType.SUPPLY_DISRUPTION,
            duration_days=90,
            events=events,
            target_metrics={
                "service_level": 0.85,  # Lower due to supply issues
                "inventory_turnover": 4.0,
                "total_revenue": 480000,
                "cost_efficiency": 0.65
            },
            difficulty_level=difficulty,
            learning_objectives=[
                "Manage inventory during supply uncertainty",
                "Evaluate alternative supplier relationships",
                "Balance cost vs. service level trade-offs",
                "Develop contingency planning strategies"
            ]
        )
    
    def generate_demand_shock_scenario(self, difficulty: float = 0.5) -> BusinessScenario:
        """Generate sudden demand change scenario"""
        events = []
        
        # Market trend emergence
        trending_product = random.choice(list(self.base_demand.keys()))
        trend_multiplier = 2.5 if difficulty > 0.6 else 1.8
        
        events.append(BusinessEvent(
            day=10,
            event_type="viral_trend",
            description=f"Social media trend dramatically increases demand for {trending_product}",
            impact_factors={
                "demand_multiplier": {trending_product: trend_multiplier},
                "price_elasticity": {trending_product: 0.6}  # Less price sensitive
            },
            duration=30,
            severity=Severity.MEDIUM
        ))
        
        # Capacity constraints
        events.append(BusinessEvent(
            day=15,
            event_type="capacity_constraint",
            description="Fulfillment capacity strained by demand surge",
            impact_factors={
                "fulfillment_capacity": 0.7,
                "shipping_delays": 1.4,
                "customer_satisfaction": 0.8
            },
            duration=25,
            severity=Severity.HIGH if difficulty > 0.6 else Severity.MEDIUM
        ))
        
        # Competitor response
        events.append(BusinessEvent(
            day=20,
            event_type="competitor_stockout",
            description="Competitors struggle with inventory, creating opportunity",
            impact_factors={
                "market_share_opportunity": 1.3,
                "demand_multiplier": 1.2,
                "price_premium": 1.15
            },
            duration=20,
            severity=Severity.LOW
        ))
        
        # Trend decline
        if difficulty < 0.7:
            events.append(BusinessEvent(
                day=50,
                event_type="trend_decline",
                description="Viral trend begins to fade, demand normalizes",
                impact_factors={
                    "demand_multiplier": {trending_product: 1.1},
                    "inventory_risk": 1.2  # Risk of overstock
                },
                duration=15,
                severity=Severity.LOW
            ))
        
        return BusinessScenario(
            name="Viral Demand Surge",
            description="Capitalize on sudden demand spike while managing capacity",
            scenario_type=ScenarioType.DEMAND_SHOCK,
            duration_days=90,
            events=events,
            target_metrics={
                "total_revenue": 650000,  # Higher due to opportunity
                "customer_satisfaction": 0.88,
                "inventory_turnover": 6.0,
                "market_share_growth": 0.15
            },
            difficulty_level=difficulty,
            learning_objectives=[
                "Recognize and respond to demand opportunities",
                "Scale operations during demand surges",
                "Balance growth vs. customer satisfaction",
                "Manage inventory risk during trend cycles"
            ]
        )
    
    def generate_cash_flow_crisis_scenario(self, difficulty: float = 0.5) -> BusinessScenario:
        """Generate cash flow challenge scenario"""
        events = []
        
        # Large customer payment delay
        events.append(BusinessEvent(
            day=7,
            event_type="payment_delay",
            description="Major customer requests extended payment terms",
            impact_factors={
                "accounts_receivable": 1.4,
                "cash_flow_delay": 30,
                "revenue_risk": 0.05
            },
            duration=45,
            severity=Severity.MEDIUM
        ))
        
        # Unexpected expense
        expense_multiplier = 2.0 if difficulty > 0.6 else 1.5
        events.append(BusinessEvent(
            day=20,
            event_type="unexpected_expense",
            description="Equipment failure requires emergency replacement",
            impact_factors={
                "operational_cost": expense_multiplier,
                "cash_flow": -25000 if difficulty > 0.6 else -15000
            },
            duration=1,
            severity=Severity.HIGH if difficulty > 0.6 else Severity.MEDIUM
        ))
        
        # Supplier payment pressure
        events.append(BusinessEvent(
            day=35,
            event_type="supplier_pressure",
            description="Key supplier demands faster payment terms",
            impact_factors={
                "payment_terms": 0.7,  # Shorter terms
                "supplier_relationship": 0.8,
                "cash_flow_pressure": 1.3
            },
            duration=30,
            severity=Severity.MEDIUM
        ))
        
        # Credit opportunity (if not too difficult)
        if difficulty < 0.7:
            events.append(BusinessEvent(
                day=45,
                event_type="credit_opportunity",
                description="Bank offers short-term credit facility",
                impact_factors={
                    "credit_available": 50000,
                    "interest_cost": 0.08,  # 8% annual
                    "cash_flow_buffer": 1.2
                },
                duration=45,
                severity=Severity.LOW
            ))
        
        return BusinessScenario(
            name="Cash Flow Crisis",
            description="Navigate through severe cash flow constraints",
            scenario_type=ScenarioType.CASH_FLOW_CRISIS,
            duration_days=90,
            events=events,
            target_metrics={
                "cash_flow": 15000,  # Minimal positive
                "payment_terms_compliance": 0.95,
                "total_revenue": 520000,
                "cost_efficiency": 0.75
            },
            difficulty_level=difficulty,
            learning_objectives=[
                "Optimize cash flow management",
                "Prioritize essential vs. optional expenses",
                "Negotiate payment terms effectively",
                "Maintain operations with limited capital"
            ]
        )
    
    def generate_seasonal_scenario(self, difficulty: float = 0.5) -> BusinessScenario:
        """Generate seasonal demand pattern scenario"""
        events = []
        
        # Holiday season preparation
        events.append(BusinessEvent(
            day=5,
            event_type="holiday_prep",
            description="Prepare inventory for holiday shopping season",
            impact_factors={
                "demand_forecast": {"tech_mouse": 1.6, "desk_organizer": 1.4},
                "inventory_pressure": 1.2,
                "lead_time_pressure": 1.1
            },
            duration=20,
            severity=Severity.LOW
        ))
        
        # Holiday demand surge
        events.append(BusinessEvent(
            day=25,
            event_type="holiday_surge",
            description="Holiday shopping drives major demand increase",
            impact_factors={
                "demand_multiplier": 1.8,
                "price_premium": 1.05,
                "customer_urgency": 1.3,
                "fulfillment_pressure": 1.4
            },
            duration=15,
            severity=Severity.MEDIUM
        ))
        
        # Post-holiday slump
        events.append(BusinessEvent(
            day=45,
            event_type="post_holiday_slump",
            description="Demand drops significantly after holiday season",
            impact_factors={
                "demand_multiplier": 0.4,
                "inventory_overhang": 1.5,
                "cash_flow_impact": 0.8
            },
            duration=20,
            severity=Severity.MEDIUM if difficulty > 0.5 else Severity.LOW
        ))
        
        # Spring recovery
        events.append(BusinessEvent(
            day=70,
            event_type="spring_recovery",
            description="Spring season brings gardening and fitness demand",
            impact_factors={
                "demand_multiplier": {"air_purifier": 1.3, "athletic_socks": 1.2},
                "seasonal_opportunity": 1.15
            },
            duration=20,
            severity=Severity.LOW
        ))
        
        return BusinessScenario(
            name="Seasonal Demand Cycle",
            description="Manage inventory and cash flow through seasonal patterns",
            scenario_type=ScenarioType.SEASONAL_PATTERN,
            duration_days=90,
            events=events,
            target_metrics={
                "total_revenue": 580000,
                "inventory_turnover": 4.5,
                "seasonal_efficiency": 0.85,
                "cash_flow": 40000
            },
            difficulty_level=difficulty,
            learning_objectives=[
                "Forecast seasonal demand patterns",
                "Pre-position inventory for peak seasons",
                "Manage post-season inventory excess",
                "Optimize cash flow across seasonal cycles"
            ]
        )
    
    def generate_competitive_pressure_scenario(self, difficulty: float = 0.5) -> BusinessScenario:
        """Generate competitive pressure scenario"""
        events = []
        
        # New competitor entry
        events.append(BusinessEvent(
            day=10,
            event_type="new_competitor",
            description="Well-funded competitor enters market with aggressive pricing",
            impact_factors={
                "competitive_pressure": 1.4,
                "price_pressure": 1.2,
                "market_share_risk": 0.9
            },
            duration=60,
            severity=Severity.MEDIUM
        ))
        
        # Price war escalation
        if difficulty > 0.4:
            events.append(BusinessEvent(
                day=25,
                event_type="price_war",
                description="Competitor cuts prices by 20%, forcing market response",
                impact_factors={
                    "price_pressure": 1.5,
                    "margin_pressure": 0.7,
                    "volume_opportunity": 1.3
                },
                duration=30,
                severity=Severity.HIGH if difficulty > 0.7 else Severity.MEDIUM
            ))
        
        # Innovation pressure
        events.append(BusinessEvent(
            day=40,
            event_type="product_innovation",
            description="Competitor launches innovative product features",
            impact_factors={
                "product_differentiation": 0.8,
                "customer_switching": 1.2,
                "innovation_pressure": 1.3
            },
            duration=40,
            severity=Severity.MEDIUM
        ))
        
        # Market consolidation
        events.append(BusinessEvent(
            day=60,
            event_type="market_consolidation",
            description="Industry consolidation creates larger competitors",
            impact_factors={
                "competitive_intensity": 1.6,
                "price_negotiation": 0.8,
                "market_share_pressure": 1.2
            },
            duration=30,
            severity=Severity.HIGH if difficulty > 0.6 else Severity.MEDIUM
        ))
        
        return BusinessScenario(
            name="Competitive Battlefield",
            description="Survive and thrive in intense competitive environment",
            scenario_type=ScenarioType.COMPETITIVE_PRESSURE,
            duration_days=90,
            events=events,
            target_metrics={
                "market_share": 0.82,  # Slight decline expected
                "total_revenue": 480000,
                "gross_margin": 0.32,  # Pressure on margins
                "customer_retention": 0.88
            },
            difficulty_level=difficulty,
            learning_objectives=[
                "Develop competitive positioning strategies",
                "Balance price competition with profitability",
                "Differentiate products and services",
                "Maintain customer loyalty under pressure"
            ]
        )
    
    def generate_random_scenario(self, scenario_type: Optional[ScenarioType] = None, 
                                difficulty: Optional[float] = None) -> BusinessScenario:
        """Generate a random scenario"""
        if scenario_type is None:
            scenario_type = random.choice(list(ScenarioType))
        
        if difficulty is None:
            difficulty = random.uniform(0.3, 0.8)
        
        scenario_generators = {
            ScenarioType.MARKET_VOLATILITY: self.generate_market_volatility_scenario,
            ScenarioType.SUPPLY_DISRUPTION: self.generate_supply_disruption_scenario,
            ScenarioType.DEMAND_SHOCK: self.generate_demand_shock_scenario,
            ScenarioType.CASH_FLOW_CRISIS: self.generate_cash_flow_crisis_scenario,
            ScenarioType.SEASONAL_PATTERN: self.generate_seasonal_scenario,
            ScenarioType.COMPETITIVE_PRESSURE: self.generate_competitive_pressure_scenario
        }
        
        return scenario_generators[scenario_type](difficulty)
    
    def generate_scenario_set(self, num_scenarios: int = 10, 
                            balanced_difficulty: bool = True) -> List[BusinessScenario]:
        """Generate a set of diverse scenarios for training"""
        scenarios = []
        
        if balanced_difficulty:
            difficulties = np.linspace(0.2, 0.9, num_scenarios)
        else:
            difficulties = [random.uniform(0.3, 0.8) for _ in range(num_scenarios)]
        
        # Only use implemented scenario types
        implemented_types = [
            ScenarioType.MARKET_VOLATILITY,
            ScenarioType.SUPPLY_DISRUPTION,
            ScenarioType.DEMAND_SHOCK,
            ScenarioType.CASH_FLOW_CRISIS,
            ScenarioType.SEASONAL_PATTERN,
            ScenarioType.COMPETITIVE_PRESSURE
        ]
        
        for i in range(num_scenarios):
            scenario_type = implemented_types[i % len(implemented_types)]
            difficulty = difficulties[i]
            
            scenario = self.generate_random_scenario(scenario_type, difficulty)
            scenarios.append(scenario)
        
        return scenarios
    
    def save_scenario(self, scenario: BusinessScenario, filename: str):
        """Save scenario to JSON file"""
        scenario_dict = asdict(scenario)
        
        # Convert enums to strings
        scenario_dict['scenario_type'] = scenario.scenario_type.value
        for event in scenario_dict['events']:
            event['severity'] = event['severity'].value
        
        with open(filename, 'w') as f:
            json.dump(scenario_dict, f, indent=2, default=str)
    
    def load_scenario(self, filename: str) -> BusinessScenario:
        """Load scenario from JSON file"""
        with open(filename, 'r') as f:
            data = json.load(f)
        
        # Convert strings back to enums
        data['scenario_type'] = ScenarioType(data['scenario_type'])
        for event in data['events']:
            event['severity'] = Severity(event['severity'])
        
        # Reconstruct BusinessEvent objects
        events = [BusinessEvent(**event) for event in data['events']]
        data['events'] = events
        
        return BusinessScenario(**data)

def main():
    """Demo the business scenario generator"""
    print("Advanced Business Scenario Generator")
    print("=" * 50)
    
    generator = BusinessScenarioGenerator()
    
    # Generate examples of each scenario type
    scenario_types = [
        (ScenarioType.MARKET_VOLATILITY, "Market Volatility"),
        (ScenarioType.SUPPLY_DISRUPTION, "Supply Chain Crisis"),
        (ScenarioType.DEMAND_SHOCK, "Demand Surge"),
        (ScenarioType.CASH_FLOW_CRISIS, "Cash Flow Crisis"),
        (ScenarioType.SEASONAL_PATTERN, "Seasonal Cycle"),
        (ScenarioType.COMPETITIVE_PRESSURE, "Competitive Pressure")
    ]
    
    print("\nGenerating example scenarios:")
    for scenario_type, name in scenario_types:
        scenario = generator.generate_random_scenario(scenario_type, 0.6)
        print(f"\n📊 {name}:")
        print(f"   Difficulty: {scenario.difficulty_level:.1f}")
        print(f"   Events: {len(scenario.events)}")
        print(f"   Duration: {scenario.duration_days} days")
        print(f"   Objective: {scenario.learning_objectives[0]}")
        
        # Save example scenario
        filename = f"scenario_{scenario_type.value}_example.json"
        generator.save_scenario(scenario, filename)
        print(f"   Saved to: {filename}")
    
    # Generate training set
    print(f"\n🎯 Generating training scenario set...")
    training_scenarios = generator.generate_scenario_set(12, balanced_difficulty=True)
    
    print(f"Generated {len(training_scenarios)} diverse scenarios:")
    for i, scenario in enumerate(training_scenarios):
        print(f"   {i+1}. {scenario.name} (Difficulty: {scenario.difficulty_level:.1f})")
    
    # Save training set
    training_set = [asdict(s) for s in training_scenarios]
    for i, scenario_dict in enumerate(training_set):
        scenario_dict['scenario_type'] = training_scenarios[i].scenario_type.value
        for event in scenario_dict['events']:
            event['severity'] = event['severity'].value
    
    with open("training_scenario_set.json", "w") as f:
        json.dump(training_set, f, indent=2, default=str)
    
    print(f"\n✅ Training scenario set saved to: training_scenario_set.json")
    print(f"📈 Ready for RL agent training and evaluation!")

if __name__ == "__main__":
    main() 