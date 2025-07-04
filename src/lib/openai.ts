import OpenAI from 'openai'
import { Goal, Task, TaskGenerationContext, TeamMember, TeamTask, TaskSuggestion, TeamTaskSuggestion } from '@/types'

type BusinessImpactType = 'cost_reduction' | 'revenue_growth' | 'profit_increase' | 'time_savings' | 'efficiency_gain' | 'risk_mitigation' | 'customer_satisfaction' | 'strategic_advantage'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function generateDailyTasks(context: TaskGenerationContext): Promise<Omit<Task, 'id' | 'userId' | 'createdAt'>[]> {
  const { goals, previousTasks, knowledgeBase } = context

  const goalsText = goals.map(g => `${g.title} (${g.timeframe}, ${g.priority} priority): ${g.description}`).join('\n')
  const knowledgeText = knowledgeBase.map(kb => `${kb.category}: ${kb.content}`).join('\n')
  
  // Enhanced context analysis using previous tasks
  const recentTasksText = previousTasks.slice(-15).map(t => `${t.title}: ${t.description} (Priority: ${t.priority}, Completed: ${t.completed}, Why: ${t.explanation})`).join('\n')
  
  // Analyze completion patterns and identify what's working
  const completedTasks = previousTasks.filter(t => t.completed)
  const incompleteTasks = previousTasks.filter(t => !t.completed)
  const completionRate = previousTasks.length > 0 ? (completedTasks.length / previousTasks.length * 100).toFixed(1) : '0'
  
  // Identify successful task patterns
  const successfulTaskTypes = completedTasks.map(t => t.title).slice(-5)
  const stuckAreas = incompleteTasks.filter(t => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(t.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceCreated > 2
  }).map(t => t.title)

  const prompt = `You are an AI COO with expertise in tactical execution and progressive task management. Generate 3-4 highly practical, directly actionable tasks that build on previous progress and move the business forward in measurable ways.

COMPANY STRATEGIC GOALS:
${goalsText}

BUSINESS INTELLIGENCE & BEST PRACTICES:
${knowledgeText}

RECENT TASK HISTORY & PROGRESS ANALYSIS:
${recentTasksText}

PERFORMANCE INSIGHTS:
- Overall completion rate: ${completionRate}%
- Recently completed tasks: ${successfulTaskTypes.join(', ') || 'None yet'}
- Areas needing attention: ${stuckAreas.join(', ') || 'None identified'}
- Total tasks tracked: ${previousTasks.length}

PROGRESSIVE TASK GENERATION REQUIREMENTS:
1. Build on completed tasks - reference and advance previous wins
2. Address stuck areas with fresh, more specific approaches
3. Generate tasks that are 100% actionable - specific WHO, WHAT, WHEN
4. Include realistic time estimates and measurable success criteria
5. Focus on immediate business value - efficiency, growth, clarity
6. Avoid repetitive, vague, or generic tasks
7. Each task should have clear next steps and completion criteria
8. Use insights from successful task patterns to inform new tasks

TASK QUALITY STANDARDS:
- Be specific about deliverables, tools, timelines, and success metrics
- Include realistic difficulty spread (mix of quick wins and meaningful work)
- Create tasks that compound value and set up future wins
- Focus on what directly moves the business forward - NO FILLER OR FLUFF
- Every task must have clear completion criteria and next steps
- Prioritize tasks that create momentum and compound value
- CRITICAL: For tasks with meaningful business impact, include specific businessImpact object
- Only include businessImpact when the task has clear, measurable potential for business value
- Be conservative but specific with impact estimates

EXECUTION FOCUS:
- Each task should be something that can be completed and checked off
- Avoid "research" or "explore" tasks unless they lead to specific decisions
- Focus on creating, building, implementing, optimizing, or completing
- Tasks should produce tangible outputs that advance business goals
- Prioritize work that increases efficiency, growth, or clarity

For each task, generate specific details that enable immediate action and measurable results.

Return JSON array with this exact structure:
[
  {
    "title": "Specific, actionable task with clear deliverable",
    "description": "Detailed step-by-step instructions with tools, timelines, success criteria, and next steps",
    "explanation": "Strategic reasoning explaining how this builds on previous progress and drives specific business outcomes",
    "priority": "high|medium|low",
    "completed": false,
    "estimatedHours": 1-8,
    "daysFromNow": 0-2,
    "relatedGoalIds": ["array of relevant goal IDs"],
    "businessImpact": {
      "type": "cost_reduction|revenue_growth|profit_increase|time_savings|efficiency_gain|risk_mitigation|customer_satisfaction|strategic_advantage",
      "description": "Clear, specific explanation of the measurable business value this task could deliver",
      "estimatedValue": "Optional: specific dollar amount, percentage improvement, or time saved",
      "timeframe": "Optional: when the impact would be realized"
    }
  }
]

IMPORTANT: Generate progressive, intelligent tasks that learn from what's working and address what isn't. Focus on practical execution over abstract planning.`

  if (!openai) {
    // Return fallback tasks for testing when OpenAI is not configured
    return [
      {
        title: "Review Q4 financial projections and identify optimization opportunities",
        description: "Analyze current financial performance, compare against projections, and identify 3-5 key areas for cost optimization or revenue acceleration.",
        explanation: "This task helps ensure Q4 targets are met and positions the company for strong Q1 performance. Financial review at this stage can identify bottlenecks before they impact cash flow.",
        priority: "high" as const,
        completed: false,
        dueDate: new Date(), // Set to today so it appears in the dashboard
        relatedGoalIds: goals.map(g => g.id),
        businessImpact: {
          type: 'cost_reduction' as const,
          description: 'Identifying optimization opportunities could reduce operational costs by 10-15% and improve cash flow',
          estimatedValue: '10-15% cost reduction',
          timeframe: 'within 6 weeks'
        }
      },
      {
        title: "Conduct strategic planning session for next quarter initiatives",
        description: "Schedule and lead a 2-hour strategic planning session with key stakeholders to define priorities, allocate resources, and set measurable objectives for the upcoming quarter.",
        explanation: "Strategic planning ensures alignment across teams and prevents reactive decision-making. Early planning typically increases execution success rates by 40%.",
        priority: "medium" as const,
        completed: false,
        dueDate: new Date(), // Set to today so it appears in the dashboard
        relatedGoalIds: goals.map(g => g.id),
        businessImpact: {
          type: 'efficiency_gain' as const,
          description: 'Proper strategic planning increases team execution success rates and reduces wasted resources',
          estimatedValue: '40% higher success rate',
          timeframe: 'next quarter'
        }
      },
      {
        title: "Schedule one-on-one meetings with direct reports",
        description: "Book 30-minute check-ins with each direct report to discuss current projects, blockers, career development, and gather feedback on team dynamics.",
        explanation: "Regular one-on-ones improve employee engagement by 30% and help identify issues before they escalate. This also strengthens leadership relationships and team performance.",
        priority: "medium" as const,
        completed: false,
        dueDate: new Date(), // Set to today so it appears in the dashboard
        relatedGoalIds: goals.map(g => g.id),
        businessImpact: {
          type: 'efficiency_gain' as const,
          description: 'Improved employee engagement leads to higher productivity and lower turnover costs',
          estimatedValue: '30% engagement increase',
          timeframe: 'within 1 month'
        }
      }
    ]
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite AI COO with 20+ years of experience scaling companies. You specialize in predictive analytics, tactical execution, and identifying high-leverage opportunities. Always respond with valid JSON containing specific, measurable, and strategically sound daily tasks."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    // Extract JSON from response (handle potential markdown formatting)
    let jsonStr = response
    if (response.includes('```json')) {
      jsonStr = response.split('```json')[1].split('```')[0]
    } else if (response.includes('```')) {
      jsonStr = response.split('```')[1]
    }

    // Parse JSON response
    const tasks = JSON.parse(jsonStr.trim())
    
    // Validate and transform tasks
    return tasks.map((task: { 
      title: string; 
      description: string; 
      explanation: string; 
      priority: string; 
      estimatedHours?: number;
      daysFromNow?: number;
      relatedGoalIds?: string[]
      businessImpact?: {
        type: string;
        description: string;
        estimatedValue?: string;
        timeframe?: string;
      }
    }) => {
      // Set all tasks for today so they appear immediately in the dashboard
      // For a daily task dashboard, tasks should be due today for immediate action
      const dueDate = new Date()
      // Set to today's date but keep the same time to maintain proper sorting
      dueDate.setHours(dueDate.getHours() + Math.floor(Math.random() * 8) + 1) // Randomize throughout the day
      
      return {
        title: task.title,
        description: task.description,
        explanation: task.explanation,
        priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
        completed: false,
        dueDate,
        relatedGoalIds: task.relatedGoalIds || [],
        businessImpact: task.businessImpact ? {
          type: task.businessImpact.type as BusinessImpactType,
          description: task.businessImpact.description,
          estimatedValue: task.businessImpact.estimatedValue,
          timeframe: task.businessImpact.timeframe
        } : undefined
      }
    })

  } catch (error) {
    console.error('Error generating tasks:', error)
    throw error
  }
}

