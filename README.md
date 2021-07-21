ancientsData.txt is just a renamed README.md output file from the scripts in the main branch.

To maintain this in the future switch to master branch, supply the .cfgs from the new version of the game, run the scripts,
copy and then rename the 'README.md' output file to 'ancientsData.txt', switch back to branch deployment, replace the old 'ancientsData.txt', push the changes.

Netlify will then update the website automatically, no additional actions necessary. Nothing will break unless 'README.md' sctructure is changed.
