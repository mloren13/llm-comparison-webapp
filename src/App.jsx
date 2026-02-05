import { useState, useMemo } from 'react'

// Benchmark descriptions
const benchmarkDescriptions = {
  MMLU: "Massive Multitask Language Understanding - Tests knowledge across subjects like math, history, law, and medicine. Higher = smarter general knowledge.",
  HellaSwag: "Tests commonsense reasoning - understanding what happens next in everyday situations. Like a 'common sense' quiz for AI. Higher = better understanding of how the world works.",
  HumanEval: "Measures coding ability - can the AI write working code? Tests on real programming problems. Higher = better at writing code.",
  GPQA: "Graduate-Level Google-Proof Q&A - Very hard science questions (graduate level). Tests expert-level knowledge. Higher = more expert-level understanding."
}

// Cost calculation explanation
const costExplanation = "Estimated monthly cost = (Input tokens × Input price) + (Output tokens × Output price) ÷ 1,000,000"

// Task cost estimates (average tokens per task)
const taskEstimates = {
  "Quick Question": { input: 500, output: 1000 },
  "Email Reply": { input: 2000, output: 3000 },
  "Code Generation": { input: 3000, output: 5000 },
  "Long Document": { input: 10000, output: 15000 },
  "Complex Analysis": { input: 20000, output: 30000 }
}

// Category/tier classifications with colors
const categoryOptions = {
  "Flagship": { color: '#e74c3c', desc: "Top-tier models for enterprise and complex tasks" },
  "Balanced": { color: '#3498db', desc: "Good performance-to-cost ratio for general use" },
  "Budget": { color: '#27ae60', desc: "Cost-effective options for high-volume workloads" },
  "Specialized Coding": { color: '#9b59b6', desc: "Optimized specifically for code generation" },
  "Reasoning Focus": { color: '#f39c12', desc: "Step-by-step thinking for math/logic problems" },
  "Conversational": { color: '#1abc9c', desc: "Optimized for chat and dialogue" },
  "Open Source": { color: '#e91e63', desc: "Self-hostable, fully customizable" },
  "Free Tier": { color: '#00bcd4', desc: "No-cost options with usage limits" }
}

