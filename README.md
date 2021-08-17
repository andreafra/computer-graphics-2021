# WebGL 2 Webpack Template Project

This is a simple, already configured, [Webpack](https://webpack.js.org/) project that you
can edit as you please. There isn't a rigid file structure in place, you can adapt it to your needs.

_This was made for a university project with WebGL 2._

The small example included is taken from an exercise by @EricaStella93.

## Features

-   🔁 Auto-reloading web server (with [HMR](https://webpack.js.org/guides/hot-module-replacement/) deactivated, didn't test it)
-   ✨ GLSL files loader (your shaders get imported as string, the advantage is having syntax highlighting)
-   🛠 [TWGL.js](https://twgljs.org) already included
-   ✍️ Code formatter ([Prettier](https://prettier.io/)) already setup

## How to use

> Requirements:
>
> -   [Node](https://nodejs.org) and `npm` installed (consider using [`nvm`](https://github.com/nvm-sh/nvm))
> -   A WebGL 2 compliant browser

1. [Create a new repo from this template](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template#creating-a-repository-from-a-template)
2. Clone your repo on your machine
3. `cd` into your repo
4. `npm install`
5. `npm start` to start the web server

Done!

Your files should be inside `src/`, your compiled web app is inside `dist/`.
