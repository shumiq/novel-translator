1. Run `bun .\extract-parenthesis.ts` to get the list of files with parenthesis.
2. Analyse all parenthesis `(...)` in the file if it is redundat or not. For an example `พล็อตคลาสสิก (Template)` is redundant but `เพราะเกือบทุกคนเป็นคนดี (ยกเว้นบางคนล่ะนะ)` is not.
3. Remove all redundant parenthesis from the file. If the redundant is the translation, choose Thai.
4. Adjust spacing after removing parenthesis.
5. Append the file name into `check.txt` EVEN THERE IS NO CHANGE
6. Repeat 1 again until there is no file left