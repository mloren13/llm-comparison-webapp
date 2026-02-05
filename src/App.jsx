import { useState, useMemo } from 'react'

// Benchmark descriptions
const benchmarkDescriptions = {
  MMLU: "Massive Multitask Language Understanding - Tests knowledge across subjects like math, history, law, and medicine. Higher = smarter general knowledge.",
  HellaSwag: "Tests commonsense reasoning - understanding what happens next in everyday situations. Like a 'common sense' quiz for AI. Higher = better understanding of how the world works.",
  HumanEval: "Measures coding ability - can the AI write working code? Tests on real programming problems. Higher = better at writing code.",
  GPQA: "Graduate-Level Google-Proof Q&A - Very hard science questions (graduate level). Tests expert-level knowledge. Higher = more expert-level understanding."
}

// Cost calculation explanation
const costExplanation = "Estimated monthly cost = (Input tokens × Input price) + (Output tokens × Output price) ÷ 1,000,000. Adjust the token inputs in the filters above to calculate costs for your specific usage."

// Task cost estimates (average tokens per task)
const taskEstimates = {
  "Quick Question": { input: 500, output: 1000 },
  "Email Reply": { input: 2000, output: 3000 },
  "Code Generation": { input: 3000, output: 5000 },
  "Long Document": { input: 10000, output: 15000 },
  "Complex Analysis": { input: 20000, output: 30000 }
}

// Context/tier categories with colors
const contextOptions = {
  "Flagship": { color: '#e74c3c', desc: "Top-tier models for enterprise and complex tasks" },
  "Balanced": { color: '#3498db', desc: "Good performance-to-cost ratio for general use" },
  "Budget": { color: '#27ae60', desc: "Cost-effective options for high-volume workloads" },
  "Specialized Coding": { color: '#9b59b6', desc: "Optimized specifically for code generation" },
  "Reasoning Focus": { color: '#f39c12', desc: "Step-by-step thinking for math/logic problems" },
  "Conversational": { color: '#1abc9c', desc: "Optimized for chat and dialogue" },
  "Open Source": { color: '#e91e63', desc: "Self-hostable, fully customizable" },
  "Free Tier": { color: '#00bcd4', desc: "No-cost options with usage limits" }
}

