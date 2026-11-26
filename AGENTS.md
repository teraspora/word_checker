# AGENTS.md

Guidance for AI coding agents (GitHub Copilot, etc.) working in this repository.
Read this before proposing or making changes.

## Project overview

- Site Will just be served over local network.
- Do **not** add dependencies (npm packages) without asking first.
- Do **not** introduce a UI framework (React, Vue, etc.). Use plain DOM APIs.
- Do **not** use TypeScript. Use JSDoc comments for types.
- Prefer small, focused changes. Don't refactor unrelated code in the same change.
- Use snake_case for variable names.
- Use hyphens between words for CSS custom properties, class and id names etc.

## Project structure

```
.git/
index.html
main.css
main.js
sowpods.txt
```

## JavaScript style
- Small, single-purpose functions. Prefer pure functions.
- Add JSDoc to exported functions:

## How the agent should work

1. **Understand first.** Read the relevant files before editing. Match existing patterns.
2. **Plan non-trivial changes.** For anything touching multiple files or rules, outline the approach and ask clarifying questions before writing code.
3. **Keep changes minimal and scoped** to what was asked.
4. **Update tests and docs** alongside code.
5. **Explain trade-offs** briefly when making a design choice.
6. If requirements are ambiguous, **ask rather than guess**.

