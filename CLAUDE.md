## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Testing

- Run `npm test`; tests live under `test/` and use Node.js 22's built-in `node:test` runner.
- See `TESTING.md` for layers, commands, and conventions.
- 100% coverage is the goal so generated code and rapid changes remain safe.
- Add a corresponding test for every new function.
- Add a regression test for every bug fix.
- Trigger every new error-handling branch in a test.
- Test both paths of every new conditional.
- Never commit code that makes existing tests fail.
