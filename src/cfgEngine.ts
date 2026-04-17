export interface Grammar {
  rules: Record<string, string[][]>;
  startSymbol: string;
  nonTerminals: Set<string>;
  terminals: Set<string>;
}

export interface ParseTreeNode {
  symbol: string;
  isTerminal: boolean;
  children?: ParseTreeNode[];
}

// Improved tokenization that handles multi-character symbols
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  
  while (i < input.length) {
    // Skip whitespace
    if (input[i] === ' ') {
      i++;
      continue;
    }
    
    // Multi-character terminals (id, num, etc.)
    if (/[a-z]/.test(input[i])) {
      let token = '';
      while (i < input.length && /[a-z0-9]/.test(input[i])) {
        token += input[i];
        i++;
      }
      tokens.push(token);
    }
    // Non-terminals (uppercase letters)
    // Only consume consecutive uppercase if they form known multi-char non-terminals
    // Otherwise treat each uppercase letter as separate non-terminal
    else if (/[A-Z]/.test(input[i])) {
      // For now, treat each uppercase letter separately to avoid AB → "AB" bug
      // This means EXPR must be written as one word (which is standard)
      tokens.push(input[i]);
      i++;
    }
    // Operators and special symbols
    else {
      tokens.push(input[i]);
      i++;
    }
  }
  
  return tokens;
}

export function parseGrammar(input: string): Grammar | null {
  const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return null;
  
  const rules: Record<string, string[][]> = {};
  const nonTerminals = new Set<string>();
  const terminals = new Set<string>();
  let startSymbol = '';

  // First pass: collect all non-terminals (LHS of rules)
  for (const line of lines) {
    const parts = line.split(/->|→/);
    if (parts.length !== 2) continue;
    const lhs = parts[0].trim();
    nonTerminals.add(lhs);
    if (!startSymbol) startSymbol = lhs;
  }

  // Validate that we found at least one rule
  if (!startSymbol || nonTerminals.size === 0) {
    return null;
  }

  // Second pass: parse rules and identify terminals
  for (const line of lines) {
    const parts = line.split(/->|→/);
    if (parts.length !== 2) continue;
    
    const lhs = parts[0].trim();
    const rhsParts = parts[1].split('|').map(p => p.trim());
    if (!rules[lhs]) rules[lhs] = [];
    
    for (const rhs of rhsParts) {
      if (rhs === 'eps' || rhs === 'ε' || rhs === '') {
        rules[lhs].push([]);
      } else {
        const symbols = tokenize(rhs);
        rules[lhs].push(symbols);
        
        // Identify terminals (symbols that are not non-terminals)
        for (const sym of symbols) {
          if (!nonTerminals.has(sym)) {
            terminals.add(sym);
          }
        }
      }
    }
  }
  
  // Validate that startSymbol has at least one production
  if (!rules[startSymbol] || rules[startSymbol].length === 0) {
    return null;
  }
  
  return { rules, startSymbol, nonTerminals, terminals };
}

export interface DerivationStep {
  sententialForm: string[];
  ruleUsed: { lhs: string; rhs: string[] } | null;
}

