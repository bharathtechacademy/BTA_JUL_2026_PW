Feature: Login feature in CREATIO CRM application
    As a user of the CREATIO CRM application, I want to use this feature file to verify all the test scenarios related to the loginpage page.

    @Regression @Sanity
    Scenario: Verify login page is displayed correctly
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed
        And Verify cookies popup selection buttons
        When User clicks on "allow all" button
        Then cookies popup should be closed
        And Login page should be displayed

    @Regression @Sanity @Smoke
    Scenario Outline: Verify login feature with "<scenario>" credentials
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed
        And Verify cookies popup selection buttons
        When User clicks on "allow all" button
        Then cookies popup should be closed
        And Login page should be displayed
        When User enters "<username>" and "<password>" in the login page
        And User clicks on the "login" button
        Then Login should be "<result>"

        Examples:
            | scenario | username                       | password                | result  |
            | valid    | bharattechacademy5@outlook.com | BharathTechAcademy#1234 | success |
            | invalid  | bharattechacademy5@outlook.com | Invalid#1234            | failure |


    @Regression
    Scenario Outline: Verify logout feature
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed
        And Verify cookies popup selection buttons
        When User clicks on "allow all" button
        Then cookies popup should be closed
        And Login page should be displayed
        When User enters "<username>" and "<password>" in the login page
        And User clicks on the "login" button
        Then Login should be "<result>"
        When User clicks on the logout button
        Then Logout should be successful and navigate to the login page

        Examples:
            | username                       | password                | result  |
            | bharattechacademy5@outlook.com | BharathTechAcademy#1234 | success |
