import { useState, useMemo } from 'react'

const benchmarkDescriptions = {
  MMLU: "Massive Multitask Language Understanding - Tests knowledge across subjects. Higher = smarter general knowledge.",
  HellaSwag: "Tests commonsense reasoning - understanding everyday situations. Higher = better commonsense.",
  HumanEval: "Measures coding ability - can the AI write working code? Higher = better at coding.",
  GPQA: "Graduate-Level Google-Proof Q&A - Very hard science questions. Higher = more expert-level understanding."
}

const categoryOptions = {
  "Flagship": { color: '#e74c3c' },
  "Balanced": { color: '#3498db' },
  "Budget": { color: '#27ae60' },
  "Specialized Coding": { color: '#9b59b6' },
  "Reasoning Focus": { color: '#f39c12' },
  "Conversational": { color: '#1abc9c' },
  "Open Source": { color: '#e91e63' },
  "Free Tier": { color: '#00bcd4' }
}

const allModels = [
  { id: 1, name: 'Google Gemini 3 Flash', provider: 'Google', mmlu: 82.4, hellaswag: 89.2, humaneval: 74.6, gpqa: 49.2, inputCost: 0.075, outputCost: 0.30, context: "1M", category: "Balanced", enabled: true,
    pros: "Best price-performance ratio. 1M token context exceptional for mid-tier. Native multimodal (vision, audio, video). Built-in function calling.",
    cons: "Not as capable as Pro on complex reasoning. Creative writing less nuanced. Smaller training corpus than OpenAI/Anthropic.",
    bestFor: "Vision apps at low cost, long document processing, AI agents with function calling, cost-sensitive startups." },
  { id: 2, name: 'Google Gemini 3 Pro', provider: 'Google', mmlu: 86.8, hellaswag: 91.5, humaneval: 78.4, gpqa: 54.8, inputCost: 1.25, outputCost: 5.00, context: "2M", category: "Flagship", enabled: true,
    pros: "Largest context in market (2M tokens). Excellent for entire codebases/books. Superior multimodal. Native Google Search grounding.",
    cons: "Significantly more expensive. Output quality varies more than Anthropic. Overkill for simple chat.",
    bestFor: "Enterprise RAG with massive docs, codebase analysis, long-context research, multimodal at scale." },
  { id: 3, name: 'DeepSeek V3.2', provider: 'DeepSeek', mmlu: 85.2, hellaswag: 90.8, humaneval: 82.6, gpqa: 52.4, inputCost: 0.14, outputCost: 0.28, context: "128K", category: "Budget", enabled: true,
    pros: "Cheapest high-performance model. Coders report it rivals Claude for code. Open weights. Strong math/technical reasoning.",
    cons: "Chinese company = data sovereignty concerns. Occasional API instability. Less polished creative writing.",
    bestFor: "Coding at scale, budget-conscious startups, high-volume API, cost-primary constraints." },
  { id: 4, name: 'Qwen3 Coder', provider: 'Alibaba', mmlu: 83.6, hellaswag: 89.8, humaneval: 85.2, gpqa: 48.6, inputCost: 0.07, outputCost: 0.28, context: "32K", category: "Specialized Coding", enabled: true,
    pros: "Highest HumanEval among open-weight models. Exceptional at requirements-to-code. Excellent IDE code completion.",
    cons: "Small context limits complex files. Non-coding underpowered. Sparse English documentation.",
    bestFor: "IDE plugins, code completion, automated refactoring, cost-optimized code pipelines." },
  { id: 5, name: 'Mistral Devstral 25.12', provider: 'Mistral AI', mmlu: 84.2, hellaswag: 90.2, humaneval: 80.4, gpqa: 51.8, inputCost: 0.30, outputCost: 0.90, context: "128K", category: "Balanced", enabled: true,
    pros: "European company = GDPR compliance. Fine-tuned for reasoning. Good speed/capability balance. Easier self-host than US models.",
    cons: "Less brand recognition = fewer integrations. Smaller community. Less polished than Anthropic.",
    bestFor: "European GDPR startups, self-hosting with compliance, general-purpose with compliance needs." },
  { id: 6, name: 'Mistral Codestral 25.08', provider: 'Mistral AI', mmlu: 82.8, hellaswag: 89.4, humaneval: 84.8, gpqa: 49.4, inputCost: 0.25, outputCost: 0.75, context: "64K", category: "Specialized Coding", enabled: true,
    pros: "Specifically fine-tuned for code - not a general model. 80+ languages. Excellent SQL and data queries.",
    cons: "Less capable non-coding. Smaller context than general models. Less docs than Anthropic.",
    bestFor: "Data engineering pipelines, SQL generation, code translation, developer tools." },
  { id: 7, name: 'Moonshot AI Kimi K2.5', provider: 'Moonshot AI', mmlu: 85.8, hellaswag: 91.2, humaneval: 79.4, gpqa: 53.2, inputCost: 0.50, outputCost: 1.00, context: "200K", category: "Balanced", enabled: true,
    pros: "Strong across all benchmarks - no obvious weakness. Chinese market leader. Good English despite Asian focus.",
    cons: "Less known West = fewer integrations. Mid-range pricing. Chinese-dominant docs.",
    bestFor: "Multilingual apps, Asian market, general-purpose, broad capability needs." },
  { id: 8, name: 'Claude 3.5 Haiku', provider: 'Anthropic', mmlu: 84.6, hellaswag: 90.4, humaneval: 76.8, gpqa: 51.2, inputCost: 0.25, outputCost: 1.25, context: "200K", category: "Conversational", enabled: true,
    pros: "Fastest Claude - nearly instant. Anthropic safety tuning. Excellent customer service and chat.",
    cons: "Higher output cost for long chats. Not as capable as Sonnet for complex tasks.",
    bestFor: "Customer chatbots, real-time chat, safety-critical apps, conversational AI at scale." },
  { id: 9, name: 'xAI Grok 4.1 Fast', provider: 'xAI', mmlu: 83.4, hellaswag: 89.6, humaneval: 75.4, gpqa: 50.4, inputCost: 0.15, outputCost: 0.60, context: "131K", category: "Balanced", enabled: true,
    pros: "Only model with native X/Twitter integration. Real-time X data access. Musk ecosystem appeal.",
    cons: "Newest = less proven. Smaller ecosystem. Less docs/community.",
    bestFor: "X/Twitter integration, social AI, real-time trends, Musk products." },
  { id: 10, name: 'Meta Llama 4 Maverick', provider: 'Meta', mmlu: 82.6, hellaswag: 88.8, humaneval: 74.8, gpqa: 48.8, inputCost: 0.20, outputCost: 0.60, context: "128K", category: "Open Source", enabled: true,
    pros: "Fully open-source with commercial license. No API costs if self-hosted. Fine-tunable. Privacy control.",
    cons: "Requires ML engineering. Infrastructure costs money. Less polished than commercial.",
    bestFor: "Companies with ML teams, privacy apps, customization, cost optimization." },
  { id: 11, name: 'Meta Llama 4 Scout', provider: 'Meta', mmlu: 78.4, hellaswag: 86.2, humaneval: 68.4, gpqa: 45.6, inputCost: 0.10, outputCost: 0.30, context: "32K", category: "Open Source", enabled: true,
    pros: "Smallest with API = lowest API cost. Fastest inference. Fully open-source.",
    cons: "Weaker reasoning. Not complex tasks. Requires quantization for efficiency.",
    bestFor: "Edge deployment, simple classification, cost-sensitive inference, learning." },
  { id: 12, name: 'Qwen3 Thinking 30B', provider: 'Alibaba', mmlu: 80.6, hellaswag: 88.4, humaneval: 71.2, gpqa: 47.8, inputCost: 0.10, outputCost: 0.40, context: "32K", category: "Reasoning Focus", enabled: true,
    pros: "Explicit step-by-step reasoning. Excellent math/logic. Good for educational explanation.",
    cons: "Slower due to thinking. Smaller = less knowledge. Not for creative writing.",
    bestFor: "Math tutoring, logic puzzles, step-by-step problems, education." },
  { id: 13, name: 'MiniMax M2.1 (Free)', provider: 'MiniMax', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0, outputCost: 0, context: "200K", category: "Free Tier", enabled: true,
    pros: "Completely free with subscription. Competitive benchmarks rival paid. Great prototyping. 200K context exceptional.",
    cons: "Rate limits. No commercial SLA. Usage caps. Newer company.",
    bestFor: "Personal projects, prototyping, learning AI, development testing." },
  { id: 14, name: 'MiniMax M2.1 (Paid)', provider: 'MiniMax', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0.50, outputCost: 1.00, context: "200K", category: "Balanced", enabled: true,
    pros: "Same performance, limits removed. Commercial allowed. Unlimited. Competitive pricing.",
    cons: "Newer = less track record. Fewer integrations. Less brand trust.",
    bestFor: "Commercial use, unlimited needs, cost-conscious startups." },
  { id: 15, name: 'MiniMax Lightning', provider: 'MiniMax', mmlu: 82.2, hellaswag: 88.8, humaneval: 76.4, gpqa: 49.8, inputCost: 0, outputCost: 0, context: "64K", category: "Free Tier", enabled: true,
    pros: "Fastest MiniMax. Free for simple tasks. High-volume queries. Low latency.",
    cons: "Lower benchmarks than M2.1. Small context. Not complex reasoning.",
    bestFor: "Simple chatbots, high-volume classification, real-time queries." },
  { id: 16, name: 'Claude 3.7 Sonnet', provider: 'Anthropic', mmlu: 88.4, hellaswag: 92.6, humaneval: 85.2, gpqa: 58.4, inputCost: 3.00, outputCost: 15.00, context: "200K", category: "Flagship", enabled: false,
    pros: "Anthropic's most capable. Exceptional multi-step reasoning. Best code architecture/refactors. 200K context.",
    cons: "Most expensive API. Higher latency. Overkill for simple tasks.",
    bestFor: "Enterprise research, complex codebases, sophisticated reasoning." },
  { id: 17, name: 'Claude 3.5 Sonnet', provider: 'Anthropic', mmlu: 87.2, hellaswag: 92.1, humaneval: 83.6, gpqa: 56.8, inputCost: 3.00, outputCost: 15.00, context: "200K", category: "Flagship", enabled: false,
    pros: "Claude capability/speed sweet spot. Excellent coding/analysis. Very reliable.",
    cons: "Still expensive. 3.7 better for complex tasks.",
    bestFor: "General enterprise, coding assistance, document analysis." },
  { id: 18, name: 'GPT-4 Turbo', provider: 'OpenAI', mmlu: 89.2, hellaswag: 93.4, humaneval: 86.4, gpqa: 59.2, inputCost: 10.00, outputCost: 30.00, context: "128K", category: "Flagship", enabled: false,
    pros: "OpenAI's most capable. Best tool use/function calling. Excellent JSONStructured. Massive ecosystem.",
    cons: "Extremely expensive. JSON inconsistent. Creative writing less nuanced than Claude.",
    bestFor: "Enterprise tool use, function pipelines, complex agents." },
  { id: 19, name: 'GPT-4o', provider: 'OpenAI', mmlu: 88.6, hellaswag: 92.8, humaneval: 84.8, gpqa: 57.6, inputCost: 5.00, outputCost: 15.00, context: "128K", category: "Flagship", enabled: false,
    pros: "Omni = native vision/audio/text. Excellent multimodal. Faster than GPT-4 Turbo.",
    cons: "Still expensive. Audio varies. Less deep reasoning for complex tasks.",
    bestFor: "Multimodal apps, vision+text, real-time audio." },
  { id: 20, name: 'GPT-3.5 Turbo', provider: 'OpenAI', mmlu: 71.2, hellaswag: 84.6, humaneval: 68.4, gpqa: 44.2, inputCost: 0.50, outputCost: 1.50, context: "16K", category: "Budget", enabled: false,
    pros: "Cheapest OpenAI. Fastest. Good simple classification. Well-documented.",
    cons: "Weak reasoning. Limited context. More hallucinations.",
    bestFor: "Simple classification, basic extraction, high-volume low-complexity." },
  { id: 21, name: 'DeepSeek Chat', provider: 'DeepSeek', mmlu: 84.8, hellaswag: 90.2, humaneval: 80.6, gpqa: 51.8, inputCost: 0.14, outputCost: 0.28, context: "128K", category: "Budget", enabled: false,
    pros: "Chat-optimized V3.2. Better conversational flow. Same low pricing.",
    cons: "Not as capable as V3.2 for technical. Less popular.",
    bestFor: "Conversational AI on budget, customer chatbots." },
  { id: 22, name: 'Qwen 2.5', provider: 'Alibaba', mmlu: 82.4, hellaswag: 89.4, humaneval: 76.2, gpqa: 49.4, inputCost: 0.07, outputCost: 0.14, context: "128K", category: "Budget", enabled: false,
    pros: "Extremely cheap. Good multilingual. 128K context.",
    cons: "Less capable than Qwen3 Coder for code.",
    bestFor: "Multilingual, cost-optimized general use." },
  { id: 23, name: 'CodeLlama 70B', provider: 'Meta', mmlu: 80.2, hellaswag: 88.4, humaneval: 84.6, gpqa: 46.8, inputCost: 0, outputCost: 0, context: "128K", category: "Specialized Coding", enabled: false,
    pros: "70B parameters. Fully open-source. Fine-tuned for code. 80+ languages.",
    cons: "Requires GPU. Slower than API. Expensive self-host.",
    bestFor: "Self-hosted code, fine-tuning proprietary code." },
  { id: 24, name: 'StarCoder 2', provider: 'BigCode', mmlu: 74.6, hellaswag: 84.2, humaneval: 78.4, gpqa: 42.6, inputCost: 0, outputCost: 0, context: "16K", category: "Specialized Coding", enabled: false,
    pros: "Fully open-source. 300+ languages. Great for underrepresented languages.",
    cons: "Smaller context. Less capable proprietary models.",
    bestFor: "Open-source code, underrepresented languages, research." },
  { id: 25, name: 'WizardMath', provider: 'Microsoft', mmlu: 72.4, hellaswag: 82.6, humaneval: 64.8, gpqa: 48.2, inputCost: 0, outputCost: 0, context: "8K", category: "Reasoning Focus", enabled: false,
    pros: "Math-specialized. Fine-tuned for arithmetic. Open-source.",
    cons: "Very small context. Not general-purpose.",
    bestFor: "Math computations, educational math, calculations." },
  { id: 26, name: 'Llama 3.1 Instruct', provider: 'Meta', mmlu: 86.4, hellaswag: 91.2, humaneval: 78.4, gpqa: 54.2, inputCost: 0, outputCost: 0, context: "128K", category: "Conversational", enabled: false,
    pros: "Meta's best instruction-tuned. Fully open-source. Excellent chat. Large community.",
    cons: "Less polished than commercial. Requires self-hosting.",
    bestFor: "Self-hosted chatbots, open-source, fine-tuning." },
  { id: 27, name: 'Gemma 2', provider: 'Google', mmlu: 84.2, hellaswag: 89.8, humaneval: 74.6, gpqa: 50.8, inputCost: 0, outputCost: 0, context: "128K", category: "Conversational", enabled: false,
    pros: "Google's efficient open-source. Fast inference. Good for edge.",
    cons: "Less capable than larger models.",
    bestFor: "Edge deployment, mobile, efficient inference." },
  { id: 28, name: 'Command R+', provider: 'Cohere', mmlu: 85.6, hellaswag: 90.8, humaneval: 78.2, gpqa: 53.6, inputCost: 0.50, outputCost: 2.00, context: "128K", category: "Flagship", enabled: false,
    pros: "Enterprise RAG specialist. Best retrieval augmentation. Strong citations. SOC2 compliant.",
    cons: "Less known than OpenAI. Growing ecosystem.",
    bestFor: "Enterprise RAG, document Q&A, knowledge management." },
  { id: 29, name: 'Azure AI', provider: 'Microsoft', mmlu: 86.8, hellaswag: 91.4, humaneval: 79.6, gpqa: 55.2, inputCost: 0, outputCost: 0, context: "128K", category: "Flagship", enabled: false,
    pros: "Deep Microsoft integration. Enterprise compliance. Azure benefits.",
    cons: "Complex pricing. Requires Azure. Less flexible.",
    bestFor: "Microsoft enterprise, Azure-native, compliance." },
  { id: 30, name: 'Amazon Titan', provider: 'AWS', mmlu: 85.4, hellaswag: 90.6, humaneval: 77.8, gpqa: 52.8, inputCost: 0, outputCost: 0, context: "128K", category: "Flagship", enabled: false,
    pros: "AWS native. Seamless Bedrock. Strong security. S3/EC2 synergy.",
    cons: "AWS pricing complexity. Vendor lock-in.",
    bestFor: "AWS-native, Bedrock users, AWS ecosystem." },
]