// Active models with category and context window
const models = [
  { 
    id: 1, name: 'Google Gemini 3 Flash', mmlu: 82.4, hellaswag: 89.2, humaneval: 74.6, gpqa: 49.2, inputCost: 0.075, outputCost: 0.30, openSource: false,
    free: false, category: "Balanced", contextWindow: "1M",
    pros: "Excellent value, large 1M context window, fast inference, strong vision capabilities",
    cons: "Rate limits on free tier, smaller than Pro version, may lack creativity",
    bestFor: "Production apps, image analysis, cost-sensitive projects",
    priceNote: "Best cost-performance ratio"
  },
  { 
    id: 2, name: 'Google Gemini 3 Pro', mmlu: 86.8, hellaswag: 91.5, humaneval: 78.4, gpqa: 54.8, inputCost: 1.25, outputCost: 5.00, openSource: false,
    free: false, category: "Flagship", contextWindow: "2M",
    pros: "Best-in-class performance, massive 2M context window, excellent reasoning, top vision",
    cons: "Expensive, rate limits, overkill for simple tasks",
    bestFor: "Research, complex analysis, long documents, enterprise use",
    priceNote: "Premium pricing"
  },
  { 
    id: 3, name: 'DeepSeek V3.2', mmlu: 85.2, hellaswag: 90.8, humaneval: 82.6, gpqa: 52.4, inputCost: 0.14, outputCost: 0.28, openSource: false,
    free: false, category: "Budget", contextWindow: "128K",
    pros: "Outstanding coding performance, lowest per-token cost, strong reasoning, open API",
    cons: "Rate limits, Chinese company (data privacy concerns), inconsistent availability",
    bestFor: "Coding-heavy workloads, budget-conscious teams, high-volume apps",
    priceNote: "50-80% cheaper than US alternatives"
  },
  { 
    id: 4, name: 'Qwen3 Coder', mmlu: 83.6, hellaswag: 89.8, humaneval: 85.2, gpqa: 48.6, inputCost: 0.07, outputCost: 0.28, openSource: false,
    free: false, category: "Specialized Coding", contextWindow: "32K",
    pros: "Highest HumanEval score, excellent for code generation, very low cost, good debugging",
    cons: "Smaller model, weaker non-coding tasks, less reasoning depth",
    bestFor: "Code generation, refactoring, debugging, cost-optimized development",
    priceNote: "Cheapest for pure coding"
  },
  { 
    id: 5, name: 'Mistral Devstral 25.12', mmlu: 84.2, hellaswag: 90.2, humaneval: 80.4, gpqa: 51.8, inputCost: 0.30, outputCost: 0.90, openSource: false,
    free: false, category: "Balanced", contextWindow: "128K",
    pros: "Strong balanced performance, European company (GDPR compliant), good reasoning",
    cons: "Less brand recognition, fewer integrations, mid-tier pricing",
    bestFor: "European projects, GDPR-sensitive applications, balanced workloads",
    priceNote: "EU compliance benefit"
  },
  { 
    id: 6, name: 'Mistral Codestral 25.08', mmlu: 82.8, hellaswag: 89.4, humaneval: 84.8, gpqa: 49.4, inputCost: 0.25, outputCost: 0.75, openSource: false,
    free: false, category: "Specialized Coding", contextWindow: "64K",
    pros: "Code-specialized, excellent code quality, good documentation, reliable outputs",
    cons: "Less versatile, weaker general reasoning, no vision capabilities",
    bestFor: "Code generation, refactoring, code review, technical docs",
    priceNote: "Reasonable for code niche"
  },
  { 
    id: 7, name: 'Moonshot AI Kimi K2.5', mmlu: 85.8, hellaswag: 91.2, humaneval: 79.4, gpqa: 53.2, inputCost: 0.50, outputCost: 1.00, openSource: false,
    free: false, category: "Balanced", contextWindow: "200K",
    pros: "Strong all-around, excellent reasoning, good coding, competitive performance",
    cons: "Asian market focus, less Western support, mid-range pricing",
    bestFor: "General-purpose AI, multilingual tasks, Asian market apps",
    priceNote: "Good for mixed workloads"
  },
  { 
    id: 8, name: 'Claude 3.5 Haiku', mmlu: 84.6, hellaswag: 90.4, humaneval: 76.8, gpqa: 51.2, inputCost: 0.25, outputCost: 1.25, openSource: false,
    free: false, category: "Conversational", contextWindow: "200K",
    pros: "Anthropic quality, fast responses, reliable outputs, good for conversation",
    cons: "Higher output costs, no free tier, may be verbose",
    bestFor: "Chatbots, conversation AI, quick queries, customer service",
    priceNote: "Higher output cost"
  },
  { 
    id: 9, name: 'xAI Grok 4.1 Fast', mmlu: 83.4, hellaswag: 89.6, humaneval: 75.4, gpqa: 50.4, inputCost: 0.15, outputCost: 0.60, openSource: false,
    free: false, category: "Balanced", contextWindow: "131K",
    pros: "Good performance, xAI ecosystem, fast responses, X integration",
    cons: "Less established, smaller community, limited track record",
    bestFor: "xAI ecosystem projects, Twitter/X integration, fast reasoning",
    priceNote: "Mid-range pricing"
  },
  { 
    id: 10, name: 'Meta Llama 4 Maverick', mmlu: 82.6, hellaswag: 88.8, humaneval: 74.8, gpqa: 48.8, inputCost: 0.20, outputCost: 0.60, openSource: true,
    free: false, category: "Open Source", contextWindow: "128K",
    pros: "Fully open-source, self-hostable, no API costs, customizable, privacy-focused",
    cons: "Requires technical setup, self-hosting costs, less polished than commercial",
    bestFor: "Self-hosting, privacy-sensitive apps, customization, research",
    priceNote: "Free to use (hosting costs apply)"
  },
  { 
    id: 11, name: 'Meta Llama 4 Scout', mmlu: 78.4, hellaswag: 86.2, humaneval: 68.4, gpqa: 45.6, inputCost: 0.10, outputCost: 0.30, openSource: true,
    free: false, category: "Open Source", contextWindow: "32K",
    pros: "Lightweight, fastest inference, fully open-source, lowest commercial cost",
    cons: "Lower performance, not for complex reasoning, requires optimization",
    bestFor: "Edge deployment, simple tasks, learning, hobby projects",
    priceNote: "Cheapest commercial + open-source"
  },
  { 
    id: 12, name: 'Qwen3 Thinking 30B', mmlu: 80.6, hellaswag: 88.4, humaneval: 71.2, gpqa: 47.8, inputCost: 0.10, outputCost: 0.40, openSource: false,
    free: false, category: "Reasoning Focus", contextWindow: "32K",
    pros: "Reasoning-focused, step-by-step thinking, low cost, good for math/logic",
    cons: "Smaller model, slower due to thinking process, weaker coding",
    bestFor: "Math problems, logical reasoning, step-by-step analysis, tutoring",
    priceNote: "Low cost for reasoning"
  },
  { 
    id: 13, name: 'MiniMax M2.1 (Free)', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0, outputCost: 0, openSource: false,
    free: true, category: "Free Tier", contextWindow: "200K",
    pros: "Completely free, excellent all-around performance, strong reasoning, great for development",
    cons: "Usage limits, rate limits, no commercial SLA, newer with limited track record",
    bestFor: "Personal projects, development, testing, learning, prototyping",
    priceNote: "FREE (with limits)"
  },
  { 
    id: 14, name: 'MiniMax M2.1 (Paid)', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0.50, outputCost: 1.00, openSource: false,
    free: false, category: "Balanced", contextWindow: "200K",
    pros: "Same performance as free tier, unlimited usage, commercial use allowed, good support",
    cons: "Still newer than competitors, less established, pricing may change",
    bestFor: "Production apps, commercial use, unlimited usage needs",
    priceNote: "Reasonable paid tier"
  },
  { 
    id: 15, name: 'MiniMax Lightning', mmlu: 82.2, hellaswag: 88.8, humaneval: 76.4, gpqa: 49.8, inputCost: 0, outputCost: 0, openSource: false,
    free: true, category: "Free Tier", contextWindow: "64K",
    pros: "Fastest option, free tier, good for simple quick tasks",
    cons: "Lower performance than standard M2.1, usage limits",
    bestFor: "Quick queries, high-volume simple tasks, prototyping",
    priceNote: "FREE (fastest option)"
  },
]

