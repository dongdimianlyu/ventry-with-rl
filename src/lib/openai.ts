import OpenAI from 'openai'
import { Goal, Task, TaskGenerationContext, TeamMember, TeamTask } from '@/types'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function generateDailyTasks(context: TaskGenerationContext): Promise<Omit<Task, 'id' | 'userId' | 'createdAt'>[]> {
  const { goals, previousTasks, knowledgeBase } = context

  const goalsText = goals.map(g => `${g.title} (${g.timeframe}, ${g.priority} priority): ${g.description}`).join('\n')
  const knowledgeText = knowledgeBase.map(kb => `${kb.category}: ${kb.content}`).join('\n')
  const recentTasksText = previousTasks.slice(-5).map(t => `${t.title}: ${t.explanation}`).join('\n')

  const prompt = `You are an AI COO helping prioritize daily tasks based on user goals and business knowledge.

USER GOALS:
${goalsText}

BUSINESS KNOWLEDGE:
${knowledgeText}

RECENT TASKS (for context):
${recentTasksText}

Generate 3-5 actionable daily tasks that directly support the user's goals. For each task:
1. Make it specific and actionable (not vague)
2. Provide a clear explanation of WHY this task matters
3. Connect it to the user's stated goals
4. Consider the business context and best practices

Return JSON array with this structure:
[
  {
    "title": "specific actionable task",
    "description": "detailed description of what to do",
    "explanation": "why this task matters and how it connects to goals",
    "priority": "high|medium|low",
    "completed": false,
    "dueDate": "today's date in ISO format",
    "relatedGoalIds": ["array of goal IDs this relates to"]
  }
]

Focus on high-impact activities that move the needle on the stated goals.`

  if (!openai) {
    throw new Error('OpenAI client not available')
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI COO that generates smart, actionable daily tasks. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    // Parse JSON response
    const tasks = JSON.parse(response)
    
    // Validate and transform tasks
    return tasks.map((task: { title: string; description: string; explanation: string; priority: string; relatedGoalIds?: string[] }) => ({
      title: task.title,
      description: task.description,
      explanation: task.explanation,
      priority: task.priority,
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
  
  const prompt = `You are an AI COO generating daily tasks for team members based on company goals and their roles.

COMPANY GOALS:
${goalsText}

TEAM MEMBERS:
${teamMembers.map(member => `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`).join('\n')}

For each team member, generate 2-3 specific, actionable tasks that:
1. Align with their role and expertise
2. Support the company's overall goals
3. Are realistic for a single day
4. Include a clear reason/justification

Return JSON object with this structure:
{
  "Team Member Name - Role": [
    {
      "title": "specific task",
      "reason": "why this task matters for the company goals",
      "priority": "high|medium|low"
    }
  ]
}

Focus on role-specific tasks that contribute to the company's success.`

  if (!openai) {
    throw new Error('OpenAI client not available')
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI COO that generates role-specific daily tasks for team members. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    // Parse JSON response
    const teamTasksRaw = JSON.parse(response)
    
    // Transform to include IDs and completed status
    const teamTasks: Record<string, TeamTask[]> = {}
    Object.entries(teamTasksRaw).forEach(([memberKey, tasks]) => {
      if (Array.isArray(tasks)) {
        teamTasks[memberKey] = tasks.map((task: { title: string; reason: string; priority?: string }, index: number) => ({
          id: `ai-${memberKey.replace(/\s+/g, '-').toLowerCase()}-${index}-${Date.now()}`,
          title: task.title,
          reason: task.reason,
          priority: (task.priority === 'high' || task.priority === 'medium' || task.priority === 'low' ? task.priority : 'medium') as 'low' | 'medium' | 'high',
          completed: false
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

  const prompt = `Explain why this task is important for the user's goals:

TASK: ${task.title}
DESCRIPTION: ${task.description}

RELATED GOALS:
${goalsContext}

Provide a concise explanation (1-2 sentences) that connects this task to the user's goals and explains the business logic behind prioritizing it.`

  if (!openai) {
    return 'Task supports your stated goals.'
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI COO that explains task prioritization with clear business logic."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 200
    })

    return completion.choices[0]?.message?.content || 'Task supports your stated goals.'
  } catch (error) {
    console.error('Error explaining task:', error)
    return 'Task supports your stated goals.'
  }
} 