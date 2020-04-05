# cupl

A CLI tool for automatic **CU**cumber gherkin feature files generation from **PL**antuml activity diagram.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cupl.svg)](https://npmjs.org/package/cupl)
[![CircleCI](https://circleci.com/gh/cinoss/cupl/tree/master.svg?style=shield)](https://circleci.com/gh/cinoss/cupl/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/cinoss/cupl?branch=master&svg=true)](https://ci.appveyor.com/project/cinoss/cupl/branch/master)
[![Codecov](https://codecov.io/gh/cinoss/cupl/branch/master/graph/badge.svg)](https://codecov.io/gh/cinoss/cupl)
[![Downloads/week](https://img.shields.io/npm/dw/cupl.svg)](https://npmjs.org/package/cupl)
[![License](https://img.shields.io/npm/l/cupl.svg)](https://github.com/cinoss/cupl/blob/master/package.json)

Cupl will help you transform `.puml` file of this diagram.

![ATM Activity Diagram](./examples/ATM.png)

Into this Gherkin feature description

```gherkin
Feature: Simple ATM withdrawal
  No PIN retry, No Amount re-enter

  Scenario: Successful transaction
    Given Entered Correct PIN number
      And Balance is sufficient
    When enter amount
    Then dispense notes
      And print receipt
      And eject the card

  Scenario: The world is not enough
    Given Entered Correct PIN number
      And Insufficient balance
    When enter amount
    Then display "Insufficient balance"
      And eject the card

  Scenario: PIN is incorrect
    Given User's PIN is 111111
    When insert card
      And User enters 111112
    Then display "incorrect PIN"
      And eject the card
```

<!-- toc -->

- [cupl](#cupl)
- [Usage](#usage)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g cupl
$ cupl <file path>
running command...
$ cupl (-v|--version|version)
cupl/0.0.4 darwin-x64 node-v10.16.0
$ cupl --help [COMMAND]
USAGE
  $ cupl FILE
...
```

<!-- usagestop -->
