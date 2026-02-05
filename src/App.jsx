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
    pros: "Fast, excellent vision, large context window (1M+), cost-effective",
    cons: "May be less creative than Pro version",
    bestFor: "Image analysis, fast tasks, cost-sensitive production use"
  },
  { 
    id: 2, name: 'Google Gemini 3 Pro', mmlu: 86.8, hellaswag: 91.5, humaneval: 78.4, gpqa: 54.8, inputCost: 1.25, outputCost: 5.00, openSource: false,
    pros: "Excellent reasoning, largest context window (2M+), strong vision, best-in-class performance",
    cons: "Higher cost, rate limits on high usage",
    bestFor: "Complex reasoning, research, long documents, vision tasks"
  },
  { 
    id: 3, name: 'DeepSeek V3.2', mmlu: 85.2, hellaswag: 90.8, humaneval: 82.6, gpqa: 52.4, inputCost: 0.14, outputCost: 0.28, openSource: false,
    pros: "Excellent value, very strong coding, competitive reasoning, low cost",
    cons: "Rate limits, data privacy considerations (Chinese company)",
    bestFor: "Coding tasks, high-volume production, budget-conscious teams"
  },
  { 
    id: 4, name: 'Qwen3 Coder', mmlu: 83.6, hellaswag: 89.8, humaneval: 85.2, gpqa: 48.6, inputCost: 0.07, outputCost: 0.28, openSource: false,
    pros: "Best coding performance, very low cost, good reasoning",
    cons: "Smaller model than competitors",
    bestFor: "Code generation, debugging, refactoring, cost-optimized coding"
  },
  { 
    id: 5, name: 'Mistral Devstral 25.12', mmlu: 84.2, hellaswag: 90.2, humaneval: 80.4, gpqa: 51.8, inputCost: 0.30, outputCost: 0.90, openSource: false,
    pros: "Strong balanced performance, European-developed (GDPR friendly), good reasoning",
    cons: "Less brand recognition, fewer integrations",
    bestFor: "General reasoning, coding, European compliance needs"
  },
  { 
    id: 6, name: 'Mistral Codestral 25.08', mmlu: 82.8, hellaswag: 89.4, humaneval: 84.8, gpqa: 49.4, inputCost: 0.25, outputCost: 0.75, openSource: false,
    pros: "Code-specialized, excellent code generation, good documentation",
    cons: "Less versatile for non-coding tasks",
    bestFor: "Code generation, refactoring, code review, technical documentation"
  },
  { 
    id: 7, name: 'Moonshot AI Kimi K2.5', mmlu: 85.8, hellaswag: 91.2, humaneval: 79.4, gpqa: 53.2, inputCost: 0.50, outputCost: 1.00, openSource: false,
    pros: "Strong reasoning, competitive coding, good value",
    cons: "Lesser-known in Western markets",
    bestFor: "Coding tasks, general reasoning, Asian market focus"
  },
  { 
    id: 8, name: 'Claude 3.5 Haiku', mmlu: 84.6, hellaswag: 90.4, humaneval: 76.8, gpqa: 51.2, inputCost: 0.25, outputCost: 1.25, openSource: false,
    pros: "Fast, Anthropic quality, reliable outputs, good reasoning",
    cons: "Higher output cost for long responses",
    bestFor: "Quick queries, conversation, fast turnaround tasks"
  },
  { 
    id: 9, name: 'xAI Grok 4.1 Fast', mmlu: 83.4, hellaswag: 89.6, humaneval: 75.4, gpqa: 50.4, inputCost: 0.15, outputCost: 0.60, openSource: false,
    pros: "Good performance, xAI ecosystem integration, fast responses",
    cons: "Less established, smaller community",
    bestFor: "xAI ecosystem projects, fast reasoning tasks"
  },
  { 
    id: 10, name: 'Meta Llama 4 Maverick', mmlu: 82.6, hellaswag: 88.8, humaneval: 74.8, gpqa: 48.8, inputCost: 0.20, outputCost: 0.60, openSource: true,
    pros: "Open-source, self-hostable, good performance-to-cost ratio",
    cons: "Requires technical setup, less polished than commercial",
    bestFor: "Self-hosting, privacy-focused, open-source projects"
  },
  { 
    id: 11, name: 'Meta Llama 4 Scout', mmlu: 78.4, hellaswag: 86.2, humaneval: 68.4, gpqa: 45.6, inputCost: 0.10, outputCost: 0.30, openSource: true,
    pros: "Lightweight, very low cost, fully open-source, fast inference",
    cons: "Lower performance, not suitable for complex reasoning",
    bestFor: "Simple tasks, edge deployment, learning, hobby projects"
  },
  { 
    id: 12, name: 'Qwen3 Thinking 30B', mmlu: 80.6, hellaswag: 88.4, humaneval: 71.2, gpqa: 47.8, inputCost: 0.10, outputCost: 0.40, openSource: false,
    pros: "Reasoning-focused, step-by-step thinking, low cost",
    cons: "Smaller model, slower due to thinking process",
    bestFor: "Math problems, logical reasoning, step-by-step analysis"
  },
  { 
    id: 13, name: 'MiniMax M2.1', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0, outputCost: 0, openSource: false,
    pros: "Free tier, strong all-around performance, good for development",
    cons: "Usage limits, newer model with limited track record",
    bestFor: "Development, testing, personal projects, cost-free work"
  },
  { 
    id: 14, name: 'MiniMax M2.1 Lightning', mmlu: 82.2, hellaswag: 88.8, humaneval: 76.4, gpqa: 49.8, inputCost: 0, outputCost: 0, openSource: false,
    pros: "Very fast, free tier, good for simple quick tasks",
    cons: "Lower performance than standard M2.1",
    bestFor: "Quick queries, high-volume simple tasks, fast prototyping"
  },
]

