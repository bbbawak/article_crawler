import requests
from bs4 import BeautifulSoup

url = "https://www.trobits.com/articles"
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# Assuming articles are listed in <a> tags, adjust according to actual structure
articles = soup.find_all('a', class_='article-link')  # Modify this based on the page's actual structure

for article in articles:
    print(f"Article Title: {article.text}")
    print(f"Article URL: {article['href']}")
