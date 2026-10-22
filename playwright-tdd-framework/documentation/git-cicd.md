# Git lifecycle 

1. Creating local working directory 
We should create a local project folder to maintain all the day-to-day changes that we are going to add with respect to application development or maybe your automation-related stuff. 

command : cd C:\Training\PlaywrightTrainings\July_2026\playwright-tdd-framework


2. Initialize the local working directory. 
Installing Git tool and its libraries within the project folder or local working directory to monitor day-to-day changes made by the user .

command : git init

3. Adding working changes into the staging area 
Staging area: meaning the temporary workspace created by Git within the local computer to maintain working changes among all the files edited by the user.

commands : 
- git status (It will return all the files updated with green and red colors. Green color refers to staged files. Red color refers to unstaged files. )

- git add <file_path> (It'll add a specific file to the staging area. )

- git add . (It will add all the files into the staging area at a time. )


4. Committing the latest changes. 
Once all the files are added to the staging area, we are going to bundle all the files together as a single package and then add comments on top of that about what change we are trying to push. 

command: git commit -m "message"

5. Push the changes into a specific branch. 
Once the work is done, we are going to upload all the changes from the local computer to the cloud repository. 
Here, specific branch means that within the cloud repository, we are going to maintain multiple copies of the code. Out of those, which copy do you want to update with the changes? 

command : git push origin master

## Branching strategy
For example, user 1 created a framework, and the framework is working absolutely fine. This guy updated the complete framework along with automation code into a GitHub repository. 

Now, within the same project, there are three more users added, and they are contributing towards the same automation framework. 

All three members started development and added all the changes on top of the existing framework created by the previous user. Is there any guarantee that every user is going to add valid code only? 

To avoid adding invalid changes to the master copy, which is in working condition, for each and every user, we are going to create a separate copy of the code along with the master copy. No one is going to have access to directly update the code in the master copy. Instead, they are going to add all their changes in their personal copy. Later, whenever they want to add all those changes to the master copy, we are going to introduce a review mechanism where another person should review the code and approve the code. Only then are we going to allow all these changes to merge into the master copy. Otherwise, changes will stay in their personal copy only. 

Once the latest code is merged into master, everyone should run the `git pull` command to pull the latest changes from the master copy to their personal branches. 