// Active models with context
const models = [
  { 
    id: 1, name: 'Google Gemini 3 Flash', mmlu: 82.4, hellaswag: 89.2, humaneval: 74.6, gpqa: 49.2, inputCost: 0.075, outputCost: 0.30, openSource: false,
    free: false, context: "Balanced",
    pros: "Excellent value, large 1M context window, fast inference, strong vision capabilities",
    cons: "Rate limits on free tier, smaller than Pro version, may lack creativity",
    bestFor: "Production apps, image analysis, cost-sensitive projects",
    priceNote: "Best cost-performance ratio for production use"
  },
  { 
    id: 2, name: 'Google Gemini 3 Pro', mmlu: 86.8, hellaswag: 91.5, humaneval: 78.4, gpqa: 54.8, inputCost: 1.25, outputCost: 5.00, openSource: false,
    free: false, context: "Flagship",
    pros: "Best-in-class performance, massive 2M context window, excellent reasoning, top vision",
    cons: "Expensive, rate limits, overkill for simple tasks",
    bestFor: "Research, complex analysis, long documents, enterprise use",
    priceNote: "Premium pricing for premium performance"
  },
  { 
    id: 3, name: 'DeepSeek V3.2', mmlu: 85.2, hellaswag: 90.8, humaneval: 82.6, gpqa: 52.4, inputCost: 0.14, outputCost: 0.28, openSource: false,
    free: false, context: "Budget",
    pros: "Outstanding coding performance, lowest per-token cost, strong reasoning, open API",
    cons: "Rate limits, Chinese company (data privacy concerns), inconsistent availability",
    bestFor: "Coding-heavy workloads, budget-conscious teams, high-volume apps",
    priceNote: "Best value for coding tasks, 50-80% cheaper than US alternatives"
  },
  { 
    id: 4, name: 'Qwen3 Coder', mmlu: 83.6, hellaswag: 89.8, humaneval: 85.2, gpqa: 48.6, inputCost: 0.07, outputCost: 0.28, openSource: false,
    free: false, context: "Specialized Coding",
    pros: "Highest HumanEval score, excellent for code generation, very low cost, good debugging",
    cons: "Smaller model, weaker non-coding tasks, less reasoning depth",
    bestFor: "Code generation, refactoring, debugging, cost-optimized development",
    priceNote: "Cheapest option for pure coding, great for dev tools"
  },
  { 
    id: 5, name: 'Mistral Devstral 25.12', mmlu: 84.2, hellaswag: 90.2, humaneval: 80.4, gpqa: 51.8, inputCost: 0.30, outputCost: 0.90, openSource: false,
    free: false, context: "Balanced",
    pros: "Strong balanced performance, European company (GDPR compliant), good reasoning",
    cons: "Less brand recognition, fewer integrations, mid-tier pricing",
    bestFor: "European projects, GDPR-sensitive applications, balanced workloads",
    priceNote: "Middle-ground pricing with EU compliance benefit"
  },
  { 
    id: 6, name: 'Mistral Codestral 25.08', mmlu: 82.8, hellaswag: 89.4, humaneval: 84.8, gpqa: 49.4, inputCost: 0.25, outputCost: 0.75, openSource: false,
    free: false, context: "Specialized Coding",
    pros: "Code-specialized, excellent code quality, good documentation, reliable outputs",
    cons: "Less versatile, weaker general reasoning, no vision capabilities",
    bestFor: "Code generation, refactoring, code review, technical docs",
    priceNote: "Specialized for code, reasonable pricing for its niche"
  },
  { 
    id: 7, name: 'Moonshot AI Kimi K2.5', mmlu: 85.8, hellaswag: 91.2, humaneval: 79.4, gpqa: 53.2, inputCost: 0.50, outputCost: 1.00, openSource: false,
    free: false, context: "Balanced",
    pros: "Strong all-around, excellent reasoning, good coding, competitive performance",
    cons: "Asian market focus, less Western support, mid-range pricing",
    bestFor: "General-purpose AI, multilingual tasks, Asian market apps",
    priceNote: "Competitive mid-tier, good for mixed workloads"
  },
  { 
    id: 8, name: 'Claude 3.5 Haiku', mmlu: 84.6, hellaswag: 90.4, humaneval: 76.8, gpqa: 51.2, inputCost: 0.25, outputCost: 1.25, openSource: false,
    free: false, context: "Conversational",
    pros: "Anthropic quality, fast responses, reliable outputs, good for conversation",
    cons: "Higher output costs, no free tier, may be verbose",
    bestFor: "Chatbots, conversation AI, quick queries, customer service",
    priceNote: "Higher output cost but excellent for conversational AI"
  },
  { 
    id: 9, name: 'xAI Grok 4.1 Fast', mmlu: 83.4, hellaswag: 89.6, humaneval: 75.4, gpqa: 50.4, inputCost: 0.15, outputCost: 0.60, openSource: false,
    free: false, context: "Balanced",
    pros: "Good performance, xAI ecosystem, fast responses, X integration",
    cons: "Less established, smaller community, limited track record",
    bestFor: "xAI ecosystem projects, Twitter/X integration, fast reasoning",
    priceNote: "Mid-range pricing with ecosystem benefits"
  },
  { 
    id: 10, name: 'Meta Llama 4 Maverick', mmlu: 82.6, hellaswag: 88.8, humaneval: 74.8, gpqa: 48.8, inputCost: 0.20, outputCost: 0.60, openSource: true,
    free: false, context: "Open Source",
    pros: "Fully open-source, self-hostable, no API costs, customizable, privacy-focused",
    cons: "Requires technical setup, self-hosting costs, less polished than commercial",
    bestFor: "Self-hosting, privacy-sensitive apps, customization, research",
    priceNote: "Free to use but requires hosting/infrastructure costs"
  },
  { 
    id: 11, name: 'Meta Llama 4 Scout', mmlu: 78.4, hellaswag: 86.2, humaneval: 68.4, gpqa: 45.6, inputCost: 0.10, outputCost: 0.30, openSource: true,
    free: false, context: "Open Source",
    pros: "Lightweight, fastest inference, fully open-source, lowest commercial cost",
    cons: "Lower performance, not for complex reasoning, requires optimization",
    bestFor: "Edge deployment, simple tasks, learning, hobby projects",
    priceNote: "Cheapest commercial API + open-source option"
  },
  { 
    id: 12, name: 'Qwen3 Thinking 30B', mmlu: 80.6, hellaswag: 88.4, humaneval: 71.2, gpqa: 47.8, inputCost: 0.10, outputCost: 0.40, openSource: false,
    free: false, context: "Reasoning Focus",
    pros: "Reasoning-focused, step-by-step thinking, low cost, good for math/logic",
    cons: "Smaller model, slower due to thinking process, weaker coding",
    bestFor: "Math problems, logical reasoning, step-by-step analysis, tutoring",
    priceNote: "Low cost for reasoning-heavy tasks"
  },
  { 
    id: 13, name: 'MiniMax M2.1 (Free)', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0, outputCost: 0, openSource: false,
    free: true, context: "Free Tier",
    pros: "Completely free, excellent all-around performance, strong reasoning, great for development",
    cons: "Usage limits, rate limits, no commercial SLA, newer with limited track record",
    bestFor: "Personal projects, development, testing, learning, prototyping",
    priceNote: "FREE with subscription (limits apply)"
  },
  { 
    id: 14, name: 'MiniMax M2.1 (Paid)', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0.50, outputCost: 1.00, openSource: false,
    free: false, context: "Balanced",
    pros: "Same performance as free tier, unlimited usage, commercial use allowed, good support",
    cons: "Still newer than competitors, less established, pricing may change",
    bestFor: "Production apps, commercial use, unlimited usage needs",
    priceNote: "Reasonable paid tier, similar to Moonshot pricing"
  },
  { 
    id: 15, name: 'MiniMax Lightning', mmlu: 82.2, hellaswag: 88.8, humaneval: 76.4, gpqa: 49.8, inputCost: 0, outputCost: 0, openSource: false,
    free: true, context: "Free Tier",
    pros: "Fastest option, free tier, good for simple quick tasks",
    cons: "Lower performance than standard M2.1, usage limits",
    bestFor: "Quick queries, high-volume simple tasks, prototyping",
    priceNote: "FREE with subscription - fastest option"
  },
]

