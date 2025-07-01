import OpenAI from 'openai'
import { Goal, Task, TaskGenerationContext } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

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

export async function explainTask(task: Task, goals: Goal[]): Promise<string> {
  const relatedGoals = goals.filter(g => task.relatedGoalIds.includes(g.id))
  const goalsContext = relatedGoals.map(g => `${g.title}: ${g.description}`).join('\n')

  const prompt = `Explain why this task is important for the user's goals:

TASK: ${task.title}
DESCRIPTION: ${task.description}

RELATED GOALS:
${goalsContext}

Provide a concise explanation (1-2 sentences) that connects this task to the user's goals and explains the business logic behind prioritizing it.`

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