[![Deploy To UAT Env](https://github.com/gcdr-volunteer/sutra-translation/actions/workflows/uat_deploy.yml/badge.svg)](https://github.com/gcdr-volunteer/sutra-translation/actions/workflows/uat_deploy.yml)

## Sutra Translation App

### Editor setup

You have to install those vscode plugin first

- prettier
- eslint

In order to make your prettier works, you have to add following config
inside your user settings

```
  "editor.formatOnSave": true,
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
```

### How to run app locally

First of all, you have to install all the packages in order to get all the
dependencies.

Open two terminal sessions side by side, and run the following code at the root
folder (same level, where you see this README.md file)

```
npm install
```

You need to open to terminal sessions side by side, one session run following command

```
npm run backend
```

the command above will help you deploy and start the whole infrastracture (Database, Static file storage, Backend Server, etc).

In another terminal session run following command

```
npm run frontend
```

The command above will help you to launch application locally.
