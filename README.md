<p align="center">
  <img src="./public/favicon.svg" width="72" height="72" alt="Hearth & Seal icon" />
</p>

# Hearth & Seal — Secret Santa

A tiny, zero-backend Secret Santa exchange app for friends: generate private, encrypted reveal links in your browser and share them so everyone can unseal who they drew without any server, database, or sign-up.

**Live site:** https://danieledambrosi-rizzoli.github.io/secret-santa/

---

## About This Repo

- **Fully vibecoded:** Built quickly with AI assistance just for fun.
- **Unmaintained:** I won't be actively maintaining this repository, reviewing PRs, or providing support.
- **Just for friends & Christmas:** There is no monetization, tracking, or commercial goal behind this—it's simply a little game for friends to share a happy Christmas.
- **Fork freely:** Anyone is welcome to fork, remix, or host their own copy with zero restrictions or hard feelings.
- **Seasonal archive:** Once testing is finished, this repository will be **archived until next Christmas** (the GitHub Pages site will stay up and available in the meantime).

## Hosting & Traffic Note

Since this site is hosted on **GitHub Pages**, it has a soft bandwidth limit (100 GB/month) and dynamic rate-limiting if it receives too many requests or traffic spikes. I don't expect high traffic since it's just for friends—but if you want to play with your own group, **hosting your own copy on GitHub Pages takes about a minute**:

1. **Fork this repository** (click **Fork** in the top-right corner; keep it **Public** if you're on a free GitHub account, as free GitHub Pages requires a public repo).
2. Open your forked repo's **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Go to the **Actions** tab, enable workflows if prompted, and run **Deploy to GitHub Pages** (or push any small edit to `main`).
5. Your own private Secret Santa site will be live at `https://<your-username>.github.io/secret-santa/`!

## Local Development

```bash
npm install
npm run dev
```

To build for production:

```bash
npm run build
```
