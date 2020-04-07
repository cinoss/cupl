Feature: Simple ATM withdrawal
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