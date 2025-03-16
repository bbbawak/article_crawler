###########################################
# scraping_and_sending.py
###########################################

import os
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import time
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

# -----------------------------------------------------------------------------
# 1. CONFIG / CONSTANTS
# -----------------------------------------------------------------------------
ARTICLES_URL = "https://www.trobits.com/articles"
# Updated XPath selectors to match the Next.js structure
ARTICLE_CONTAINER_XPATH = "//div[contains(@class, 'flex')]//a[contains(@href, '/articles/')]"
ARTICLE_TITLE_XPATH = "//h1[contains(@class, 'text-4xl')]"
ARTICLE_AUTHOR_XPATH = "//div[contains(@class, 'flex')]//span[contains(@class, 'text-sm')]"
ARTICLE_PARAGRAPHS_XPATH = "//div[contains(@class, 'prose')]//p"

SENT_ARTICLES_FILE = "sent_articles.json"
ARTICLES_DATA_FILE = "articles_data_cleaned.json"
EMAIL_LIST_FILE = "email_list.txt"

# Gmail credentials
GMAIL_USER = "trobitscommunity@gmail.com"
GMAIL_PASSWORD = "mswu xwct dtth zrom"  # Original Gmail app password

# -----------------------------------------------------------------------------
# 2. LOGGER SETUP
# -----------------------------------------------------------------------------
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler('crawler.log'),
        logging.StreamHandler()
    ]
)

# -----------------------------------------------------------------------------
# 3. HELPER FUNCTIONS
# -----------------------------------------------------------------------------
def load_sent_articles():
    """Loads sent articles from JSON file, handling empty or invalid files."""
    if not os.path.exists(SENT_ARTICLES_FILE):
        logging.info("Creating new sent_articles.json file...")
        save_sent_articles([])
        return []
        
    try:
        with open(SENT_ARTICLES_FILE, "r", encoding="utf-8") as file:
            content = file.read().strip()
            if not content:
                logging.warning("sent_articles.json was empty, initializing with empty array...")
                save_sent_articles([])
                return []
            return json.loads(content)
    except json.JSONDecodeError:
        logging.error("sent_articles.json was invalid JSON; resetting to empty array...")
        save_sent_articles([])
        return []
    except Exception as e:
        logging.error(f"Unexpected error reading sent_articles.json: {e}")
        save_sent_articles([])
        return []

def save_sent_articles(sent_articles):
    """Saves the list of sent article titles to JSON."""
    try:
        with open(SENT_ARTICLES_FILE, "w", encoding="utf-8") as file:
            json.dump(sent_articles, file, indent=4, ensure_ascii=False)
    except Exception as e:
        logging.error(f"Error writing to {SENT_ARTICLES_FILE}: {e}")

def read_email_list(file_path):
    """Reads emails and names (one per line) from file_path and returns a list of tuples."""
    if not os.path.exists(file_path):
        logging.warning(f"{file_path} does not exist. Returning empty recipient list.")
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            recipients = []
            for line in f:
                line = line.strip()
                if line:
                    parts = line.split()
                    if len(parts) >= 2:
                        email = parts[0]
                        name = parts[1]
                        recipients.append((email, name))
                    else:
                        recipients.append((line, "there"))  # Default greeting if no name provided
            return recipients
    except Exception as e:
        logging.error(f"Unexpected error reading email list file: {e}")
        return []

def extract_author_from_text(text):
    """Extracts author information from the beginning of the text."""
    if "by " in text.lower():
        parts = text.split("     ", 1)
        if len(parts) > 1:
            author_part = parts[0].strip()
            if author_part.lower().startswith("by "):
                return author_part, parts[1]
    return None, text

def format_article_body(text, limit=300, link=""):
    """Formats article text with proper truncation and read more link."""
    if len(text) <= limit:
        return text
        
    last_space = text[:limit].rfind(" ")
    if last_space == -1:
        last_space = limit
        
    truncated_text = text[:last_space].rstrip()
    
    end_punctuation = [". ", "! ", "? "]
    last_sentence_end = max(truncated_text.rfind(p) for p in end_punctuation)
    
    if last_sentence_end != -1:
        truncated_text = truncated_text[:last_sentence_end + 1]
    
    return f"{truncated_text}... Read more: {link}"

