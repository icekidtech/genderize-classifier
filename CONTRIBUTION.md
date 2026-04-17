# Contributing Guide

## Development Workflow

This project uses a multi-stage development approach with a structured branching strategy.

### Branch Strategy

```
main (✓ released, tagged versions only)
  ↑
develop (✓ stable, ready-to-release features)
  ↑
stage-1, stage-2, ... (⚙️ active work branches)
```

### Setup Your Local Environment

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd stage-zero
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local PostgreSQL connection string
   ```

4. **Create database**
   ```bash
   # PostgreSQL should be running on your machine
   createdb genderize_stage1
   ```

5. **Run migrations** (when available)
   ```bash
   pnpm typeorm migration:run
   ```

### Working on a Feature

1. **Ensure you're on the latest develop**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create a feature branch from develop**
   ```bash
   git checkout -b stage-1  # or your stage name
   ```

3. **Make your changes, test locally**
   ```bash
   pnpm dev          # Start development server
   pnpm test         # Run tests
   pnpm build        # Verify build succeeds
   ```

4. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "feat: add profile creation endpoint"
   # Use conventional commits: feat:, fix:, docs:, refactor:, test:
   ```

5. **Push to origin**
   ```bash
   git push origin stage-1
   ```

6. **Create Pull Request** on GitHub
   - Merge into `develop` (not main)
   - Add description of changes
   - Ensure all tests pass

### Code Style & Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Formatting**: Follow existing code patterns (2-space indents)
- **Imports**: Organize alphabetically, group by type
- **Error Handling**: Always handle errors explicitly
- **Comments**: Add comments for complex logic only

### Testing

```bash
# Run all tests
pnpm test

# Test specific feature
pnpm test:profiles

# Run with watch mode (if configured)
pnpm test -- --watch
```

### Before Submitting PR

- [ ] All tests pass: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] No TypeScript errors: `pnpm build` (build catches these)
- [ ] Code follows patterns from [stage 0](src/routes/classify.routes.ts)
- [ ] Added tests for new features
- [ ] Updated [README.md](README.md) if adding new endpoints
- [ ] Commit messages are clear and descriptive

### Releasing a New Stage

See [RELEASE_PROCESS.md](RELEASE_PROCESS.md) for detailed instructions on:
- Version bumping
- Changelog updates
- Creating release tags
- Deployment to VPS

## Project Structure

```
src/
  ├── main.ts                    # Express app setup
  ├── middleware/                # Middleware (CORS, etc.)
  ├── routes/                    # API endpoints
  ├── services/                  # External API integrations & business logic
  ├── repositories/              # Database access layer (Stage 1+)
  ├── entities/                  # TypeORM entities (Stage 1+)
  ├── types/                     # TypeScript interfaces
  └── utils/                     # Helper functions

tests/                            # Test suites
CHANGELOG.md                      # Version history
RELEASE_PROCESS.md               # Release instructions
.env.example                      # Environment template
ecosystem.config.js               # PM2 configuration
```

## Questions or Issues?

Refer to:
- `RELEASE_PROCESS.md` for versioning questions
- Individual file comments for implementation details
- Git log for change history: `git log --oneline --all`
