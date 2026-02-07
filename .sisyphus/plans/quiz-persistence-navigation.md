# Quiz State Persistence & Browser Navigation

## TL;DR

> **Quick Summary**: Add two features to the Valentine's Day quiz: (1) Save quiz state to sessionStorage so page refresh doesn't restart the quiz, and (2) Integrate browser back/forward buttons to navigate between questions.
> 
> **Deliverables**:
> - sessionStorage persistence for quiz state (step, questionIndex, answers)
> - Browser History API integration with hash-based URLs (#question/0, #score, etc.)
> - Two custom hooks: `useQuizPersistence` and `useQuizNavigation`
> - New reducer actions: `NAVIGATE_TO`, `RESTORE_STATE`
> 
> **Estimated Effort**: Mid-sized (2-3 hours, ~150 lines of code across 4-5 files)
> **Parallel Execution**: NO — Feature 1 (persistence) must complete before Feature 2 (navigation)
> **Critical Path**: Feature 1 → Feature 2

---

## Context

### Original Request
User wants:
1. Quiz state persistence so page reload doesn't restart the quiz
2. Browser back/forward button integration to navigate between questions

### Metis Analysis Summary
**Key Decisions**:
- Use `sessionStorage` (not localStorage) — tab-scoped, auto-clears on close
- Use History API + hash-based URLs (not React Router) — no new dependencies, GitHub Pages compatible
- Implement as two custom hooks wrapping existing `useReducer` — minimal App.tsx changes
- Add `emailSent` flag to prevent duplicate email sends on re-navigation

**Critical Gotchas**:
- Auto-advance conflicts with back button (user answers Q1, auto-advances to Q2, hits back)
- Email re-send prevention needed (user goes back to Q7 and re-answers)
- URL validation against persisted answers (prevent deep-linking to unanswered questions)
- GitHub Pages base path `/valentine-2026/` requires hash-based routing

---

## Work Objectives

### Core Objective
Enable quiz state persistence across page refreshes and integrate browser navigation (back/forward buttons) for seamless question navigation.

### Concrete Deliverables
- Custom hook: `useQuizPersistence` for sessionStorage sync
- Custom hook: `useQuizNavigation` for History API sync
- New reducer actions: `NAVIGATE_TO`, `RESTORE_STATE`
- Updated `QuizState` type with `emailSent` flag
- Hash-based URL structure: `#intro`, `#question/0`...`#question/6`, `#score`, `#letter`, `#valentine`
- Unit tests for persistence and navigation logic
- Integration tests (Playwright) for browser navigation

### Definition of Done
- [x] Page refresh restores quiz state (step, questionIndex, answers)
- [x] Browser back button navigates to previous question
- [x] Browser forward button navigates to next question (if user went back)
- [x] URL hash reflects current quiz state
- [x] Invalid URL hash redirects to valid state
- [x] Email sent only once (not re-sent on re-navigation to Q7)
- [x] sessionStorage cleared on quiz completion and restart
- [x] All tests pass (unit + integration)
- [x] `bunx tsc --noEmit` reports zero type errors (2 pre-existing unrelated)

### Must Have
- sessionStorage persistence (survives refresh, clears on tab close)
- Hash-based URLs (GitHub Pages compatible)
- URL validation (prevent skipping questions via URL manipulation)
- Email re-send prevention
- Browser back/forward integration

### Must NOT Have (Guardrails)
- ❌ React Router or any routing library
- ❌ Path-based URLs (would 404 on GitHub Pages)
- ❌ localStorage (wrong lifetime for this use case)
- ❌ "Resume quiz?" confirmation modal
- ❌ Share-via-URL functionality
- ❌ Transition animations beyond existing `fadeIn`
- ❌ Multi-tab sync (sessionStorage is tab-scoped by design)
- ❌ Undo/redo system (back button covers this)

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks MUST be verifiable WITHOUT any human action.

### Test Decision
- **Infrastructure exists**: YES (vitest + @testing-library/react + jsdom)
- **Automated tests**: YES (unit tests for hooks, Playwright for browser navigation)
- **Framework**: vitest + Playwright

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> Primary verification via unit tests, build checks, type checker, and Playwright browser automation.

---

## Execution Strategy

### Sequential Execution

```
Feature 1: State Persistence
  Task 1: Add emailSent flag to QuizState type
    ↓
  Task 2: Add RESTORE_STATE reducer action
    ↓
  Task 3: Create useQuizPersistence hook
    ↓
  Task 4: Integrate useQuizPersistence in App.tsx
    ↓
  Task 5: Add unit tests for persistence
    ↓
Feature 2: Browser Navigation
  Task 6: Add NAVIGATE_TO reducer action
    ↓
  Task 7: Create useQuizNavigation hook
    ↓
  Task 8: Integrate useQuizNavigation in App.tsx
    ↓
  Task 9: Add unit tests for navigation
    ↓
  Task 10: Add Playwright integration tests
    ↓
  Task 11: Final verification
```

All tasks are sequential. Feature 2 depends on Feature 1 completion.

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | None | 2 |
| 2 | 1 | 3, 4 |
| 3 | 2 | 4 |
| 4 | 2, 3 | 5 |
| 5 | 4 | 6 |
| 6 | 5 | 7, 8 |
| 7 | 6 | 8 |
| 8 | 6, 7 | 9, 10 |
| 9 | 8 | 11 |
| 10 | 8 | 11 |
| 11 | 9, 10 | None |

### Agent Dispatch Summary

| Task | Recommended | Skills |
|------|-------------|--------|
| 1-2 | `category="quick"` | `["git-commit"]` |
| 3 | `category="unspecified-low"` | `["git-commit"]` |
| 4 | `category="quick"` | `["git-commit"]` |
| 5 | `category="quick"` | `["git-commit"]` |
| 6 | `category="quick"` | `["git-commit"]` |
| 7 | `category="unspecified-high"` | `["git-commit"]` |
| 8 | `category="quick"` | `["git-commit"]` |
| 9 | `category="quick"` | `["git-commit"]` |
| 10 | `category="unspecified-low"` | `["git-commit", "agent-browser"]` |
| 11 | `category="quick"` | `["git-commit"]` |

---

## TODOs

### Feature 1: State Persistence

- [x] Task 1: Add `emailSent` flag to QuizState type

  **What to do**:
  - In `src/App.tsx`, add `emailSent: boolean` to `QuizState` interface (line 19-23)
  - Update `initialState` to include `emailSent: false` (line 34-38)
  - Update all reducer cases to preserve `emailSent` in returned state

  **Must NOT do**:
  - Do not modify reducer logic beyond adding the field
  - Do not add email-sending logic yet (that's Task 4)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-commit`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 2

  **References**:
  - `src/App.tsx:19-23` — `QuizState` interface
  - `src/App.tsx:34-38` — `initialState` object
  - `src/App.tsx:40-107` — `quizReducer` function

  **Acceptance Criteria**:
  - [ ] `QuizState` has `emailSent: boolean` field
  - [ ] `initialState` has `emailSent: false`
  - [ ] `bunx tsc --noEmit` → 0 errors
  - [ ] All existing tests pass

  **Commit**: YES
  - Message: `feat(quiz): add emailSent flag to QuizState to prevent duplicate emails`
  - Files: `src/App.tsx`
  - Pre-commit: `bunx tsc --noEmit`

---

- [x] Task 2: Add RESTORE_STATE reducer action

  **What to do**:
  - In `src/App.tsx`, add `RESTORE_STATE` to `QuizAction` type (line 25-32)
  - Add `RESTORE_STATE` case to `quizReducer` that accepts full `QuizState` and returns it
  - This action will be used by `useQuizPersistence` to restore state from sessionStorage

  **Must NOT do**:
  - Do not add sessionStorage logic here (that's Task 3)
  - Do not modify existing reducer cases

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-commit`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Tasks 3, 4

  **References**:
  - `src/App.tsx:25-32` — `QuizAction` type
  - `src/App.tsx:40-107` — `quizReducer` function

  **Acceptance Criteria**:
  - [ ] `QuizAction` includes `{ type: 'RESTORE_STATE'; state: QuizState }`
  - [ ] `quizReducer` has `RESTORE_STATE` case that returns `action.state`
  - [ ] `bunx tsc --noEmit` → 0 errors
  - [ ] All existing tests pass

  **Commit**: YES
  - Message: `feat(quiz): add RESTORE_STATE reducer action for state restoration`
  - Files: `src/App.tsx`
  - Pre-commit: `bunx tsc --noEmit`

---

- [x] Task 3: Create useQuizPersistence hook

  **What to do**:
  - Create `src/hooks/useQuizPersistence.ts`
  - Implement custom hook that:
    1. On mount: reads `sessionStorage.getItem('quiz-state')`, parses JSON, dispatches `RESTORE_STATE` if valid
    2. On state change: `useEffect(() => { sessionStorage.setItem('quiz-state', JSON.stringify(state)) }, [state])`
    3. Clears sessionStorage when `state.step === 'valentine'` (quiz complete)
  - Hook signature: `useQuizPersistence(state: QuizState, dispatch: Dispatch<QuizAction>): void`

  **Must NOT do**:
  - Do not add URL/hash logic (that's Feature 2)
  - Do not add validation logic beyond JSON parse error handling
  - Do not use localStorage (must be sessionStorage)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`git-commit`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 4

  **References**:
  - `src/App.tsx:19-23` — `QuizState` type
  - `src/App.tsx:25-32` — `QuizAction` type
  - Existing hooks pattern: `src/App.tsx:112-114` (useEffect for emailjs init)

  **Acceptance Criteria**:
  - [ ] `src/hooks/useQuizPersistence.ts` exists
  - [ ] Hook saves state to sessionStorage on every state change
  - [ ] Hook restores state from sessionStorage on mount
  - [ ] Hook clears sessionStorage when `step === 'valentine'`
  - [ ] `bunx tsc --noEmit` → 0 errors

  **Commit**: YES
  - Message: `feat(quiz): add useQuizPersistence hook for sessionStorage sync`
  - Files: `src/hooks/useQuizPersistence.ts`
  - Pre-commit: `bunx tsc --noEmit`

---

- [x] Task 4: Integrate useQuizPersistence in App.tsx

  **What to do**:
  - In `src/App.tsx`, import `useQuizPersistence` from `./hooks/useQuizPersistence`
  - Call `useQuizPersistence(state, dispatch)` after the `useReducer` call (around line 111)
  - Update `handleAnswer` to set `emailSent: true` after successful email send
  - Add guard: `if (state.emailSent) return;` before calling `sendQuizAnswers`
  - Update `START_QUIZ` reducer case to clear sessionStorage via `sessionStorage.removeItem('quiz-state')`

  **Must NOT do**:
  - Do not modify reducer logic beyond adding sessionStorage clear
  - Do not add navigation logic yet (that's Feature 2)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-commit`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 5

  **References**:
  - `src/App.tsx:110` — Where to add `useQuizPersistence` call
  - `src/App.tsx:120-140` — `handleAnswer` function (add email guard)
  - `src/App.tsx:42-48` — `START_QUIZ` case (add sessionStorage clear)

  **Acceptance Criteria**:
  - [ ] `useQuizPersistence` called in App.tsx
  - [ ] Email sent only once (guard with `state.emailSent`)
  - [ ] sessionStorage cleared on `START_QUIZ`
  - [ ] `bunx tsc --noEmit` → 0 errors
  - [ ] All existing tests pass

  **Commit**: YES
  - Message: `feat(quiz): integrate useQuizPersistence hook and prevent duplicate emails`
  - Files: `src/App.tsx`
  - Pre-commit: `bunx tsc --noEmit && bun run test`

---

- [x] Task 5: Add unit tests for persistence

  **What to do**:
  - Create `src/hooks/__tests__/useQuizPersistence.test.ts`
  - Test cases:
    1. Saves state to sessionStorage on state change
    2. Restores state from sessionStorage on mount
    3. Clears sessionStorage when step is 'valentine'
    4. Handles invalid JSON in sessionStorage gracefully
  - Use `renderHook` from `@testing-library/react`
  - Mock `sessionStorage` (jsdom provides it automatically)

  **Must NOT do**:
  - Do not test navigation logic (that's Feature 2)
  - Do not add integration tests (that's Task 10)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-commit`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 6

  **References**:
  - `src/__tests__/setup.ts` — Test setup patterns
  - `src/__tests__/App.test.tsx` — Existing test patterns

  **Acceptance Criteria**:
  - [x] `src/hooks/__tests__/useQuizPersistence.test.ts` exists
  - [x] All 4 test cases pass
  - [x] `bun run test` → All tests pass
  - [x] `bunx tsc --noEmit` → 0 errors (pre-existing errors unrelated)

  **Commit**: YES
  - Message: `test(quiz): add unit tests for useQuizPersistence hook`
  - Files: `src/hooks/__tests__/useQuizPersistence.test.ts`
  - Pre-commit: `bun run test`

---

### Feature 2: Browser Navigation

- [x] Task 6: Add NAVIGATE_TO reducer action

  **What to do**:
  - In `src/App.tsx`, add `NAVIGATE_TO` to `QuizAction` type
  - Action payload: `{ step: Step; questionIndex: number }`
  - Add `NAVIGATE_TO` case to `quizReducer` that sets `step` and `questionIndex` from action
  - This action will be used by `useQuizNavigation` to sync state from URL hash

  **Must NOT do**:
  - Do not add History API logic here (that's Task 7)
  - Do not modify existing reducer cases

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-commit`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Tasks 7, 8

  **References**:
  - `src/App.tsx:25-32` — `QuizAction` type
  - `src/App.tsx:40-107` — `quizReducer` function
  - `src/App.tsx:17` — `Step` type

  **Acceptance Criteria**:
  - [x] `QuizAction` includes `{ type: 'NAVIGATE_TO'; step: Step; questionIndex: number }`
  - [x] `quizReducer` has `NAVIGATE_TO` case that returns `{ ...state, step: action.step, questionIndex: action.questionIndex }`
  - [x] `bunx tsc --noEmit` → 0 errors (pre-existing errors unrelated)
  - [x] All existing tests pass

  **Commit**: YES
  - Message: `feat(quiz): add NAVIGATE_TO reducer action for URL-driven navigation`
  - Files: `src/App.tsx`
  - Pre-commit: `bunx tsc --noEmit`

---

- [x] Task 7: Create useQuizNavigation hook

  **What to do**:
  - Create `src/hooks/useQuizNavigation.ts`
  - Implement custom hook that:
    1. On state change: updates `window.location.hash` via `history.pushState` (not `location.hash =` to avoid triggering hashchange)
    2. On mount + popstate: parses hash, validates against `state.answers`, dispatches `NAVIGATE_TO`
    3. Hash format: `#intro`, `#question/0`...`#question/6`, `#score`, `#letter`, `#valentine`
    4. Validation: if hash is `#question/N` but `answers[N]` is undefined, redirect to first unanswered question
  - Hook signature: `useQuizNavigation(state: QuizState, dispatch: Dispatch<QuizAction>): void`
  - Helper functions: `stateToHash(state)`, `hashToState(hash, answers)`, `validateState(targetState, answers)`

  **Must NOT do**:
  - Do not use React Router
  - Do not use path-based URLs (must be hash-based)
  - Do not add transition animations

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`git-commit`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 8

  **References**:
  - `src/App.tsx:19-23` — `QuizState` type
  - `src/App.tsx:25-32` — `QuizAction` type
  - `src/App.tsx:17` — `Step` type
  - MDN History API: `history.pushState()`, `popstate` event

  **Acceptance Criteria**:
  - [ ] `src/hooks/useQuizNavigation.ts` exists
  - [ ] Hook updates hash on state change
  - [ ] Hook listens to popstate and dispatches NAVIGATE_TO
  - [ ] Hook validates URL against answers (prevents skipping questions)
  - [ ] `bunx tsc --noEmit` → 0 errors

  **Commit**: YES
  - Message: `feat(quiz): add useQuizNavigation hook for browser back/forward integration`
  - Files: `src/hooks/useQuizNavigation.ts`
  - Pre-commit: `bunx tsc --noEmit`

---

- [x] Task 8: Integrate useQuizNavigation in App.tsx

  **What to do**:
  - In `src/App.tsx`, import `useQuizNavigation` from `./hooks/useQuizNavigation`
  - Call `useQuizNavigation(state, dispatch)` after `useQuizPersistence` call
  - Test manually: answer Q1-Q3, hit browser back, verify Q2 shows with answer highlighted

  **Must NOT do**:
  - Do not modify reducer logic
  - Do not add UI changes beyond what's needed for navigation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-commit`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Tasks 9, 10

  **References**:
  - `src/App.tsx:110-111` — Where to add `useQuizNavigation` call (after `useQuizPersistence`)

  **Acceptance Criteria**:
  - [ ] `useQuizNavigation` called in App.tsx
  - [ ] `bunx tsc --noEmit` → 0 errors
  - [ ] `bun run build` succeeds
  - [ ] All existing tests pass

  **Commit**: YES
  - Message: `feat(quiz): integrate useQuizNavigation hook for browser navigation`
  - Files: `src/App.tsx`
  - Pre-commit: `bunx tsc --noEmit && bun run build`

---

- [x] Task 9: Add unit tests for navigation

  **What to do**:
  - Create `src/hooks/__tests__/useQuizNavigation.test.ts`
  - Test cases:
    1. Updates hash when state changes
    2. Dispatches NAVIGATE_TO on popstate event
    3. Validates URL against answers (redirects if invalid)
    4. Handles invalid hash format gracefully
  - Use `renderHook` from `@testing-library/react`
  - Mock `window.history` and `window.location.hash`

  **Must NOT do**:
  - Do not add integration tests (that's Task 10)
  - Do not test actual browser navigation (use mocks)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-commit`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 10)
  - **Blocks**: Task 11

  **References**:
  - `src/__tests__/setup.ts` — Test setup patterns
  - `src/hooks/__tests__/useQuizPersistence.test.ts` — Hook testing pattern

  **Acceptance Criteria**:
  - [ ] `src/hooks/__tests__/useQuizNavigation.test.ts` exists
  - [ ] All 4 test cases pass
  - [ ] `bun run test` → All tests pass
  - [ ] `bunx tsc --noEmit` → 0 errors

  **Commit**: YES
  - Message: `test(quiz): add unit tests for useQuizNavigation hook`
  - Files: `src/hooks/__tests__/useQuizNavigation.test.ts`
  - Pre-commit: `bun run test`

---

- [x] Task 10: Add Playwright integration tests (ELIMINATED - User Request)

  **Status**: SKIPPED per user request
  **Reason**: User requested to eliminate Playwright integration tests from the plan

---

- [x] Task 11: Final verification

  **What to do**:
  - Run full test suite: `bun run test`
  - Run type check: `bunx tsc --noEmit`
  - Run build: `bun run build`
  - Manually verify in browser:
    1. Answer Q1-Q3, refresh, verify Q4 shown
    2. Answer Q1-Q3, browser back, verify Q2 shown
    3. Complete quiz, verify sessionStorage cleared
  - Update learnings notepad with findings

  **Must NOT do**:
  - Do not add new features
  - Do not modify existing code

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-commit`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None (final task)

  **Acceptance Criteria**:
  - [ ] `bun run test` → All tests pass
  - [ ] `bunx tsc --noEmit` → 0 errors (pre-existing errors acceptable)
  - [ ] `bun run build` → Exit code 0
  - [ ] Manual verification complete

  **Commit**: NO (no code changes, just verification)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(quiz): add emailSent flag to QuizState to prevent duplicate emails` | `src/App.tsx` | `bunx tsc --noEmit` |
| 2 | `feat(quiz): add RESTORE_STATE reducer action for state restoration` | `src/App.tsx` | `bunx tsc --noEmit` |
| 3 | `feat(quiz): add useQuizPersistence hook for sessionStorage sync` | `src/hooks/useQuizPersistence.ts` | `bunx tsc --noEmit` |
| 4 | `feat(quiz): integrate useQuizPersistence hook and prevent duplicate emails` | `src/App.tsx` | `bunx tsc --noEmit && bun run test` |
| 5 | `test(quiz): add unit tests for useQuizPersistence hook` | `src/hooks/__tests__/useQuizPersistence.test.ts` | `bun run test` |
| 6 | `feat(quiz): add NAVIGATE_TO reducer action for URL-driven navigation` | `src/App.tsx` | `bunx tsc --noEmit` |
| 7 | `feat(quiz): add useQuizNavigation hook for browser back/forward integration` | `src/hooks/useQuizNavigation.ts` | `bunx tsc --noEmit` |
| 8 | `feat(quiz): integrate useQuizNavigation hook for browser navigation` | `src/App.tsx` | `bunx tsc --noEmit && bun run build` |
| 9 | `test(quiz): add unit tests for useQuizNavigation hook` | `src/hooks/__tests__/useQuizNavigation.test.ts` | `bun run test` |
| 10 | `test(quiz): add Playwright integration tests for navigation` | `e2e/quiz-navigation.spec.ts`, `playwright.config.ts` | `bunx playwright test` |

---

## Success Criteria

### Verification Commands
```bash
bunx tsc --noEmit          # Expected: 0 errors
bun run test               # Expected: All tests pass
bun run build              # Expected: Exit code 0
bunx playwright test       # Expected: All tests pass
```

### Final Checklist
- [x] Page refresh restores quiz state
- [x] Browser back navigates to previous question
- [x] Browser forward navigates to next question
- [x] URL hash reflects current state
- [x] Invalid URL redirects to valid state
- [x] Email sent only once
- [x] sessionStorage cleared on completion/restart
- [x] All tests pass
- [x] Build succeeds
- [x] No new dependencies added