def scrape_articles():
    """
    Scrapes exactly the first 4 articles from the website.
    Returns a list of dicts with title, author, text, and link.
    """
    logging.info("Starting article scraping process...")
    articles_data = []
    
    # Configure Selenium with additional options for better stability
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    
    try:
        driver = webdriver.Chrome(options=options)
        driver.set_page_load_timeout(30)
        driver.execute_cdp_cmd('Network.setUserAgentOverride', {
            "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
    except Exception as e:
        logging.error(f"Could not start Chrome WebDriver: {e}")
        return articles_data
    
    try:
        logging.info(f"Attempting to navigate to {ARTICLES_URL}")
        driver.get(ARTICLES_URL)
        
        # Wait for the page to load completely
        time.sleep(10)  # Increased wait time for dynamic content
        
        # Wait for article container elements with increased timeout
        try:
            article_elements = WebDriverWait(driver, 30).until(
                EC.presence_of_all_elements_located((By.XPATH, ARTICLE_CONTAINER_XPATH))
            )
            logging.info(f"Found {len(article_elements)} article elements")
            
            # Get only the first 4 article links
            article_links = []
            for element in article_elements[:4]:  # Only look at first 4 elements
                href = element.get_attribute("href")
                if href and "/articles/" in href:
                    article_links.append(href)
            
            logging.info(f"Processing first {len(article_links)} articles")
            
        except TimeoutException:
            logging.error("Timeout waiting for article elements to load")
            return articles_data

        for article_link in article_links:
            try:
                logging.info(f"Processing article: {article_link}")
                driver.get(article_link)
                time.sleep(5)  # Increased wait time for dynamic content
                
                # Wait for title with explicit wait
                try:
                    title_element = WebDriverWait(driver, 15).until(
                        EC.presence_of_element_located((By.XPATH, ARTICLE_TITLE_XPATH))
                    )
                    title = title_element.text
                    logging.info(f"Found title: {title}")
                except TimeoutException:
                    logging.error(f"Timeout waiting for title at {article_link}")
                    continue
                
                # Get paragraphs with explicit wait
                try:
                    paragraphs = WebDriverWait(driver, 15).until(
                        EC.presence_of_all_elements_located((By.XPATH, ARTICLE_PARAGRAPHS_XPATH))
                    )
                    text = " ".join([p.text for p in paragraphs if p.text.strip()])
                    logging.info(f"Found {len(paragraphs)} paragraphs")
                    
                    # Extract author from text
                    author_text, cleaned_text = extract_author_from_text(text)
                    author = author_text if author_text else "Unknown Author"
                    text = cleaned_text
                    logging.info(f"Found author: {author}")
                    
                except TimeoutException:
                    logging.error(f"Timeout waiting for paragraphs at {article_link}")
                    continue
                
                articles_data.append({
                    "title": title,
                    "author": author,
                    "text": text,
                    "link": article_link
                })
                logging.info(f"Successfully scraped article: '{title}'")
                
            except Exception as e:
                logging.error(f"Error processing article {article_link}: {str(e)}")
                continue

        if articles_data:
            try:
                with open(ARTICLES_DATA_FILE, "w", encoding="utf-8") as file:
                    json.dump(articles_data, file, indent=4, ensure_ascii=False)
                logging.info(f"Saved {len(articles_data)} articles to {ARTICLES_DATA_FILE}")
            except Exception as e:
                logging.error(f"Error saving articles to {ARTICLES_DATA_FILE}: {e}")

        return articles_data

    except Exception as e:
        logging.error(f"Unexpected error while scraping: {str(e)}")
        return []
    finally:
        try:
            driver.quit()
            logging.info("Chrome WebDriver has been closed.")
        except Exception as e:
            logging.error(f"Error closing Chrome WebDriver: {e}")

def find_unsent_articles(articles, sent_titles):
    """
    Returns a list of articles whose titles are not in sent_titles.
    """
    return [art for art in articles if art["title"] not in sent_titles]

def format_multiple_articles_body(articles):
    """
    Formats multiple articles into a single email body with HTML styling.
    """
    body_parts = []
    for article in articles:
        article_text = format_article_body(article['text'], link=article['link'])
        body_parts.append(f"""
        <div class="article" style="margin-bottom: 40px; padding: 30px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border: 1px solid #eef2f7;">
            <h2 style="color: #1a365d; font-size: 24px; margin: 0 0 15px 0; font-family: 'Arial', sans-serif; line-height: 1.4;">{article['title']}</h2>
            <p style="color: #4a5568; font-size: 14px; margin: 0 0 20px 0; font-family: 'Arial', sans-serif; font-style: italic;">{article['author']}</p>
            <div style="color: #2d3748; font-size: 16px; line-height: 1.8; font-family: 'Arial', sans-serif; margin-bottom: 25px; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
                {article_text}
            </div>
            <a href="{article['link']}" style="display: inline-block; padding: 12px 24px; background-color: #3182ce; color: #ffffff; text-decoration: none; font-family: 'Arial', sans-serif; border-radius: 6px; font-weight: bold; transition: background-color 0.3s ease;">Read full article →</a>
        </div>""")
    
    return "\n".join(body_parts)

def send_email_via_gmail(gmail_user, gmail_password, recipient_list, subject, body_template):
    logging.info("Preparing to send personalized emails...")

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(gmail_user, gmail_password)
            
            for email, name in recipient_list:
                try:
                    msg = MIMEMultipart("alternative")
                    msg["From"] = gmail_user
                    msg["To"] = gmail_user
                    msg["Subject"] = subject

                    # Create HTML email with styling
                    html_content = f"""
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Arial', sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #f0f4f8; padding: 20px;">
                            <div style="padding: 40px 30px; background-color: #1a365d; color: white; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                                <h1 style="margin: 0; font-size: 32px; color: #ffffff; font-weight: bold;">Trobits Newsletter</h1>
                                <p style="margin: 10px 0 0 0; color: #e2e8f0; font-size: 16px;">Your Daily Crypto Updates</p>
                            </div>
                            
                            <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                                <p style="color: #2d3748; font-size: 18px; margin: 0 0 30px 0; line-height: 1.6;">Hi {name},</p>
                                
                                {body_template}
                                
                                <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #edf2f7;">
                                    <p style="color: #4a5568; font-size: 16px; margin: 0; line-height: 1.6;">Best regards,<br><strong>The Trobits Team</strong></p>
                                </div>
                            </div>
                            
                            <div style="margin-top: 30px; padding: 20px; background-color: #ffffff; border-radius: 12px; text-align: center;">
                                <p style="color: #718096; font-size: 14px; margin: 0;">You're receiving this email because you subscribed to Trobits updates.</p>
                                <p style="color: #718096; font-size: 14px; margin: 10px 0 0 0;">Stay informed about the latest in crypto!</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """

                    # Add both plain text and HTML versions
                    text_part = MIMEText(body_template, "plain")
                    html_part = MIMEText(html_content, "html")
                    
                    msg.attach(text_part)
                    msg.attach(html_part)

                    server.sendmail(
                        from_addr=gmail_user,
                        to_addrs=[gmail_user, email],
                        msg=msg.as_string()
                    )
                    logging.info(f"Personalized email sent to {email}")
                except Exception as e:
                    logging.error(f"Error sending email to {email}: {e}")
                    continue

            logging.info(f"Completed sending personalized emails to {len(recipient_list)} recipients")
    except Exception as e:
        logging.error(f"Error in email sending process: {e}")

def main():
    """Main function to orchestrate the scraping and email sending process."""
    logging.info("Starting main process...")
    
    # Load previously sent articles
    sent_articles = load_sent_articles()
    logging.info(f"Loaded {len(sent_articles)} previously sent articles")
    
    # Scrape new articles
    articles = scrape_articles()
    if not articles:
        logging.warning("No articles found during scraping.")
        return
    
    # Find all unsent articles
    unsent_articles = find_unsent_articles(articles, sent_articles)
    if not unsent_articles:
        logging.info("No new articles to send.")
        return
    
    # Read email list with names
    recipient_list = read_email_list(EMAIL_LIST_FILE)
    if not recipient_list:
        logging.warning("No recipients found in email list.")
        return
    
    # Format email content with all unsent articles
    subject = f"📰 Latest Articles from Trobits ({len(unsent_articles)} New Updates)"
    body_template = format_multiple_articles_body(unsent_articles)
    
    # Send consolidated email with all articles
    send_email_via_gmail(GMAIL_USER, GMAIL_PASSWORD, recipient_list, subject, body_template)
    
    # Update sent articles list with all new articles
    for article in unsent_articles:
        sent_articles.append(article['title'])
    save_sent_articles(sent_articles)
    logging.info(f"Updated sent articles list with {len(unsent_articles)} new articles")

if __name__ == "__main__":
    main()

