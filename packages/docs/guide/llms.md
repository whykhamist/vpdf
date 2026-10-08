# llms.txt for agents

This documentation site publishes [llms.txt](https://llmstxt.org/) files that let coding agents and AI assistants read vpdf documentation as Markdown, without scraping HTML pages.

## Published resources

| Resource        | URL                                               | Use it for                                                                                                       |
| --------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Site index**  | `https://whykhamist.github.io/vpdf/llms.txt`      | Start here. Lists the documentation pages available to agents.                                                   |
| **Single page** | `https://whykhamist.github.io/vpdf/<path>.md`     | Read one documentation page as Markdown. For example, `https://whykhamist.github.io/vpdf/guide/installation.md`. |
| **Full dump**   | `https://whykhamist.github.io/vpdf/llms-full.txt` | Read the entire documentation site from a single file.                                                           |

## Recommended workflow

For most tasks, give your agent the site index:

```
https://whykhamist.github.io/vpdf/llms.txt
```

Then:

1. **Read** `llms.txt` **first** to discover the relevant documentation.
2. **Fetch only the** `.md` **pages you need** for the task.
3. **Use** `llms-full.txt` when you need broad access to the entire documentation and your context window can accommodate it.

### For project rules

You can add the `llms.txt` URL to your agent's project or repository instructions so it can use the vpdf documentation as a reference when working on your codebase.

## Why Markdown?

The `.md` endpoints contain the same documentation in an agent-friendly format. They are easier for coding agents and assistants to consume than rendered HTML and avoid requiring HTML scraping.

For the best balance of context size and relevance, **start with** `llms.txt` **and fetch individual** `.md` **pages as needed**.
