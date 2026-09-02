import {test} from '@playwright/test';

test('Test Case 1', {tag: '@smoke'}, async ({ page }) => {
    console.log("This is test case 1");
});

test('Test Case 2',{tag: '@regression'}, async ({ page }) => {
    console.log("This is test case 2");
});

test('Test Case 3',{tag: '@smoke'}, async ({ page }) => {
    console.log("This is test case 3");
});

test('Test Case 4', {tag: ['@smoke', '@regression', '@sanity']}, async ({ page }) => {
    console.log("This is test case 4");
});