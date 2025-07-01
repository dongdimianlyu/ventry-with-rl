import { KnowledgeBase } from '@/types'

export const knowledgeBase: KnowledgeBase[] = [
  {
    id: 'growth-1',
    title: 'Revenue Growth Strategies',
    content: 'Focus on customer acquisition cost (CAC) vs lifetime value (LTV) ratio. Prioritize channels with CAC:LTV ratio of 1:3 or better. Test pricing strategies, upselling existing customers often has 60-70% higher success rate than acquiring new ones.',
    category: 'growth',
    tags: ['revenue', 'acquisition', 'pricing', 'LTV']
  },
  {
    id: 'retention-1',
    title: 'Customer Retention Best Practices',
    content: 'Monitor churn indicators: decreased usage, support tickets, delayed payments. Implement proactive outreach when engagement drops 30%+ week-over-week. Focus on onboarding completion rates - customers who complete onboarding have 70% higher retention.',
    category: 'retention',
    tags: ['churn', 'engagement', 'onboarding']
  },
  {
    id: 'sales-1',
    title: 'Sales Pipeline Optimization',
    content: 'Track lead velocity (leads × conversion rate × average deal size × sales cycle speed). Focus on shortening sales cycles rather than just increasing conversion rates. Qualify leads harder upfront to improve downstream conversion.',
    category: 'sales',
    tags: ['pipeline', 'conversion', 'velocity']
  },
  {
    id: 'operations-1',
    title: 'Operational Efficiency Framework',
    content: 'Identify bottlenecks using Theory of Constraints. Measure cycle times for key processes. Automate repetitive tasks that take >2 hours/week. Focus on processes that touch multiple departments for highest leverage.',
    category: 'operations',
    tags: ['efficiency', 'automation', 'processes']
  },
  {
    id: 'strategy-1',
    title: 'Strategic Planning Principles',
    content: 'Use OKRs with 3-5 objectives max per quarter. Set targets that are 60-70% achievable to maintain motivation. Review weekly, adjust monthly, reset quarterly. Link every initiative to a measurable business outcome.',
    category: 'strategy',
    tags: ['OKRs', 'planning', 'measurement']
  },
  {
    id: 'growth-2',
    title: 'Product-Led Growth Tactics',
    content: 'Optimize for time-to-value (TTV) in first session. Create aha moments within first 5 minutes of product use. Use progressive disclosure to avoid overwhelming new users. Track activation metrics, not just sign-ups.',
    category: 'growth',
    tags: ['product-led', 'activation', 'TTV', 'onboarding']
  },
  {
    id: 'sales-2',
    title: 'Sales Team Performance',
    content: 'Track individual rep metrics: calls per day, meetings booked, close rate by stage. Coach bottom 20% performers weekly. Share best practices from top performers. Focus training on objection handling and discovery questions.',
    category: 'sales',
    tags: ['performance', 'coaching', 'metrics']
  },
  {
    id: 'retention-2',
    title: 'Customer Success Operations',
    content: 'Segment customers by health score (usage + engagement + support tickets). Create automated playbooks for at-risk customers. Measure Net Promoter Score monthly, act on feedback within 48 hours.',
    category: 'retention',
    tags: ['health-score', 'NPS', 'customer-success']
  }
]

export function getKnowledgeByCategory(category: string): KnowledgeBase[] {
  return knowledgeBase.filter(kb => kb.category === category)
}

export function searchKnowledge(query: string): KnowledgeBase[] {
  const lowercaseQuery = query.toLowerCase()
  return knowledgeBase.filter(kb => 
    kb.title.toLowerCase().includes(lowercaseQuery) ||
    kb.content.toLowerCase().includes(lowercaseQuery) ||
    kb.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
} 