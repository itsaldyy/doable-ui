# Git Hooks Documentation Index

Welcome to the Git Hooks documentation! This index will help you find the right document for your needs.

## 📚 Documentation Structure

```
scripts/git-hooks/
├── INDEX.md                  ← You are here
├── QUICK-REFERENCE.md        ← Quick commands and tips
├── SETUP.md                  ← Getting started guide
├── README.md                 ← Complete documentation
├── ARCHITECTURE.md           ← Technical architecture
└── config.sh                 ← Configuration file
```

## 🎯 Choose Your Path

### I'm New Here

**Start with:** [`SETUP.md`](./SETUP.md)

- Quick start guide
- Installation instructions
- Basic usage examples
- Troubleshooting common issues

### I Need Quick Help

**Start with:** [`QUICK-REFERENCE.md`](./QUICK-REFERENCE.md)

- Common commands
- Configuration options
- Environment variables
- Quick troubleshooting

### I Want Complete Information

**Start with:** [`README.md`](./README.md)

- Full documentation
- All available hooks
- Adding new hooks
- Best practices
- Detailed troubleshooting

### I Want to Understand the System

**Start with:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)

- System architecture
- Component interactions
- Data flow diagrams
- Extension points
- Performance considerations

### I Want to Customize Behavior

**Start with:** [`config.sh`](./config.sh)

- Configuration options
- Environment variables
- Feature toggles
- Performance settings

## 📖 Additional Resources

### Knowledge Transfer Document

**Location:** `docs/knowledge-transfer/git-hooks-setup.md`

- Design decisions and rationale
- Implementation details
- Benefits and impact
- Future enhancements

### Hook Scripts

**Location:** `scripts/git-hooks/`

- `pre-commit.sh` - Main orchestrator
- `cleanup-whitespace.sh` - Whitespace cleanup
- `lint-staged.sh` - Linting
- `check-types.sh` - Type checking

### Utility Scripts

**Location:** `scripts/utils/`

- `colors.sh` - Terminal colors
- `logging.sh` - Logging functions

## 🚀 Quick Start (TL;DR)

```bash
# Hooks are already installed!
# They run automatically on every commit

# Test them manually:
bash scripts/git-hooks/pre-commit.sh

# Skip in emergency:
git commit --no-verify -m "message"
```

## 🎓 Learning Path

1. **Beginner** → Read `SETUP.md`
2. **Intermediate** → Read `README.md`
3. **Advanced** → Read `ARCHITECTURE.md`
4. **Expert** → Modify scripts and add new hooks

## 🔍 Find What You Need

### By Task

| I want to...                | Read this...                                 |
| --------------------------- | -------------------------------------------- |
| Get started quickly         | `SETUP.md`                                   |
| Run hooks manually          | `QUICK-REFERENCE.md`                         |
| Skip hooks temporarily      | `QUICK-REFERENCE.md`                         |
| Add a new check             | `README.md` → "Adding New Hooks"             |
| Customize behavior          | `config.sh` + `README.md`                    |
| Understand the architecture | `ARCHITECTURE.md`                            |
| Debug issues                | `README.md` → "Troubleshooting"              |
| Learn design decisions      | `docs/knowledge-transfer/git-hooks-setup.md` |

### By Role

| Role                | Recommended Reading               |
| ------------------- | --------------------------------- |
| **New Developer**   | `SETUP.md` → `QUICK-REFERENCE.md` |
| **Team Lead**       | `README.md` → `ARCHITECTURE.md`   |
| **DevOps Engineer** | `ARCHITECTURE.md` → `config.sh`   |
| **Contributor**     | `README.md` → Hook scripts        |

## 🆘 Getting Help

1. **Check the docs** - Most questions are answered here
2. **Run manually** - Test hooks to see what's happening
3. **Enable debug mode** - `DEBUG=1 bash scripts/git-hooks/pre-commit.sh`
4. **Ask the team** - Someone has probably seen this before
5. **Check Git hooks docs** - [git-scm.com/docs/githooks](https://git-scm.com/docs/githooks)

## 📝 Contributing

When modifying hooks:

1. Test manually first
2. Update relevant documentation
3. Add examples if needed
4. Consider backward compatibility
5. Update this index if adding new docs

## 🎉 You're All Set!

The hooks are installed and ready to use. They'll run automatically on every commit to ensure code quality. Happy coding! 🚀

---

**Last Updated:** 2025-01-16
**Maintained By:** Development Team
**Questions?** Check the docs or ask the team!
