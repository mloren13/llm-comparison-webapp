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

// Model comparison data with qualitative info
const models = [
  { 
    id: 1, name: 'Google Gemini 3 Flash', mmlu: 82.4, hellaswag: 89.2, humaneval: 74.6, gpqa: 49.2, inputCost: 0.075, outputCost: 0.30, openSource: false,
    free: false,
    pros: "Excellent value, large 1M context window, fast inference, strong vision capabilities",
    cons: "Rate limits on free tier, smaller than Pro version, may lack creativity",
    bestFor: "Production apps, image analysis, cost-sensitive projects",
    priceNote: "Best cost-performance ratio for production use"
  },
  { 
    id: 2, name: 'Google Gemini 3 Pro', mmlu: 86.8, hellaswag: 91.5, humaneval: 78.4, gpqa: 54.8, inputCost: 1.25, outputCost: 5.00, openSource: false,
    free: false,
    pros: "Best-in-class performance, massive 2M context window, excellent reasoning, top vision",
    cons: "Expensive, rate limits, overkill for simple tasks",
    bestFor: "Research, complex analysis, long documents, enterprise use",
    priceNote: "Premium pricing for premium performance"
  },
  { 
    id: 3, name: 'DeepSeek V3.2', mmlu: 85.2, hellaswag: 90.8, humaneval: 82.6, gpqa: 52.4, inputCost: 0.14, outputCost: 0.28, openSource: false,
    free: false,
    pros: "Outstanding coding performance, lowest per-token cost, strong reasoning, open API",
    cons: "Rate limits, Chinese company (data privacy concerns), inconsistent availability",
    bestFor: "Coding-heavy workloads, budget-conscious teams, high-volume apps",
    priceNote: "Best value for coding tasks, 50-80% cheaper than US alternatives"
  },
  { 
    id: 4, name: 'Qwen3 Coder', mmlu: 83.6, hellaswag: 89.8, humaneval: 85.2, gpqa: 48.6, inputCost: 0.07, outputCost: 0.28, openSource: false,
    free: false,
    pros: "Highest HumanEval score, excellent for code generation, very low cost, good debugging",
    cons: "Smaller model, weaker non-coding tasks, less reasoning depth",
    bestFor: "Code generation, refactoring, debugging, cost-optimized development",
    priceNote: "Cheapest option for pure coding, great for dev tools"
  },
  { 
    id: 5, name: 'Mistral Devstral 25.12', mmlu: 84.2, hellaswag: 90.2, humaneval: 80.4, gpqa: 51.8, inputCost: 0.30, outputCost: 0.90, openSource: false,
    free: false,
    pros: "Strong balanced performance, European company (GDPR compliant), good reasoning",
    cons: "Less brand recognition, fewer integrations, mid-tier pricing",
    bestFor: "European projects, GDPR-sensitive applications, balanced workloads",
    priceNote: "Middle-ground pricing with EU compliance benefit"
  },
  { 
    id: 6, name: 'Mistral Codestral 25.08', mmlu: 82.8, hellaswag: 89.4, humaneval: 84.8, gpqa: 49.4, inputCost: 0.25, outputCost: 0.75, openSource: false,
    free: false,
    pros: "Code-specialized, excellent code quality, good documentation, reliable outputs",
    cons: "Less versatile, weaker general reasoning, no vision capabilities",
    bestFor: "Code generation, refactoring, code review, technical docs",
    priceNote: "Specialized for code, reasonable pricing for its niche"
  },
  { 
    id: 7, name: 'Moonshot AI Kimi K2.5', mmlu: 85.8, hellaswag: 91.2, humaneval: 79.4, gpqa: 53.2, inputCost: 0.50, outputCost: 1.00, openSource: false,
    free: false,
    pros: "Strong all-around, excellent reasoning, good coding, competitive performance",
    cons: "Asian market focus, less Western support, mid-range pricing",
    bestFor: "General-purpose AI, multilingual tasks, Asian market apps",
    priceNote: "Competitive mid-tier, good for mixed workloads"
  },
  { 
    id: 8, name: 'Claude 3.5 Haiku', mmlu: 84.6, hellaswag: 90.4, humaneval: 76.8, gpqa: 51.2, inputCost: 0.25, outputCost: 1.25, openSource: false,
    free: false,
    pros: "Anthropic quality, fast responses, reliable outputs, good for conversation",
    cons: "Higher output costs, no free tier, may be verbose",
    bestFor: "Chatbots, conversation AI, quick queries, customer service",
    priceNote: "Higher output cost but excellent for conversational AI"
  },
  { 
    id: 9, name: 'xAI Grok 4.1 Fast', mmlu: 83.4, hellaswag: 89.6, humaneval: 75.4, gpqa: 50.4, inputCost: 0.15, outputCost: 0.60, openSource: false,
    free: false,
    pros: "Good performance, xAI ecosystem, fast responses, X integration",
    cons: "Less established, smaller community, limited track record",
    bestFor: "xAI ecosystem projects, Twitter/X integration, fast reasoning",
    priceNote: "Mid-range pricing with ecosystem benefits"
  },
  { 
    id: 10, name: 'Meta Llama 4 Maverick', mmlu: 82.6, hellaswag: 88.8, humaneval: 74.8, gpqa: 48.8, inputCost: 0.20, outputCost: 0.60, openSource: true,
    free: false,
    pros: "Fully open-source, self-hostable, no API costs, customizable, privacy-focused",
    cons: "Requires technical setup, self-hosting costs, less polished than commercial",
    bestFor: "Self-hosting, privacy-sensitive apps, customization, research",
    priceNote: "Free to use but requires hosting/infrastructure costs"
  },
  { 
    id: 11, name: 'Meta Llama 4 Scout', mmlu: 78.4, hellaswag: 86.2, humaneval: 68.4, gpqa: 45.6, inputCost: 0.10, outputCost: 0.30, openSource: true,
    free: false,
    pros: "Lightweight, fastest inference, fully open-source, lowest commercial cost",
    cons: "Lower performance, not for complex reasoning, requires optimization",
    bestFor: "Edge deployment, simple tasks, learning, hobby projects",
    priceNote: "Cheapest commercial API + open-source option"
  },
  { 
    id: 12, name: 'Qwen3 Thinking 30B', mmlu: 80.6, hellaswag: 88.4, humaneval: 71.2, gpqa: 47.8, inputCost: 0.10, outputCost: 0.40, openSource: false,
    free: false,
    pros: "Reasoning-focused, step-by-step thinking, low cost, good for math/logic",
    cons: "Smaller model, slower due to thinking process, weaker coding",
    bestFor: "Math problems, logical reasoning, step-by-step analysis, tutoring",
    priceNote: "Low cost for reasoning-heavy tasks"
  },
  { 
    id: 13, name: 'MiniMax M2.1 (Free)', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0, outputCost: 0, openSource: false,
    free: true,
    pros: "Completely free, excellent all-around performance, strong reasoning, great for development",
    cons: "Usage limits, rate limits, no commercial SLA, newer with limited track record",
    bestFor: "Personal projects, development, testing, learning, prototyping",
    priceNote: "FREE with subscription (limits apply)"
  },
  { 
    id: 14, name: 'MiniMax M2.1 (Paid)', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0.50, outputCost: 1.00, openSource: false,
    free: false,
    pros: "Same performance as free tier, unlimited usage, commercial use allowed, good support",
    cons: "Still newer than competitors, less established, pricing may change",
    bestFor: "Production apps, commercial use, unlimited usage needs",
    priceNote: "Reasonable paid tier, similar to Moonshot pricing"
  },
  { 
    id: 15, name: 'MiniMax Lightning', mmlu: 82.2, hellaswag: 88.8, humaneval: 76.4, gpqa: 49.8, inputCost: 0, outputCost: 0, openSource: false,
    free: true,
    pros: "Fastest option, free tier, good for simple quick tasks",
    cons: "Lower performance than standard M2.1, usage limits",
    bestFor: "Quick queries, high-volume simple tasks, prototyping",
    priceNote: "FREE with subscription - fastest option"
  },
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
    return {
      value: val1,
      pct: pct,
      label: `${pct.toFixed(0)}%`
    }
  }
  
  const getPctClass = (pct) => {
    if (pct >= 100) return 'positive-diff'
    if (pct >= 95) return 'neutral-diff'
    return 'negative-diff'
  }
  
  const getCostPercentage = (model, selected, inputs, outputs) => {
    const cost1 = (inputs * model.inputCost / 1000000) + (outputs * model.outputCost / 1000000)
    const cost2 = (inputs * selected.inputCost / 1000000) + (outputs * selected.outputCost / 1000000)
    if (model.free) return { value: 0, pct: 0, label: 'FREE' }
    if (cost2 === 0) return { value: cost1, pct: 0, label: 'N/A' }
    const pct = (cost1 / cost2) * 100
    return {
      value: cost1,
      pct: pct,
      label: `${pct.toFixed(0)}%`
    }
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
              <th>Model</th>
              <th><Tooltip text={benchmarkDescriptions.MMLU}>MMLU</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.HellaSwag}>HellaSwag</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.HumanEval}>HumanEval</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.GPQA}>GPQA</Tooltip></th>
              <th><Tooltip text={costExplanation}>Cost</Tooltip></th>
            </tr>
          </thead>
          <tbody>
            {models.map(model => {
              const mmlu = calculatePercentage(model, selectedModel, 'mmlu')
              const hellaswag = calculatePercentage(model, selectedModel, 'hellaswag')
              const humaneval = calculatePercentage(model, selectedModel, 'humaneval')
              const gpqa = calculatePercentage(model, selectedModel, 'gpqa')
              const cost = getCostPercentage(model, selectedModel, 1000000, 5000000)
              
              const isSelected = model.id === selectedModel.id
              
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
                    <span className={model.free ? 'best-value' : getPctClass(cost.pct)} style={{ fontWeight: '600' }}>
                      {cost.label}
                    </span>
                    {!isSelected && !model.free && <span style={{ marginLeft: '8px', fontSize: '0.85em', color: '#888' }}>${cost.value}</span>}
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
    if (!task) return { cost: 0, pct: 0 }
    const cost = (task.input * model.inputCost / 1000000) + (task.output * model.outputCost / 1000000)
    return { cost: cost, free: model.free }
  }
  
  const calculatePercentage = (model, selected, taskName) => {
    const task = taskEstimates[taskName]
    if (!task) return 0
    const cost1 = (task.input * model.inputCost / 1000000) + (task.output * model.outputCost / 1000000)
    const cost2 = (task.input * selected.inputCost / 1000000) + (task.output * selected.outputCost / 1000000)
    if (model.free) return 0
    if (cost2 === 0) return 100
    return (cost1 / cost2) * 100
  }
  
  const getPctClass = (pct) => {
    if (pct <= 100) return 'positive-diff'
    if (pct <= 110) return 'neutral-diff'
    return 'negative-diff'
  }
  
  return (
    <div className="table-section">
      <h2>💰 Cost Breakdown by Task (% of Baseline)</h2>
      <p className="table-description">Select a baseline model. Shows absolute cost and percentage relative to baseline for each task type.</p>
      
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
              <th>Model</th>
              {Object.keys(taskEstimates).map(task => (
                <th key={task}>
                  <Tooltip text={`Average tokens for ${task}: ${taskEstimates[task].input + taskEstimates[task].output} tokens`}>
                    {task}
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map(model => {
              const isSelected = model.id === selectedModel.id
              
              return (
                <tr key={model.id} style={{ background: isSelected ? 'rgba(103, 126, 234, 0.15)' : undefined }}>
                  <td>
                    <strong>{model.name}</strong>
                    {model.free && <span style={{ marginLeft: '8px', background: '#11998e', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>FREE</span>}
                    {model.openSource && <span style={{ marginLeft: '8px', background: '#9b59b6', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>OPEN SOURCE</span>}
                  </td>
                  {Object.keys(taskEstimates).map(task => {
                    const { cost, free } = calculateTaskCost(model, task)
                    const pct = calculatePercentage(model, selectedModel, task)
                    
                    return (
                      <td key={task}>
                        {free ? (
                          <span className="best-value" style={{ fontWeight: '600' }}>FREE</span>
                        ) : (
                          <>
                            <span style={{ fontWeight: '600', color: isSelected ? '#e0e0e0' : '#c0c0c0' }}>
                              ${cost.toFixed(4)}
                            </span>
                            {!isSelected && (
                              <span className={getPctClass(pct)} style={{ marginLeft: '8px', fontSize: '0.85em', fontWeight: '600' }}>
                                {pct.toFixed(0)}%
                              </span>
                            )}
                          </>
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
      
      <p className="table-description" style={{ marginTop: '15px', fontSize: '0.85em' }}>
        💡 How to read: If baseline shows $0.01 and another model shows $0.005 with 50%, that model costs 50% as much (half the price).
      </p>
    </div>
  )
}

function App() {
  const [sortBy, setSortBy] = useState('mmlu')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterFree, setFilterFree] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [costScenario, setCostScenario] = useState({ input: 1000000, output: 5000000 })

  // Calculate cost
  const calculateCost = (model, inputs, outputs) => {
    return (inputs * model.inputCost / 1000000) + (outputs * model.outputCost / 1000000)
  }

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let result = models.filter(model => {
      if (filterFree && !model.free && !model.openSource) return false
      if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })

    // Sort
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

  // Calculate totals
  const totals = useMemo(() => {
    return {
      models: filteredModels.length,
      freeModels: filteredModels.filter(m => m.free).length,
      openSourceModels: filteredModels.filter(m => m.openSource).length,
      avgMmlu: (filteredModels.reduce((sum, m) => sum + m.mmlu, 0) / filteredModels.length).toFixed(1),
    }
  }, [filteredModels])

  // Toggle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>🤖 LLM Model Comparison</h1>
        <p>Compare AI models across benchmarks, costs, and features</p>
      </header>

      {/* Stats */}
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

      {/* Filters */}
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

      {/* FIRST TABLE: Comparison Section */}
      <ComparisonSection models={filteredModels} />

      {/* Cost Breakdown Table */}
      <CostBreakdownTable models={filteredModels} />

      {/* Table: Performance Metrics & Costs */}
      <div className="table-section">
        <h2>📊 Performance Metrics & Costs</h2>
        <p className="table-description">Click any column header to sort. Hover over headers to see what each benchmark tests.</p>
        
        <div className="table-container">
          <table className="model-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  Model {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('mmlu')}>
                  <Tooltip text={benchmarkDescriptions.MMLU}>MMLU</Tooltip> {sortBy === 'mmlu' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('hellaswag')}>
                  <Tooltip text={benchmarkDescriptions.HellaSwag}>HellaSwag</Tooltip> {sortBy === 'hellaswag' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('humaneval')}>
                  <Tooltip text={benchmarkDescriptions.HumanEval}>HumanEval</Tooltip> {sortBy === 'humaneval' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('gpqa')}>
                  <Tooltip text={benchmarkDescriptions.GPQA}>GPQA</Tooltip> {sortBy === 'gpqa' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('inputCost')}>
                  Input ($/M) {sortBy === 'inputCost' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('outputCost')}>
                  Output ($/M) {sortBy === 'outputCost' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>
                  <Tooltip text={costExplanation}>Est. Cost</Tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map(model => {
                const cost = calculateCost(model, costScenario.input, costScenario.output)
                const isBestValue = model.free || model.openSource || (model.mmlu > 75 && cost < 1)
                
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
                    <td>${model.inputCost.toFixed(3)}</td>
                    <td>${model.outputCost.toFixed(2)}</td>
                    <td>
                      {model.free ? (
                        <span className="best-value">FREE</span>
                      ) : (
                        <span className={isBestValue ? 'best-value' : ''}>
                          ${cost.toFixed(2)}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Qualitative Analysis Table */}
      <div className="table-section">
        <h2>📋 Qualitative Analysis (Price-Adjusted)</h2>
        <p className="table-description">Detailed pros, cons, and recommendations including price-performance analysis.</p>
        
        <div className="table-container">
          <table className="model-table qualitative-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Model</th>
                <th style={{ width: '25%' }}>✅ Key Advantages</th>
                <th style={{ width: '25%' }}>❌ Limitations</th>
                <th style={{ width: '30%' }}>🎯 Best Use Cases</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map(model => (
                <tr key={model.id}>
                  <td>
                    <strong>{model.name}</strong>
                    {model.free && <span style={{ marginLeft: '8px', background: '#11998e', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>FREE</span>}
                    {model.openSource && <span style={{ marginLeft: '8px', background: '#9b59b6', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>OPEN SOURCE</span>}
                    <div style={{ marginTop: '4px', fontSize: '0.75em', color: '#888' }}>
                      💰 {model.priceNote}
                    </div>
                  </td>
                  <td>{model.pros}</td>
                  <td>{model.cons}</td>
                  <td>{model.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>
          Built with React + Vite | 
          <a href="https://github.com/mloren13/llm-comparison-webapp" target="_blank" rel="noopener noreferrer"> View on GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export default App
