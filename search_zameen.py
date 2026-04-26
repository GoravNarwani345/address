import urllib.request
import re

url = "https://html.duckduckgo.com/html/?q=site:zameen.com+flats+in+hyderabad+sindh+pakistan"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    # find any urls in the html
    urls = re.findall(r'href=[\'"]?([^\'" >]+)', html)
    print("Found URLs:")
    zameen_links = [u for u in urls if 'zameen.com' in u]
    for u in zameen_links[:5]:
        print(u)
except Exception as e:
    print(e)
