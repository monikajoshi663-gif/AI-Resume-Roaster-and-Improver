# Teamwork and Git rules for the Resume Roaster project
# Git rules (main branch only)

1. **One branch: `main`.** Nobody creates branches.
2. **Own your folder.** Person A edits only `client/`. Person B edits only `server/`.
   Shared files (`README.md`, this file, task files): message your teammate first, and change them in a commit of their own.
3. **Start of every work block:**
   ```bash
   git pull --rebase origin main
   ```
4. **Commit small, push often** (every 20 to 30 minutes, or after each finished task):
   ```bash
   git add -A
   git commit -m "client: add score gauge"     # or "server: add pdf parsing"
   git pull --rebase origin main
   git push origin main
   ```
5. **Push rejected?** Run `git pull --rebase origin main` and push again. Never `git push --force`.
6. **Never commit** `.env`, `node_modules/` or `dist/`. Share API keys in chat, not in git.
7. **Changing the API contract** (request or response JSON): tell your teammate first, then update the contract in `README.md` in its own commit with the message `contract: ...`.
8. **Commit prefix** is `client:`, `server:` or `contract:`, so the history shows who changed what.
9. **Never leave `main` broken.** Before pushing, make sure your side still starts (`npm run dev`).