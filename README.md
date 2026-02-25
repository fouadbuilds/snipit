# snipit

A personal code snippet manager for your terminal. Save, find, and copy snippets without leaving your workflow.

```bash
snipit save "fetch with timeout" --tag js
snipit get "fetch with timeout" --copy
```

---

## Install

```bash
npm install -g snipit
```

---

## Commands

### Save a snippet

```bash
# inline
snipit save "kill port 3000" --code "lsof -ti:3000 | xargs kill" --tag node

# from a file
snipit save "tsconfig base" --file ./tsconfig.json --tag ts

# multiline — opens your default editor
snipit save "async fetch"
```

### List snippets

```bash
snipit list                   # all snippets
snipit list --tag ts          # filter by tag
snipit list --search "fetch"  # search by title
```

### Get a snippet

```bash
snipit get "kill port 3000"          # prints to terminal
snipit get "kill port 3000" --copy   # prints + copies to clipboard
```

Printing to terminal means you can pipe it too:

```bash
snipit get "tsconfig base" > tsconfig.json
```

### Delete a snippet

```bash
snipit delete 3   # use the ID from snipit list
```

---

## Data

Snippets are stored locally at `~/.snipit/snippets.json` — no account, no sync, no internet. Just a file on your machine.

---

## Contributing

Pull requests are welcome. For major changes open an issue first.

1. Fork the repo
2. Create a branch (`git checkout -b feat/your-feature`)
3. Commit your changes
4. Push and open a PR

---

## License

MIT