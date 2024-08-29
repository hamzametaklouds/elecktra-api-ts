# voyagevite-admin-service Platform linting configuration

There are the following two predominant code style guides are in use widely.

- [Google JavaScript style guideline](https://google.github.io/styleguide/jsguide.html)
- [Airbnb JavaScript Style guideline](https://github.com/airbnb/javascript)

I like the Google style guide, it is very generic can be used across frameworks and different environments. 

Google also has [style guidelines](https://google.github.io/styleguide/) for a host of other languages including Typescript, which is a subset of their JavaScript style guideline. Google also open-sourced a project called [gts](https://github.com/google/gts)

## Problems Experienced when we first included gts

While GTS offers a lot of benefits it is not without its problems. Following are the two problems which we need to keep an eye on:

- GTS version (3.1.0) which is what we are using for this project does not support workspaces. To remedy that we have installed eslint separately, which is not bad. In fact GTS does suggest using eslint because internally they are using eslint.I have raised a [ticket](https://github.com/google/gts/issues/663). Keep a regular check on it and must update the gts version once it gets released. 
- Currently GTS supports eslint version 7.10.0 which is not the latest and CRA (5) uses eslint verion 8.

### Steps to take when upgrading

If gts starts supporting eslint 8.x.x. Then do following:
- Remove eslint from nohoist option in lerna.json
- Remove these two rules from tsconfig.json in `client-admin-web` package.
  ```
  "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off"
  ```

## Future maintenance

Keep an eye on following issues

- [GTS-Suport](https://github.com/google/gts/issues/663)
- [Google JavaScript style guide - support](https://github.com/google/eslint-config-google/issues/68)
