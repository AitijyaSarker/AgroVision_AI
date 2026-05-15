# 📄 HTML/CSS Explanation

## Why No Separate HTML/CSS Files?

This project uses **Next.js** (React framework), which works differently from traditional HTML/CSS websites:

### Traditional Website:
```
index.html          ← HTML file
styles.css          ← CSS file
script.js           ← JavaScript file
```

### Next.js/React Website:
```
page.tsx            ← JSX (JavaScript + HTML-like syntax)
globals.css         ← Global CSS
tailwind.config.ts  ← Tailwind CSS (utility classes)
```

## How It Works

1. **JSX/TSX Files** (`.tsx` or `.jsx`):
   - Contain HTML-like syntax mixed with JavaScript
   - Example: `<div className="...">` instead of `<div class="...">`
   - These compile to regular HTML when built

2. **Tailwind CSS**:
   - Uses utility classes instead of separate CSS files
   - Example: `className="bg-blue-500 text-white p-4"`
   - Compiles to regular CSS when built

3. **Global CSS** (`globals.css`):
   - Contains custom styles and Tailwind directives
   - Similar to traditional CSS but uses Tailwind's system

## 📁 Standalone HTML/CSS Version

I've created a **traditional HTML/CSS version** for you to see how it would work:

- `public/contact-form-standalone.html` - Pure HTML
- `public/contact-form-styles.css` - Traditional CSS
- `public/contact-form-script.js` - Vanilla JavaScript

You can open `contact-form-standalone.html` directly in your browser!

## 🔄 Converting React to HTML

If you want to see the actual HTML output:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Check the output:**
   - Built HTML files will be in `.next/` folder
   - These are the compiled HTML files

3. **Or use standalone version:**
   - Open `public/contact-form-standalone.html` in browser
   - It works without any build process!

## ✅ Benefits of Next.js Approach

- **Component Reusability**: Write once, use everywhere
- **Type Safety**: TypeScript catches errors early
- **Better Performance**: Automatic code splitting
- **SEO Friendly**: Server-side rendering
- **Modern Tooling**: Hot reload, fast refresh

## 📝 Summary

- **React/Next.js** = Modern approach (what this project uses)
- **HTML/CSS** = Traditional approach (standalone version provided)
- Both work! Choose based on your needs.

The standalone HTML version in `public/` folder shows you exactly how traditional HTML/CSS works!


