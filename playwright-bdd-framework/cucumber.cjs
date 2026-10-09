module.exports = {

    default: {
        // paths: ['features/**/*.feature'],
        import: ['support/register.js', 'step-definitions/**/*.ts', 'support/*.ts'],
        format: ['progress-bar', 'html:reports/cucumber-report.html']
    }

};