function Tooltip({ text, children }) {
  return <span className="tooltip-container" title={text}>{children}</span>
}

function ComparisonTable({ models }) {
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id || null)
  const [showDisabled, setShowDisabled] = useState(false)
  const selectedModel = models.find(m => m.id === Number(selectedModelId)) || models[0]
  
  const calculatePercentage = (model, selected, metric) => {
    const val1 = model[metric]
    const val2 = selected[metric]
    if (val2 === 0) return 0
    return (val1 / val2) * 100
  }
  
  const getPctClass = (pct) => {
    if (pct >= 100) return 'positive-diff'
    if (pct >= 95) return 'neutral-diff'
    return 'negative-diff'
  }
  
  const getCategoryColor = (cat) => categoryOptions[cat]?.color || '#888'
  
  const displayModels = useMemo(() => {
    return showDisabled ? models : models.filter(m => m.enabled)
  }, [models, showDisabled])
  
  const calculateCost = (model, inputs, outputs) => {
    return (inputs * model.inputCost / 1000000) + (outputs * model.outputCost / 1000000)
  }
  
  const baselineCost = selectedModel ? calculateCost(selectedModel, 1000000, 5000000) : 0
  
  return (
    <div className="table-section">
      <h2>📊 Model Comparison</h2>
      <p className="table-description">Benchmarks (% of baseline), costs, and specs. Toggle to show disabled models.</p>
      
      <div style={{ padding: '0 15px', marginBottom: '15px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label>
          <strong>Baseline:</strong>
          <select value={selectedModelId || ''} onChange={(e) => setSelectedModelId(Number(e.target.value))} style={{ marginLeft: '8px', padding: '8px 12px', borderRadius: '8px', border: '2px solid #667eea', background: '#fff', color: '#1a1a2e', fontWeight: '600' }}>
            {models.filter(m => m.enabled).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <label style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={showDisabled} onChange={(e) => setShowDisabled(e.target.checked)} style={{ marginRight: '6px' }} />
          Show disabled ({models.filter(m => !m.enabled).length})
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
              <th><Tooltip text="Cost per 1M input + 5M output">Est. $</Tooltip></th>
              <th><Tooltip text="Cost % of baseline">Cost %</Tooltip></th>
            </tr>
          </thead>
          <tbody>
            {displayModels.map(model => {
              const isSelected = model.id === selectedModel?.id
              const mmluPct = selectedModel ? calculatePercentage(model, selectedModel, 'mmlu') : 0
              const hellaswagPct = selectedModel ? calculatePercentage(model, selectedModel, 'hellaswag') : 0
              const humanevalPct = selectedModel ? calculatePercentage(model, selectedModel, 'humaneval') : 0
              const gpqaPct = selectedModel ? calculatePercentage(model, selectedModel, 'gpqa') : 0
              const cost = selectedModel ? calculateCost(model, 1000000, 5000000) : 0
              const costPct = selectedModel && baselineCost > 0 ? (cost / baselineCost) * 100 : 0
              
              return (
                <tr key={model.id} style={{ opacity: model.enabled ? 1 : 0.55, background: isSelected ? 'rgba(103, 126, 234, 0.15)' : undefined }}>
                  <td>
                    <strong>{model.name}</strong>
                    {model.provider && <span style={{ fontSize: '0.8em', color: '#888', display: 'block' }}>{model.provider}</span>}
                    {!model.enabled && <span style={{ fontSize: '0.7em', background: '#666', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>DISABLED</span>}
                    {model.free && <span style={{ marginLeft: '4px', background: '#11998e', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7em' }}>FREE</span>}
                    {model.openSource && !model.free && <span style={{ marginLeft: '4px', background: '#9b59b6', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7em' }}>OSS</span>}
                  </td>
                  <td>
                    <span>{model.mmlu}%</span>
                    {selectedModel && !isSelected && <span className={getPctClass(mmluPct)} style={{ marginLeft: '6px', fontSize: '0.8em', fontWeight: '600' }}>{mmluPct.toFixed(0)}%</span>}
                  </td>
                  <td>
                    <span>{model.hellaswag}%</span>
                    {selectedModel && !isSelected && <span className={getPctClass(hellaswagPct)} style={{ marginLeft: '6px', fontSize: '0.8em', fontWeight: '600' }}>{hellaswagPct.toFixed(0)}%</span>}
                  </td>
                  <td>
                    <span>{model.humaneval}%</span>
                    {selectedModel && !isSelected && <span className={getPctClass(humanevalPct)} style={{ marginLeft: '6px', fontSize: '0.8em', fontWeight: '600' }}>{humanevalPct.toFixed(0)}%</span>}
                  </td>
                  <td>
                    <span>{model.gpqa}%</span>
                    {selectedModel && !isSelected && <span className={getPctClass(gpqaPct)} style={{ marginLeft: '6px', fontSize: '0.8em', fontWeight: '600' }}>{gpqaPct.toFixed(0)}%</span>}
                  </td>
                  <td style={{ color: '#f1c40f', fontWeight: '500' }}>{model.context}</td>
                  <td><span style={{ background: getCategoryColor(model.category), color: '#fff', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7em', fontWeight: '600' }}>{model.category}</span></td>
                  <td style={{ fontWeight: '600' }}>{model.free ? 'FREE' : `$${cost.toFixed(2)}`}</td>
                  <td>
                    {selectedModel && !isSelected ? (
                      <span className={costPct <= 100 ? 'positive-diff' : 'negative-diff'} style={{ fontWeight: '600' }}>
                        {model.free ? 'FREE' : `${costPct.toFixed(0)}%`}
                      </span>
                    ) : <span style={{ color: '#888' }}>-</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function QualitativeTable({ models }) {
  const [showDisabled, setShowDisabled] = useState(false)
  
  const displayModels = useMemo(() => {
    return showDisabled ? models : models.filter(m => m.enabled)
  }, [models, showDisabled])
  
  const getCategoryColor = (cat) => categoryOptions[cat]?.color || '#888'
  
  return (
    <div className="table-section">
      <h2>📋 Qualitative Analysis</h2>
      <p className="table-description">What makes each model special, their weaknesses, and ideal use cases.</p>
      
      <div style={{ padding: '0 15px', marginBottom: '15px' }}>
        <label style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={showDisabled} onChange={(e) => setShowDisabled(e.target.checked)} style={{ marginRight: '6px' }} />
          Show disabled models
        </label>
      </div>
      
      <div className="table-container">
        <table className="model-table qualitative-table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Model</th>
              <th style={{ width: '10%' }}>Cat</th>
              <th style={{ width: '22%' }}>✅ What Makes It Special</th>
              <th style={{ width: '22%' }}>❌ Where It Falls Short</th>
              <th style={{ width: '28%' }}>🎯 Best Use Cases</th>
            </tr>
          </thead>
          <tbody>
            {displayModels.map(model => (
              <tr key={model.id} style={{ opacity: model.enabled ? 1 : 0.55 }}>
                <td>
                  <strong>{model.name}</strong>
                  {model.provider && <span style={{ fontSize: '0.8em', color: '#888', display: 'block' }}>{model.provider}</span>}
                  {!model.enabled && <span style={{ fontSize: '0.7em', background: '#666', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>DISABLED</span>}
                </td>
                <td><span style={{ background: getCategoryColor(model.category), color: '#fff', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7em' }}>{model.category}</span></td>
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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFree, setFilterFree] = useState(false)
  
  const filteredModels = useMemo(() => {
    return allModels.filter(model => {
      if (filterFree && !model.free && !model.openSource) return false
      if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
  }, [filterFree, searchTerm])
  
  const totals = useMemo(() => ({
    enabled: allModels.filter(m => m.enabled).length,
    disabled: allModels.filter(m => !m.enabled).length,
    free: allModels.filter(m => m.free).length,
    openSource: allModels.filter(m => m.openSource).length,
    avgMmlu: (allModels.filter(m => m.enabled).reduce((sum, m) => sum + m.mmlu, 0) / allModels.filter(m => m.enabled).length).toFixed(1),
  }), [])
  
  return (
    <div className="app">
      <header className="header">
        <h1>🤖 LLM Model Comparison</h1>
        <p>Compare 30 AI models across benchmarks, costs, and qualitative analysis</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card"><h3>{totals.enabled}/{totals.enabled + totals.disabled}</h3><p>Models (enabled/total)</p></div>
        <div className="stat-card"><h3>{totals.free}</h3><p>Free Options</p></div>
        <div className="stat-card"><h3>{totals.openSource}</h3><p>Open Source</p></div>
        <div className="stat-card"><h3>{totals.avgMmlu}%</h3><p>Avg MMLU (enabled)</p></div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>🔍 Search Models</label>
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">
          <label><input type="checkbox" checked={filterFree} onChange={(e) => setFilterFree(e.target.checked)} style={{ marginRight: '8px' }} />Free & Open Source Only</label>
        </div>
      </div>

      <ComparisonTable models={filteredModels} />
      <QualitativeTable models={filteredModels} />

      <footer className="footer">
        <p>Built with React + Vite | <a href="https://github.com/mloren13/llm-comparison-webapp" target="_blank">View on GitHub</a></p>
      </footer>
    </div>
  )
}

export default App