// Notable mentions (disabled models)
const notableModels = [
  { name: 'Claude 3.7 Sonnet', provider: 'Anthropic', context: 'Flagship', price: '$3/$15', reason: "Anthropic's top model, excellent for complex reasoning and coding" },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', context: 'Flagship', price: '$3/$15', reason: "Former flagship, excellent balance of capability and speed" },
  { name: 'GPT-4 Turbo', provider: 'OpenAI', context: 'Flagship', price: '$10/$30', reason: "OpenAI's top model, excellent reasoning and tool use" },
  { name: 'GPT-4o', provider: 'OpenAI', context: 'Flagship', price: '$5/$15', reason: "Omni model with excellent vision and audio capabilities" },
  { name: 'GPT-3.5 Turbo', provider: 'OpenAI', context: 'Budget', price: '$0.50/$1.50', reason: "Inexpensive option for simple tasks and high-volume workloads" },
  { name: 'DeepSeek Chat', provider: 'DeepSeek', context: 'Budget', price: '$0.14/$0.28', reason: "Chat-focused version of DeepSeek, great value" },
  { name: 'Qwen 2.5', provider: 'Alibaba', context: 'Budget', price: '$0.07/$0.14', reason: "Extremely low cost, good for simple tasks" },
  { name: 'CodeLlama 70B', provider: 'Meta', context: 'Specialized Coding', price: 'Open Source', reason: "Meta's code-specialized model, fully open-source" },
  { name: 'StarCoder 2', provider: 'BigCode', context: 'Specialized Coding', price: 'Open Source', reason: "Open-source code model, trained on 300+ languages" },
  { name: 'WizardMath', provider: 'Microsoft', context: 'Reasoning Focus', price: 'Open Source', reason: "Math-specialized open-source model" },
  { name: 'Llama 3.1 Instruct', provider: 'Meta', context: 'Conversational', price: 'Open Source', reason: "Meta's instruction-tuned model, excellent for chat" },
  { name: 'Gemma 2', provider: 'Google', context: 'Conversational', price: 'Open Source', reason: "Google's lightweight open-source chat model" },
  { name: 'Command R+', provider: 'Cohere', context: 'Flagship', price: '$0.50/$2.00', reason: "Enterprise-focused, excellent RAG capabilities" },
  { name: 'Azure AI', provider: 'Microsoft', context: 'Enterprise', price: 'Varies', reason: "Enterprise deployment with Microsoft integration" },
  { name: 'Amazon Titan', provider: 'AWS', context: 'Enterprise', price: 'Varies', reason: "AWS's integrated AI service for enterprise" },
]

