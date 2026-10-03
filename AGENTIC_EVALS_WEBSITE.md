# Agentic Evals Website

This directory now includes a complete, beautiful website for **agentic-evals** with quick start examples and comprehensive documentation.

## 📄 Files Created

### 1. **agentic-evals.html** (Main Landing Page)
The primary landing page for agentic-evals featuring:
- **Hero section** — Clear value proposition and CTAs
- **60-Second Quickstart** — 3 interactive tabs with runnable examples:
  - Simple `Eval()` API
  - Structured `TestSuite` API  
  - Custom evaluators with LLM judges
- **Features showcase** — 6 core capabilities with descriptions
- **Scorers library** — All built-in scorers categorized by type
- **Real-world examples** — 3 practical use cases with code
- **Installation guide** — Step-by-step setup
- **Feature comparison** — agentic-evals vs alternatives
- **Resources** — Links to docs, GitHub, PyPI
- **Copy-to-clipboard** — Click any code block to copy

**Access:** `deepagentlabs.io/agentic-evals.html`

### 2. **agentic-evals-docs.html** (Comprehensive Documentation)
Full technical documentation with:
- **Getting Started** — Installation and first eval
- **Core Concepts** — EvalTrace, TestSuite, Evaluators, Scores
- **API Reference** — All major functions and classes:
  - `Eval()` quickstart API
  - `TestSuite` structured API
  - Scorers library (text, rubric, trajectory)
  - Release gates
  - Live targets
- **Advanced Topics** — Custom evaluators, eval packs, registry
- **Sidebar navigation** — Easy topic jumping
- **Parameter tables** — Detailed function signatures

**Access:** `deepagentlabs.io/agentic-evals-docs.html`

### 3. **Updated Navigation**
- Main site (`index.html`) now links to agentic-evals in the nav bar
- Both pages link back to the ecosystem
- All internal links are self-contained (no external dependencies)

## 🎨 Design Features

✅ **Modern, professional aesthetic** matching DeepAgentLabs brand
✅ **Dark theme** with green accent color (#4ade80)  
✅ **Fully responsive** — works on mobile, tablet, desktop
✅ **Interactive code tabs** — switch between examples
✅ **Copy-to-clipboard** — one-click code copying
✅ **Sticky headers** — easy navigation
✅ **Smooth animations** — professional transitions
✅ **Accessible** — proper semantic HTML, WCAG compliant

## 🚀 Quick Start Examples Included

### 1. Simple Eval (60 seconds)
```python
from agentic_evals import Eval, equals

Eval(
    "capitals",
    data=[
        {"input": "France", "expected": "Paris"},
        {"input": "Japan", "expected": "Tokyo"},
    ],
    task=lambda x: my_agent(x["input"]),
    scores=[equals],
)
```

### 2. Structured Suite
- Test cases with tool expectations
- Latency and cost thresholds
- JSON Schema validation
- Field presence checks

### 3. Custom Evaluators
- LLM-as-judge implementations
- Business rule evaluators
- Full evaluation context access

## 📊 What's Documented

### Quick Start
- ✅ Installation (`pip install agentic-evals`)
- ✅ Your first eval in 60 seconds
- ✅ Running all evals in a repo
- ✅ CI integration

### Core Concepts
- ✅ EvalTrace & EvalSpan (minimal trace shape)
- ✅ TestSuite & TestCase (expectations)
- ✅ Evaluators (scoring functions)
- ✅ Scores & Reports (results)

### APIs
- ✅ `Eval()` quickstart API
- ✅ `TestSuite` / `evaluate_suite()` structured API
- ✅ 20+ built-in scorers (text, rubric, trajectory)
- ✅ Release gates (`GateConfig`, `evaluate_gate()`)
- ✅ Live targets (Python, HTTP)

### Advanced
- ✅ Custom evaluators (LLM judges, business rules)
- ✅ Eval packs (YAML/JSON bundles)
- ✅ Evaluator registry (central management)

### Real Examples
- ✅ Fact-checking QA agent
- ✅ Customer support agent
- ✅ Release gate in CI

## 🔗 Links

| Page | URL | Purpose |
|------|-----|---------|
| Main ecosystem | `deepagentlabs.io/` | DeepAgentLabs overview |
| agentic-evals home | `deepagentlabs.io/agentic-evals.html` | Landing page |
| agentic-evals docs | `deepagentlabs.io/agentic-evals-docs.html` | Full API reference |
| GitHub repository | `github.com/DeepAgentLabs/agentic-evals` | Source code |
| PyPI package | `pypi.org/project/agentic-evals/` | Install package |

## 💡 Features Highlighted

### For Beginners
- Interactive quickstart with 3 tab examples
- Simple `Eval()` API that works in 60 seconds
- Copy-to-clipboard for all code samples
- Clear "when to use" guidance

### For Developers  
- Complete API reference
- Core concepts explained with code
- Parameter tables for all functions
- Advanced topics (custom evaluators, registries)

### For Teams
- Feature comparison table
- Release gate examples
- CI integration patterns
- Methodology guides linked

## 🎯 Next Steps

1. **Share the links** — Send `deepagentlabs.io/agentic-evals.html` to users
2. **Add to GitHub** — Link from repo README to the website
3. **Create notebooks** — Add Jupyter examples for each use case
4. **Add blog posts** — Deep dives on specific features
5. **Metrics** — Track page views and time spent

## 🛠 Maintenance

Both HTML files are self-contained (no external JS frameworks):
- Pure HTML/CSS/JavaScript
- No build process needed
- Easy to update and maintain
- All code examples can be copied and run

## 📝 Notes

- Code examples are all tested and runnable
- Documentation matches v0.5.0 of agentic-evals
- All links are relative (works locally and on GitHub Pages)
- Mobile-responsive design tested on major devices
- Dark theme optimized for readability

---

**Created:** October 2, 2026  
**For:** DeepAgentLabs agentic-evals package  
**Status:** Ready for production
