# peralta.sh
A personal website built on <a href="https://encore.dev/ts">Encore.ts</a>.

![TypeScript](https://img.shields.io/badge/typescript-black?style=for-the-badge&logo=typescript)
![HTML](https://img.shields.io/badge/ejs-black?style=for-the-badge&logo=ejs)
![HTML](https://img.shields.io/badge/html-black?style=for-the-badge&logo=html5)
![CSS](https://img.shields.io/badge/css-black?style=for-the-badge&logo=css)
![R2/S3](https://img.shields.io/badge/r2%2Fs3-black?style=for-the-badge&logo=cloudflare)
![Website](https://img.shields.io/website?style=for-the-badge&labelColor=black&up_color=blue&up_message=online&url=https%3A%2F%2Fperalta.sh&label=status)

> #### Brief history of this repo
> I've always enjoyed making and designing websites as a hobby, with this being one of them!
> Originally, this website was a simple static HTML site made to complement `photos.peralta.sh`, which was the actual dynamic part of the site (the photography gallery) and was originally made with a Python backend (first Django, then Flask).
> Now, this repository serves as a combination of both sites into one application. I wouldn't say that the site is fully complete, however, and I intend to work on it slowly as I go along.

## Running

If you want to try running this for yourself, install Encore with:
```sh
brew install encoredev/tap/encore
``` 
then, run:
```sh
encore run
``` 
in the repo directory.

### File Structure

- `./assets/` - static files, includes main page and all CSS & JS
- `./templates/gallery` - where gallery template files are stored for content generation
- `main.ts` - main application code
- `storage.ts` - util for connecting to R2 storage for images

---

> <span style="color:gray">Photos hosted on https://peralta.sh/gallery are subject to copyright</span> &bull; [MIT License](LICENSE)

