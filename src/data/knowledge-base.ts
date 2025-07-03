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
  },

  // Role Templates - Actionable Task Templates by Role
  {
    id: 'role-template-1',
    title: 'CEO Role Template',
    content: 'Define vision and strategy; set quarterly OKRs; build key partnerships; review company performance dashboards; recruit leadership. For example, an effective CEO sets clear objectives (e.g. "grow revenue 20% this year") and delegates tactical work.',
    category: 'role-templates',
    tags: ['CEO', 'vision', 'strategy', 'OKRs', 'leadership', 'partnerships']
  },
  {
    id: 'role-template-2',
    title: 'Marketing/Growth Role Template',
    content: 'Plan campaigns, create content (blogs, social, ads), manage branding, track KPIs. E.g. writing a 1,000-word blog typically takes ~3–4 hours; crafting a social post ~30–90 minutes. Optimize acquisition/retention funnels.',
    category: 'role-templates',
    tags: ['marketing', 'growth', 'campaigns', 'content', 'branding', 'KPIs', 'funnels']
  },
  {
    id: 'role-template-3',
    title: 'Operations (COO) Role Template',
    content: 'Map and optimize processes; manage vendors, procurement, facilities, IT systems; implement tools (CRM, ERP). A startup COO often "does the important things the company hasn\'t hired for yet," then builds systems to handle them.',
    category: 'role-templates',
    tags: ['COO', 'operations', 'processes', 'vendors', 'procurement', 'CRM', 'ERP']
  },
  {
    id: 'role-template-4',
    title: 'Product/Engineering Role Template',
    content: 'Define roadmap and MVP; run agile sprints (2-week iterations with planning, daily stand-ups, review, retrospective); gather user feedback; refine features.',
    category: 'role-templates',
    tags: ['product', 'engineering', 'roadmap', 'MVP', 'agile', 'sprints', 'feedback']
  },
  {
    id: 'role-template-5',
    title: 'Sales Role Template',
    content: 'Generate leads, nurture pipeline, conduct demos, close deals. Tasks include CRM updates, quota forecasts, and account management. Typical activities: 1–on–1 calls (~30–60 min), proposal writing (1–2 hr each), and weekly sales reviews.',
    category: 'role-templates',
    tags: ['sales', 'leads', 'pipeline', 'demos', 'CRM', 'forecasts', 'proposals']
  },
  {
    id: 'role-template-6',
    title: 'Customer Success Role Template',
    content: 'Onboard new clients, provide training/resources, monitor usage, and preempt churn. Key tasks: set up customer training sessions, escalate support issues, and run monthly health checks.',
    category: 'role-templates',
    tags: ['customer-success', 'onboarding', 'training', 'churn', 'support', 'health-checks']
  },
  {
    id: 'role-template-7',
    title: 'Finance Role Template',
    content: 'Prepare budgets, manage cash flow, process invoices/payroll, produce monthly P&L and forecast reports. For a small firm, typical finance tasks might include a half-day closing of accounts each month.',
    category: 'role-templates',
    tags: ['finance', 'budgets', 'cash-flow', 'invoices', 'payroll', 'P&L', 'forecasts']
  },

  // Frameworks - Task Prioritization Frameworks
  {
    id: 'framework-1',
    title: 'ICE Framework (Impact–Confidence–Ease)',
    content: 'Score ideas by Impact (benefit), Confidence (certainty), and Ease (effort). Multiply or sum 1–10 scores to rank tasks. E.g. Impact=9, Confidence=8, Ease=6 gives ICE=23.',
    category: 'frameworks',
    tags: ['ICE', 'prioritization', 'impact', 'confidence', 'ease', 'scoring']
  },
  {
    id: 'framework-2',
    title: 'RICE Framework (Reach–Impact–Confidence–Effort)',
    content: 'Score features by Reach (users affected), Impact (value per user), Confidence (certainty), Effort (work hours). Compute RICE = (Reach×Impact×Confidence)/Effort.',
    category: 'frameworks',
    tags: ['RICE', 'prioritization', 'reach', 'impact', 'confidence', 'effort']
  },
  {
    id: 'framework-3',
    title: 'Eisenhower Matrix',
    content: 'Categorize tasks by Urgent vs Important: Do first (Important & urgent), Schedule (Important but not urgent), Delegate (Urgent but not important), Delete (Neither urgent nor important).',
    category: 'frameworks',
    tags: ['eisenhower', 'prioritization', 'urgent', 'important', 'delegation']
  },

  // Planning - Tactical Planning Templates
  {
    id: 'planning-1',
    title: 'OKRs (Objectives & Key Results)',
    content: 'Set a clear Objective (inspirational goal) and 2–5 measurable Key Results per quarter. E.g. Objective: "Improve Customer Loyalty"; KRs: "Increase NPS by 10 points, reduce churn to 5%".',
    category: 'planning',
    tags: ['OKRs', 'objectives', 'key-results', 'quarterly', 'goals', 'measurement']
  },
  {
    id: 'planning-2',
    title: '30–60–90 Day Plans',
    content: 'Roadmap for the first 90 days in a role or project. 30-day segments with specific goals and milestones: Learn, Contribute, Lead.',
    category: 'planning',
    tags: ['30-60-90', 'onboarding', 'roadmap', 'milestones', 'learning']
  },
  {
    id: 'planning-3',
    title: 'Agile Sprint Structure',
    content: '2-week sprints: Sprint Planning, Daily Standups (15-min), Sprint Review/Demo, and Retrospective.',
    category: 'planning',
    tags: ['agile', 'sprints', 'planning', 'standups', 'review', 'retrospective']
  },

  // Workflows - Workflows & Best-Practice Checklists
  {
    id: 'workflow-1',
    title: 'Product Launch Plan',
    content: 'Research customers, Craft positioning statement, Align stakeholders, Develop brand assets, Plan GTM channels, Set SMART goals, Create content, Test/soft-launch, Finalize channels, Prep team, Launch Day, Post-launch review.',
    category: 'workflows',
    tags: ['product-launch', 'GTM', 'positioning', 'stakeholders', 'SMART-goals']
  },
  {
    id: 'workflow-2',
    title: 'Churn Reduction Workflow',
    content: 'Onboarding & Training, Identify At-Risk Customers, Engage High-Value Customers, Retention Incentives, Improved Support & Feedback.',
    category: 'workflows',
    tags: ['churn-reduction', 'onboarding', 'at-risk', 'retention', 'support']
  },
  {
    id: 'workflow-3',
    title: 'Hiring Workflow',
    content: 'Define role, Source candidates, Resume screening, Interviews, Reference checks, Offer and onboarding.',
    category: 'workflows',
    tags: ['hiring', 'recruitment', 'screening', 'interviews', 'references']
  },
  {
    id: 'workflow-4',
    title: 'Onboarding Checklist',
    content: 'HR docs & background checks, Prepare workspace & equipment, Orientation, Assign mentor, 30/60/90-day check-ins.',
    category: 'workflows',
    tags: ['onboarding', 'HR', 'workspace', 'orientation', 'mentor', 'check-ins']
  },

  // Time Estimates - Example Tasks with Time Estimates
  {
    id: 'time-estimate-1',
    title: 'Content Creation Time Estimates',
    content: 'Blog Post (800–1000 words): 3–4 hours, Social Media Post: 30–90 minutes, Marketing Email: 1–2 hours.',
    category: 'time-estimates',
    tags: ['time-estimates', 'content', 'blog', 'social-media', 'email']
  },
  {
    id: 'time-estimate-2',
    title: 'Analysis and Reporting Time Estimates',
    content: 'Competitor Analysis: 4–8 hours, KPI Report: 2–4 hours, Data Reporting: 2–4 hours.',
    category: 'time-estimates',
    tags: ['time-estimates', 'analysis', 'reporting', 'competitor', 'KPI']
  },
  {
    id: 'time-estimate-3',
    title: 'Sales and Meeting Time Estimates',
    content: 'Sales Deck: 4–6 hours, Meeting Agenda: 15–30 minutes, Meetings: 15 min prep, 1 hr execution.',
    category: 'time-estimates',
    tags: ['time-estimates', 'sales-deck', 'meetings', 'agenda', 'preparation']
  },
  {
    id: 'time-estimate-4',
    title: 'Process and Training Time Estimates',
    content: 'New Hire Onboarding: 4–8 hours over week, Agile Sprint Rituals: ~1 day per sprint for planning and review.',
    category: 'time-estimates',
    tags: ['time-estimates', 'onboarding', 'agile', 'sprint', 'training']
  },

  // Best Practices - Good vs. Bad Goals/Tasks and Execution Concepts
  {
    id: 'best-practice-1',
    title: 'Good vs. Bad Goals',
    content: 'Good Goals: Specific, measurable, time-bound (e.g. "Increase Q3 revenue by 15%"). Bad Goals: Vague (e.g. "Grow the business").',
    category: 'best-practices',
    tags: ['goals', 'SMART', 'specific', 'measurable', 'time-bound']
  },
  {
    id: 'best-practice-2',
    title: 'Good vs. Bad Tasks',
    content: 'Good Tasks: Actionable and clear (e.g. "Draft a marketing email"). Bad Tasks: Generic or unclear (e.g. "Work on PR").',
    category: 'best-practices',
    tags: ['tasks', 'actionable', 'clear', 'specific']
  },
  {
    id: 'best-practice-3',
    title: 'Proven Execution Concepts',
    content: 'OKRs align teams around outcomes, 80/20 Rule (Pareto): Focus on high-impact 20%, Lean Startup: Validate through MVP + feedback, Vision requires implementation to succeed, First Round: Fast meetings, clear decisions, avoid indecision, Two-Pizza Teams: Small, autonomous, cross-functional, Public accountability via owners and deadlines.',
    category: 'best-practices',
    tags: ['execution', 'OKRs', 'pareto', 'lean-startup', 'MVP', 'accountability']
  },

  // Operational Context - Operational Context Primers
  {
    id: 'operational-context-1',
    title: 'COO Role Evolution',
    content: 'Early COO handles whatever\'s needed, then builds processes. Over time, leads HR, IT, vendors, and day-to-day ops.',
    category: 'operational-context',
    tags: ['COO', 'role-evolution', 'processes', 'HR', 'IT', 'vendors']
  },
  {
    id: 'operational-context-2',
    title: 'Head of Growth Role',
    content: 'Owns user acquisition, activation, retention, and monetization. Distinct from traditional marketing roles.',
    category: 'operational-context',
    tags: ['head-of-growth', 'acquisition', 'activation', 'retention', 'monetization']
  },
  {
    id: 'operational-context-3',
    title: 'Leadership as Scaling Tool',
    content: 'CEO narrows to vision and external roles; COO and department heads emerge to own execution.',
    category: 'operational-context',
    tags: ['leadership', 'scaling', 'CEO', 'COO', 'execution', 'delegation']
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