function Tooltip({ text, children }) {
  return (
    <span className="tooltip-container">
      {children}
      <span className="tooltip-text">{text}</span>
    </span>
  )
}

function CostBreakdownTable({ models }) {
  const calculateTaskCost = (model, taskName) => {
    const task = taskEstimates[taskName]
    if (!task) return 0
    const cost = (task.input * model.inputCost / 1000000) + (task.output * model.outputCost / 1000000)
    return model.free ? 'FREE' : `$${cost.toFixed(4)}`
  }
  
  return (
    <div className="table-section">
      <h2>💰 Cost Breakdown by Task</h2>
      <p className="table-description">Estimated cost for different types of tasks based on average token usage.</p>
      
      <div className="table-container">
        <table className="model-table">
          <thead>
            <tr>
              <th>Model</th>
              {Object.keys(taskEstimates).map(task => (
                <th key={task}>{task}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map(model => (
              <tr key={model.id}>
                <td>
                  <strong>{model.name}</strong>
                  {model.openSource && <span style={{ marginLeft: '8px', background: '#9b59b6', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>OPEN SOURCE</span>}
                </td>
                {Object.keys(taskEstimates).map(task => (
                  <td key={task}>
                    <span className={model.free ? 'best-value' : ''}>
                      {calculateTaskCost(model, task)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="table-description" style={{ marginTop: '15px', fontSize: '0.85em' }}>
        💡 Task estimates are based on average token usage. Your actual costs may vary based on prompt length and response size.
      </p>
    </div>
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
    if (cost2 === 0) return { value: cost1, pct: 0, label: model.free ? 'FREE' : 'N/A' }
    const pct = (cost1 / cost2) * 100
    return {
      value: cost1,
      pct: pct,
      label: model.free ? 'FREE' : `${pct.toFixed(0)}%`
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
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
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
              <th><Tooltip text={costExplanation}>Cost %</Tooltip></th>
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
                    {isSelected && <span className="comparison-badge">BASELINE</span>}
                    {model.openSource && <span style={{ marginLeft: '8px', background: '#9b59b6', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>OPEN SOURCE</span>}
                  </td>
                  <td>
                    {mmlu.value}%
                    {!isSelected && <span className={getPctClass(mmlu.pct)} style={{ marginLeft: '8px', fontSize: '0.85em' }}>{mmlu.label}</span>}
                  </td>
                  <td>
                    {hellaswag.value}%
                    {!isSelected && <span className={getPctClass(hellaswag.pct)} style={{ marginLeft: '8px', fontSize: '0.85em' }}>{hellaswag.label}</span>}
                  </td>
                  <td>
                    {humaneval.value}%
                    {!isSelected && <span className={getPctClass(humaneval.pct)} style={{ marginLeft: '8px', fontSize: '0.85em' }}>{humaneval.label}</span>}
                  </td>
                  <td>
                    {gpqa.value}%
                    {!isSelected && <span className={getPctClass(gpqa.pct)} style={{ marginLeft: '8px', fontSize: '0.85em' }}>{gpqa.label}</span>}
                  </td>
                  <td>
                    <span className={model.free ? 'best-value' : getPctClass(cost.pct)}>
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
        💡 How to read: If baseline has 80% MMLU and another model shows 95%, that model achieves 95% of the baseline's performance (76% actual score).
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
      if (filterFree && !model.openSource) return false
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
      openSourceModels: filteredModels.filter(m => m.openSource).length,
      avgMmlu: (filteredModels.reduce((sum, m) => sum + m.mmlu, 0) / filteredModels.length).toFixed(1),
      avgCost: (filteredModels.reduce((sum, m) => calculateCost(m, costScenario.input, costScenario.output), 0) / filteredModels.length).toFixed(2)
    }
  }, [filteredModels, costScenario])

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
          <h3>{totals.openSourceModels}</h3>
          <p>Open Source</p>
        </div>
        <div className="stat-card">
          <h3>{totals.avgMmlu}%</h3>
          <p>Avg MMLU Score</p>
        </div>
        <div className="stat-card">
          <h3>${totals.avgCost}</h3>
          <p>Avg Cost @ {costScenario.input / 1000000}M in / {costScenario.output / 1000000}M out</p>
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
            Show Open Source Only
          </label>
        </div>

        <div className="filter-group">
          <label>💰 Cost Scenario (tokens/month)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input 
              type="number" 
              placeholder="Input tokens"
              value={costScenario.input}
              onChange={(e) => setCostScenario({ ...costScenario, input: Number(e.target.value) })}
            />
            <input 
              type="number" 
              placeholder="Output tokens"
              value={costScenario.output}
              onChange={(e) => setCostScenario({ ...costScenario, output: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Table 1: Metrics & Costs */}
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
                const isBestValue = model.openSource || (model.mmlu > 75 && cost < 1)
                
                return (
                  <tr key={model.id}>
                    <td>
                      <strong>{model.name}</strong>
                      {model.openSource && <span style={{ marginLeft: '10px', background: '#9b59b6', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8em' }}>OPEN SOURCE</span>}
                    </td>
                    <td>{model.mmlu}%</td>
                    <td>{model.hellaswag}%</td>
                    <td>{model.humaneval}%</td>
                    <td>{model.gpqa}%</td>
                    <td>${model.inputCost.toFixed(3)}</td>
                    <td>${model.outputCost.toFixed(2)}</td>
                    <td>
                      <span className={isBestValue ? 'best-value' : ''}>
                        ${cost.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <CostBreakdownTable models={filteredModels} />

      {/* Comparison Section */}
      <ComparisonSection models={filteredModels} />

      {/* Qualitative Analysis Table */}
      <div className="table-section">
        <h2>📋 Qualitative Analysis</h2>
        <p className="table-description">Pros, cons, and recommended use cases for each model.</p>
        
        <div className="table-container">
          <table className="model-table qualitative-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Model</th>
                <th style={{ width: '25%' }}>✅ Pros</th>
                <th style={{ width: '25%' }}>❌ Cons</th>
                <th style={{ width: '25%' }}>🎯 Best For</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map(model => (
                <tr key={model.id}>
                  <td>
                    <strong>{model.name}</strong>
                    {model.openSource && <span style={{ marginLeft: '8px', background: '#9b59b6', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>OPEN SOURCE</span>}
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
