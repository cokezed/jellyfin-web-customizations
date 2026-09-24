# Jellyfin web customizations

CSS and JavaScript Injector snippets for the [Jellyfin](https://jellyfin.org/) web client.

Tested on Jellyfin 10.11.x. Older or newer builds may need small selector changes.

## Layout

Each customization is its own folder: CSS and/or JS to paste, plus a README.

Add one customization per pull request.

## Customizations

| Folder | What |
| --- | --- |
| [missing-episode-badge/](missing-episode-badge/) | Missing-episode count on TV series/season posters (JS Injector + CSS) |
| [foreign-language-badge/](foreign-language-badge/) | Non-English primary audio ISO code on movie/episode posters (JS Injector + CSS) |
| [collections-poster-grid/](collections-poster-grid/) | Collections grid columns/titles + larger posters on collection detail (CSS) |
| [image-search-dialog/](image-search-dialog/) | Larger Edit images / Identify art search dialogs (CSS) |

## Requirements

| Need | Used for |
| --- | --- |
| Jellyfin 10.11+ web | All snippets |
| [Custom CSS](https://jellyfin.org/docs/general/clients/css-customization/) or `branding.xml` | Styles |
| [JavaScript Injector](https://github.com/IAmParadox27/jellyfin-plugin-javascript-injector) | Behavior |

### Branding note (10.11)

Dashboard → Branding → Custom CSS often loads empty. Do not Save an empty box; that can wipe `branding.xml`. Edit `branding.xml` `<CustomCss>` on disk if the Dashboard box is empty.

## Contributing

1. One customization per PR (folder + root README table row).
2. No secrets, API keys, or host-only paths.
3. READMEs should work on stock Jellyfin + Injector (no local tooling assumed).

## License

MIT. See [LICENSE](LICENSE).
