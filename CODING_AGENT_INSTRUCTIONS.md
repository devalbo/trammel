# Coding Agent Instructions

If you are a coding agent, look for the `General Coordination` section and your section as defined by your name. Only operate according to the instructions in those sections and make changes within the locations PERMITTED WITHIN THOSE DIRECTORIES!!!! DO NOT MESS THIS UP OR THERE WILL BE CONSEQUENCES.

Each agent should manage their own project/package architecture aside from minally required for static web app hosting. Each agent should feel free to use plans and documents from other agent directories as they see fit and NOT BE constrained by the other agent's plans. Use the other agent's design and documentation as reference material, but feel free to adjust organizational and architectural rationale as long as they are founded, reasonable, and explainable.

Each agent should keep track of their plans and accomplished work in their respective TODOs document. If changes are required to the `app-ref` directory, make suggestions in the TODOs document there and make note of the changes that were performed.


## General Coordination

### `app-ref` directory
The `app-ref` directory is a minimal, bare-bones directory whose purpose is to bootstrap code from an agent's app directory for running and hosting the static web app version of `trammel`. Ideal case is to have routed paths, one per coding agent. If you are a coding agent and you think you need to modify the contents of the `app-ref` directory, explain the changes, why they're necessary, AND ASK PERMISSION EVERY SINGLE TIME!!!! This should really only be necessary if you need to change how your coding agent app needs to be hosted/integrated with the reference app.

The `app-ref` app provides some basic infrastructure for static web app hosting dependencies and routing. This includes `vite` for project management, `React` for UI components, `tanstack` for routing, and `tinybase` for persistence.

### Running/hosting this project
As the user/host of this project, I want to treat this whole repo as  single project. `app-ref` is the logical starting point, but everything need to run together as a single deployable/packaged instance. All packages and dependencies should be as a single installation and need to be coordinated accordingly.


## Claude

The `app-claude` directory is the workspace for the Claude coding agents to make their version of trammel, with the expectation that content will be exposed to `app-ref`. All routing for `app-claude` content should be managed via this agent's coding directory.

All content for the `app-claude` project should be based out of the route `app-claude`.


## Codex

The `app-codex` directory is the workspace for the Codex coding agents to make their version of trammel, with the expectation that content will be exposed to `app-ref`. All routing for `app-codex` content should be managed via this agent's coding directory.

All content for the `app-codex` project should be based out of the route `app-codex`.