// Improved derivation search with better pruning and correctness
// For ambiguity detection, set detectAmbiguity=true to find multiple derivations
export function findDerivationDFS(grammar: Grammar, target: string[], leftmost: boolean, limit: number = 1, detectAmbiguity: boolean = false): { steps: DerivationStep[], tree: ParseTreeNode }[] {
  const MAX_DEPTH = 50;
  const MAX_STATES = 50000;
  let statesExplored = 0;
  
  type State = {
    form: string[];
    steps: DerivationStep[];
    depth: number;
  };

  const stack: State[] = [{
    form: [grammar.startSymbol],
    steps: [{ sententialForm: [grammar.startSymbol], ruleUsed: null }],
    depth: 0
  }];

  const results: { steps: DerivationStep[], tree: ParseTreeNode }[] = [];
  const seenStates = new Set<string>();

  while (stack.length > 0 && statesExplored < MAX_STATES) {
    statesExplored++;
    const current = stack.pop()!;
    
    // Check if we've reached maximum depth
    if (current.depth > MAX_DEPTH) continue;
    
    // Check if form matches target exactly
    if (arraysEqual(current.form, target)) {
      const tree = reconstructTree(grammar, current.steps, leftmost);
      results.push({ steps: current.steps, tree });
      if (results.length >= limit) {
        return results;
      }
      continue;
    }
    
    // Check if all symbols are terminals (no more derivations possible)
    const hasNonTerminal = current.form.some(sym => grammar.nonTerminals.has(sym));
    if (!hasNonTerminal) {
      // All terminals but doesn't match target - dead end
      continue;
    }
    
    // Early pruning: if we have more terminals than target, skip
    const terminalCount = current.form.filter(sym => grammar.terminals.has(sym)).length;
    if (terminalCount > target.length) continue;
    
    // Check terminal prefix matching for better pruning
    // For leftmost derivation: check terminals before first non-terminal
    // For rightmost derivation: check terminals after last non-terminal
    let mismatch = false;
    if (leftmost) {
      let targetIdx = 0;
      for (const sym of current.form) {
        if (grammar.terminals.has(sym)) {
          if (targetIdx >= target.length || sym !== target[targetIdx]) {
            mismatch = true;
            break;
          }
          targetIdx++;
        } else {
          // Hit a non-terminal, stop checking
          break;
        }
      }
    } else {
      // For rightmost, check from the end
      let targetIdx = target.length - 1;
      for (let i = current.form.length - 1; i >= 0; i--) {
        const sym = current.form[i];
        if (grammar.terminals.has(sym)) {
          if (targetIdx < 0 || sym !== target[targetIdx]) {
            mismatch = true;
            break;
          }
          targetIdx--;
        } else {
          // Hit a non-terminal, stop checking
          break;
        }
      }
    }
    if (mismatch) continue;
    
    // Find non-terminal to expand
    let ntIndex = -1;
    if (leftmost) {
      ntIndex = current.form.findIndex(sym => grammar.nonTerminals.has(sym));
    } else {
      for (let i = current.form.length - 1; i >= 0; i--) {
        if (grammar.nonTerminals.has(current.form[i])) {
          ntIndex = i;
          break;
        }
      }
    }
    
    if (ntIndex === -1) continue;
    
    const nt = current.form[ntIndex];
    const productions = grammar.rules[nt] || [];
    
    // Try each production rule
    // For rightmost derivation, reverse the order to match textbook conventions
    const productionsToTry = leftmost ? productions : [...productions].reverse();
    
    for (const production of productionsToTry) {
      const newForm = [...current.form];
      newForm.splice(ntIndex, 1, ...production);
      
      // For ambiguity detection, we need to explore all paths
      // For normal derivation, we can skip seen states
      if (!detectAmbiguity) {
        // Avoid infinite loops by checking if we've seen this state
        // Don't include depth - same sentential form is same state regardless of depth
        const stateKey = newForm.join(',');
        if (seenStates.has(stateKey)) continue;
        seenStates.add(stateKey);
      }
      
      stack.push({
        form: newForm,
        steps: [...current.steps, { 
          sententialForm: newForm, 
          ruleUsed: { lhs: nt, rhs: production } 
        }],
        depth: current.depth + 1
      });
    }
  }
  
  return results;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function findDerivation(grammar: Grammar, targetStr: string, leftmost: boolean = true): { steps: DerivationStep[], tree: ParseTreeNode } | null {
  const tokenizedTarget = tokenize(targetStr);
  
  // Handle epsilon/empty string
  if (targetStr.trim() === 'eps' || targetStr.trim() === 'ε' || targetStr.trim() === '') {
    const results = findDerivationDFS(grammar, [], leftmost, 1);
    return results.length > 0 ? results[0] : null;
  }

  const results = findDerivationDFS(grammar, tokenizedTarget, leftmost, 1);
  return results.length > 0 ? results[0] : null;
}

export function findAllLeftmostDerivations(grammar: Grammar, targetStr: string, limit: number = 2): { steps: DerivationStep[], tree: ParseTreeNode }[] {
  const tokenizedTarget = tokenize(targetStr);
  
  // Handle epsilon/empty string
  if (targetStr.trim() === 'eps' || targetStr.trim() === 'ε' || targetStr.trim() === '') {
    return findDerivationDFS(grammar, [], true, limit, true);
  }

  // Pass detectAmbiguity=true to disable state deduplication
  return findDerivationDFS(grammar, tokenizedTarget, true, limit, true);
}

function reconstructTree(grammar: Grammar, steps: DerivationStep[], leftmost: boolean): ParseTreeNode {
  const root: ParseTreeNode = { 
    symbol: grammar.startSymbol, 
    isTerminal: false, 
    children: [] 
  };
  
  // Apply each derivation step to build the tree
  for (let i = 1; i < steps.length; i++) {
    const ruleUsed = steps[i].ruleUsed!;
    const frontier = getFrontier(root);
    
    // Find the non-terminal node to expand
    // We need to match the exact non-terminal that was expanded in this step
    // by comparing against the sentential form from the previous step
    const prevForm = steps[i - 1].sententialForm;
    
    let ntNode: ParseTreeNode | undefined;
    let formIndex = 0;
    
    for (let j = 0; j < frontier.length; j++) {
      const node = frontier[j];
      
      // Skip if this node doesn't match the symbol in the previous sentential form
      if (formIndex >= prevForm.length || node.symbol !== prevForm[formIndex]) {
        formIndex++;
        continue;
      }
      
      // Check if this is an unexpanded non-terminal matching our rule
      if (!node.isTerminal && 
          node.symbol === ruleUsed.lhs && 
          (!node.children || node.children.length === 0)) {
        
        // For leftmost, take the first match
        // For rightmost, we need to find the rightmost match
        if (leftmost) {
          ntNode = node;
          break;
        } else {
          // Keep searching for rightmost
          ntNode = node;
        }
      }
      
      formIndex++;
    }
    
    if (ntNode) {
      // Expand the node with the production
      if (ruleUsed.rhs.length === 0) {
        // Epsilon production
        ntNode.children = [{ symbol: 'ε', isTerminal: true }];
      } else {
        ntNode.children = ruleUsed.rhs.map(sym => ({
          symbol: sym,
          isTerminal: grammar.terminals.has(sym),
          children: []
        }));
      }
    }
  }
  
  return root;
}

function getFrontier(node: ParseTreeNode): ParseTreeNode[] {
  if (!node.children || node.children.length === 0) {
    return [node];
  }
  
  const result: ParseTreeNode[] = [];
  for (const child of node.children) {
    result.push(...getFrontier(child));
  }
  return result;
}
