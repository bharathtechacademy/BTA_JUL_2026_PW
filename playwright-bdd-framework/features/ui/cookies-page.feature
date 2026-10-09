Feature: Cookies feature in CREATIO CRM application
    As a user of the CREATIO CRM application, I want to use this feature file to verify all the test scenarios related to the cookies page.

    Scenario: Verify cookies page is displayed correctly
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed

    Scenario: Verify cookies pop-up content
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed
        And Verify cookies pop-up content
            """
            We may use cookies and similar technologies to collect information about the ways you interact with and use the website, to support and enhance features and functionality, to monitor performance, to personalize content and experiences, for marketing and analytics, and for other lawful purposes.
            """

    Scenario: Verify cookies popup logos displayed correctly
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed
        And Verify cookies popup logos

    Scenario: Verify cookies popup switch buttons
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed
        And Verify cookies popup switch buttons

    Scenario: Verify cookies popup selection buttons
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed
        And Verify cookies popup selection buttons

    Scenario: Verify show details link functionality
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed
        And Verify show details link
        When User clicks on show details link
        Then cookies popup should display in expanded view

    Scenario: Verify accept cookies functionality
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed
        And Verify cookies popup selection buttons
        When User clicks on "allow all" button
        Then cookies popup should be closed

    Scenario: Verify login page is displayed correctly
        Given Launch the Creatio CRM application
        Then Cookies page should be displayed
        And Verify cookies popup selection buttons
        When User clicks on "allow all" button
        Then cookies popup should be closed
        And Login page should be displayed