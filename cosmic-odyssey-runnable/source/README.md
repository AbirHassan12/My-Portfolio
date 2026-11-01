# Cosmic Odyssey v2 — Abir Hassan
Interactive 3D portfolio told as a six-chapter story, with a procedural ambient soundtrack.

## Run
    npm install
    npm run dev          # http://localhost:5173
    npm run build        # production build in /dist
    npm run build:single # one self-contained dist/index.html

## Structure
    index.html               page markup (sections, HUD, modal)
    src/main.js              boots everything
    src/data/                YOUR CONTENT: profile.js, skills.js, projects.js, timeline.js, story.js
    src/scene/               Universe.js (renderer, camera spline, springs, loop), objects.js, shaders.js
    src/audio/SoundEngine.js procedural ambient score + UI sounds (off by default)
    src/ui/                  content.js, projects.js, story.js, interface.js
    src/utils/spring.js      damped-spring helper
    src/styles/main.css      design system

## Customise
- Name, text, email, CV, social links: src/data/profile.js (put cv.pdf in /public, set cv: 'cv.pdf')
- Skills / projects / timeline: the matching file in src/data/
- Story captions and chapter titles: src/data/story.js
- Contact form has no backend: it opens the visitor's mail app (needs profile.email). Use Formspree/EmailJS for a real send.