function Tooltip({ text, children }) {
  return (
    <span className="tooltip-container" title={text}>
      {children}
    </span>
  )
}

function ComparisonSection({ models }) {
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id || null)
  
  const selectedModel = models.find(m => m.id === Number(selectedModelId)) || models[0]
  
  const calculatePercentage = (model, selected, metric) => {
    const val1 = model[metric]
    const val2 = selected[metric]
    if (val2 === 0) return { value: val1, pct: 0, label: 'N/A' }
    const pct = (val1 / val2) * 100
    return { value: val1, pct: pct, label: `${pct.toFixed(0)}%` }
  }
  
  const getPctClass = (pct) => {
    if (pct >= 100) return 'positive-diff'
    if (pct >= 95) return 'neutral-diff'
    return 'negative-diff'
  }
  
  const getContextColor = (context) => {
    return contextOptions[context]?.color || '#888'
  }
  
  return (
    <div className="table-section">
      <h2>📊 Model Comparison (% of Baseline)</h2>
      <p className="table-description">Select a model as baseline. All other models show their performance as a percentage of this baseline (100% = same performance).</p>
      
      <div className="comparison-selector" style={{ padding: '0 15px' }}>
        <label>
          <strong>Select baseline model:</strong>
          <select 
            value={selectedModelId || ''}
            onChange={(e) => setSelectedModelId(Number(e.target.value))}
            style={{ 
              marginLeft: '10px', 
              padding: '10px 15px', 
              fontSize: '1em',
              fontWeight: '600',
              color: '#1a1a2e',
              background: '#ffffff',
              border: '2px solid #667eea',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            {models.map(model => (
              <option key={model.id} value={model.id} style={{ fontWeight: '600', color: '#1a1a2e' }}>
                {model.name}
              </option>
            ))}
          </select>
          <span className="comparison-badge">Baseline: {selectedModel?.name}</span>
        </label>
      </div>
      
      <div className="table-container">
        <table className="model-table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Model</th>
              <th><Tooltip text={benchmarkDescriptions.MMLU}>MMLU</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.HellaSwag}>HellaSwag</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.HumanEval}>HumanEval</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.GPQA}>GPQA</Tooltip></th>
              <th>Context</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {models.map(model => {
              const isSelected = model.id === selectedModel.id
              const contextColor = getContextColor(model.context)
              
              return (
                <tr key={model.id} style={{ background: isSelected ? 'rgba(103, 126, 234, 0.15)' : undefined }}>
                  <td>
                    <strong>{model.name}</strong>
                    {model.free && <span style={{ marginLeft: '8px', background: '#11998e', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>FREE</span>}
                    {model.openSource && <span style={{ marginLeft: '8px', background: '#9b59b6', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>OPEN SOURCE</span>}
                  </td>
                  <td>
                    <span style={{ fontWeight: isSelected ? '600' : '400', color: isSelected ? '#e0e0e0' : '#c0c0c0' }}>
                      {model.mmlu}%
                    </span>
                    {!isSelected && <span className={getPctClass((model.mmlu / selectedModel.mmlu) * 100)} style={{ marginLeft: '8px', fontSize: '0.85em', fontWeight: '600' }}>{((model.mmlu / selectedModel.mmlu) * 100).toFixed(0)}%</span>}
                  </td>
                  <td>
                    <span style={{ fontWeight: isSelected ? '600' : '400', color: isSelected ? '#e0e0e0' : '#c0c0c0' }}>
                      {model.hellaswag}%
                    </span>
                    {!isSelected && <span className={getPctClass((model.hellaswag / selectedModel.hellaswag) * 100)} style={{ marginLeft: '8px', fontSize: '0.85em', fontWeight: '600' }}>{((model.hellaswag / selectedModel.hellaswag) * 100).toFixed(0)}%</span>}
                  </td>
                  <td>
                    <span style={{ fontWeight: isSelected ? '600' : '400', color: isSelected ? '#e0e0e0' : '#c0c0c0' }}>
                      {model.humaneval}%
                    </span>
                    {!isSelected && <span className={getPctClass((model.humaneval / selectedModel.humaneval) * 100)} style={{ marginLeft: '8px', fontSize: '0.85em', fontWeight: '600' }}>{((model.humaneval / selectedModel.humaneval) * 100).toFixed(0)}%</span>}
                  </td>
                  <td>
                    <span style={{ fontWeight: isSelected ? '600' : '400', color: isSelected ? '#e0e0e0' : '#c0c0c0' }}>
                      {model.gpqa}%
                    </span>
                    {!isSelected && <span className={getPctClass((model.gpqa / selectedModel.gpqa) * 100)} style={{ marginLeft: '8px', fontSize: '0.85em', fontWeight: '600' }}>{((model.gpqa / selectedModel.gpqa) * 100).toFixed(0)}%</span>}
                  </td>
                  <td>
                    <span style={{ 
                      background: contextColor, 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '8px', 
                      fontSize: '0.75em',
                      fontWeight: '600'
                    }}>
                      {model.context}
                    </span>
                  </td>
                  <td>
                    <span className={model.free ? 'best-value' : ''} style={{ fontWeight: '600' }}>
                      {model.free ? 'FREE' : `$${model.inputCost.toFixed(2)}/$${model.outputCost.toFixed(2)}`}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      <p className="table-description" style={{ marginTop: '15px', fontSize: '0.85em' }}>
        💡 How to read: If baseline has 80% MMLU and another model shows 95%, that model achieves 95% of the baseline's performance.
      </p>
    </div>
  )
}

function CostBreakdownTable({ models }) {
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id || null)
  const selectedModel = models.find(m => m.id === Number(selectedModelId)) || models[0]
  
  const calculateTaskCost = (model, taskName) => {
    const task = taskEstimates[taskName]
    if (!task) return { cost: 0 }
    return { cost: (task.input * model.inputCost / 1000000) + (task.output * model.outputCost / 1000000), free: model.free }
  }
  
  const getContextColor = (context) => contextOptions[context]?.color || '#888'
  
  return (
    <div className="table-section">
      <h2>💰 Cost Breakdown by Task</h2>
      <p className="table-description">Shows absolute cost and context for each model across different task types.</p>
      
      <div className="comparison-selector" style={{ padding: '0 15px', marginBottom: '15px' }}>
        {Object.entries(contextOptions).map(([ctx, info]) => (
          <span key={ctx} style={{ marginRight: '15px', fontSize: '0.85em' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: info.color, marginRight: '5px' }}></span>
            {ctx}
          </span>
        ))}
      </div>
      
      <div className="table-container">
        <table className="model-table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Model</th>
              <th style={{ width: '12%' }}>Context</th>
              {Object.keys(taskEstimates).map(task => (
                <th key={task} style={{ width: '14%' }}>
                  <Tooltip text={`Average tokens for ${task}: ${taskEstimates[task].input + taskEstimates[task].output} tokens`}>
                    {task}
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map(model => {
              const contextColor = getContextColor(model.context)
              
              return (
                <tr key={model.id}>
                  <td>
                    <strong>{model.name}</strong>
                    {model.free && <span style={{ marginLeft: '8px', background: '#11998e', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>FREE</span>}
                  </td>
                  <td>
                    <span style={{ background: contextColor, color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75em', fontWeight: '600' }}>
                      {model.context}
                    </span>
                  </td>
                  {Object.keys(taskEstimates).map(task => {
                    const { cost, free } = calculateTaskCost(model, task)
                    return (
                      <td key={task}>
                        {free ? (
                          <span className="best-value" style={{ fontWeight: '600' }}>FREE</span>
                        ) : (
                          <span style={{ fontWeight: '600', color: '#c0c0c0' }}>${cost.toFixed(4)}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NotableMentions() {
  const getContextColor = (context) => contextOptions[context]?.color || '#888'
  
  return (
    <div className="table-section">
      <h2>⭐ Notable Mentions (Disabled Models)</h2>
      <p className="table-description">Other relevant models worth considering but not currently enabled in the comparison. Grayed out = not active.</p>
      
      <div className="table-container" style={{ opacity: 0.8 }}>
        <table className="model-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Model</th>
              <th style={{ width: '12%' }}>Provider</th>
              <th style={{ width: '12%' }}>Context</th>
              <th style={{ width: '12%' }}>Price</th>
              <th style={{ width: '42%' }}>Why Consider</th>
            </tr>
          </thead>
          <tbody>
            {notableModels.map((model, index) => {
              const contextColor = getContextColor(model.context)
              
              return (
                <tr key={index} style={{ opacity: 0.5 }}>
                  <td><strong>{model.name}</strong></td>
                  <td>{model.provider}</td>
                  <td>
                    <span style={{ background: contextColor, color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75em', fontWeight: '600' }}>
                      {model.context}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85em', color: '#aaa' }}>{model.price}</td>
                  <td style={{ fontSize: '0.85em' }}>{model.reason}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function App() {
  const [sortBy, setSortBy] = useState('mmlu')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterFree, setFilterFree] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredModels = useMemo(() => {
    let result = models.filter(model => {
      if (filterFree && !model.free && !model.openSource) return false
      if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })

    result.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

    return result
  }, [sortBy, sortOrder, filterFree, searchTerm])

  const totals = useMemo(() => ({
    models: filteredModels.length,
    freeModels: filteredModels.filter(m => m.free).length,
    openSourceModels: filteredModels.filter(m => m.openSource).length,
    avgMmlu: (filteredModels.reduce((sum, m) => sum + m.mmlu, 0) / filteredModels.length).toFixed(1),
  }), [filteredModels])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getContextColor = (context) => contextOptions[context]?.color || '#888'

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 LLM Model Comparison</h1>
        <p>Compare AI models across benchmarks, costs, and use cases</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{totals.models}</h3>
          <p>Models Compared</p>
        </div>
        <div className="stat-card">
          <h3>{totals.freeModels}</h3>
          <p>Free Options</p>
        </div>
        <div className="stat-card">
          <h3>{totals.openSourceModels}</h3>
          <p>Open Source</p>
        </div>
        <div className="stat-card">
          <h3>{totals.avgMmlu}%</h3>
          <p>Avg MMLU Score</p>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>🔍 Search Models</label>
          <input 
            type="text" 
            placeholder="Type to search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>
            <input 
              type="checkbox" 
              checked={filterFree}
              onChange={(e) => setFilterFree(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Show Free & Open Source Only
          </label>
        </div>
      </div>

      <ComparisonSection models={filteredModels} />
      <CostBreakdownTable models={filteredModels} />

      <div className="table-section">
        <h2>📈 Performance Metrics & Costs</h2>
        <p className="table-description">Click any column header to sort.</p>
        
        <div className="table-container">
          <table className="model-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Model {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('mmlu')}>MMLU {sortBy === 'mmlu' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('hellaswag')}>HellaSwag {sortBy === 'hellaswag' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('humaneval')}>HumanEval {sortBy === 'humaneval' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('gpqa')}>GPQA {sortBy === 'gpqa' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th>Context</th>
                <th>Input ($/M)</th>
                <th>Output ($/M)</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map(model => {
                const contextColor = getContextColor(model.context)
                return (
                  <tr key={model.id}>
                    <td>
                      <strong>{model.name}</strong>
                      {model.free && <span style={{ marginLeft: '10px', background: '#11998e', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8em' }}>FREE</span>}
                      {model.openSource && <span style={{ marginLeft: '10px', background: '#9b59b6', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8em' }}>OPEN SOURCE</span>}
                    </td>
                    <td>{model.mmlu}%</td>
                    <td>{model.hellaswag}%</td>
                    <td>{model.humaneval}%</td>
                    <td>{model.gpqa}%</td>
                    <td>
                      <span style={{ background: contextColor, color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75em', fontWeight: '600' }}>
                        {model.context}
                      </span>
                    </td>
                    <td>${model.inputCost.toFixed(3)}</td>
                    <td>${model.outputCost.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NotableMentions />

      <footer className="footer">
        <p>Built with React + Vite | <a href="https://github.com/mloren13/llm-comparison-webapp" target="_blank" rel="noopener noreferrer">View on GitHub</a></p>
      </footer>
    </div>
  )
}

export default App
