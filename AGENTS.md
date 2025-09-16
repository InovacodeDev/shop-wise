# AGENTS.md - AI Development Guidelines for Shop-Wise Project

## Overview
This document provides comprehensive guidelines for AI agents working on the Shop-Wise project (https://github.com/InovacodeDev/shop-wise). All modifications must follow these instructions to maintain code quality, consistency, and project standards.

## 🔍 Pre-Development Requirements

### 1. Project Analysis Phase
Before starting ANY development task, the AI must:

1. **Complete Project Scan**: Perform a comprehensive analysis of the entire project structure
   - Review all configuration files (`package.json`, `tsconfig.json`, etc.)
   - Analyze folder structure and file organization patterns
   - Identify architectural patterns and conventions used
   - Review existing components, utilities, and services
   - Study styling approaches and UI patterns
   - Examine state management patterns
   - Check testing patterns and configurations

2. **Pattern Recognition**: Document the following patterns found in the project:
   - Naming conventions for files, functions, and variables
   - Code organization structure
   - Component architecture patterns
   - API integration patterns
   - Error handling approaches
   - Styling methodologies
   - Import/export conventions

### 2. Task Planning Phase
After the project analysis, create a detailed **Activity Schedule** that includes:

```markdown
## Activity Schedule

### Task: [Brief Description]
**Estimated Duration**: [Time estimate]
**Priority**: [High/Medium/Low]

#### Phase 1: Analysis & Planning
- [ ] Review related existing code
- [ ] Identify dependencies and impacts
- [ ] Plan implementation approach
- [ ] Identify potential risks

#### Phase 2: Implementation
- [ ] [Specific implementation step 1]
- [ ] [Specific implementation step 2]
- [ ] [Specific implementation step N]

#### Phase 3: Testing & Validation
- [ ] Unit tests (if applicable)
- [ ] Integration testing
- [ ] Manual testing
- [ ] Code review checklist

#### Phase 4: Documentation
- [ ] Update relevant documentation
- [ ] Add/update comments
- [ ] Update README if needed
```

## 🛠 Development Standards

### Package Management
- **ALWAYS use `pnpm`** for all package management operations
- Never use `npm` or `yarn`
- Common commands:
  ```bash
  pnpm install           # Install dependencies
  pnpm add [package]     # Add new dependency
  pnpm remove [package]  # Remove dependency
  pnpm dev               # Start development server
  pnpm build             # Build for production
  pnpm test              # Run tests
  ```

### Internationalization (i18n) Standards
All user-facing text must follow this pattern using i18next with JSON translation files:

#### 1. Code Implementation
```javascript
// ✅ CORRECT: Use t function with keys
const message = t('welcomeToShopWise');
const dynamicMessage = t('helloUserItems', { username, count });

// ❌ WRONG: Hardcoded strings
const message = "Welcome to Shop-Wise";
const dynamicMessage = "Hello ${username}, you have ${count} items";
```

#### 2. Translation Files
For every English text in code, add translations to ALL three language files:

**File**: `apps/web/public/locales/pt/all-translations.json`
```json
{
    "welcomeToShopWise": "Bem-vindo ao Shop-Wise",
    "helloUserItems": "Olá ${username}, você tem ${count} itens"
}
```

**File**: `apps/web/public/locales/en/all-translations.json`
```json
{
    "welcomeToShopWise": "Welcome to Shop-Wise",
    "helloUserItems": "Hello ${username}, you have ${count} items"
}
```

**File**: `apps/web/public/locales/es/all-translations.json`
```json
{
    "welcomeToShopWise": "Bienvenido a Shop-Wise",
    "helloUserItems": "Hola ${username}, tienes ${count} elementos"
}
```

#### 3. Translation File Structure
- **Portuguese (`pt/all-translations.json`)**: Key → Portuguese text mapping
- **English (`en/all-translations.json`)**: Key → English text mapping
- **Spanish (`es/all-translations.json`)**: Key → Spanish text mapping

#### 4. Translation Guidelines
- English text in code should be clear, concise, and professional
- Portuguese translations should be natural and culturally appropriate for Brazil
- Spanish translations should be neutral and accessible across Spanish-speaking regions
- Maintain consistent terminology across all languages
- Use i18n in every logger/throw method as well
- **MANDATORY**: Every new text must be added to ALL THREE language files
- **MANDATORY**: Every new translation on `apps/web/public/locales` must be replicated to `locales/`
- Keys should be camelCase and descriptive of the content purpose

## 📋 Code Quality Requirements

### Code Standards
- Follow existing project conventions identified in the analysis phase
- Maintain consistent indentation and formatting
- Use TypeScript types appropriately
- Include proper error handling
- Add meaningful comments for complex logic
- Follow existing naming conventions

### File Organization
- Place files in appropriate directories following project structure
- Use consistent file naming conventions
- Group related functionality together
- Maintain clean import statements

### Testing Requirements
- Add tests for new functionality when applicable
- Ensure existing tests continue to pass
- Follow existing testing patterns and conventions

## 🔄 Development Workflow

### Step-by-Step Process
1. **Project Analysis** (Complete scan and pattern recognition)
2. **Schedule Creation** (Detailed activity breakdown)
3. **Implementation** (Following all standards)
4. **Testing** (Verify functionality and integration)
5. **Documentation** (Update relevant docs and comments)
6. **Review** (Self-review against this guideline)

### Quality Checklist
Before submitting any changes, verify:
- [ ] Project analysis was completed
- [ ] Activity schedule was created and followed
- [ ] All commands use `pnpm`
- [ ] All text uses `t\`{message}\`` pattern
- [ ] Portuguese translations added to `pt/all-translations.json`
- [ ] English translations added to `en/all-translations.json`
- [ ] Spanish translations added to `es/all-translations.json`
- [ ] Code follows identified project patterns
- [ ] Existing tests pass
- [ ] New functionality is tested
- [ ] Documentation is updated
- [ ] No hardcoded strings remain

## 🚨 Common Mistakes to Avoid

1. **Skipping project analysis** - Never start coding without understanding the full project
2. **Using wrong package manager** - Only use `pnpm`
3. **Hardcoded strings** - All text must use i18n system
4. **Incomplete translations** - Every English text needs Portuguese, English, and Spanish translations
5. **Inconsistent patterns** - Always follow existing project conventions
6. **Missing schedule** - Always create detailed activity schedule first

## 📚 Additional Resources

- Review existing components for implementation examples
- Check `package.json` for available scripts and dependencies
- Examine existing translation files for reference
- Study project README for specific setup instructions

---

**Remember**: Quality over speed. Take time to understand the project thoroughly before making changes. This ensures maintainable, consistent, and high-quality code contributions. And do not touch vercel.json or turbo.json unless explicitly instructed.