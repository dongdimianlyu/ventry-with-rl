import { KnowledgeBase } from '@/types'

export const knowledgeBase: KnowledgeBase[] = [
  // === SALES EXPERTISE ===
  {
    id: 'sales-funnel-1',
    title: 'B2B Sales Funnel: TOFU to BOFU Strategy',
    content: 'TOFU (Top of Funnel): Content marketing, SEO, cold outbound. Target 3-5% conversion to MQL. MOFU (Middle): Nurture sequences, demos, case studies. 15-25% MQL to SQL conversion. BOFU (Bottom): Proposals, trials, negotiations. 20-30% SQL to close rate. Track velocity: days in each stage, identify bottlenecks.',
    category: 'sales',
    tags: ['B2B', 'funnel', 'TOFU', 'MOFU', 'BOFU', 'conversion', 'velocity']
  },
  {
    id: 'sales-outbound-1',
    title: 'Cold Email Cadence Framework',
    content: 'Day 1: Value-first email (industry insight). Day 4: Case study/social proof. Day 8: Direct ask with clear CTA. Day 12: Breakup email ("last attempt"). Use 3:1 give-to-ask ratio. Personalize first line with company-specific insight. A/B test subject lines: questions vs statements vs urgency.',
    category: 'sales',
    tags: ['cold-email', 'outbound', 'cadence', 'personalization', 'A/B-testing']
  },
  {
    id: 'sales-qualification-1',
    title: 'MEDDIC Qualification Framework',
    content: 'Metrics: What economic impact? Economic Buyer: Who signs the check? Decision Criteria: How will they decide? Decision Process: What steps to close? Identify Pain: What problem costs them? Champion: Who sells internally for you? Qualify hard early to avoid wasted cycles.',
    category: 'sales',
    tags: ['MEDDIC', 'qualification', 'economic-buyer', 'pain', 'champion']
  },
  {
    id: 'sales-qualification-2',
    title: 'BANT vs SPICED Lead Scoring',
    content: 'BANT (Budget, Authority, Need, Timeline) is outdated. Use SPICED: Situation (current state), Pain (specific problem), Impact (cost of problem), Critical Event (urgency driver), Decision (process/timeline). SPICED leads convert 40% higher than BANT-qualified leads.',
    category: 'sales',
    tags: ['BANT', 'SPICED', 'lead-scoring', 'qualification', 'conversion']
  },
  {
    id: 'sales-saas-1',
    title: 'SaaS Sales Motion: Demo to Close',
    content: 'Discovery call: Understand pain (30-45 min). Demo: Show solution to their specific use case (45-60 min). Trial: 14-day guided trial with 3 check-ins. Proposal: ROI-focused, 1-page summary. Close: Handle objections, create urgency with limited-time incentives. Track: Demo-to-trial 60%+, trial-to-close 25%+.',
    category: 'sales',
    tags: ['SaaS', 'demo', 'trial', 'proposal', 'ROI', 'close-rate']
  },
  {
    id: 'sales-closing-1',
    title: 'Challenger Sale Framework',
    content: 'Teach: Share unique insight about their business. Tailor: Customize message to their situation. Take Control: Push back on status quo, create urgency. Reframe problems they didn\'t know they had. 40% more effective than relationship selling in complex B2B deals.',
    category: 'sales',
    tags: ['challenger-sale', 'teaching', 'tailoring', 'control', 'reframing']
  },
  {
    id: 'sales-objections-1',
    title: 'Objection Handling Playbook',
    content: 'Price objection: "What would you need to see to justify the investment?" No budget: "When do budgets get set for next year?" Not interested: "What would need to change for this to be a priority?" Need to think: "What specifically concerns you?" Always ask clarifying questions before responding.',
    category: 'sales',
    tags: ['objection-handling', 'price', 'budget', 'clarifying-questions']
  },
  {
    id: 'sales-crm-1',
    title: 'CRM Optimization Strategy',
    content: 'HubSpot: Use sequences for follow-up automation. Set up lead scoring (0-100). Track email open/click rates. Salesforce: Custom fields for deal stage probability. Pipeline reports by rep. Activity tracking (calls, emails, meetings). Both: Update within 24 hours, require next steps on every opportunity.',
    category: 'sales',
    tags: ['CRM', 'HubSpot', 'Salesforce', 'automation', 'lead-scoring', 'pipeline']
  },
  {
    id: 'sales-metrics-1',
    title: 'CAC and LTV Optimization',
    content: 'CAC = (Sales + Marketing spend) / New customers acquired. LTV = (Average revenue per customer × Gross margin %) / Churn rate. Target LTV:CAC ratio of 3:1 minimum. Payback period under 12 months. Increase LTV through upsells (easier than new acquisition), reduce CAC through referral programs.',
    category: 'sales',
    tags: ['CAC', 'LTV', 'payback-period', 'upsells', 'referrals', 'metrics']
  },

  // === MARKETING EXPERTISE ===
  {
    id: 'marketing-content-1',
    title: 'Content Marketing Playbook',
    content: 'Pillar page strategy: Create 10-15 comprehensive guides (3000+ words) targeting high-volume keywords. Build 20-30 supporting blog posts linking to pillars. SEO sprint: Research keywords (Ahrefs/SEMrush), create content calendar, publish 2-3x/week, build backlinks through guest posting and PR.',
    category: 'marketing',
    tags: ['content-marketing', 'pillar-pages', 'SEO', 'keywords', 'backlinks']
  },
  {
    id: 'marketing-paid-ads-1',
    title: 'Paid Ads Scaling Framework',
    content: 'Google Ads: Start with exact match keywords, 20% search impression share target. Meta: Lookalike audiences from customer email list. LinkedIn: Target job titles + company size. Budget allocation: 60% proven campaigns, 30% optimization, 10% testing. Scale winners 20-50% weekly, pause losers at 2x CPA threshold.',
    category: 'marketing',
    tags: ['paid-ads', 'Google-Ads', 'Meta', 'LinkedIn', 'budget-allocation', 'scaling']
  },
  {
    id: 'marketing-email-1',
    title: 'High-Converting Email Sequences',
    content: 'Welcome series (5 emails over 7 days): Welcome + expectations, company story, social proof, product education, special offer. Abandoned cart: 3 emails at 1 hour, 24 hours, 72 hours. Re-engagement: "We miss you" + 20% discount. Benchmark: 25%+ open rate, 3%+ click rate, 2%+ conversion rate.',
    category: 'marketing',
    tags: ['email-marketing', 'welcome-series', 'abandoned-cart', 're-engagement', 'benchmarks']
  },
  {
    id: 'marketing-social-1',
    title: 'B2B Social Media Growth Strategy',
    content: 'LinkedIn: Post 3-5x/week, mix of industry insights (40%), company updates (30%), personal stories (30%). Engage on others\' posts before posting your own. Twitter: Share quick insights, engage in industry conversations, use relevant hashtags. Track engagement rate >3%, follower growth >10%/month.',
    category: 'marketing',
    tags: ['social-media', 'LinkedIn', 'Twitter', 'B2B', 'engagement', 'growth']
  },
  {
    id: 'marketing-influencer-1',
    title: 'Influencer Marketing Process',
    content: 'Identify micro-influencers (10K-100K followers) in your niche. Engagement rate >3% more important than follower count. Outreach: Personalized email with specific collaboration idea. Compensation: $100-500 per 10K followers or free product + affiliate commission. Track: Reach, engagement, click-through, conversions.',
    category: 'marketing',
    tags: ['influencer-marketing', 'micro-influencers', 'engagement-rate', 'compensation', 'tracking']
  },
  {
    id: 'marketing-positioning-1',
    title: 'April Dunford Positioning Framework',
    content: 'Step 1: List competitive alternatives. Step 2: Isolate unique attributes. Step 3: Map attributes to value. Step 4: Isolate value for target segments. Step 5: Frame context of market category. Position against status quo, not just competitors. Test messaging with 10+ customer interviews.',
    category: 'marketing',
    tags: ['positioning', 'April-Dunford', 'competitive-alternatives', 'unique-attributes', 'market-category']
  },
  {
    id: 'marketing-gtm-1',
    title: 'Go-to-Market Launch Checklist',
    content: 'Pre-launch (4 weeks): Identify target customers, create messaging framework, build landing page, set up analytics. Launch week: Press release, social media campaign, email to existing customers, influencer outreach. Post-launch: Monitor metrics daily, gather feedback, iterate messaging, plan follow-up campaigns.',
    category: 'marketing',
    tags: ['go-to-market', 'GTM', 'launch-checklist', 'messaging', 'analytics']
  },
  {
    id: 'marketing-product-1',
    title: 'Product Marketing Strategy',
    content: 'Customer research: 20+ interviews to understand jobs-to-be-done. Competitive analysis: Feature comparison, pricing analysis, positioning gaps. Messaging: Value proposition, key benefits, proof points. Sales enablement: Battle cards, objection handling, demo scripts. Launch: Coordinate with sales, marketing, and product teams.',
    category: 'marketing',
    tags: ['product-marketing', 'customer-research', 'competitive-analysis', 'messaging', 'sales-enablement']
  },
  {
    id: 'marketing-funnel-1',
    title: 'Marketing Funnel Optimization',
    content: 'Awareness: Track brand search volume, social mentions. Interest: Email signups, content downloads. Consideration: Demo requests, free trial signups. Purchase: Conversion rate, average deal size. Retention: NPS, expansion revenue. Benchmark conversion rates: Visitor to lead 2-5%, lead to customer 5-15%.',
    category: 'marketing',
    tags: ['marketing-funnel', 'awareness', 'consideration', 'conversion-rates', 'benchmarks']
  },
  {
    id: 'marketing-saas-growth-1',
    title: 'SaaS Growth Loops',
    content: 'Freemium loop: Free users invite teammates → paid conversion. Content loop: SEO content → trial signups → case studies → more SEO content. Referral loop: Happy customers → referrals → new customers → more referrals. Viral loop: Product usage creates value for others → organic sharing. Focus on one loop at a time.',
    category: 'marketing',
    tags: ['SaaS', 'growth-loops', 'freemium', 'content-loop', 'referral-loop', 'viral-loop']
  },

  // === GROWTH & ANALYTICS ===
  {
    id: 'growth-audit-1',
    title: 'Growth Audit Checklist',
    content: 'Acquisition: Check traffic sources, conversion rates by channel, CAC by channel. Activation: First-time user experience, time to value, completion rates. Retention: Cohort analysis, churn rates, engagement metrics. Revenue: Expansion revenue, upsell rates, LTV. Look for biggest drop-offs and lowest-hanging fruit.',
    category: 'growth',
    tags: ['growth-audit', 'acquisition', 'activation', 'retention', 'revenue', 'drop-offs']
  },
  {
    id: 'growth-metrics-1',
    title: 'Metrics That Matter by Stage',
    content: 'Early stage: Product-market fit signals (40%+ very disappointed without product, <5% monthly churn). Growth stage: CAC, LTV, payback period, net revenue retention >100%. Scale stage: Market share, brand awareness, operational efficiency ratios. Track north star metric + 3-5 supporting metrics max.',
    category: 'growth',
    tags: ['metrics', 'product-market-fit', 'CAC', 'LTV', 'net-revenue-retention', 'north-star-metric']
  },
  {
    id: 'growth-ab-testing-1',
    title: 'A/B Testing Framework',
    content: 'Hypothesis: "If we change X, then Y will improve because Z." Sample size: Use statistical significance calculator (95% confidence, 80% power). Test duration: Run for full business cycles (7-14 days minimum). Analysis: Measure primary metric + guardrail metrics. Implementation: Roll out winners to 100%, document learnings.',
    category: 'growth',
    tags: ['A/B-testing', 'hypothesis', 'statistical-significance', 'sample-size', 'guardrail-metrics']
  },
  {
    id: 'growth-data-insights-1',
    title: 'Data-Led Growth Strategy',
    content: 'Weekly growth review: Review key metrics, identify anomalies, prioritize experiments. Monthly deep dive: Cohort analysis, customer segments, channel performance. Quarterly planning: Set growth targets, allocate resources, plan major initiatives. Always ask: What does this data tell us about user behavior? What should we test next?',
    category: 'growth',
    tags: ['data-led-growth', 'growth-review', 'cohort-analysis', 'customer-segments', 'user-behavior']
  },

  // === OPERATIONS & STRATEGY ===
  {
    id: 'ops-bottlenecks-1',
    title: 'Operational Bottleneck Identification',
    content: 'Map current state process flow. Measure cycle time for each step. Identify constraints using Theory of Constraints: find the slowest step that limits overall throughput. Focus improvement efforts on the constraint first. Common bottlenecks: manual approvals, data entry, communication handoffs, waiting for decisions.',
    category: 'operations',
    tags: ['bottlenecks', 'process-flow', 'cycle-time', 'theory-of-constraints', 'throughput']
  },
  {
    id: 'ops-cost-cutting-1',
    title: 'Cost-Cutting Without Killing Growth',
    content: 'Review all subscriptions monthly - cancel unused tools. Negotiate with vendors annually. Automate repetitive tasks >2 hours/week. Outsource non-core functions. Cut marketing spend on low-ROI channels first. Preserve: product development, customer success, top sales talent. Track: cost per customer, cost per employee.',
    category: 'operations',
    tags: ['cost-cutting', 'subscriptions', 'automation', 'outsourcing', 'ROI', 'cost-per-customer']
  },
  {
    id: 'ops-automation-1',
    title: 'Small Team Automation Ideas',
    content: 'Zapier workflows: New customer → Slack notification + CRM update. Email automation: Welcome sequences, follow-ups, re-engagement. Social media: Buffer/Hootsuite for scheduling. Invoicing: Stripe/QuickBooks automation. Support: Chatbots for common questions. HR: BambooHR for onboarding. Focus on tasks done >3x/week.',
    category: 'operations',
    tags: ['automation', 'Zapier', 'email-automation', 'social-media', 'invoicing', 'support', 'HR']
  },
  {
    id: 'strategy-okrs-1',
    title: 'OKR Implementation Playbook',
    content: 'Company OKRs: 3-5 objectives max, each with 2-4 key results. Team OKRs: Ladder up to company objectives. Individual OKRs: 60% aligned to team, 40% individual development. Scoring: 0.7 is success (stretch goals). Cadence: Weekly check-ins, monthly reviews, quarterly planning. Avoid: too many OKRs, sandbagging, treating as performance review.',
    category: 'strategy',
    tags: ['OKRs', 'objectives', 'key-results', 'scoring', 'cadence', 'stretch-goals']
  },
  {
    id: 'strategy-delegation-1',
    title: 'CEO Delegation Framework',
    content: 'Delegate by outcome, not process. Give context: why this matters, how it fits bigger picture. Set clear success criteria and deadlines. Check in at 25%, 50%, 75% completion. What to delegate first: recurring tasks, your weaknesses, growth opportunities for others. Keep: vision, culture, key relationships, major decisions.',
    category: 'strategy',
    tags: ['delegation', 'CEO', 'outcomes', 'success-criteria', 'vision', 'culture']
  },
  {
    id: 'strategy-hiring-1',
    title: 'Startup Hiring Prioritization',
    content: 'Hire order: Technical co-founder, first engineer, first salesperson, customer success, marketing, operations. A-players: Hire slow, fire fast. Look for: hustle, learning ability, culture fit. Red flags: job hopping without growth, lack of ownership, poor communication. Use 3-interview process: phone screen, skills assessment, culture fit.',
    category: 'strategy',
    tags: ['hiring', 'prioritization', 'A-players', 'culture-fit', 'interview-process']
  },

  // === ROLE-SPECIFIC FRAMEWORKS ===
  {
    id: 'role-marketing-advanced',
    title: 'Marketing Role: Advanced Frameworks',
    content: 'Customer journey mapping: Awareness → Interest → Consideration → Purchase → Retention → Advocacy. Attribution modeling: First-touch, last-touch, multi-touch. Cohort analysis for retention marketing. Marketing mix modeling for budget allocation. Brand tracking: awareness, consideration, preference metrics.',
    category: 'role-templates',
    tags: ['marketing', 'customer-journey', 'attribution', 'cohort-analysis', 'brand-tracking']
  },
  {
    id: 'role-sales-advanced',
    title: 'Sales Role: Advanced Playbooks',
    content: 'Territory planning: Account segmentation, target account lists, coverage models. Sales forecasting: Pipeline analysis, win probability, time-based forecasts. Competitive battlecards: Feature comparisons, win/loss analysis, objection responses. Sales coaching: Call reviews, skill development, performance improvement plans.',
    category: 'role-templates',
    tags: ['sales', 'territory-planning', 'forecasting', 'competitive-analysis', 'coaching']
  },
  {
    id: 'role-product-advanced',
    title: 'Product Role: Strategic Frameworks',
    content: 'Product roadmap prioritization: RICE scoring, user story mapping, feature impact analysis. User research: Jobs-to-be-done interviews, usability testing, A/B testing. Product metrics: Activation rates, feature adoption, user engagement, retention cohorts. Competitive intelligence: Feature gap analysis, pricing analysis.',
    category: 'role-templates',
    tags: ['product', 'roadmap', 'RICE', 'user-research', 'metrics', 'competitive-intelligence']
  },
  {
    id: 'role-ops-advanced',
    title: 'Operations Role: Systems & Processes',
    content: 'Process documentation: Standard operating procedures, workflow diagrams, training materials. Vendor management: Contract negotiations, performance reviews, cost optimization. System integrations: CRM-marketing automation, accounting-CRM, support-product. KPI dashboards: Real-time metrics, automated reporting.',
    category: 'role-templates',
    tags: ['operations', 'process-documentation', 'vendor-management', 'integrations', 'KPI-dashboards']
  },
  {
    id: 'role-design-advanced',
    title: 'Design Role: User Experience Excellence',
    content: 'Design system creation: Component library, style guide, design tokens. User research: User interviews, usability testing, journey mapping. Conversion optimization: Landing page testing, checkout flow optimization, onboarding UX. Design metrics: Task completion rates, user satisfaction scores, design system adoption.',
    category: 'role-templates',
    tags: ['design', 'design-system', 'user-research', 'conversion-optimization', 'UX-metrics']
  },

  // === PROVEN METHODOLOGIES ===
  {
    id: 'methodology-lean-startup',
    title: 'Lean Startup Methodology',
    content: 'Build-Measure-Learn cycle: Create minimum viable product, measure user behavior, learn from data, iterate. Validated learning: Test hypotheses with real customers. Innovation accounting: Metrics that matter for early-stage companies. Pivot or persevere: Data-driven decisions about product direction.',
    category: 'frameworks',
    tags: ['lean-startup', 'MVP', 'validated-learning', 'innovation-accounting', 'pivot']
  },
  {
    id: 'methodology-crossing-chasm',
    title: 'Crossing the Chasm Strategy',
    content: 'Technology adoption lifecycle: Innovators → Early adopters → Early majority → Late majority → Laggards. The chasm: Gap between early adopters and early majority. Crossing strategy: Focus on specific niche, create whole product solution, build references, expand to adjacent segments.',
    category: 'frameworks',
    tags: ['crossing-chasm', 'adoption-lifecycle', 'early-majority', 'niche-focus', 'whole-product']
  },
  {
    id: 'methodology-category-creation',
    title: 'Play Bigger: Category Creation',
    content: 'Category design: Define new market category, not just better product. Category king: Company that defines and dominates new category captures 70%+ of economics. Point of view: Unique perspective on market problem and solution. Category blueprint: Vision of new market landscape.',
    category: 'frameworks',
    tags: ['category-creation', 'category-king', 'point-of-view', 'market-category']
  },
  {
    id: 'methodology-influence',
    title: 'Cialdini Influence Principles',
    content: 'Reciprocity: Give before you ask. Commitment: Get people to commit publicly. Social proof: Show others doing it. Authority: Demonstrate expertise. Liking: Build rapport and similarity. Scarcity: Limited time or quantity. Apply in sales, marketing, and leadership contexts.',
    category: 'frameworks',
    tags: ['influence', 'reciprocity', 'social-proof', 'authority', 'scarcity', 'sales-psychology']
  },

  // === TIME ESTIMATES & BENCHMARKS ===
  {
    id: 'time-content-creation',
    title: 'Content Creation Time Benchmarks',
    content: 'Blog post (1000 words): 4-6 hours (research, writing, editing). Social media post: 15-30 minutes. Email newsletter: 2-3 hours. Video script: 1 hour per minute of video. Podcast episode: 3x recording time for editing. Webinar: 8-10 hours (prep, delivery, follow-up).',
    category: 'time-estimates',
    tags: ['content-creation', 'blog-post', 'social-media', 'email', 'video', 'podcast', 'webinar']
  },
  {
    id: 'time-sales-activities',
    title: 'Sales Activity Time Benchmarks',
    content: 'Cold call: 5-10 minutes (including prep). Cold email: 10-15 minutes (research + personalization). Demo: 45-60 minutes + 30 minutes prep. Proposal: 2-4 hours. Contract negotiation: 1-3 hours. CRM updates: 15-30 minutes daily. Weekly pipeline review: 1-2 hours.',
    category: 'time-estimates',
    tags: ['sales-activities', 'cold-call', 'cold-email', 'demo', 'proposal', 'CRM', 'pipeline-review']
  },
  {
    id: 'time-marketing-campaigns',
    title: 'Marketing Campaign Time Benchmarks',
    content: 'Email campaign: 4-6 hours (design, copy, setup, testing). Paid ad campaign: 6-8 hours (research, creative, setup, optimization). Content calendar: 4-8 hours monthly. Landing page: 8-16 hours (design, copy, development, testing). PR campaign: 16-24 hours (pitch, outreach, follow-up).',
    category: 'time-estimates',
    tags: ['marketing-campaigns', 'email-campaign', 'paid-ads', 'content-calendar', 'landing-page', 'PR']
  },

  // === OPERATIONAL CONTEXT ===
  {
    id: 'context-startup-stages',
    title: 'Startup Stage Characteristics',
    content: 'Pre-product-market fit: Focus on customer discovery, MVP iteration, finding repeatable growth. Post-PMF: Scale proven channels, build processes, hire specialists. Growth stage: Optimize unit economics, expand market, build competitive moats. Scale stage: International expansion, new products, operational excellence.',
    category: 'operational-context',
    tags: ['startup-stages', 'product-market-fit', 'customer-discovery', 'scale', 'unit-economics']
  },
  {
    id: 'context-team-evolution',
    title: 'Team Evolution Patterns',
    content: 'Founding team: Generalists who wear multiple hats. 10-20 employees: First specialists (sales, marketing, engineering). 20-50 employees: Department heads, formal processes. 50+ employees: Middle management, specialized roles. Key hires by stage: technical co-founder, first salesperson, head of growth.',
    category: 'operational-context',
    tags: ['team-evolution', 'generalists', 'specialists', 'department-heads', 'key-hires']
  },
  {
    id: 'context-funding-stages',
    title: 'Funding Stage Priorities',
    content: 'Pre-seed: Prove concept, find co-founder, build MVP. Seed: Achieve product-market fit, hire key team members. Series A: Scale proven business model, expand team. Series B: Accelerate growth, enter new markets. Focus shifts from survival to growth to optimization.',
    category: 'operational-context',
    tags: ['funding-stages', 'pre-seed', 'seed', 'series-A', 'series-B', 'business-model']
  },

  // === FINANCE EXPERTISE ===
  {
    id: 'finance-budgeting-1',
    title: 'SME Budgeting Framework',
    content: 'Monthly budget categories: Revenue (conservative estimates), Fixed costs (rent, salaries, insurance), Variable costs (materials, commissions), One-time expenses (equipment, software). Track actual vs budget weekly. Red flags: >10% variance in any category. Cash flow rule: Maintain 3-6 months operating expenses in reserve.',
    category: 'finance',
    tags: ['budgeting', 'cash-flow', 'operating-expenses', 'variance-analysis', 'SME']
  },
  {
    id: 'finance-invoicing-1',
    title: 'Invoice Management & Collections',
    content: 'Invoice immediately upon delivery. Payment terms: Net 15 for new customers, Net 30 for established. Follow-up schedule: Day 5 (friendly reminder), Day 20 (firm notice), Day 35 (final notice), Day 45 (collections). Automate with QuickBooks/FreshBooks. Track DSO (Days Sales Outstanding) - target <30 days. Offer 2% discount for early payment.',
    category: 'finance',
    tags: ['invoicing', 'collections', 'payment-terms', 'DSO', 'automation', 'cash-flow']
  },
  {
    id: 'finance-pl-reporting-1',
    title: 'P&L Analysis for SMEs',
    content: 'Monthly P&L structure: Revenue (by product/service line), Cost of Goods Sold (COGS), Gross Profit, Operating Expenses (sales, marketing, admin), EBITDA, Net Income. Key ratios: Gross margin >50%, Operating margin >10%. Weekly flash reports: Revenue, expenses, cash position. Quarterly deep dive: Trend analysis, variance explanations.',
    category: 'finance',
    tags: ['P&L', 'gross-margin', 'operating-margin', 'EBITDA', 'financial-analysis', 'reporting']
  },
  {
    id: 'finance-cost-control-1',
    title: 'Cost Control Strategies',
    content: 'Monthly expense audit: Cancel unused subscriptions (avg $200-500/month savings), negotiate vendor contracts annually, consolidate suppliers. Track cost per customer acquisition and cost per employee. Implement approval workflows for expenses >$500. Monitor burn rate weekly. Emergency cost cuts: Reduce non-essential travel, pause non-critical hires, renegotiate rent.',
    category: 'finance',
    tags: ['cost-control', 'expense-audit', 'vendor-negotiation', 'burn-rate', 'cost-per-customer']
  },
  {
    id: 'finance-pricing-1',
    title: 'Pricing Strategy & Revenue Optimization',
    content: 'Cost-plus pricing: COGS + desired margin (typically 2-3x for products, 50-70% for services). Value-based pricing: Price based on customer ROI/value delivered. A/B test pricing: 10-20% price increases often have minimal impact on demand. Bundle pricing: Increase average order value 15-30%. Annual contracts: Offer 10-15% discount for upfront payment.',
    category: 'finance',
    tags: ['pricing-strategy', 'cost-plus', 'value-based', 'bundling', 'annual-contracts', 'revenue-optimization']
  },
  {
    id: 'finance-forecasting-1',
    title: 'Financial Forecasting for SMEs',
    content: 'Rolling 13-week cash flow forecast: Weekly revenue projections, accounts receivable collections, expense timing. Scenario planning: Best case (+20%), base case (realistic), worst case (-20%). Monthly revenue forecasting: Historical trends + pipeline analysis + seasonal adjustments. Key metrics: Monthly recurring revenue (MRR), customer lifetime value (LTV), churn rate.',
    category: 'finance',
    tags: ['forecasting', 'cash-flow', 'scenario-planning', 'MRR', 'LTV', 'churn-rate']
  },
  {
    id: 'finance-tax-compliance-1',
    title: 'Tax Planning & Compliance',
    content: 'Quarterly tax estimates: Set aside 25-30% of profit for taxes. Deductible expenses: Business meals (50%), home office, equipment depreciation, professional development. Record keeping: Digital receipts, mileage logs, business vs personal separation. Year-end strategies: Accelerate expenses, defer income, equipment purchases (Section 179 deduction).',
    category: 'finance',
    tags: ['tax-planning', 'quarterly-estimates', 'deductions', 'record-keeping', 'compliance']
  },
  {
    id: 'finance-funding-1',
    title: 'SME Funding & Capital Management',
    content: 'Funding options: SBA loans (7a, 504), business lines of credit, equipment financing, revenue-based financing. Prepare for funding: 3 years financials, business plan, personal guarantees. Working capital management: Optimize inventory turnover, negotiate supplier payment terms, factor receivables if needed. Debt service coverage ratio >1.25.',
    category: 'finance',
    tags: ['funding', 'SBA-loans', 'working-capital', 'debt-service', 'receivables', 'inventory']
  },

  // === CUSTOMER SUCCESS EXPERTISE ===
  {
    id: 'customer-success-health-1',
    title: 'Customer Health Score Framework',
    content: 'Health score components: Product usage (40%), Support tickets (20%), Payment history (20%), Engagement (20%). Scoring: Green (80-100), Yellow (60-79), Red (<60). Usage metrics: Login frequency, feature adoption, time spent. Engagement: Email opens, event attendance, feedback responses. Automate scoring with CRM/CS platforms.',
    category: 'customer-success',
    tags: ['health-score', 'product-usage', 'engagement', 'support-tickets', 'payment-history', 'automation']
  },
  {
    id: 'customer-success-churn-1',
    title: 'Churn Prevention Playbook',
    content: 'Early warning signs: 50% decrease in usage, support tickets increase, payment delays, declining engagement. Intervention timeline: Yellow score (proactive outreach within 48 hours), Red score (immediate call/meeting). Retention tactics: Success plan review, additional training, feature demos, account review meetings. Track: Time to intervention, retention rate by intervention type.',
    category: 'customer-success',
    tags: ['churn-prevention', 'early-warning', 'intervention', 'retention-tactics', 'success-plans']
  },
  {
    id: 'customer-success-onboarding-1',
    title: 'Customer Onboarding Excellence',
    content: 'Onboarding timeline: Week 1 (setup, initial training), Week 2 (first value achievement), Week 4 (full feature adoption), Week 8 (success review). Success metrics: Time to first value <7 days, feature adoption >70%, satisfaction score >8/10. Onboarding completion increases retention by 70%. Automate check-ins, provide self-service resources.',
    category: 'customer-success',
    tags: ['onboarding', 'time-to-value', 'feature-adoption', 'satisfaction-score', 'retention', 'automation']
  },
  {
    id: 'customer-success-expansion-1',
    title: 'Revenue Expansion Strategy',
    content: 'Expansion opportunities: Upselling (higher tier), cross-selling (additional products), seat expansion (more users). Timing: 3-6 months post-onboarding, after value realization. Success indicators: High usage, positive feedback, growing team. Expansion revenue should be 20-30% of total revenue. Track: Net revenue retention (target >110%), expansion rate by customer segment.',
    category: 'customer-success',
    tags: ['revenue-expansion', 'upselling', 'cross-selling', 'net-revenue-retention', 'expansion-rate']
  },
  {
    id: 'customer-success-feedback-1',
    title: 'Customer Feedback & NPS Program',
    content: 'NPS surveys: Quarterly for all customers, post-interaction for support. Follow-up: Contact detractors within 24 hours, ask promoters for referrals/reviews. Feedback channels: In-app surveys, email campaigns, customer calls. Close the loop: Share product updates based on feedback, measure satisfaction improvements. Target: NPS >50, response rate >30%.',
    category: 'customer-success',
    tags: ['NPS', 'feedback', 'detractors', 'promoters', 'surveys', 'customer-calls']
  },
  {
    id: 'customer-success-advocacy-1',
    title: 'Customer Advocacy Program',
    content: 'Identify advocates: High NPS scores, long tenure, expansion customers, vocal supporters. Advocacy activities: Case studies, testimonials, referrals, speaking opportunities, user groups. Incentives: Exclusive access, recognition, referral rewards, advisory board positions. Track: Advocacy participation rate, referral conversion, case study impact on sales.',
    category: 'customer-success',
    tags: ['customer-advocacy', 'case-studies', 'testimonials', 'referrals', 'user-groups', 'advisory-board']
  },
  {
    id: 'customer-success-metrics-1',
    title: 'Customer Success KPIs & Reporting',
    content: 'Key metrics: Customer satisfaction (CSAT), Net Promoter Score (NPS), Customer effort score (CES), Retention rate, Churn rate, Time to value, Expansion revenue. Reporting cadence: Weekly health score updates, monthly churn analysis, quarterly business reviews. Benchmarks: SaaS churn <5% monthly, B2B retention >90% annually, NPS >50.',
    category: 'customer-success',
    tags: ['KPIs', 'CSAT', 'NPS', 'CES', 'retention-rate', 'churn-rate', 'reporting']
  },

  // === INDUSTRY-SPECIFIC SME FRAMEWORKS ===
  {
    id: 'retail-operations-1',
    title: 'Retail SME Operations Framework',
    content: 'Inventory management: ABC analysis (80/20 rule), reorder points, seasonal adjustments. POS optimization: Upselling prompts, bundle suggestions, loyalty program integration. Customer flow: Peak hour staffing, queue management, store layout optimization. Key metrics: Inventory turnover (6-12x annually), gross margin (40-60%), sales per square foot.',
    category: 'operations',
    tags: ['retail', 'inventory-management', 'POS', 'upselling', 'customer-flow', 'store-layout']
  },
  {
    id: 'retail-marketing-1',
    title: 'Retail Marketing & Customer Acquisition',
    content: 'Local marketing: Google My Business optimization, local SEO, community partnerships. In-store promotions: End-cap displays, seasonal campaigns, loyalty programs. Digital presence: Social media showcasing products, email newsletters with promotions, customer reviews management. Budget allocation: 60% local/digital, 30% in-store, 10% testing new channels.',
    category: 'marketing',
    tags: ['retail', 'local-marketing', 'Google-My-Business', 'in-store-promotions', 'loyalty-programs', 'community']
  },
  {
    id: 'services-operations-1',
    title: 'Service Business Operations Framework',
    content: 'Service delivery: Standardized processes, quality checklists, time tracking. Scheduling optimization: Buffer time between appointments, seasonal capacity planning, no-show policies. Client management: Project timelines, milestone tracking, change order processes. Pricing: Time-based vs value-based, retainer models, scope creep prevention.',
    category: 'operations',
    tags: ['services', 'service-delivery', 'scheduling', 'client-management', 'pricing', 'retainer-models']
  },
  {
    id: 'services-sales-1',
    title: 'Service Business Sales & Contracts',
    content: 'Sales process: Discovery calls, proposal development, contract negotiation. Proposal structure: Scope of work, timeline, deliverables, pricing, terms. Contract renewals: 90-day advance notice, performance reviews, expansion opportunities. Recurring revenue: Maintenance contracts, ongoing support, annual retainers. Target: 40-60% recurring revenue.',
    category: 'sales',
    tags: ['services', 'proposals', 'contracts', 'renewals', 'recurring-revenue', 'retainers', 'scope-of-work']
  },
  {
    id: 'hospitality-operations-1',
    title: 'Hospitality Operations Framework',
    content: 'Guest experience: Check-in/out processes, service standards, complaint resolution. Revenue management: Dynamic pricing, occupancy optimization, seasonal adjustments. Staff management: Scheduling, training, performance standards. Maintenance: Preventive schedules, vendor management, emergency protocols. Key metrics: Occupancy rate, ADR (Average Daily Rate), RevPAR.',
    category: 'operations',
    tags: ['hospitality', 'guest-experience', 'revenue-management', 'dynamic-pricing', 'occupancy', 'ADR', 'RevPAR']
  },
  {
    id: 'hospitality-marketing-1',
    title: 'Hospitality Marketing & Bookings',
    content: 'Online presence: Website optimization, booking engine, review management (Google, Yelp, TripAdvisor). Distribution channels: OTAs (Booking.com, Expedia), direct bookings, corporate partnerships. Promotional strategies: Seasonal packages, loyalty programs, local partnerships. Target: 60% direct bookings, 40% OTA to optimize margins.',
    category: 'marketing',
    tags: ['hospitality', 'booking-engine', 'review-management', 'OTAs', 'direct-bookings', 'loyalty-programs']
  },
  {
    id: 'manufacturing-operations-1',
    title: 'Small Manufacturing Operations',
    content: 'Production planning: Demand forecasting, capacity planning, lead time management. Quality control: Inspection processes, defect tracking, supplier quality. Inventory: Raw materials, work-in-progress, finished goods optimization. Lean principles: Waste reduction, continuous improvement, 5S methodology. Key metrics: OEE (Overall Equipment Effectiveness), defect rate, on-time delivery.',
    category: 'operations',
    tags: ['manufacturing', 'production-planning', 'quality-control', 'inventory', 'lean', 'OEE', '5S']
  },
  {
    id: 'professional-services-1',
    title: 'Professional Services Framework',
    content: 'Project management: Scope definition, resource allocation, milestone tracking. Time tracking: Billable vs non-billable, utilization targets (70-80%), project profitability. Client relationships: Regular check-ins, value demonstrations, expansion opportunities. Expertise development: Continuing education, certifications, thought leadership. Pricing: Value-based over hourly when possible.',
    category: 'operations',
    tags: ['professional-services', 'project-management', 'time-tracking', 'utilization', 'value-based-pricing', 'expertise']
  },
  {
    id: 'ecommerce-operations-1',
    title: 'E-commerce SME Operations',
    content: 'Order fulfillment: Inventory management, shipping optimization, return processes. Customer acquisition: SEO, PPC, email marketing, social commerce. Conversion optimization: Product pages, checkout process, abandoned cart recovery. Analytics: Traffic sources, conversion rates, customer lifetime value, return on ad spend (ROAS). Target: 2-4% conversion rate, 3:1 ROAS.',
    category: 'operations',
    tags: ['ecommerce', 'fulfillment', 'conversion-optimization', 'ROAS', 'abandoned-cart', 'customer-acquisition']
  },
  {
    id: 'consulting-business-1',
    title: 'Consulting Business Framework',
    content: 'Service packaging: Diagnostic, implementation, ongoing support phases. Pricing models: Project-based, retainer, performance-based. Client acquisition: Referrals, content marketing, speaking engagements, LinkedIn outreach. Delivery: Frameworks, templates, methodology documentation. Scaling: Subcontractors, junior consultants, productized services. Target: 50-70% utilization rate.',
    category: 'role-templates',
    tags: ['consulting', 'service-packaging', 'pricing-models', 'client-acquisition', 'scaling', 'utilization-rate']
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