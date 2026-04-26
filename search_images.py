from duckduckgo_search import DDGS
import json

with DDGS() as ddgs:
    results = ddgs.images("apartment flat hyderabad pakistan real estate property", max_results=15)
    for r in results:
        print(f"URL: {r['image']}")
        print(f"Title: {r['title']}")
        print(f"Source: {r['url']}\n")
