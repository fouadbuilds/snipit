# snipit 📎

<p align="center">
  <strong>A snappy personal code snippet manager for your terminal.</strong><br>
  Save, search, and copy snippets without leaving your workflow.
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@fouaden/snipit" target='_blank'><img src="https://img.shields.io/npm/last-update/%40fouaden%2Fsnipit" alt="Node.js 18+"></a>
<a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js" alt="Node.js 18+"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green" alt="License"></a>
</p>

<p align="center">
  <a href="#install">Install</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#commands">Commands</a> •
  <a href="#data">Data</a> •
</p>

---

## Why snipit?

You know that one-liner you Google every time? The `tsconfig` you copy from an old project? The regex you always lose?

snipit stores them locally, tagged and searchable, ready to copy to your clipboard in one command. No account, no sync, no internet — just a JSON file on your machine.

---

## Install

```bash
npm i -g @fouaden/snipit
```

**Requirements**: Node.js 18+

---

## Note!

macOS/Linux: If you get an EACCES permission error, run

```bash
 sudo npm install -g @fouaden/snipit # This happens when npm's global folder is owned by root.
```

## Quick Start

```bash
# save a snippet
snipit save "kill port 3000" --code "lsof -ti:3000 | xargs kill" --tag node

# find it
snipit list --tag node

# grab it
snipit get "kill port 3000" --copy
```

---

## Commands

### Save a snippet

```bash
# inline code
snipit save "kill port 3000" --code "lsof -ti:3000 | xargs kill" --tag node

# from a file — reads the file content and stores it
snipit save "tsconfig base" --file ./tsconfig.json --tag ts

# multiline — opens your default editor
snipit save "async fetch" --tag js
```

Tags are comma-separated and optional:

```bash
snipit save "docker prune" --code "docker system prune -af" --tag "docker,ops"
```

### List snippets

```bash
snipit list                    # all snippets
snipit list --tag ts           # filter by tag
snipit list --search "docker"  # search by title
```

### Get a snippet

```bash
snipit get "kill port 3000"          # prints to terminal
snipit get "kill port 3000" --copy   # prints + copies to clipboard
```

Since output goes to stdout, you can pipe it too:

```bash
snipit get "tsconfig base" > tsconfig.json
snipit get "nginx config" | ssh user@server "cat > /etc/nginx/nginx.conf"
```

### Delete a snippet

```bash
snipit delete 3   # use the ID shown in snipit list
```

---

## Data

Snippets are stored at `~/.snipit/snippets.json` as a plain JSON file. No database, no server, no account.

```json
{
  "snippets": [
    {
      "id": 1,
      "title": "kill port 3000",
      "code": "lsof -ti:3000 | xargs kill",
      "tags": ["node"],
      "created": "2026-02-25"
    }
  ],
  "lastId": 1
}
```

You can back it up, sync it with Dropbox, or commit it to a private repo — it's just a file.

---

## License

MIT
