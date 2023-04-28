from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

url = 'https://wax-oig.notion.site/Guild-Ratings-0e51defdf10641748a253ccc7f5146b1'

# Configure the browser options
chrome_options = Options()
#chrome_options.add_argument("--headless")  # Commented out to run the browser visibly
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--start-maximized') 

# Set user agent
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36")

# Disable Chrome flags that can reveal headless mode
chrome_options.add_argument('--disable-blink-features=AutomationControlled')
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option('useAutomationExtension', False)

# Initialize the browser
browser = webdriver.Chrome(options=chrome_options)

# Get the dynamic content of the page
browser.get(url)

# You can manually interact with the browser if necessary, e.g., accept cookies, click buttons, etc.

input("Press Enter to continue...")  # Wait for user input to close the browser

# Automatically proceed without user interaction
#browser.implicitly_wait(20)

# When ready, you can proceed to retrieve the page source
html_content = browser.page_source
browser.quit()

# Parse the HTML content
soup = BeautifulSoup(html_content, 'html.parser')



# Find all the <a> tags with an 'href' attribute
a_tags = soup.find_all('a', href=True)

urls = []

# Iterate through the found <a> tags
for a_tag in a_tags:
    # Find the ancestor <div> elements with a 'data-block-id' attribute
    ancestor_divs = a_tag.find_parents('div', {'data-block-id': True})
    
    # If there are ancestor <div> elements with a 'data-block-id' attribute, add the URL to the list
    if ancestor_divs:
        urls.append(a_tag['href'])

# Print the extracted URLs
for url in urls:
    print(url)