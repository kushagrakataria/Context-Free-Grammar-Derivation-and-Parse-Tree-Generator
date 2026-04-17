# Context-Free Grammar Derivation and Parse Tree Generator

## Project Information

**Student Name:** Kushagra Kataria  
**Roll Number:** 2024UCD2164  
**Topic:** Context-Free Grammar Derivation and Parse Tree Generator  

## About This Project

This is a web-based tool that helps students learn and visualize context-free grammars (CFGs). The application takes grammar rules and a target string as input, then shows how the string can be derived from the grammar step by step.

## What It Does

- **Grammar Input**: Enter your CFG rules using simple notation (like `S -> a S b | eps`)
- **Derivation Modes**: Choose between leftmost (LL) or rightmost (LR) derivation
- **Step-by-Step Visualization**: See each step of the derivation process
- **Parse Tree Generation**: View the complete parse tree structure
- **Ambiguity Detection**: Check if a grammar can produce multiple parse trees for the same string
- **Built-in Examples**: Try classic CFG patterns like balanced parentheses, expression grammars, and palindromes

## Features

### Main Tools

1. **CFG Visualizer** - Generate derivations and parse trees for any grammar
2. **Ambiguity Checker** - Detect if a grammar is ambiguous
3. **Theory Section** - Learn the basics of context-free grammars
4. **Built-in Examples** - Pre-loaded examples to get started quickly
5. **Knowledge Quiz** - Test your understanding

### Grammar Notation

The tool uses standard CFG notation:
- Non-terminals: Uppercase letters (S, E, T, F)
- Terminals: Lowercase letters, numbers, operators (a, b, id, +, *)
- Arrow: `->` or `→`
- Alternatives: `|`
- Empty string: `eps` or `ε`

Example:
```
S -> a S b | eps
E -> E + T | T
T -> T * F | F
F -> id
```

## How to Run

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and go to `http://localhost:5174`

4. Build for production:
```bash
npm run build
```

## Example Usage

### Simple Balanced Strings

**Grammar:**
```
S -> a S b | eps
```

**Target String:** `a a b b`

**Result:** The tool will show the leftmost derivation:
```
S → a S b → a a S b b → a a b b
```

And display the corresponding parse tree.

### Expression Grammar

**Grammar:**
```
E -> E + T | T
T -> T * F | F
F -> id
```

**Target String:** `id + id * id`

The tool will generate the derivation showing proper operator precedence.

## Technologies Used

- React 19 with TypeScript
- Vite for fast development
- Custom CSS for styling
- Pure JavaScript for parsing logic (no external parser libraries)

## Project Structure

```
src/
├── App.tsx          - Main UI components
├── cfgEngine.ts     - Core parsing and derivation logic
├── App.css          - Component styles
└── index.css        - Global styles
```

## Learning Objectives

This project demonstrates:
- Understanding of context-free grammars
- Implementation of leftmost and rightmost derivations
- Parse tree construction algorithms
- Ambiguity detection in grammars
- Web application development with React

## Notes

- The tool handles multi-character terminals like `id`, `num`
- Maximum derivation depth is limited to 50 steps to prevent infinite loops
- Ambiguity detection explores up to 50,000 states
- All parsing is done client-side with no backend required

## Future Enhancements

Possible improvements for this project:
- First and Follow set computation
- LL(1) and LR(0) parsing table generation
- Grammar transformation tools (removing left recursion, left factoring)
- Export parse trees as images
- More interactive visualizations

---

**Submitted as part of TAFL coursework - Topic Implementation**  
**Academic Year 2025-26**
