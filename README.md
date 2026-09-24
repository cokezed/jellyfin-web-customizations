# Jellyfin web customizations

Portable **CSS** and **JavaScript Injector** snippets for the [Jellyfin](https://jellyfin.org/) web client.

Tested on **Jellyfin 10.11.x**. Other versions may need selector tweaks.

## How this repo is organized

Each customization lives in its own folder with:

- The CSS and/or JS to paste
- A README with install steps

Customizations are added one at a time via pull requests.

## Requirements

| Need | Used for |
| --- | --- |
| Jellyfin 10.11+ web | All snippets |
| [Custom CSS](https://jellyfin.org/docs/general/clients/css-customization/) / `branding.xml` | Style-only and badge styles |
| [JavaScript Injector](https://github.com/IAmParadox27/jellyfin-plugin-javascript-injector) | Behavior patches |

### Branding note (10.11)

Dashboard → Branding → Custom CSS often loads empty. **Do not Save an empty box** — it can clear `branding.xml`. Paste into `branding.xml` `<CustomCss>` (or use your host’s apply script) when the UI is unreliable.

## Contributing

1. One customization per PR (one folder + README row).
2. No secrets, API keys, or host-specific paths in snippets.
3. Keep READMEs installable on a stock Jellyfin + Injector setup.

## License

MIT — see [LICENSE](LICENSE).
