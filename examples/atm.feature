Feature: Simple ATM withdrawal
  No PIN retry, No Amount re-enter

  Scenario: Successful transaction
    Given Entered Correct PIN number
    And Balance is sufficient
    When enter amount
    Then dispense notes
    And print receipt
    And eject the card

  Scenario: Not enough money
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
