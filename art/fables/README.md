# Aesop storybook illustrations

Original illustrations generated with the built-in OpenAI imagegen tool.
Each WebP (`<story-id>.webp`) is a 1536 × 1024 atlas with four equal panels:
top left = cover; top right = paragraph 1; bottom left = paragraph 2;
bottom right = paragraph 3 (or an extra closing illustration for two-paragraph stories).

The application crops panels with CSS. There are 12 covers and 31 paragraph illustrations.
Story text, Chinese translations, speech controls and quiz data remain unchanged.
Generation prompts are saved in prompts.json. Unfortunate events are illustrated gently.

New art arrives as PNG from the image generator. Convert before committing, then delete the PNG:

    cwebp -q 82 -m 6 aesop-xxx.png -o aesop-xxx.webp

Then run `python3 tools/sync_assets.py` and bump the `CACHE` name in `sw.js`.
