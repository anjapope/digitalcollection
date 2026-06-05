---
layout: page
title: Interactive SVG Navigation Demo
permalink: /svg-demo/
---

<h2>Interactive SVG Navigation Example</h2>
<p>Click the shapes below to visit different parts of the collection.</p>

<svg width="500" height="220" viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">
  <!-- Browse Circle -->
  <a xlink:href="/browse.html">
    <circle cx="120" cy="110" r="60" fill="#4A90E2" />
    <text x="120" y="115" text-anchor="middle" fill="#fff" font-size="20" font-family="Arial">Browse</text>
  </a>
  <!-- Timeline Rectangle -->
  <a xlink:href="/timeline.html">
    <rect x="220" y="60" width="120" height="100" rx="15" fill="#E94E77" />
    <text x="280" y="120" text-anchor="middle" fill="#fff" font-size="20" font-family="Arial">Timeline</text>
  </a>
  <!-- About Ellipse -->
  <a xlink:href="/about.html">
    <ellipse cx="400" cy="110" rx="60" ry="40" fill="#50E3C2" />
    <text x="400" y="115" text-anchor="middle" fill="#222" font-size="20" font-family="Arial">About</text>
  </a>
</svg>

<p style="margin-top:2em; color:#666; font-size:0.95em;">You can replace these shapes with your own SVG artwork and link to any collection page or filtered view.</p>
