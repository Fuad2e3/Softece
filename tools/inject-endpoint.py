#!/usr/bin/env python3
"""Write the order endpoint into index.html at publish time.

The URL lives in the SHEET_ENDPOINT repository secret rather than in the
repository, so the committed page always carries data-sheet="" and the order
form falls back to the visitor's mail client — which is also what happens if
the secret is missing or malformed. Only the published copy on GitHub Pages
carries the endpoint.
"""
import os
import pathlib
import sys

MARKER = 'data-sheet=""'
PREFIX = "https://script.google.com/macros/s/"

url = os.environ.get("SHEET_ENDPOINT", "").strip()
page = pathlib.Path("index.html")
html = page.read_text()

if MARKER not in html:
    sys.exit('inject-endpoint: %s not found in index.html — has the order form changed?' % MARKER)

if not url:
    print("inject-endpoint: SHEET_ENDPOINT is empty; the order form will use the mail client.")
    sys.exit(0)

if not url.startswith(PREFIX) or not url.endswith("/exec") or '"' in url:
    sys.exit("inject-endpoint: SHEET_ENDPOINT is not an Apps Script /exec URL.")

page.write_text(html.replace(MARKER, 'data-sheet="%s"' % url, 1))
print("inject-endpoint: endpoint written into index.html")
