import OpenAI from 'openai'
import { Goal, Task, TaskGenerationContext, TeamMember, TeamTask } from '@/types'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function generateDailyTasks(context: TaskGenerationContext): Promise<Omit<Task, 'id' | 'userId' | 'createdAt'>[]> {
  const { goals, previousTasks, knowledgeBase } = context

  const goalsText = goals.map(g => `${g.title} (${g.timeframe}, ${g.priority} priority): ${g.description}`).join('\n')
  const knowledgeText = knowledgeBase.map(kb => `${kb.category}: ${kb.content}`).join('\n')
  const recentTasksText = previousTasks.slice(-10).map(t => `${t.title}: ${t.explanation} (Priority: ${t.priority}, Completed: ${t.completed})`).join('\n')
  
  // Calculate completion patterns and bottlenecks
  const completionRate = previousTasks.length > 0 ? (previousTasks.filter(t => t.completed).length / previousTasks.length * 100).toFixed(1) : '0'
  const highPriorityTasks = previousTasks.filter(t => t.priority === 'high')
  const highPriorityCompletion = highPriorityTasks.length > 0 ? (highPriorityTasks.filter(t => t.completed).length / highPriorityTasks.length * 100).toFixed(1) : '0'

  const prompt = `You are an AI COO with expertise in predictive business analytics and tactical execution. Analyze the user's goals, historical performance, and business context to generate 3-5 high-impact daily tasks that predict and prevent future bottlenecks while accelerating goal achievement.

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
1. Generate tasks that are predictive of future challenges and opportunities
2. Include specific metrics, numbers, and measurable outcomes
3. Prioritize tasks that compound over time (network effects, process improvements)
4. Consider lead times - what needs to start today to meet future deadlines
5. Include one task that addresses a potential bottleneck before it occurs
6. Focus on leverage points that multiply impact across multiple goals

TASK GENERATION CRITERIA:
- Be specific about WHO, WHAT, WHEN, and measurable SUCCESS CRITERIA
- Include industry benchmarks where relevant (e.g., "industry average is X%, aim for Y%")
- Combine analytical insights with actionable next steps
- Vary difficulty levels to maintain momentum while driving growth
- Each task should have clear business justification tied to financial or strategic outcomes

Return JSON array with this exact structure:
[
  {
    "title": "Specific, action-oriented task with clear deliverable",
    "description": "Detailed step-by-step description including tools, metrics, and success criteria",
    "explanation": "Strategic reasoning connecting task to goals with specific business impact prediction (e.g., 'This typically increases X by Y% within Z timeframe based on industry data')",
    "priority": "high|medium|low",
    "completed": false,
    "dueDate": "${new Date().toISOString()}",
    "relatedGoalIds": ["array of relevant goal IDs"]
  }
]

Focus on tasks that move the needle significantly and set up future wins.`

  if (!openai) {
    throw new Error('OpenAI client not available')
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
    return tasks.map((task: { title: string; description: string; explanation: string; priority: string; relatedGoalIds?: string[] }) => ({
      title: task.title,
      description: task.description,
      explanation: task.explanation,
      priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
      completed: false,
      dueDate: new Date(),
      relatedGoalIds: task.relatedGoalIds || []
    }))

  } catch (error) {
    console.error('Error generating tasks:', error)
    throw error
  }
}

export async function generateTeamTasks(
  teamMembers: TeamMember[], 
  goals: Goal[]
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

  const prompt = `You are an AI COO with expertise in team optimization and cross-functional collaboration. Generate intelligent, balanced task assignments that maximize team productivity while ensuring equitable workload distribution.

COMPANY STRATEGIC GOALS:
${goalsText}

TEAM COMPOSITION (${teamSize} members):
${rolesText}

INDIVIDUAL TEAM MEMBERS:
${teamMembers.map((member, idx) => `${idx + 1}. ${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`).join('\n')}

TACTICAL REQUIREMENTS:
1. Distribute tasks fairly - no single person should get all high-priority tasks
2. Create interdependencies that encourage collaboration between roles
3. Generate tasks with reasonable difficulty spread (mix of quick wins and challenging work)
4. Include specific metrics and success criteria for each task
5. Ensure tasks leverage each person's unique expertise while supporting company goals
6. Include at least one collaborative task that requires 2+ team members
7. Consider realistic time constraints - tasks should be achievable in 1-2 days

TASK QUALITY STANDARDS:
- Be specific about deliverables, tools, and success metrics
- Include industry benchmarks where relevant
- Create tasks that compound value over time
- Address both urgent needs and strategic initiatives
- Ensure reasonable difficulty distribution across team members

For each team member, generate 2-3 specific tasks that align with their role and expertise while supporting company goals.

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
      "successMetrics": "Specific, measurable outcomes expected"
    }
  ]
}

Ensure balanced workload and create synergies between team members' tasks.`

  if (!openai) {
    throw new Error('OpenAI client not available')
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
    Object.entries(teamTasksRaw).forEach(([memberKey, tasks]) => {
      if (Array.isArray(tasks)) {
        teamTasks[memberKey] = tasks.map((task: { 
          title: string; 
          description?: string;
          reason: string; 
          priority?: string;
          estimatedHours?: number;
          collaborationNeeded?: string;
          successMetrics?: string;
        }, index: number) => ({
          id: `ai-${memberKey.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${index}-${Date.now()}`,
          title: task.title,
          description: task.description || task.title,
          reason: task.reason,
          priority: (['high', 'medium', 'low'].includes(task.priority || '') ? task.priority : 'medium') as 'low' | 'medium' | 'high',
          completed: false,
          dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000), // Staggered due dates
          assignedTo: memberKey.split(' - ')[0] || 'unknown'
        }))
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