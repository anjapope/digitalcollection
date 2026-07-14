---
title: "Historical Society Room"
layout: page
---

# Historical Society

Welcome to the Historical Society pathway. Discover how ivory objects shaped and were shaped by local communities.

{% for entry in site.historicalsociety %}
- [{{ entry.title }}]({{ entry.url }})
{% endfor %}

<div style="margin-top:2em; text-align:center;">
	<a href="/" style="
	  display: inline-block;
	  background: #111;
	  color: #fff !important;
	  font-size: 1.25rem;
	  font-weight: bold;
	  border: 3px solid #ffd700;
	  border-radius: 8px;
	  padding: 0.75em 2em;
	  margin-bottom: 2rem;
	  margin-top: 1rem;
	  text-align: center;
	  text-decoration: none;
	  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
	  transition: background 0.2s, color 0.2s, border 0.2s;
	" onmouseover="this.style.background='#ffd700';this.style.color='#111';this.style.borderColor='#111';" onmouseout="this.style.background='#111';this.style.color='#fff';this.style.borderColor='#ffd700';">Back to Pathways Overview</a>
</div>