export async function generateTeamTasks(
  teamMembers: TeamMember[], 
  goals: Goal[],
  previousTeamTasks?: Record<string, TeamTask[]>
): Promise<Record<string, TeamTask[]>> {
  const goalsText = goals.map(g => `${g.title} (${g.timeframe}, ${g.priority} priority): ${g.description}`).join('\n')
  
  // Calculate team composition and workload distribution
  const roleDistribution = teamMembers.reduce((acc, member) => {
    const role = member.role === 'Custom' ? member.customRole || 'General' : member.role
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const teamSize = teamMembers.length
  const rolesText = Object.entries(roleDistribution).map(([role, count]) => `${role}: ${count} members`).join(', ')

  // Enhanced team task context analysis
  const allPreviousTasks = previousTeamTasks ? Object.values(previousTeamTasks).flat() : []
  const completedTeamTasks = allPreviousTasks.filter(t => t.completed)
  const incompleteTeamTasks = allPreviousTasks.filter(t => !t.completed)
  const teamCompletionRate = allPreviousTasks.length > 0 ? (completedTeamTasks.length / allPreviousTasks.length * 100).toFixed(1) : '0'

  // Analyze patterns by member
  const memberPerformance = teamMembers.map(member => {
    const memberKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
    const memberTasks = previousTeamTasks?.[memberKey] || []
    const completed = memberTasks.filter(t => t.completed)
    const pending = memberTasks.filter(t => !t.completed)
    
    return {
      member: memberKey,
      totalTasks: memberTasks.length,
      completed: completed.length,
      pending: pending.length,
      completionRate: memberTasks.length > 0 ? (completed.length / memberTasks.length * 100).toFixed(1) : '0',
      recentTasks: memberTasks.slice(-3).map(t => `${t.title} (${t.completed ? 'completed' : 'pending'})`)
    }
  })

  const teamHistoryText = memberPerformance.map(p => 
    `${p.member}: ${p.totalTasks} tasks (${p.completionRate}% completion), Recent: ${p.recentTasks.join(', ') || 'No previous tasks'}`
  ).join('\n')

  const prompt = `You are an AI COO with expertise in tactical execution and team optimization. Generate 2-3 highly practical, directly actionable tasks per team member that build on previous progress and move the business forward in measurable ways.

COMPANY STRATEGIC GOALS:
${goalsText}

TEAM COMPOSITION (${teamSize} members):
${rolesText}

INDIVIDUAL TEAM MEMBERS:
${teamMembers.map((member, idx) => `${idx + 1}. ${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`).join('\n')}

TEAM PERFORMANCE HISTORY:
${teamHistoryText || 'No previous team tasks yet - this is the first task generation'}

TEAM METRICS:
- Overall team completion rate: ${teamCompletionRate}%
- Total previous tasks: ${allPreviousTasks.length}
- Completed tasks: ${completedTeamTasks.length}
- Pending tasks: ${incompleteTeamTasks.length}

REQUIRED: Return tasks using EXACT member keys in format: "Name - Role" (e.g., "John Doe - Marketing", "Jane Smith - Sales")

PROGRESSIVE TASK GENERATION REQUIREMENTS:
1. Build on completed tasks - reference and advance previous wins for each member
2. Address pending tasks with fresh approaches or complementary work
3. Generate tasks that are 100% actionable - specific WHO, WHAT, WHEN, HOW
4. Focus on immediate business value - efficiency, growth, clarity
5. Avoid repetitive, vague, or generic tasks
6. Create tasks that compound value and set up future wins
7. Distribute fairly - balanced workload across team members
8. Include realistic time estimates and measurable success criteria
9. Each task should have clear completion criteria and next steps
10. Leverage each person's unique expertise while supporting company goals
11. Use individual performance patterns to optimize task assignment

TASK QUALITY STANDARDS:
- Be specific about deliverables, tools, timelines, and success metrics
- Include realistic difficulty spread (mix of quick wins and meaningful work)
- Focus on what directly moves the business forward - NO FILLER OR FLUFF
- Encourage natural collaboration between complementary roles
- Avoid abstract planning - focus on concrete execution that produces results
- Every task must have clear completion criteria and next steps
- Prioritize tasks that create momentum and compound value
- CRITICAL: For tasks with meaningful business impact, include specific businessImpact object
- Only include businessImpact when the task has clear, measurable potential for business value
- Be conservative but specific with impact estimates

EXECUTION FOCUS:
- Each task should be something that can be completed and checked off
- Avoid "research" or "explore" tasks unless they lead to specific decisions
- Focus on creating, building, implementing, optimizing, or completing
- Tasks should produce tangible outputs that advance business goals
- Prioritize work that increases efficiency, growth, or clarity

For each team member, generate specific tasks that enable immediate action and clear business outcomes.

Return JSON object with this exact structure:
{
  "Team Member Name - Role": [
    {
      "title": "Specific, actionable task with clear outcome",
      "description": "Detailed implementation steps with tools, timelines, and success criteria",
      "reason": "Strategic justification explaining how this task advances company goals and why this person is best suited for it",
      "priority": "high|medium|low",
      "estimatedHours": 2-8,
      "collaborationNeeded": "Optional: which other team members this task involves",
      "successMetrics": "Specific, measurable outcomes expected",
      "businessImpact": {
        "type": "cost_reduction|revenue_growth|profit_increase|time_savings|efficiency_gain|risk_mitigation|customer_satisfaction|strategic_advantage",
        "description": "Clear, specific explanation of the measurable business value this task could deliver",
        "estimatedValue": "Optional: specific dollar amount, percentage improvement, or time saved",
        "timeframe": "Optional: when the impact would be realized"
      }
    }
  ]
}

Ensure balanced workload and create synergies between team members' tasks.`

  if (!openai) {
    // Return fallback team tasks for testing
    const fallbackTasks: Record<string, TeamTask[]> = {}
    
    teamMembers.forEach((member) => {
      const memberKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
      fallbackTasks[memberKey] = [
        {
          id: `fallback-${member.id}-1`,
          title: `Complete market analysis for ${member.role} initiatives`,
          description: `Research and analyze market trends relevant to ${member.role} responsibilities, create actionable insights report.`,
          reason: `Market analysis helps ${member.name} make data-driven decisions and identify new opportunities in their domain.`,
          priority: 'medium' as const,
          completed: false,
          dueDate: new Date(), // Set to today so tasks appear immediately
          assignedTo: member.id,
          businessImpact: {
            type: 'strategic_advantage' as const,
            description: 'Market insights can identify new opportunities and competitive advantages',
            estimatedValue: 'Potential 20% improvement in strategic positioning',
            timeframe: 'within 2 weeks'
          }
        },
        {
          id: `fallback-${member.id}-2`,
          title: `Optimize workflow processes for improved efficiency`,
          description: `Identify bottlenecks in current ${member.role} workflows and implement 2-3 process improvements.`,
          reason: `Process optimization can increase ${member.name}'s productivity by 25% and improve team collaboration.`,
          priority: 'high' as const,
          completed: false,
          dueDate: new Date(), // Set to today so tasks appear immediately
          assignedTo: member.id,
          businessImpact: {
            type: 'efficiency_gain' as const,
            description: 'Process improvements can significantly boost individual and team productivity',
            estimatedValue: '25% productivity increase',
            timeframe: 'within 1 month'
          }
        }
      ]
    })
    
    return fallbackTasks
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite AI COO specializing in team optimization and task distribution. You excel at creating balanced, collaborative workloads that maximize team productivity. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    // Extract JSON from response
    let jsonStr = response
    if (response.includes('```json')) {
      jsonStr = response.split('```json')[1].split('```')[0]
    } else if (response.includes('```')) {
      jsonStr = response.split('```')[1]
    }

    // Parse JSON response
    const teamTasksRaw = JSON.parse(jsonStr.trim())
    
    // Transform to include IDs and required fields
    const teamTasks: Record<string, TeamTask[]> = {}
    
    // Create a mapping of expected member keys for normalization
    const memberKeyMap: Record<string, string> = {}
    teamMembers.forEach(member => {
      const normalizedKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
      memberKeyMap[member.name] = normalizedKey
      memberKeyMap[normalizedKey] = normalizedKey
      memberKeyMap[member.role] = normalizedKey
    })
    
    Object.entries(teamTasksRaw).forEach(([rawKey, tasks]) => {
      if (Array.isArray(tasks)) {
        // Find the correct member key or use the raw key if it's already correct
        let memberKey = rawKey
        if (memberKeyMap[rawKey]) {
          memberKey = memberKeyMap[rawKey]
        } else {
          // Try to find a matching member based on name
          const matchingMember = teamMembers.find(m => 
            rawKey.includes(m.name) || rawKey.includes(m.role) || 
            (m.role === 'Custom' && m.customRole && rawKey.includes(m.customRole))
          )
          if (matchingMember) {
            memberKey = `${matchingMember.name} - ${matchingMember.role === 'Custom' ? matchingMember.customRole : matchingMember.role}`
          }
        }
        
        teamTasks[memberKey] = tasks.map((task: { 
          title: string; 
          description?: string;
          reason: string; 
          priority?: string;
          estimatedHours?: number;
          collaborationNeeded?: string;
          successMetrics?: string;
          businessImpact?: {
            type: string;
            description: string;
            estimatedValue?: string;
            timeframe?: string;
          }
        }, taskIndex: number) => {
          // Set all team tasks for today so they appear immediately in the dashboard
          // For a daily task dashboard, tasks should be due today for immediate action
          const dueDate = new Date()
          // Add slight time variation to maintain proper sorting
          dueDate.setHours(dueDate.getHours() + Math.floor(Math.random() * 6) + 1)
          
          return {
            id: `ai-${memberKey.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${taskIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: task.title,
            description: task.description || task.title,
            reason: task.reason,
            priority: (['high', 'medium', 'low'].includes(task.priority || '') ? task.priority : 'medium') as 'low' | 'medium' | 'high',
            completed: false,
            dueDate,
            assignedTo: memberKey.split(' - ')[0] || 'unknown',
            businessImpact: task.businessImpact ? {
              type: task.businessImpact.type as BusinessImpactType,
              description: task.businessImpact.description,
              estimatedValue: task.businessImpact.estimatedValue,
              timeframe: task.businessImpact.timeframe
            } : undefined
          }
        })
      }
    })

    return teamTasks

  } catch (error) {
    console.error('Error generating team tasks:', error)
    throw error
  }
}

export async function explainTask(task: Task, goals: Goal[]): Promise<string> {
  const relatedGoals = goals.filter(g => task.relatedGoalIds.includes(g.id))
  const goalsContext = relatedGoals.map(g => `${g.title}: ${g.description}`).join('\n')

  const prompt = `Analyze this task and provide strategic reasoning for its importance:

TASK: ${task.title}
DESCRIPTION: ${task.description}

RELATED GOALS:
${goalsContext}

As an AI COO, explain in 2-3 sentences:
1. The strategic importance of this task
2. Expected business impact and timeline
3. How it connects to achieving the stated goals

Be specific about metrics and outcomes where possible.`

  if (!openai) {
    return 'This task supports your strategic objectives and contributes to overall business growth.'
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI COO that provides clear, strategic explanations for task prioritization with specific business reasoning."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 300
    })

    return completion.choices[0]?.message?.content || 'This task supports your strategic objectives and contributes to overall business growth.'
  } catch (error) {
    console.error('Error explaining task:', error)
    return 'This task supports your strategic objectives and contributes to overall business growth.'
  }
}

// New function for task optimization and analytics
export async function analyzeTaskPerformance(
  tasks: Task[],
  goals: Goal[]
): Promise<{
  completionRate: number;
  priorityDistribution: Record<string, number>;
  goalAlignment: Record<string, number>;
  recommendations: string[];
}> {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const priorityDistribution = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const goalAlignment = goals.reduce((acc, goal) => {
    const relatedTasks = tasks.filter(t => t.relatedGoalIds.includes(goal.id))
    acc[goal.title] = relatedTasks.length
    return acc
  }, {} as Record<string, number>)

  // Generate AI recommendations if API is available
  let recommendations: string[] = []
  
  if (openai) {
    try {
      const prompt = `Analyze this task performance data and provide 3-5 specific recommendations for improvement:

PERFORMANCE METRICS:
- Total tasks: ${totalTasks}
- Completion rate: ${completionRate.toFixed(1)}%
- Priority distribution: ${JSON.stringify(priorityDistribution)}
- Goal alignment: ${JSON.stringify(goalAlignment)}

GOALS:
${goals.map(g => `${g.title} (${g.priority}): ${g.description}`).join('\n')}

Provide specific, actionable recommendations to improve productivity and goal achievement.`

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI COO that provides data-driven recommendations for improving task performance and goal achievement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 500
      })

      const response = completion.choices[0]?.message?.content
      if (response) {
        recommendations = response.split('\n').filter(line => line.trim().length > 0).slice(0, 5)
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
    }
  }

  return {
    completionRate,
    priorityDistribution,
    goalAlignment,
    recommendations
  }
}

// New functions for task suggestion system
export async function generateTaskSuggestions(context: TaskGenerationContext): Promise<TaskSuggestion[]> {
  const { goals, previousTasks, knowledgeBase } = context

  const goalsText = goals.map(g => `${g.title} (${g.timeframe}, ${g.priority} priority): ${g.description}`).join('\n')
  const knowledgeText = knowledgeBase.map(kb => `${kb.category}: ${kb.content}`).join('\n')
  const recentTasksText = previousTasks.slice(-10).map(t => `${t.title}: ${t.explanation} (Priority: ${t.priority}, Completed: ${t.completed})`).join('\n')
  
  // Calculate completion patterns and bottlenecks
  const completionRate = previousTasks.length > 0 ? (previousTasks.filter(t => t.completed).length / previousTasks.length * 100).toFixed(1) : '0'
  const highPriorityTasks = previousTasks.filter(t => t.priority === 'high')
  const highPriorityCompletion = highPriorityTasks.length > 0 ? (highPriorityTasks.filter(t => t.completed).length / highPriorityTasks.length * 100).toFixed(1) : '0'

  const prompt = `You are an AI COO with expertise in predictive business analytics and tactical execution. Generate 6 thoughtful, distinct task suggestions that predict and prevent future bottlenecks while accelerating goal achievement.

USER GOALS & STRATEGY:
${goalsText}

BUSINESS INTELLIGENCE & BEST PRACTICES:
${knowledgeText}

RECENT TASK HISTORY & PERFORMANCE:
${recentTasksText}

PERFORMANCE METRICS:
- Overall completion rate: ${completionRate}%
- High-priority task completion: ${highPriorityCompletion}%
- Total tasks tracked: ${previousTasks.length}

TACTICAL REQUIREMENTS:
1. Generate 6 DISTINCT task suggestions with varied priorities and approaches
2. Include specific metrics, numbers, and measurable outcomes
3. Prioritize tasks that compound over time (network effects, process improvements)
4. Consider lead times - what needs to start today to meet future deadlines
5. Include tasks that address potential bottlenecks before they occur
6. Focus on leverage points that multiply impact across multiple goals
7. Ensure diversity in task types, difficulty levels, and time commitments

TASK GENERATION CRITERIA:
- Be specific about WHO, WHAT, WHEN, and measurable SUCCESS CRITERIA
- Include industry benchmarks where relevant (e.g., "industry average is X%, aim for Y%")
- Combine analytical insights with actionable next steps
- Vary difficulty levels to maintain momentum while driving growth
- Each task should have clear business justification tied to financial or strategic outcomes
- Rank tasks by importance (1-6, where 1 is highest priority)
- CRITICAL: For tasks with meaningful business impact, include specific businessImpact object with realistic estimates
- Only include businessImpact when the task has clear, measurable potential for business value
- Be conservative but specific with impact estimates - use real industry data when possible

Return JSON array with this exact structure:
[
  {
    "title": "Specific, action-oriented task with clear deliverable",
    "description": "Detailed step-by-step description including tools, metrics, and success criteria",
    "explanation": "Strategic reasoning connecting task to goals with specific business impact prediction",
    "priority": "high|medium|low",
    "estimatedHours": 1-8,
    "rank": 1-6,
    "relatedGoalIds": ["array of relevant goal IDs"],
    "businessImpact": {
      "type": "cost_reduction|revenue_growth|profit_increase|time_savings|efficiency_gain|risk_mitigation|customer_satisfaction|strategic_advantage",
      "description": "Clear, specific explanation of the measurable business value this task could deliver",
      "estimatedValue": "Optional: specific dollar amount, percentage improvement, or time saved",
      "timeframe": "Optional: when the impact would be realized"
    }
  }
]

IMPORTANT: Generate exactly 6 tasks with diverse priorities and approaches. Focus on tasks that move the needle significantly.`

  if (!openai) {
    // Return 6 fallback task suggestions for testing
    return [
      {
        id: `suggestion-ceo-1-${Date.now()}`,
        title: "Review Q4 financial projections and identify optimization opportunities",
        description: "Analyze current financial performance, compare against projections, and identify 3-5 key areas for cost optimization or revenue acceleration.",
        explanation: "This task helps ensure Q4 targets are met and positions the company for strong Q1 performance. Financial review at this stage can identify bottlenecks before they impact cash flow.",
        priority: "high" as const,
        estimatedHours: 3,
        rank: 1,
        selected: false,
        relatedGoalIds: goals.map(g => g.id),
        businessImpact: {
          type: 'cost_reduction' as const,
          description: 'Identifying optimization opportunities could reduce operational costs and improve cash flow',
          estimatedValue: '10-15% cost reduction',
          timeframe: 'within 6 weeks'
        }
      },
      {
        id: `suggestion-ceo-2-${Date.now()}`,
        title: "Conduct strategic planning session for next quarter initiatives",
        description: "Schedule and lead a 2-hour strategic planning session with key stakeholders to define priorities, allocate resources, and set measurable objectives for the upcoming quarter.",
        explanation: "Strategic planning ensures alignment across teams and prevents reactive decision-making. Early planning typically increases execution success rates by 40%.",
        priority: "high" as const,
        estimatedHours: 4,
        rank: 2,
        selected: false,
        relatedGoalIds: goals.map(g => g.id),
        businessImpact: {
          type: 'efficiency_gain' as const,
          description: 'Proper strategic planning increases team execution success rates and reduces wasted resources',
          estimatedValue: '40% higher success rate',
          timeframe: 'next quarter'
        }
      },
      {
        id: `suggestion-ceo-3-${Date.now()}`,
        title: "Schedule one-on-one meetings with direct reports",
        description: "Book 30-minute check-ins with each direct report to discuss current projects, blockers, career development, and gather feedback on team dynamics.",
        explanation: "Regular one-on-ones improve employee engagement by 30% and help identify issues before they escalate. This also strengthens leadership relationships and team performance.",
        priority: "medium" as const,
        estimatedHours: 2,
        rank: 3,
        selected: false,
        relatedGoalIds: goals.map(g => g.id),
        businessImpact: {
          type: 'efficiency_gain' as const,
          description: 'Improved employee engagement leads to higher productivity and lower turnover costs',
          estimatedValue: '30% engagement increase',
          timeframe: 'within 1 month'
        }
      },
      {
        id: `suggestion-ceo-4-${Date.now()}`,
        title: "Analyze competitor landscape and market positioning",
        description: "Research top 3 competitors, analyze their recent moves, pricing strategies, and market positioning to identify opportunities and threats.",
        explanation: "Competitive analysis helps maintain market advantage and identify strategic opportunities. Companies that regularly analyze competition are 23% more likely to outperform peers.",
        priority: "medium" as const,
        estimatedHours: 3,
        rank: 4,
        selected: false,
        relatedGoalIds: goals.map(g => g.id),
        businessImpact: {
          type: 'strategic_advantage' as const,
          description: 'Competitive analysis can identify market opportunities and strategic positioning improvements',
          estimatedValue: '23% higher performance vs peers',
          timeframe: 'within 2 months'
        }
      },
      {
        id: `suggestion-ceo-5-${Date.now()}`,
        title: "Review and optimize key business processes",
        description: "Identify the top 3 business processes that consume the most time or resources and create optimization plans to improve efficiency by 15-25%.",
        explanation: "Process optimization creates scalable improvements that compound over time. Even small efficiency gains can result in significant cost savings and improved customer satisfaction.",
        priority: "medium" as const,
        estimatedHours: 4,
        rank: 5,
        selected: false,
        relatedGoalIds: goals.map(g => g.id),
        businessImpact: {
          type: 'efficiency_gain' as const,
          description: 'Process optimization creates scalable efficiency improvements that compound over time',
          estimatedValue: '15-25% efficiency improvement',
          timeframe: 'within 3 months'
        }
      },
      {
        id: `suggestion-ceo-6-${Date.now()}`,
        title: "Plan customer feedback collection and analysis initiative",
        description: "Design and implement a systematic approach to collect, analyze, and act on customer feedback through surveys, interviews, and data analysis.",
        explanation: "Customer feedback drives product improvements and retention. Companies that actively collect and act on feedback see 25% higher customer satisfaction and 20% better retention rates.",
        priority: "low" as const,
        estimatedHours: 2,
        rank: 6,
        selected: false,
        relatedGoalIds: goals.map(g => g.id),
        businessImpact: {
          type: 'customer_satisfaction' as const,
          description: 'Systematic customer feedback collection improves satisfaction and retention rates',
          estimatedValue: '25% higher satisfaction, 20% better retention',
          timeframe: 'within 2 months'
        }
      }
    ]
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite AI COO with 20+ years of experience scaling companies. You specialize in predictive analytics, tactical execution, and identifying high-leverage opportunities. Always respond with valid JSON containing exactly 6 specific, measurable, and strategically sound task suggestions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    // Extract JSON from response
    let jsonStr = response
    if (response.includes('```json')) {
      jsonStr = response.split('```json')[1].split('```')[0]
    } else if (response.includes('```')) {
      jsonStr = response.split('```')[1]
    }

    // Parse JSON response
    const tasks = JSON.parse(jsonStr.trim())
    
    // Validate and transform tasks
    return tasks.map((task: { 
      title: string; 
      description: string; 
      explanation: string; 
      priority: string; 
      estimatedHours?: number;
      rank?: number;
      relatedGoalIds?: string[]
      businessImpact?: {
        type: string;
        description: string;
        estimatedValue?: string;
        timeframe?: string;
      }
    }, taskIndex: number) => {
      return {
        id: `suggestion-ceo-${taskIndex + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: task.title,
        description: task.description,
        explanation: task.explanation,
        priority: (['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium') as 'low' | 'medium' | 'high',
        estimatedHours: task.estimatedHours || 3,
        rank: task.rank || (taskIndex + 1),
        selected: false,
        relatedGoalIds: task.relatedGoalIds || [],
        businessImpact: task.businessImpact ? {
          type: task.businessImpact.type as BusinessImpactType,
          description: task.businessImpact.description,
          estimatedValue: task.businessImpact.estimatedValue,
          timeframe: task.businessImpact.timeframe
        } : undefined
      }
    })

  } catch (error) {
    console.error('Error generating task suggestions:', error)
    throw error
  }
}

export async function generateTeamTaskSuggestions(
  teamMembers: TeamMember[], 
  goals: Goal[]
): Promise<Record<string, TeamTaskSuggestion[]>> {
  const goalsText = goals.map(g => `${g.title} (${g.timeframe}, ${g.priority} priority): ${g.description}`).join('\n')
  
  // Calculate team composition and workload distribution
  const roleDistribution = teamMembers.reduce((acc, member) => {
    const role = member.role === 'Custom' ? member.customRole || 'General' : member.role
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const teamSize = teamMembers.length
  const rolesText = Object.entries(roleDistribution).map(([role, count]) => `${role}: ${count} members`).join(', ')

  const prompt = `You are an AI COO with expertise in team optimization and cross-functional collaboration. Generate 6 thoughtful, distinct task suggestions per team member that maximize team productivity while ensuring equitable workload distribution.

COMPANY STRATEGIC GOALS:
${goalsText}

TEAM COMPOSITION (${teamSize} members):
${rolesText}

INDIVIDUAL TEAM MEMBERS:
${teamMembers.map((member, idx) => `${idx + 1}. ${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`).join('\n')}

REQUIRED: Return tasks using EXACT member keys in format: "Name - Role" (e.g., "John Doe - Marketing", "Jane Smith - Sales")

TACTICAL REQUIREMENTS:
1. Generate exactly 6 DISTINCT task suggestions per team member
2. Distribute tasks fairly - vary priority levels across suggestions
3. Create interdependencies that encourage collaboration between roles
4. Generate tasks with reasonable difficulty spread (mix of quick wins and challenging work)
5. Include specific metrics and success criteria for each task
6. Ensure tasks leverage each person's unique expertise while supporting company goals
7. Consider realistic time constraints - tasks should be achievable in 1-2 days
8. Rank tasks by importance (1-6, where 1 is highest priority for that person)

TASK QUALITY STANDARDS:
- Be specific about deliverables, tools, and success metrics
- Include industry benchmarks where relevant
- Create tasks that compound value over time
- Address both urgent needs and strategic initiatives
- Ensure reasonable difficulty distribution across team members
- Vary task types and approaches for diversity
- CRITICAL: For tasks with meaningful business impact, include specific businessImpact object with realistic estimates
- Only include businessImpact when the task has clear, measurable potential for business value
- Be conservative but specific with impact estimates - use real industry data when possible

For each team member, generate exactly 6 specific task suggestions that align with their role and expertise while supporting company goals.

Return JSON object with this exact structure:
{
  "Team Member Name - Role": [
    {
      "title": "Specific, actionable task with clear outcome",
      "description": "Detailed implementation steps with tools, timelines, and success criteria",
      "reason": "Strategic justification explaining how this task advances company goals and why this person is best suited for it",
      "priority": "high|medium|low",
      "estimatedHours": 1-8,
      "rank": 1-6,
      "collaborationNeeded": "Optional: which other team members this task involves",
      "successMetrics": "Specific, measurable outcomes expected",
      "businessImpact": {
        "type": "cost_reduction|revenue_growth|profit_increase|time_savings|efficiency_gain|risk_mitigation|customer_satisfaction|strategic_advantage",
        "description": "Clear, specific explanation of the measurable business value this task could deliver",
        "estimatedValue": "Optional: specific dollar amount, percentage improvement, or time saved",
        "timeframe": "Optional: when the impact would be realized"
      }
    }
  ]
}

Ensure balanced workload and create synergies between team members' tasks. Generate exactly 6 tasks per person.`

  if (!openai) {
    // Return 6 fallback team task suggestions for testing
    const fallbackTasks: Record<string, TeamTaskSuggestion[]> = {}
    
    teamMembers.forEach((member) => {
      const memberKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
      fallbackTasks[memberKey] = Array.from({ length: 6 }, (_, index) => ({
        id: `suggestion-${member.id}-${index + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${member.role} task ${index + 1}: Complete strategic analysis for ${member.role} initiatives`,
        description: `Research and analyze key opportunities relevant to ${member.role} responsibilities, create actionable insights report with specific recommendations.`,
        reason: `This task helps ${member.name} make data-driven decisions and identify new opportunities in their domain, directly supporting company strategic goals.`,
        priority: (index < 2 ? 'high' : index < 4 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
        estimatedHours: 2 + (index % 4),
        rank: index + 1,
        selected: false,
        assignedTo: member.id,
        collaborationNeeded: index === 0 ? 'Cross-functional team input needed' : undefined,
        successMetrics: `Deliver comprehensive analysis with 3-5 actionable recommendations within ${2 + (index % 4)} hours`,
        businessImpact: {
          type: index % 2 === 0 ? 'strategic_advantage' : 'efficiency_gain',
          description: index % 2 === 0 
            ? 'Strategic insights can identify new opportunities and competitive advantages'
            : 'Process improvements can significantly boost individual and team productivity',
          estimatedValue: index % 2 === 0 ? 'Potential 15-20% strategic improvement' : '20-25% efficiency gain',
          timeframe: 'within 2-4 weeks'
        }
      }))
    })
    
    return fallbackTasks
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite AI COO specializing in team optimization and task distribution. You excel at creating balanced, collaborative workloads that maximize team productivity. Always respond with valid JSON containing exactly 6 task suggestions per team member."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    // Extract JSON from response
    let jsonStr = response
    if (response.includes('```json')) {
      jsonStr = response.split('```json')[1].split('```')[0]
    } else if (response.includes('```')) {
      jsonStr = response.split('```')[1]
    }

    // Parse JSON response
    const teamTasksRaw = JSON.parse(jsonStr.trim())
    
    // Transform to include IDs and required fields
    const teamTasks: Record<string, TeamTaskSuggestion[]> = {}
    
    // Create a mapping of expected member keys for normalization
    const memberKeyMap: Record<string, string> = {}
    teamMembers.forEach(member => {
      const normalizedKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
      memberKeyMap[member.name] = normalizedKey
      memberKeyMap[normalizedKey] = normalizedKey
      memberKeyMap[member.role] = normalizedKey
    })
    
    Object.entries(teamTasksRaw).forEach(([rawKey, tasks]) => {
      if (Array.isArray(tasks)) {
        // Find the correct member key or use the raw key if it's already correct
        let memberKey = rawKey
        if (memberKeyMap[rawKey]) {
          memberKey = memberKeyMap[rawKey]
        } else {
          // Try to find a matching member based on name
          const matchingMember = teamMembers.find(m => 
            rawKey.includes(m.name) || rawKey.includes(m.role) || 
            (m.role === 'Custom' && m.customRole && rawKey.includes(m.customRole))
          )
          if (matchingMember) {
            memberKey = `${matchingMember.name} - ${matchingMember.role === 'Custom' ? matchingMember.customRole : matchingMember.role}`
          }
        }
        
        teamTasks[memberKey] = tasks.map((task: { 
          title: string; 
          description?: string;
          reason: string; 
          priority?: string;
          estimatedHours?: number;
          rank?: number;
          collaborationNeeded?: string;
          successMetrics?: string;
          businessImpact?: {
            type: string;
            description: string;
            estimatedValue?: string;
            timeframe?: string;
          }
        }, taskIndex: number) => {
          return {
            id: `suggestion-${memberKey.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${taskIndex + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: task.title,
            description: task.description || task.title,
            reason: task.reason,
            priority: (['high', 'medium', 'low'].includes(task.priority || '') ? task.priority : 'medium') as 'low' | 'medium' | 'high',
            estimatedHours: task.estimatedHours || 3,
            rank: task.rank || (taskIndex + 1),
            selected: false,
            assignedTo: memberKey.split(' - ')[0] || 'unknown',
            collaborationNeeded: task.collaborationNeeded,
            successMetrics: task.successMetrics,
            businessImpact: task.businessImpact ? {
              type: task.businessImpact.type as BusinessImpactType,
              description: task.businessImpact.description,
              estimatedValue: task.businessImpact.estimatedValue,
              timeframe: task.businessImpact.timeframe
            } : undefined
          }
        })
      }
    })

    return teamTasks

  } catch (error) {
    console.error('Error generating team task suggestions:', error)
    throw error
  }
} 