Feature: Git API load test feature
    As a user of GitHub, I want to perform load testing on Git API endpoints to ensure they can handle high traffic efficiently.
 
    Scenario: Perform load test on Git API endpoint
        Given Initialize the Jmeter Utility
        Then Run the JMeter test plan "LoadTest.jmx" and publish results