> ⚠️ **Archived Repository**
>
> This repository has been archived and is no longer actively maintained.
> All workflows and configurations in this directory are preserved for reference and learning purposes only.
>
> **Attribution**: CMAMSys (CompetiMath AutoModel System)
> Repository: https://github.com/Yogdunana/CMAMSys-V1-Archive

---

# GitHub Configurations

This directory contains GitHub-specific configurations for CMAMSys.

## 📁 Directory Structure

```
.github/
├── workflows/              # CI/CD workflows
│   ├── cd.yml             # Continuous Deployment workflow
│   ├── ci.yml             # Continuous Integration workflow
│   ├── hello-world.yml    # Example workflow
│   ├── scheduled.yml      # Scheduled tasks workflow
│   ├── test-docker-build.yml  # Docker build testing
│   └── test-docker.yml    # Docker runtime testing
└── README.md              # This file
```

## 🔧 Workflows

### CI Workflow (`ci.yml`)
- Runs on every push and pull request to main/develop branches
- Performs linting and type checking
- Ensures code quality standards

### CD Workflow (`cd.yml`)
- Handles continuous deployment
- Builds and deploys the application
- Configured for automated release process

### Scheduled Workflow (`scheduled.yml`)
- Runs scheduled tasks
- Periodic maintenance jobs
- Automated health checks

### Docker Testing Workflows
- `test-docker-build.yml`: Tests Docker image building process
- `test-docker.yml`: Validates Docker container runtime

## ⚠️ Important Notes

### Archived Status
- These workflows are **preserved for learning purposes only**
- They will **not execute** for this archived repository
- Use them as references for your own CI/CD setup

### Workflow Limitations
- No GitHub Actions will run (repository is archived)
- No automated deployments
- No scheduled tasks
- No dependency updates (dependabot.yml removed)

## 📖 Learning Resources

These workflows demonstrate:

- ✅ **CI/CD Best Practices**: Automated testing and deployment
- ✅ **Docker Integration**: Container-based testing and deployment
- ✅ **Type Checking**: TypeScript strict mode enforcement
- ✅ **Code Quality**: ESLint and Prettier integration
- ✅ **Scheduled Tasks**: Automated maintenance workflows

## 🚀 For Your Projects

If you use these workflows as references:

1. **Customize for your needs**: Adjust triggers, steps, and configurations
2. **Update dependencies**: Ensure all actions are up-to-date
3. **Configure secrets**: Add necessary secrets for your environment
4. **Test thoroughly**: Validate workflows in your repository
5. **Monitor execution**: Keep track of workflow runs and failures

## 📄 License

These configurations are part of CMAMSys and are licensed under the [MIT License](../LICENSE).

## 🔗 Links

- **Main Repository**: https://github.com/Yogdunana/CMAMSys-V1-Archive
- **Main README**: [../README.md](../README.md)
- **Archived Notice**: [../ARCHIVED.md](../ARCHIVED.md)

---

**Last Updated**: 2026年2月22日
**Status**: 📦 Archived - Reference Only
