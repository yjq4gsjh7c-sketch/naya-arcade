# La nostra serata impossibile

Standalone bilingual Italian/German couples game for iPhone and iPad. Hosted as an unlinked subdirectory on GitHub Pages; it is not part of Naya Arcade's menu or offline cache. This URL is public, even though it is unlisted and has a `noindex` directive.

Two people share one device. In each of 12 rounds, one secretly picks one of three options; the other predicts the choice after an opaque handoff screen. Roles alternate. The game offers 42 classic cards and 36 adult hot cards, shuffled without repeats until each deck is exhausted during the open browser session. Adjacent cards avoid the same category when possible. Any card may be skipped. Hot mode requires an 18+ mutual-consent acknowledgement. Choices and names are held only in memory; no game data is uploaded or saved. Optional synthesized sound uses Web Audio. The page has no external dependencies or trackers.

All UI and card copy is Italian followed by German in parentheses. `node tests.cjs` validates the card catalogue. Browser validation should cover classic/hot selection, handoff secrecy, reveal and score, plus iPhone and iPad portrait layouts.
