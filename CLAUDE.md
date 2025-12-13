# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tidal Endurance is a static website built using the HTML5 UP "Dimension" template. It's a single-page site with modal-style "pages" and a depth effect.

## Development

This is a static HTML/CSS/JS site with no build system or package manager. To develop:

- Open `index.html` directly in a browser, or use a local server (e.g., `python -m http.server 8000`)
- Edit `index.html` for content changes
- Edit `assets/css/main.css` for styling (compiled from SASS in `assets/sass/`)
- Edit `assets/js/main.js` for JavaScript behavior

## Architecture

- `index.html` - Main entry point containing all page content as modal articles
- `assets/` - CSS, JavaScript, SASS source files, and web fonts
- `images/` - Site images
- `icons/` - Custom SVG icons (shoe logo, arrow icons)
- `html5up-dimension/` - Original unmodified template for reference

### Content Structure

The site uses modal articles triggered by nav links:
- `#about` - About section
- `#onboarding-form` - Embedded Google Form iframe

Additional sections (contact, elements) are commented out in the HTML and can be re-enabled.

## Template

Based on "Dimension" by HTML5 UP (html5up.net), licensed under CC BY 3.0. The template includes jQuery, Font Awesome, and responsive utilities.
