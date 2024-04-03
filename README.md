# AMQP Dev Tools 🐰

A Desktop App for debugging and testing when working with AMQP.

**It's still work in progress and there is no stable release yet.**

## Install

If you want to use the tool you need to build it yourself. Make sure you have installed

* Rust
* pnpm
* Node.js

Then, just clone the repository, checkout the tag you want to build and run `pnpm tauri build`. You can find the installers in *src-tauri/target/release/bundle/.*

## Usage

Press <kbd>⌘</kbd> + <kbd>K</kbd> to do anything.

## Features

* A **Publisher** allows you to publish messages to exchanges
* A **Recorder** consumes messages from an exchange and lets you filter them using Regex
* Command to **declare exchanges**
