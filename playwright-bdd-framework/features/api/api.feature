Feature: API feature in Github application
    As a user of GitHub, I want to validate all the Git repository-related APA validations in this feature file.

    Background: Initialize API request context.
        Given API request context is initialized

    Scenario: Request to create a duplicate repository within GitHub.
        When User send a "POST" request with endpoint "/user/repos" to create a repository with name "PlaywrightRepo"
        Then User should receive a response with status code 422
        And User should receive status message "Unprocessable Entity"
        And User should receive body having "message" as "Repository creation failed."
        And User should receive body having "message" datatype as "string"

    Scenario: Request to create a valid repository within GitHub.
        When User send a "POST" request with endpoint "/user/repos" to create a repository with name "ValidRepo"
        Then User should receive a response with status code 201
        And User should receive status message "Created"
        And User should receive body having "name" as "ValidRepo"
        And User should receive body having "name" datatype as "string"

    Scenario: Request to update a valid repository within GitHub.
        When User send a "PATCH" request with endpoint "/repos/bharattechacademy11/ValidRepo" to update the repository description as "Updated Description"
        Then User should receive a response with status code 200
        And User should receive status message "OK"
        And User should receive body having "name" as "ValidRepo"
        And User should receive body having "name" datatype as "string"
        And User should receive body having "description" as "Updated Description"
        And User should receive body having "description" datatype as "string"

    Scenario: Request to get a valid repository within GitHub.
        When User send a "GET" request with endpoint "/repos/bharattechacademy11/ValidRepo"
        Then User should receive a response with status code 200
        And User should receive status message "OK"
        And User should receive body having "name" as "ValidRepo"
        And User should receive body having "name" datatype as "string"
        And User should receive body having "description" as "Updated Description"
        And User should receive body having "description" datatype as "string"

    Scenario: Request to delete a valid repository within GitHub.
        When User send a "DELETE" request with endpoint "/repos/bharattechacademy11/ValidRepo"
        Then User should receive a response with status code 204
        And User should receive status message "No Content"