// Notable mentions (disabled models) with full details
const notableModels = [
  { name: 'Claude 3.7 Sonnet', provider: 'Anthropic', category: "Flagship", contextWindow: "200K", price: '$3/$15',
    pros: "Anthropic's top model, excellent complex reasoning and coding capabilities",
    cons: "Expensive, rate limits, no vision capabilities",
    bestFor: "Enterprise research, complex analysis, coding at scale" },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', category: "Flagship", contextWindow: "200K", price: '$3/$15',
    pros: "Excellent balance of capability and speed, strong reasoning",
    cons: "Still expensive compared to alternatives",
    bestFor: "General-purpose enterprise use, complex tasks" },
  { name: 'GPT-4 Turbo', provider: 'OpenAI', category: "Flagship", contextWindow: "128K", price: '$10/$30',
    pros: "OpenAI's top model, excellent reasoning and tool use capabilities",
    cons: "Very expensive, rate limits, complex pricing",
    bestFor: "Enterprise applications, complex reasoning, tool integration" },
  { name: 'GPT-4o', provider: 'OpenAI', category: "Flagship", contextWindow: "128K", price: '$5/$15',
    pros: "Omni model with excellent vision and audio capabilities",
    cons: "Expensive for high-volume, complex pricing structure",
    bestFor: "Multimodal applications, vision + text tasks" },
  { name: 'GPT-3.5 Turbo', provider: 'OpenAI', category: "Budget", contextWindow: "16K", price: '$0.50/$1.50',
    pros: "Inexpensive, fast, good for simple tasks",
    cons: "Weaker reasoning, limited context, less capable",
    bestFor: "High-volume simple tasks, cost-sensitive applications" },
  { name: 'DeepSeek Chat', provider: 'DeepSeek', category: "Budget", contextWindow: "128K", price: '$0.14/$0.28',
    pros: "Chat-focused, great value, similar to V3.2 for dialogue",
    cons: "Rate limits, less specialized than V3.2",
    bestFor: "Conversational AI on a budget" },
  { name: 'Qwen 2.5', provider: 'Alibaba', category: "Budget", contextWindow: "128K", price: '$0.07/$0.14',
    pros: "Extremely low cost, good performance for simple tasks",
    cons: "Less capable for complex reasoning",
    bestFor: "Simple chatbots, high-volume low-complexity tasks" },
  { name: 'CodeLlama 70B', provider: 'Meta', category: "Specialized Coding", contextWindow: "128K", price: 'Open Source',
    pros: "Meta's code-specialized model, fully open-source, large parameter count",
    cons: "Requires significant resources to run, slower inference",
    bestFor: "Self-hosted code generation, research on code models" },
  { name: 'StarCoder 2', provider: 'BigCode', category: "Specialized Coding", contextWindow: "16K", price: 'Open Source',
    pros: "Open-source code model trained on 300+ languages, well-documented",
    cons: "Smaller context window, less capable overall",
    bestFor: "Open-source code projects, language-specific tasks" },
  { name: 'WizardMath', provider: 'Microsoft', category: "Reasoning Focus", contextWindow: "8K", price: 'Open Source',
    pros: "Math-specialized open-source model, excellent for arithmetic",
    cons: "Very small context window, limited to math-focused tasks",
    bestFor: "Mathematical computations, educational applications" },
  { name: 'Llama 3.1 Instruct', provider: 'Meta', category: "Conversational", contextWindow: "128K", price: 'Open Source',
    pros: "Meta's instruction-tuned model, excellent for chat, fully open-source",
    cons: "Less polished than commercial alternatives",
    bestFor: "Self-hosted chatbots, open-source projects" },
  { name: 'Gemma 2', provider: 'Google', category: "Conversational", contextWindow: "128K", price: 'Open Source',
    pros: "Google's lightweight open-source model, efficient inference",
    cons: "Less capable than larger models",
    bestFor: "Edge deployment, efficient open-source chat" },
  { name: 'Command R+', provider: 'Cohere', category: "Flagship", contextWindow: "128K", price: '$0.50/$2.00',
    pros: "Enterprise-focused, excellent RAG capabilities, strong retrieval",
    cons: "Less brand recognition, requires Cohere ecosystem",
    bestFor: "Enterprise RAG, document retrieval, knowledge management" },
  { name: 'Azure AI', provider: 'Microsoft', category: "Flagship", contextWindow: "128K", price: 'Varies',
    pros: "Enterprise deployment with Microsoft integration, compliance-ready",
    cons: "Complex pricing, requires Azure ecosystem",
    bestFor: "Microsoft enterprise environments, compliance-heavy industries" },
  { name: 'Amazon Titan', provider: 'AWS', category: "Flagship", contextWindow: "128K", price: 'Varies',
    pros: "AWS's integrated AI service, seamless S3/EC2 integration",
    cons: "AWS-specific pricing, vendor lock-in concerns",
    bestFor: "AWS-native applications, AWS ecosystem projects" },
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
  
  const getCategoryColor = (category) => categoryOptions[category]?.color || '#888'
  
  return (
    <div className="table-section">
      <h2>📊 Model Comparison (% of Baseline)</h2>
      <p className="table-description">Select a baseline model. All other models show their performance as a percentage of this baseline (100% = same performance).</p>
      
      <div className="comparison-selector" style={{ padding: '0 15px', marginBottom: '20px' }}>
        <label>
          <strong>Baseline:</strong>
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
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </label>
      </div>
      
      <div className="table-container">
        <table className="model-table">
          <thead>
            <tr>
              <th style={{ width: '16%' }}>Model</th>
              <th><Tooltip text={benchmarkDescriptions.MMLU}>MMLU</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.HellaSwag}>HellaSwag</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.HumanEval}>HumanEval</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.GPQA}>GPQA</Tooltip></th>
              <th><Tooltip text="Token context window">Ctx</Tooltip></th>
              <th><Tooltip text="Category tier">Cat</Tooltip></th>
              <th><Tooltip text={costExplanation}>Cost</Tooltip></th>
            </tr>
          </thead>
          <tbody>
            {models.map(model => {
              const isSelected = model.id === selectedModel.id
              return (
                <tr key={model.id} style={{ background: isSelected ? 'rgba(103, 126, 234, 0.15)' : undefined }}>
                  <td>
                    <strong>{model.name}</strong>
                    {model.free && <span style={{ marginLeft: '6px', background: '#11998e', color: 'white', padding: '1px 5px', borderRadius: '6px', fontSize: '0.7em' }}>FREE</span>}
                    {model.openSource && <span style={{ marginLeft: '6px', background: '#9b59b6', color: 'white', padding: '1px 5px', borderRadius: '6px', fontSize: '0.7em' }}>OSS</span>}
                  </td>
                  <td>
                    <span>{model.mmlu}%</span>
                    {!isSelected && <span className={getPctClass((model.mmlu / selectedModel.mmlu) * 100)} style={{ marginLeft: '6px', fontSize: '0.8em', fontWeight: '600' }}>{((model.mmlu / selectedModel.mmlu) * 100).toFixed(0)}%</span>}
                  </td>
                  <td>
                    <span>{model.hellaswag}%</span>
                    {!isSelected && <span className={getPctClass((model.hellaswag / selectedModel.hellaswag) * 100)} style={{ marginLeft: '6px', fontSize: '0.8em', fontWeight: '600' }}>{((model.hellaswag / selectedModel.hellaswag) * 100).toFixed(0)}%</span>}
                  </td>
                  <td>
                    <span>{model.humaneval}%</span>
                    {!isSelected && <span className={getPctClass((model.humaneval / selectedModel.humaneval) * 100)} style={{ marginLeft: '6px', fontSize: '0.8em', fontWeight: '600' }}>{((model.humaneval / selectedModel.humaneval) * 100).toFixed(0)}%</span>}
                  </td>
                  <td>
                    <span>{model.gpqa}%</span>
                    {!isSelected && <span className={getPctClass((model.gpqa / selectedModel.gpqa) * 100)} style={{ marginLeft: '6px', fontSize: '0.8em', fontWeight: '600' }}>{((model.gpqa / selectedModel.gpqa) * 100).toFixed(0)}%</span>}
                  </td>
                  <td style={{ color: '#f1c40f', fontWeight: '500' }}>{model.contextWindow}</td>
                  <td><span style={{ background: getCategoryColor(model.category), color: 'white', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7em', fontWeight: '600' }}>{model.category}</span></td>
                  <td style={{ fontWeight: '600' }}>{model.free ? 'FREE' : `$${model.inputCost.toFixed(2)}/$${model.outputCost.toFixed(2)}`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
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
  
  const getCategoryColor = (category) => categoryOptions[category]?.color || '#888'
  
  return (
    <div className="table-section">
      <h2>💰 Cost by Task Type</h2>
      <p className="table-description">Estimated costs for different task types.</p>
      
      <div className="comparison-selector" style={{ padding: '0 15px', marginBottom: '15px' }}>
        <span style={{ fontSize: '0.9em', color: '#aaa' }}>
          Baseline: <strong style={{ color: '#e0e0e0' }}>{selectedModel?.name}</strong>
        </span>
      </div>
      
      <div className="table-container">
        <table className="model-table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Model</th>
              <th style={{ width: '10%' }}>Cat</th>
              {Object.keys(taskEstimates).map(task => (
                <th key={task} style={{ width: '14%' }}>{task}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map(model => (
              <tr key={model.id}>
                <td><strong>{model.name}</strong></td>
                <td><span style={{ background: getCategoryColor(model.category), color: 'white', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7em' }}>{model.category}</span></td>
                {Object.keys(taskEstimates).map(task => {
                  const { cost, free } = calculateTaskCost(model, task)
                  return <td key={task}>{free ? <span className="best-value">FREE</span> : `$${cost.toFixed(4)}`}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NotableMentions() {
  const getCategoryColor = (category) => categoryOptions[category]?.color || '#888'
  
  return (
    <div className="table-section">
      <h2>⭐ Notable Mentions (Disabled Models)</h2>
      <p className="table-description">Other relevant models worth considering. Grayed out = not enabled in comparison.</p>
      
      <div className="table-container" style={{ opacity: 0.75 }}>
        <table className="model-table qualitative-table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Model</th>
              <th style={{ width: '8%' }}>Cat</th>
              <th style={{ width: '8%' }}>Ctx</th>
              <th style={{ width: '8%' }}>Price</th>
              <th style={{ width: '22%' }}>✅ Pros</th>
              <th style={{ width: '22%' }}>❌ Cons</th>
              <th style={{ width: '22%' }}>🎯 Best For</th>
            </tr>
          </thead>
          <tbody>
            {notableModels.map((model, index) => (
              <tr key={index} style={{ opacity: 0.5 }}>
                <td><strong>{model.name}</strong><br/><span style={{ fontSize: '0.8em', color: '#888' }}>{model.provider}</span></td>
                <td><span style={{ background: getCategoryColor(model.category), color: 'white', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7em' }}>{model.category}</span></td>
                <td style={{ color: '#f1c40f', fontSize: '0.85em' }}>{model.contextWindow}</td>
                <td style={{ fontSize: '0.85em', color: '#aaa' }}>{model.price}</td>
                <td style={{ fontSize: '0.85em' }}>{model.pros}</td>
                <td style={{ fontSize: '0.85em' }}>{model.cons}</td>
                <td style={{ fontSize: '0.85em' }}>{model.bestFor}</td>
              </tr>
            ))}
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
      if (sortBy === 'name') return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
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
    if (sortBy === column) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    else { setSortBy(column); setSortOrder('desc') }
  }

  const getCategoryColor = (category) => categoryOptions[category]?.color || '#888'

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 LLM Model Comparison</h1>
        <p>Compare AI models across benchmarks, costs, and use cases</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card"><h3>{totals.models}</h3><p>Models</p></div>
        <div className="stat-card"><h3>{totals.freeModels}</h3><p>Free</p></div>
        <div className="stat-card"><h3>{totals.openSourceModels}</h3><p>Open Source</p></div>
        <div className="stat-card"><h3>{totals.avgMmlu}%</h3><p>Avg MMLU</p></div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>🔍 Search</label>
          <input type="text" placeholder="Search models..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">
          <label><input type="checkbox" checked={filterFree} onChange={(e) => setFilterFree(e.target.checked)} style={{ marginRight: '10px' }}/>Free & Open Source Only</label>
        </div>
      </div>

      <ComparisonSection models={filteredModels} />
      <CostBreakdownTable models={filteredModels} />
      <NotableMentions />

      <footer className="footer">
        <p>Built with React + Vite | <a href="https://github.com/mloren13/llm-comparison-webapp" target="_blank">View on GitHub</a></p>
      </footer>
    </div>
  )
}

export default App
