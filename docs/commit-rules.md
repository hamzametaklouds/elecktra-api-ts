# Commit Rules

**Branches** should be prepended with context, a good helper framework for this is [git-extras](https://github.com/tj/git-extras/). The following options are considered:
- feature
- refactor
- bug
- chore

**Commits** are protected with [commitlint](https://github.com/marionebl/commitlint) and [lerna-scopes](https://www.npmjs.com/package/@commitlint/config-lerna-scopes). This is to inform the changelog on merge for versioning. Available types are: 

- build
- ci
- chore
- docs
- feat
- fix
- perf
- refactor
- revert
- style
- test

Commit message also need to include scope i.e package which this change is effecting. 

### Examples

- `feat(lib-hooks): add ability to search dataset`
- `chore(lib-hooks): update dependencies`
- `perf(lib-hooks): call api concurrently instead of sequentially`

## Commitlint

[Commitlint](https://github.com/conventional-changelog/commitlint) and [lerna-scopes](https://www.npmjs.com/package/@commitlint/config-lerna-scopes) has been configured to enforce these rules

These rules are automatically enforced by [Husky](https://github.com/typicode/husky)
