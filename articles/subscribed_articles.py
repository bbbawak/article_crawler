import requests
from bs4 import BeautifulSoup
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Constantsp
MAIN_URL = "https://www.trobits.com/articles"
TRACKING_FILE = "known_articles.json"
SMTP_SERVER = "smtp.gmail.com"  # Replace with your email provider's SMTP server
SMTP_PORT = 587  # Typical port for TLS
EMAIL_SENDER = "your_email@gmail.com"  # Replace with your email
EMAIL_PASSWORD = "your_email_password"  # Replace with your email password
EMAIL_RECIPIENTS = ["recipient1@example.com", "recipient2@example.com"]  # List of recipients

# Function to load the tracking file
def load_tracking_file():
    try:
        with open(TRACKING_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# Function to save the updated tracking file
def save_tracking_file(data):
    with open(TRACKING_FILE, "w") as f:
        json.dump(data, f, indent=4)

# Function to scrape articles from the main URL
def scrape_articles():
    response = requests.get(MAIN_URL)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Example: Assuming article links are in <a> tags with an "href" attribute
    article_links = [
        a["href"] for a in soup.find_all("a", href=True) if "/articles/" in a["href"]
    ]
    
    # Make sure links are absolute
    return [link if link.startswith("http") else f"https://www.trobits.com{link}" for link in article_links]

# Function to send email
def send_email(new_articles):
    # Email setup
    subject = "New Articles Available on Trobits"
    body = "\n".join(new_articles)
    
    msg = MIMEMultipart()
    msg["From"] = EMAIL_SENDER
    msg["To"] = ", ".join(EMAIL_RECIPIENTS)
    msg["Subject"] = subject
    
    # Attach the body text
    msg.attach(MIMEText(body, "plain"))
    
    # Send the email
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, EMAIL_RECIPIENTS, msg.as_string())
            print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")

# Main script logic
def main():
    # Load previously known articles
    known_articles = load_tracking_file()
    
    # Scrape current articles
    current_articles = scrape_articles()
    
    # Identify new articles
    new_articles = [article for article in current_articles if article not in known_articles]
    
    if new_articles:
        print(f"New articles found: {new_articles}")
        
        # Send email notification
        send_email(new_articles)
        
        # Update tracking file
        save_tracking_file(known_articles + new_articles)
    else:
        print("No new articles found.")

# Run the script
if __name__ == "__main__":
    main()
