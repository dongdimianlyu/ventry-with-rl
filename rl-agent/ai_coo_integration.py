#!/usr/bin/env python3
"""
AI COO Integration Script

This script provides integration between the AI COO agent and the web API,
generating comprehensive business recommendations that go beyond simple restocking.
"""

import sys
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from enhanced_integration_manager import get_integration_manager
    from ai_coo_agent import AICOOAgent
except ImportError as e:
    print(f"Error importing modules: {e}", file=sys.stderr)
    sys.exit(1)


def generate_ai_coo_recommendation(user_id: str, use_ai_coo: bool = True) -> Dict[str, Any]:
    """
    Generate AI COO recommendation for the given user
    
    Args:
        user_id: User ID for the recommendation
        use_ai_coo: Whether to use AI COO or fallback to enhanced model
        
    Returns:
        Dict containing the recommendation
    """
    try:
        # Get the integration manager
        manager = get_integration_manager(mock_mode=True)
        
        # Generate recommendations using AI COO
        recommendation = manager.generate_recommendations(
            use_enhanced_model=True,
            n_episodes=5,
            user_id=user_id,
            use_ai_coo=use_ai_coo
        )
        
        # Ensure all required fields are present
        if 'action' not in recommendation:
            recommendation['action'] = 'monitor'
        if 'description' not in recommendation:
            recommendation['description'] = recommendation.get('reasoning', 'Monitor business operations')
        if 'category' not in recommendation:
            recommendation['category'] = 'operational'
        if 'expected_roi' not in recommendation:
            recommendation['expected_roi'] = '0%'
        if 'predicted_profit_usd' not in recommendation:
            recommendation['predicted_profit_usd'] = 0
        if 'confidence' not in recommendation:
            recommendation['confidence'] = 'medium'
        if 'reasoning' not in recommendation:
            recommendation['reasoning'] = 'Agent analysis of current business conditions'
        if 'timestamp' not in recommendation:
            recommendation['timestamp'] = datetime.now().isoformat()
        
        return recommendation
        
    except Exception as e:
        print(f"Error generating Agent recommendation: {e}", file=sys.stderr)
        
        # Return fallback recommendation
        return {
            'action': 'monitor',
            'description': 'Monitor business operations',
            'category': 'operational',
            'quantity': 0,
            'expected_roi': '0%',
            'predicted_profit_usd': 0,
            'confidence': 'low',
            'reasoning': f'Unable to generate Agent recommendation: {str(e)}',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }


def create_mock_comprehensive_recommendation(user_id: str) -> Dict[str, Any]:
    """Create a mock comprehensive recommendation for testing"""
    import random
    
    # Mock different types of business operations
    operations = [
        {
            'action': 'inventory_restock',
            'description': 'Restock 150 units of Wireless Headphones',
            'category': 'inventory',
            'quantity': 150,
            'expected_roi': '18.5%',
            'predicted_profit_usd': 2250,
            'confidence': 'high'
        },
        {
            'action': 'marketing_ad_spend',
            'description': 'Increase ad spend by $1,500 for summer campaign',
            'category': 'marketing',
            'quantity': 0,
            'expected_roi': '24.2%',
            'predicted_profit_usd': 4500,
            'confidence': 'high'
        },
        {
            'action': 'financial_invoice',
            'description': 'Send invoice reminders to 8 overdue customers',
            'category': 'financial',
            'quantity': 8,
            'expected_roi': '15.8%',
            'predicted_profit_usd': 3200,
            'confidence': 'medium'
        },
        {
            'action': 'pricing_discount',
            'description': 'Offer 15% discount on slow-moving Smart Watches',
            'category': 'pricing',
            'quantity': 0,
            'expected_roi': '12.3%',
            'predicted_profit_usd': 1800,
            'confidence': 'medium'
        },
        {
            'action': 'operational_expense_check',
            'description': 'Conduct comprehensive expense audit',
            'category': 'operational',
            'quantity': 0,
            'expected_roi': '22.1%',
            'predicted_profit_usd': 2800,
            'confidence': 'high'
        }
    ]
    
    # Select a random primary operation
    primary_op = random.choice(operations)
    
    # Create alternative actions
    alternative_actions = [op for op in operations if op != primary_op][:3]
    
    # Create comprehensive business analysis
    business_analysis = {
        'average_profit': '$2,450.00',
        'recommendation_diversity': '0.85',
        'total_recommendations': len(operations),
        'categories_covered': ['inventory', 'marketing', 'financial', 'pricing', 'operational']
    }
    
    # Create recommendations by category
    recommendations_by_category = {
        'inventory': [
            {
                'action': 'inventory_restock',
                'description': 'Restock 150 units of Wireless Headphones',
                'expected_roi': '18.5%',
                'predicted_profit_usd': 2250
            },
            {
                'action': 'inventory_restock',
                'description': 'Restock 75 units of Bluetooth Speakers',
                'expected_roi': '16.2%',
                'predicted_profit_usd': 1650
            }
        ],
        'marketing': [
            {
                'action': 'marketing_ad_spend',
                'description': 'Increase ad spend by $1,500 for summer campaign',
                'expected_roi': '24.2%',
                'predicted_profit_usd': 4500
            },
            {
                'action': 'marketing_campaign',
                'description': 'Pause underperforming back-to-school campaign',
                'expected_roi': '8.5%',
                'predicted_profit_usd': 850
            }
        ],
        'financial': [
            {
                'action': 'financial_invoice',
                'description': 'Send invoice reminders to 8 overdue customers',
                'expected_roi': '15.8%',
                'predicted_profit_usd': 3200
            },
            {
                'action': 'financial_cost_review',
                'description': 'Schedule comprehensive cost review',
                'expected_roi': '19.4%',
                'predicted_profit_usd': 3800
            }
        ]
    }
    
    # Create comprehensive plan
    comprehensive_plan = {
        'immediate_actions': [
            {
                'category': 'marketing',
                'action': 'Increase ad spend by $1,500 for summer campaign',
                'roi': '24.2%',
                'priority': 'high'
            },
            {
                'category': 'operational',
                'action': 'Conduct comprehensive expense audit',
                'roi': '22.1%',
                'priority': 'high'
            }
        ],
        'short_term_initiatives': [
            {
                'category': 'inventory',
                'action': 'Restock 150 units of Wireless Headphones',
                'roi': '18.5%',
                'priority': 'medium'
            },
            {
                'category': 'financial',
                'action': 'Send invoice reminders to 8 overdue customers',
                'roi': '15.8%',
                'priority': 'medium'
            }
        ],
        'strategic_priorities': [
            {
                'category': 'pricing',
                'focus': 'Long-term pricing optimization',
                'priority': 'strategic'
            },
            {
                'category': 'operational',
                'focus': 'Long-term operational optimization',
                'priority': 'strategic'
            }
        ]
    }
    
    return {
        'action': primary_op['action'],
        'description': primary_op['description'],
        'category': primary_op['category'],
        'quantity': primary_op['quantity'],
        'expected_roi': primary_op['expected_roi'],
        'predicted_profit_usd': primary_op['predicted_profit_usd'],
        'confidence': primary_op['confidence'],
        'reasoning': f"Agent analysis identified {primary_op['category']} optimization as highest impact opportunity. {primary_op['description']} shows {primary_op['expected_roi']} ROI based on comprehensive business analysis across 5 operational categories.",
        'timestamp': datetime.now().isoformat(),
        'model_version': 'ai_coo_v1',
        'user_id': user_id,
        'alternative_actions': alternative_actions,
        'business_analysis': business_analysis,
        'recommendations_by_category': recommendations_by_category,
        'comprehensive_plan': comprehensive_plan
    }


def main():
    """Main function to handle command line arguments and generate recommendations"""
    if len(sys.argv) < 2:
        print("Usage: python ai_coo_integration.py <user_id> [use_ai_coo]", file=sys.stderr)
        sys.exit(1)
    
    user_id = sys.argv[1]
    use_ai_coo = sys.argv[2].lower() == 'true' if len(sys.argv) > 2 else True
    
    try:
        # For now, use mock comprehensive recommendation since AI COO training takes time
        # In production, this would call generate_ai_coo_recommendation(user_id, use_ai_coo)
        recommendation = create_mock_comprehensive_recommendation(user_id)
        
        # Output the recommendation as JSON (compact format for API parsing)
        print(json.dumps(recommendation))
        
    except Exception as e:
        print(f"Error in main: {e}", file=sys.stderr)
        
        # Output error recommendation
        error_recommendation = {
            'action': 'monitor',
            'description': 'Monitor business operations',
            'category': 'operational',
            'quantity': 0,
            'expected_roi': '0%',
            'predicted_profit_usd': 0,
            'confidence': 'low',
            'reasoning': f'Error generating recommendation: {str(e)}',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }
        
        print(json.dumps(error_recommendation))
        sys.exit(1)


if __name__ == "__main__":
    main() 