[![Deploy To UAT Env](https://github.com/gcdr-volunteer/sutra-translation/actions/workflows/uat_deploy.yml/badge.svg)](https://github.com/gcdr-volunteer/sutra-translation/actions/workflows/uat_deploy.yml)

# Sutra Translation App

## Environment setup

**Install vscode**

We use vscode as our editor, you can choose other code editor as well. However,
all the instructions here is meant to use vscode as the default editor, if you
choose to use other editors, you have to setup by yourself.
Download vscode [here](https://code.visualstudio.com/)

**Install node**

We use `nvm` as our node version management, so install [nvm](https://github.com/nvm-sh/nvm) first, then run following code from your terminal

```
# install node 16 first
nvm install 16.16.0
```

```
# setup default node version
nvm use 16
```

**Install prompt indicator (optional)**

Although this is optional, this is highly recommended feature that can help you
to reduce significant error.
Starship prompt is a prompt indicator that can show the currently running
`node version`, `branch name` and `commit status`. You can install starship
from [here](https://starship.rs/guide/#%F0%9F%9A%80-installation)

**Install aws cli**

All our services that rely on AWS, so it's essential to install aws cli. Install
aws cli from [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

After installation finished, make sure to check you have aws cli installed by

```
which aws
```

**Choose your env name**
We use an env name to represent each user's environment. You have to choose a
environment name to represent your environment. After decided your env name
export your environment to your environment

```
export ENV=your-env-name
```

## Editor setup

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

## How to run app locally

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

## Contributor

Go to github `Issues` find any open issue, change the assignees to yourself,
change projects status to `In Progress`, create a local branch by clicking
Development `Create a branch`, remember to add the prefix `feature/` to branch
name. For example, your branch name is `12-implement-this-new-feature`, then you
have to update the name to `feature/12-implement-this-new-feature`. Then
click `Create branch` button, you will get a popup window, just copy paste
the content and then paste to your terminal, you are ready to do the local
development.
