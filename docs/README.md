# Cupl

A CLI tool for automatic **CU**cumber gherkin feature files generation from **PL**antuml activity diagram.

[![Version](https://img.shields.io/npm/v/cupl.svg)](https://npmjs.org/package/cupl)
[![CircleCI](https://circleci.com/gh/cinoss/cupl/tree/master.svg?style=shield)](https://circleci.com/gh/cinoss/cupl/tree/master)
[![Codecov](https://codecov.io/gh/cinoss/cupl/branch/master/graph/badge.svg)](https://codecov.io/gh/cinoss/cupl)
[![Downloads/week](https://img.shields.io/npm/dw/cupl.svg)](https://npmjs.org/package/cupl)
[![License](https://img.shields.io/npm/l/cupl.svg)](https://github.com/cinoss/cupl/blob/master/package.json)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- [![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/cinoss/cupl?branch=master&svg=true)](https://ci.appveyor.com/project/cinoss/cupl/branch/master) -->

Cupl will help you transform `.puml` file of this diagram.

![ATM Activity Diagram](https://raw.githubusercontent.com/cinoss/cupl/master/examples/ATM.png)

Into this Gherkin feature description

```gherkin
  No PIN retry, No Amount re-enter

  Scenario: Successful transaction
    Given Entered Correct PIN number
      And Balance is sufficient
    When enter amount
    Then dispense notes
      And print receipt
      And eject the card

  @important
  Scenario: Not enough money
    Given Entered Correct PIN number
      And Insufficient balance
    When enter amount
    Then display "Insufficient balance"
      And eject the card

  Scenario Outline: PIN is incorrect
    Given User's PIN is <pin>
    When insert card
      And User enters <input>
    Then display "incorrect PIN"
      And eject the card

    Examples:
      | pin    | input  |
      | 123456 | 325212 |
      | 123456 |        |
```

<!-- toc -->

- [Cupl](#cupl)
- [Usage](#usage)
  - [Conventions](#conventions)
  - [Basic](#basic)
  - [Install globally](#install-globally)
- [Syntax Support](#syntax-support)
  - [Gherkin](#gherkin)
  - [PlantUML Activity Diagram (New Syntax)](#plantuml-activity-diagram-new-syntax)
  <!-- tocstop -->

# Usage

## Conventions

- User/Core activity must start with `@` symbol, these will go to `When` steps of Gherkin file.
- If condition must be a statement that end with `?`, it's will be drop while parsing.

> :x: `is PIN correct?`

> :white_check_mark: `PIN is correct?`

- Else branch must be descriptive.

> :x: `no`

> :x: `false`

> :white_check_mark: `PIN is incorrect`

## Basic

<!-- usage -->

1. create a `.puml` file and run

```sh-session
$ npx cupl FILE.puml
Feature: ...
...
```

2. a `.cupl.json` file will be generated to allow you to

- Rename `Scenario` ( by `name` field).
- Rename rename steps ( by `alias` dictionary) and insert parameters.
- Rename add `@tag` to `Scenario` and steps (by `tags` field - array of strings).
- Rename change Gherkin dialect.
- Provides examples

Example:

```json
{
  "$schema": "https://raw.githubusercontent.com/cinoss/cupl/master/src/config.schema.json",
  "global": {
    "alias": {
      "PIN is correct": "Entered Correct PIN number"
    },
    "dialect": "en"
  },
  "paths": {
    "PIN is correct|Balance is sufficient": {
      "name": "Successful transaction"
    },
    "PIN is correct|Insufficient balance": {
      "name": "Not enough money",
      "tags": ["important"]
    },
    "PIN is incorrect": {
      "alias": {
        "PIN is incorrect": "User's PIN is <pin>",
        "enter PIN": "User enters <input>"
      },
      "examples": [
        ["pin", "input"],
        ["123456", "325212"],
        ["123456", ""]
      ]
    }
  }
}
```

3. Run `cupl` again with `-w` flag to generate a file.

```sh-session
$ npx cupl -w FILE.puml
Feature: ...
...
Generated [FILE].feature successfully!
```

## Install globally

```sh-session
$ npm install -g cupl
$ cupl FILE
running command...
...
```

<!-- usagestop -->

# Syntax Support

## Gherkin

- [x] Feature
- [x] Example (or Scenario)
- [x] Given, When, Then, And, But for steps (or \*)
- [x] Tags
- [x] Examples
- [ ] Background
- [ ] Scenario Outline (or Scenario Template)
- [ ] Data Tables
- [ ] Rule
- [ ] Doc Strings
- [ ] Comments

## PlantUML Activity Diagram (New Syntax)

- [x] `start`, `stop`, `end`
- [x] `if`, `elseif`, `endif`
- [x] `title`, `end title`
- [x] `note`, `end note`
- [x] SDL (`|`, `<`, `>`, `/`, `]`, `}`)
- [ ] `repeat`, `repeat while`, `backward`, `while`, `end while`
- [ ] `fork`, `end fork`
- [ ] Colors
- [ ] Arrow
- [ ] Connector
- [ ] Grouping
- [ ] Swimlanes
- [ ] Detach
