import { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, BookOpen, Presentation, Columns, Lightbulb, CheckSquare, Library, BookMarked } from 'lucide-react';
import { parseGrammar, findDerivation, findAllLeftmostDerivations, type ParseTreeNode, type DerivationStep } from './cfgEngine';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'theory' | 'visualizer' | 'examples' | 'ambiguity' | 'quiz' | 'reference'>('home');
  const [exampleGrammar, setExampleGrammar] = useState<string>('');
  const [exampleTarget, setExampleTarget] = useState<string>('');

  const loadExample = (grammar: string, target: string) => {
    setExampleGrammar(grammar);
    setExampleTarget(target);
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Presentation size={20} />
            CFG Derivation & Parse Tree
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-group">
            <div className="nav-group-title">Introduction</div>
            <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              <Lightbulb size={16} /> Overview
            </button>
          </div>
          
          <div className="nav-group">
            <div className="nav-group-title">Learn</div>
            <button className={`nav-item ${activeTab === 'theory' ? 'active' : ''}`} onClick={() => setActiveTab('theory')}>
              <BookOpen size={16} /> Topic Theory
            </button>
            <button className={`nav-item ${activeTab === 'examples' ? 'active' : ''}`} onClick={() => setActiveTab('examples')}>
              <Library size={16} /> Built-in Examples
            </button>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Tools</div>
            <button className={`nav-item ${activeTab === 'visualizer' ? 'active' : ''}`} onClick={() => setActiveTab('visualizer')}>
              <Play size={16} /> CFG Visualizer
            </button>
            <button className={`nav-item ${activeTab === 'ambiguity' ? 'active' : ''}`} onClick={() => setActiveTab('ambiguity')}>
              <Columns size={16} /> Ambiguity Checker
            </button>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Practice</div>
            <button className={`nav-item ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>
              <CheckSquare size={16} /> Knowledge Quiz
            </button>
            <button className={`nav-item ${activeTab === 'reference' ? 'active' : ''}`} onClick={() => setActiveTab('reference')}>
              <BookMarked size={16} /> Quick Reference
            </button>
          </div>
        </nav>
      </aside>

      <main className="main-area">
        <div className="content-container fade-in">
          {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}
          {activeTab === 'theory' && <TheoryView />}
          {activeTab === 'visualizer' && <VisualizerView initialGrammar={exampleGrammar} initialTarget={exampleTarget} />}
          {activeTab === 'examples' && <ExamplesView setActiveTab={setActiveTab} setExample={loadExample} />}
          {activeTab === 'ambiguity' && <AmbiguityView />}
          {activeTab === 'quiz' && <QuizView />}
          {activeTab === 'reference' && <ReferenceView />}
        </div>
      </main>
    </div>
  );
}

const HomeView = ({ setActiveTab }: { setActiveTab: (tab: any) => void }) => (
  <div>
    <h1>Context-Free Grammar Derivation<br/>and Parse Tree Generator</h1>
    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '2rem' }}>
      An academic tool designed to help you learn, visualize, and teach the structure of context-free languages. Step-by-step derivations and live parse trees ensure no theory stays abstract.
    </p>
    
    <div className="card" style={{ maxWidth: '600px' }}>
      <h3>Getting Started</h3>
      <p>If you're new to Context-Free Grammars, start with the topic theory. If you want to jump straight into the visualizer, be sure to check how production rules are formatted.</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => setActiveTab('theory')}>
          Start Topic Theory
        </button>
        <button className="btn btn-secondary" onClick={() => setActiveTab('visualizer')}>
          Open Visualizer
        </button>
      </div>
    </div>
  </div>
);

const TheoryView = () => (
  <div>
    <h1>Context-Free Grammar Derivation and Parse Tree Generator</h1>
    
    <div className="card">
      <h2 style={{ fontSize: '1.25rem', borderBottom: 'none' }}>1. What is a Context-Free Grammar?</h2>
      <p>A Context-Free Grammar (CFG) is a set of formal rules that describes how strings in a language are built. It's called "context-free" because any rule can be applied to a non-terminal symbol regardless of what surrounds it — the context doesn't matter.</p>
      <p>CFGs are used heavily in computer science to define the syntax of programming languages, build compilers, and model parts of natural language.</p>
    </div>

    <div className="card">
      <h2 style={{ fontSize: '1.25rem', borderBottom: 'none' }}>2. The Four Components <span className="inline-code">G = (V, T, P, S)</span></h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Symbol</th><th>Name</th><th>Meaning</th></tr>
          </thead>
          <tbody>
            <tr><td><code>V</code></td><td>Non-terminals</td><td>Placeholder symbols that get replaced (e.g., S, A, E).</td></tr>
            <tr><td><code>T</code></td><td>Terminals</td><td>The actual characters in the final string: (e.g., a, b, id).</td></tr>
            <tr><td><code>P</code></td><td>Production Rules</td><td>Rules dictating how non-terminals get replaced.</td></tr>
            <tr><td><code>S</code></td><td>Start Symbol</td><td>The non-terminal from which the derivation begins.</td></tr>
          </tbody>
        </table>
      </div>
      <p className="form-help"><strong>Rule of thumb:</strong> Non-terminals are work-in-progress. Terminals are finished pieces.</p>
    </div>

    <div className="card">
      <h2 style={{ fontSize: '1.25rem', borderBottom: 'none' }}>3. How to write rules</h2>
      <p>A production rule format in this tool:</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li>Use <strong>capital letters</strong> for non-terminals (S, A, B).</li>
        <li>Use <strong>lowercase letters/symbols</strong> for terminals (a, b, +, 0, id).</li>
        <li>Use <code>-&gt;</code> to separate sides.</li>
        <li>Use <code>|</code> to list alternatives.</li>
        <li>Use <code>eps</code> or <code>epsilon</code> for empty string.</li>
      </ul>
      <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '4px' }}>
        <p className="mono">S -&gt; a S b | eps</p>
        <p className="form-help" style={{ marginTop: '0.5rem' }}>Generates matched strings: aabb, aaabbb, etc.</p>
      </div>
    </div>

    <div className="card">
      <h2 style={{ fontSize: '1.25rem', borderBottom: 'none' }}>4. Derivations: Leftmost vs Rightmost</h2>
      <p>A <strong>derivation</strong> is a sequence of rule applications that transforms the start symbol into a target string. There are two standard strategies:</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li><strong>Leftmost Derivation (LMD):</strong> Always expand the leftmost non-terminal first.</li>
        <li><strong>Rightmost Derivation (RMD):</strong> Always expand the rightmost non-terminal first.</li>
      </ul>
      <p><strong>Example:</strong> Grammar <code>S → aSb | ε</code>, deriving "aabb"</p>
      <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
        <p className="mono" style={{ marginBottom: '0.5rem' }}><strong>Leftmost:</strong></p>
        <p className="mono">S ⇒ aSb ⇒ aaSbb ⇒ aaεbb ⇒ aabb</p>
      </div>
      <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '4px' }}>
        <p className="mono" style={{ marginBottom: '0.5rem' }}><strong>Rightmost:</strong></p>
        <p className="mono">S ⇒ aSb ⇒ aaSbb ⇒ aaεbb ⇒ aabb</p>
        <p className="form-help" style={{ marginTop: '0.5rem' }}>Note: For this grammar, LMD and RMD produce the same sequence since there's only one non-terminal at each step.</p>
      </div>
    </div>

    <div className="card">
      <h2 style={{ fontSize: '1.25rem', borderBottom: 'none' }}>5. Parse Trees</h2>
      <p>A <strong>parse tree</strong> records the structural result of a derivation. The root is the start symbol. Internal nodes are non-terminals. Leaves are terminals or ε. Reading leaves left-to-right gives the derived string.</p>
      <p><strong>Example:</strong> Grammar <code>S → aSb | ε</code>, deriving "ab"</p>
      <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '4px', fontFamily: 'monospace', whiteSpace: 'pre' }}>
{`      S
     /|\\
    a S b
      |
      ε`}
      </div>
      <p className="form-help" style={{ marginTop: '0.5rem' }}>The leaves read left-to-right: a, ε, b → "ab"</p>
    </div>

    <div className="card">
      <h2 style={{ fontSize: '1.25rem', borderBottom: 'none' }}>6. Ambiguous Grammars</h2>
      <p>A grammar is <strong>ambiguous</strong> if any string has two or more distinct parse trees. This means the grammar doesn't uniquely define the structure of that string.</p>
      <p><strong>Example:</strong> Grammar <code>E → E + E | E * E | id</code> with string "id + id * id"</p>
      <p>This grammar is ambiguous because it doesn't specify whether + or * has higher precedence. Two possible parse trees:</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '4px' }}>
          <p className="mono" style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Tree 1: (id + id) * id</p>
          <div style={{ fontFamily: 'monospace', whiteSpace: 'pre', fontSize: '0.85rem' }}>
{`      E
     /|\\
    E * E
   /|\\  |
  E + E id
  |   |
 id  id`}
          </div>
        </div>
        <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '4px' }}>
          <p className="mono" style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Tree 2: id + (id * id)</p>
          <div style={{ fontFamily: 'monospace', whiteSpace: 'pre', fontSize: '0.85rem' }}>
{`      E
     /|\\
    E + E
    |  /|\\
   id E * E
      |   |
     id  id`}
          </div>
        </div>
      </div>
      <p className="form-help" style={{ marginTop: '1rem' }}>To fix this, use separate non-terminals for different precedence levels (E for +, T for *, F for atoms).</p>
    </div>
  </div>
);

const TreeView = ({ node }: { node: ParseTreeNode }) => {
  return (
    <div className="tree-canvas">
      <TreeNode node={node} />
    </div>
  );
};

const TreeNode = ({ node }: { node: ParseTreeNode }) => {
  const isTerminal = node.isTerminal;
  const isEps = node.symbol === 'ε' || node.symbol === 'eps';
  
  return (
    <div className="node">
      <div className={`node-circle ${isTerminal && !isEps ? 'terminal' : ''} ${isEps ? 'epsilon' : ''}`}>
        {node.symbol}
      </div>
      {node.children && node.children.length > 0 && (
        <div className={`node-children ${node.children.length === 1 ? 'single-child' : ''}`}>
          <div className="node-connector"></div>
          {node.children.map((child, i) => (
            <TreeNode key={`${child.symbol}-${i}`} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const VisualizerView = ({ initialGrammar, initialTarget }: { initialGrammar?: string, initialTarget?: string }) => {
  const [grammarInput, setGrammarInput] = useState(initialGrammar || 'S -> a S b | eps');
  const [targetString, setTargetString] = useState(initialTarget || 'a a b b');
  const [mode, setMode] = useState<'lmd' | 'rmd'>('lmd');
  const [result, setResult] = useState<{ steps: DerivationStep[], tree: ParseTreeNode } | null | undefined>(undefined);
  const [status, setStatus] = useState<'idle' | 'success' | 'fail' | 'error'>('idle');

  // Update when props change
  useEffect(() => {
    if (initialGrammar) {
      setGrammarInput(initialGrammar);
    }
    if (initialTarget) {
      setTargetString(initialTarget);
    }
    // Reset result when grammar or target changes
    setStatus('idle');
    setResult(undefined);
  }, [initialGrammar, initialTarget]);

  const handleGenerate = () => {
    try {
      const grammar = parseGrammar(grammarInput);
      if (!grammar) { setStatus('error'); return; }
      const res = findDerivation(grammar, targetString, mode === 'lmd');
      setResult(res);
      setStatus(res ? 'success' : 'fail');
    } catch (e) {
      console.error('Derivation error:', e);
      setStatus('error');
    }
  };

  return (
    <div>
      <h1>Context-Free Grammar Derivation and Parse Tree Generator</h1>
      
      <div className="editor-layout">
        <div className="card" style={{ margin: 0 }}>
          <div className="form-group">
            <label className="form-label">Production Rules (G)</label>
            <textarea 
              className="form-input" 
              value={grammarInput} 
              onChange={e => setGrammarInput(e.target.value)}
            />
            <div className="form-help">One rule per line. Caps = Non-terminal.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Target String (w)</label>
            <input 
              type="text" 
              className="form-input" 
              value={targetString} 
              onChange={e => setTargetString(e.target.value)}
            />
            <div className="form-help">Separate tokens with spaces (e.g. id + id). Use eps for empty string.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Derivation Strategy</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="radio" checked={mode === 'lmd'} onChange={() => setMode('lmd')} /> Leftmost (LL)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="radio" checked={mode === 'rmd'} onChange={() => setMode('rmd')} /> Rightmost (LR)
              </label>
            </div>
          </div>

          <button className="btn btn-primary btn-block" onClick={handleGenerate}>
            Generate Structure
          </button>

          {status === 'success' && <div className="alert alert-success"><CheckCircle size={18}/> String derived successfully.</div>}
          {status === 'fail' && <div className="alert alert-danger"><XCircle size={18}/> String invalid/not in language.</div>}
          {status === 'error' && <div className="alert alert-warning"><AlertTriangle size={18}/> Syntax error in grammar.</div>}
        </div>

        <div className="output-panel">
          <div className="output-header">Visual Output</div>
          <div className="output-body">
            {!result ? (
               <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Awaiting execution...</p>
            ) : (
              <>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Derivation Trace</h3>
                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-app)', borderRadius: '6px' }}>
                  {result.steps.map((step, idx) => (
                    <div key={idx} className="derivation-step">
                      <span className="step-num">Step {idx}</span>
                      <span className="step-form">{step.sententialForm.join(' ') || 'ε'}</span>
                      <span className="step-rule">
                        {step.ruleUsed ? `(${step.ruleUsed.lhs} → ${step.ruleUsed.rhs.join(' ') || 'ε'})` : ''}
                      </span>
                    </div>
                  ))}
                </div>
                
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Parse Tree Topology</h3>
                <TreeView node={result.tree} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamplesView = ({ setActiveTab, setExample }: { setActiveTab?: (tab: any) => void, setExample?: (grammar: string, target: string) => void }) => {
  const examples = [
    {
      title: "aⁿbⁿ (Balanced Pairs)",
      description: "Classic non-regular language with equal a's and b's.",
      grammar: "S -> a S b | eps",
      target: "a a b b",
      tag: "normal"
    },
    {
      title: "Arithmetic (Unambiguous, correct precedence)",
      description: "Enforces multiplication before addition via grammar structure.",
      grammar: "E -> E + T | T\nT -> T * F | F\nF -> id",
      target: "id + id * id",
      tag: "normal"
    },
    {
      title: "Arithmetic (Ambiguous)",
      description: "Same language as Example 2 but ambiguous — try in the Ambiguity Checker!",
      grammar: "E -> E + E | E * E | id",
      target: "id + id * id",
      tag: "ambiguous"
    },
    {
      title: "Palindromes over {a,b}",
      description: "Strings that read the same forwards and backwards.",
      grammar: "S -> a S a | b S b | a | b | eps",
      target: "a b b a",
      tag: "normal"
    },
    {
      title: "Matched Parentheses",
      description: "Properly nested bracket structures — a context-free classic.",
      grammar: "S -> ( S ) | S S | eps",
      target: "( ( ) ( ) )",
      tag: "normal"
    },
    {
      title: "Dangling-Else (Ambiguous)",
      description: "The classic dangling-else ambiguity in programming languages.",
      grammar: "S -> if E then S | if E then S else S | stmt\nE -> cond",
      target: "if cond then if cond then stmt else stmt",
      tag: "ambiguous"
    }
  ];

  const handleRunExample = (grammar: string, target: string) => {
    if (setExample) {
      setExample(grammar, target);
    }
    if (setActiveTab) {
      setActiveTab('visualizer');
    }
  };

  const handleCheckAmbiguity = (grammar: string, target: string) => {
    if (setExample) {
      setExample(grammar, target);
    }
    if (setActiveTab) {
      setActiveTab('ambiguity');
    }
  };

  return (
    <div>
      <h1>Built-in Language Examples</h1>
      <p style={{ marginBottom: '2rem' }}>Load these classic grammars directly into the Visualizer to see how standard context-free structures operate.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {examples.map((example, idx) => (
          <div className="card" key={idx}>
            <span className={`example-tag ${example.tag}`}>
              {example.tag === 'ambiguous' ? 'Ambiguous' : 'Standard'}
            </span>
            <h4>{example.title}</h4>
            <p className="form-help">{example.description}</p>
            <div style={{ padding: '1rem', background: 'var(--bg-app)', margin: '1rem 0', borderRadius: '4px' }}>
              <p className="mono" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{example.grammar}</p>
            </div>
            <p style={{ marginBottom: '1rem' }}>Target: <code>{example.target}</code></p>
            <button 
              className="btn btn-primary btn-block" 
              onClick={() => handleRunExample(example.grammar, example.target)}
            >
              Run in Visualizer
            </button>
            {example.tag === 'ambiguous' && (
              <button 
                className="btn btn-secondary btn-block" 
                style={{ marginTop: '0.5rem' }}
                onClick={() => handleCheckAmbiguity(example.grammar, example.target)}
              >
                Check Ambiguity
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AmbiguityView = () => {
  const [grammarInput, setGrammarInput] = useState('E -> E + E | E * E | id');
  const [targetString, setTargetString] = useState('id + id * id');
  const [status, setStatus] = useState<'idle' | 'checking' | 'unambiguous' | 'ambiguous' | 'error'>('idle');
  const [derivations, setDerivations] = useState<{ steps: DerivationStep[], tree: ParseTreeNode }[]>([]);

  const handleCheck = () => {
    try {
      setStatus('checking');
      setTimeout(() => {
        const grammar = parseGrammar(grammarInput);
        if (!grammar) { setStatus('error'); return; }
        const allDerivations = findAllLeftmostDerivations(grammar, targetString, 2);
        
        if (allDerivations.length > 1) {
          setDerivations(allDerivations);
          setStatus('ambiguous');
        } else if (allDerivations.length === 1) {
          setDerivations([allDerivations[0]]);
          setStatus('unambiguous');
        } else {
          setDerivations([]);
          setStatus('error');
        }
      }, 100);
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div>
      <h1>Grammar Ambiguity Detector</h1>
      <p style={{ maxWidth: '700px', marginBottom: '2rem' }}>Check if a specific string generates multiple distinct leftmost parse trees (structural equivalence test).</p>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Grammar</label>
            <textarea className="form-input" style={{ minHeight: '100px' }} value={grammarInput} onChange={(e) => setGrammarInput(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Target String</label>
            <input type="text" className="form-input" value={targetString} onChange={(e) => setTargetString(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleCheck}>Check Ambiguity</button>

        {status === 'unambiguous' && <div className="alert alert-success"><CheckCircle size={18}/> Verdict: Unambiguous. Only one parse tree found.</div>}
        {status === 'ambiguous' && (
          <>
            <div className="alert alert-danger"><AlertTriangle size={18}/> Verdict: Ambiguous. Multiple valid trees found.</div>
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef9c3', border: '1px solid #fef08a', borderRadius: '6px', fontSize: '0.9rem', color: '#854d0e' }}>
              <strong>Explanation:</strong> This grammar is ambiguous because the string "{targetString}" can be derived in two different ways, producing different parse trees. This means the grammar has multiple valid interpretations for this string.
            </div>
          </>
        )}
        {status === 'error' && <div className="alert alert-warning"><AlertTriangle size={18}/> Syntax error or string invalid.</div>}
      </div>

      {derivations.length > 0 && status === 'ambiguous' && derivations.length > 1 && (
        <div className="two-col-trees">
          <div className="output-panel tree-panel-a">
            <div className="output-header">Tree A (First Derivation)</div>
            <div className="output-body">
              <TreeView node={derivations[0].tree} />
              <details style={{ marginTop: '1.5rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>Derivation Steps</summary>
                <div style={{ padding: '0.5rem', background: 'var(--bg-app)', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {derivations[0].steps.map((step, idx) => (
                    <div key={idx} style={{ padding: '0.25rem 0', fontFamily: 'monospace' }}>
                      {step.sententialForm.join(' ') || 'ε'}
                      {step.ruleUsed && <span style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>
                        ({step.ruleUsed.lhs} → {step.ruleUsed.rhs.join(' ') || 'ε'})
                      </span>}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
          <div className="output-panel tree-panel-b">
            <div className="output-header">Tree B (Second Derivation)</div>
            <div className="output-body">
              <TreeView node={derivations[1].tree} />
              <details style={{ marginTop: '1.5rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>Derivation Steps</summary>
                <div style={{ padding: '0.5rem', background: 'var(--bg-app)', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {derivations[1].steps.map((step, idx) => (
                    <div key={idx} style={{ padding: '0.25rem 0', fontFamily: 'monospace' }}>
                      {step.sententialForm.join(' ') || 'ε'}
                      {step.ruleUsed && <span style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>
                        ({step.ruleUsed.lhs} → {step.ruleUsed.rhs.join(' ') || 'ε'})
                      </span>}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {derivations.length > 0 && status === 'unambiguous' && (
        <div style={{ marginTop: '2rem' }} className="output-panel">
          <div className="output-header">Parse Tree (Unique)</div>
          <div className="output-body">
            <TreeView node={derivations[0].tree} />
          </div>
        </div>
      )}
    </div>
  );
};

const QuizView = () => {
  const questions = [
    { q: "Which describes a Context-Free Grammar?", options: ["Context matters.", "Non-terminal replaced independent of context.", "No recursive rules.", "Only regular languages."], answer: 1 },
    { q: "A string with two distinct parse trees makes the grammar:", options: ["Unambiguous", "Deterministic", "Ambiguous", "Context-sensitive"], answer: 2 },
    { q: "Expands rightmost non-terminal first:", options: ["LMD", "Top-Down Derivation", "Terminal Derivation", "RMD"], answer: 3 },
    { q: "In a parse tree, leaf nodes represent:", options: ["Non-terminals", "Terminals or ε", "Start symbol S", "Production rules"], answer: 1 },
    { q: "Which of these is NOT a context-free language?", options: ["aⁿbⁿ", "Palindromes over {a,b}", "aⁿbⁿcⁿ", "Balanced parentheses"], answer: 2 },
    { q: "In a parse tree, what do leaf nodes represent?", options: ["Non-terminals only", "Terminals or ε", "The start symbol", "Production rules"], answer: 1 },
    { q: "What does LMD stand for?", options: ["Least Meaningful Derivation", "Leftmost Derivation", "Linear Memory DFA", "Last Match Detection"], answer: 1 },
    { q: "A grammar where every string has exactly ONE parse tree is called:", options: ["Regular", "Unambiguous", "Deterministic", "Complete"], answer: 1 },
    { q: "The language {aⁿbⁿ | n ≥ 0} is:", options: ["Regular", "Context-free but not regular", "Context-sensitive", "Recursively enumerable only"], answer: 1 },
    { q: "Which component is NOT part of a CFG G = (V, T, P, S)?", options: ["V — non-terminals", "T — terminals", "P — production rules", "Q — states"], answer: 3 }
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    if (idx === questions[currentQ].answer) setScore(s => s + 1);
  };

  const nextQ = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1); setSelected(null); setShowAnswer(false);
    } else {
      setFinished(true);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1>Knowledge Quiz</h1>
      {finished ? (
        <div className="card" style={{ textAlign: 'center' }}>
           <h2>Quiz Complete!</h2>
           <p>Score: {score} / {questions.length}</p>
           <button className="btn btn-primary" onClick={() => { setCurrentQ(0); setSelected(null); setShowAnswer(false); setScore(0); setFinished(false); }}>Retry</button>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }} className="form-help">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>Current Score: {score}</span>
          </div>
          <h3 style={{ marginBottom: '1.5rem' }}>{questions[currentQ].q}</h3>
          
          <div>
            {questions[currentQ].options.map((opt, idx) => {
              let cls = 'quiz-option';
              if (showAnswer) {
                if (idx === questions[currentQ].answer) cls += ' correct';
                else if (idx === selected) cls += ' incorrect';
              }
              return <button key={idx} className={cls} onClick={() => handleSelect(idx)} disabled={showAnswer}>{opt}</button>;
            })}
          </div>

          {showAnswer && (
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={nextQ}>{currentQ < questions.length - 1 ? 'Next Question' : 'Finish'}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ReferenceView = () => (
  <div>
    <h1>Quick Reference</h1>
    <p>A quick summary of notation used across the tool and course material.</p>

    <div className="card">
      <h2 style={{ fontSize: '1.25rem', borderBottom: 'none' }}>Notation Table</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Symbol</th><th>Meaning</th></tr>
          </thead>
          <tbody>
            <tr><td><code>V</code> or <code>N</code></td><td>Set of non-terminals</td></tr>
            <tr><td><code>T</code> or <code>Σ</code></td><td>Set of terminals</td></tr>
            <tr><td><code>P</code></td><td>Set of production rules</td></tr>
            <tr><td><code>S</code></td><td>Start symbol</td></tr>
            <tr><td><code>ε</code></td><td>Empty string (epsilon)</td></tr>
            <tr><td><code>→</code></td><td>"Produces"</td></tr>
            <tr><td><code>⇒</code></td><td>One derivation step</td></tr>
            <tr><td><code>⇒*</code></td><td>Zero or more steps</td></tr>
            <tr><td><code>⇒lm</code></td><td>Leftmost derivation step</td></tr>
            <tr><td><code>⇒rm</code></td><td>Rightmost derivation step</td></tr>
            <tr><td><code>L(G)</code></td><td>Language of grammar G</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="card">
      <h2 style={{ fontSize: '1.25rem', borderBottom: 'none' }}>Key Facts</h2>
      <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
        <li>Every regular language is also a CFL</li>
        <li>Not every CFL is regular (e.g. aⁿbⁿ)</li>
        <li>CFLs are recognized by Pushdown Automata (PDAs)</li>
        <li>The language aⁿbⁿcⁿ is NOT context-free</li>
        <li>A grammar is ambiguous if any string has 2+ parse trees</li>
        <li>For unambiguous grammars, LMD and RMD produce the same parse tree</li>
        <li>Deciding if an arbitrary CFG is ambiguous is undecidable</li>
      </ul>
    </div>

    <div className="card">
      <h2 style={{ fontSize: '1.25rem', borderBottom: 'none' }}>Input Format Guide</h2>
      <p>How to type rules in this tool:</p>
      <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
        <p className="mono" style={{ marginBottom: '0.5rem' }}><strong>Basic rule:</strong></p>
        <p className="mono">S -&gt; a S b</p>
        <p className="form-help" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Non-terminals are UPPERCASE, terminals are lowercase</p>
        
        <p className="mono" style={{ marginBottom: '0.5rem' }}><strong>Multiple alternatives:</strong></p>
        <p className="mono">S -&gt; a S b | a | eps</p>
        <p className="form-help" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Use | to separate alternatives</p>
        
        <p className="mono" style={{ marginBottom: '0.5rem' }}><strong>Multi-line grammar:</strong></p>
        <p className="mono">E -&gt; E + T | T<br/>T -&gt; T * F | F<br/>F -&gt; id</p>
        <p className="form-help" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>One rule per line</p>
        
        <p className="mono" style={{ marginBottom: '0.5rem' }}><strong>Empty string:</strong></p>
        <p className="mono">S -&gt; eps</p>
        <p className="form-help" style={{ marginTop: '0.5rem' }}>Use "eps", "epsilon", or "ε" for empty string</p>
      </div>
    </div>
  </div>
);

export default App;
