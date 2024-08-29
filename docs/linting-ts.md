# voyagevite-admin-service Platform adding linting and eslint to package

For convience we have base eslint and tsconfig file included in the project. Every new package must extend these files and add their own configuraiton. 

## Adding tslint

Create a new `.tsconfig.json` file in the root of your paakcge. Following are the basic settings which you can use for tsconfig.

```
{
  "extends": "../../.tsconfig.common.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## Adding eslint

eslint is used for linting of the package and the whole proejct. Eslint cli is added as workspace in project root. For any new package create a .eslintrc.json. Following are configuration which needs to be included in any new package. 

```
{
    "extends":"../../.eslintrc.json"
}
```
