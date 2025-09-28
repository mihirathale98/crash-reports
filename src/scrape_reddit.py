# reddit_fetch.py
import os
import time
import hashlib
from datetime import datetime
import praw

# configure via env vars
CLIENT_ID = os.environ.get("REDDIT_CLIENT_ID")
CLIENT_SECRET = os.environ.get("REDDIT_CLIENT_SECRET")
USER_AGENT = os.environ.get("REDDIT_USER_AGENT", "boston-crash-scraper/0.1 (by u/yourname)")
# SUBREDDITS = ["boston", "massachusetts", "cambri`dge", "bikeboston", "MassachusettsUSA", "CambridgeMA", ]  # Using verified subreddit names

# CRASH_KEYWORDS = [
#     "crash", "accident", "collision", "hit-and-run", "pileup", "rolled", "ambulance", "fatal", "serious injury",
#     "fender bender", "rear-end", "t-bone", "head-on", "side-swipe", "rollover", "wreck", "smash", "impact",
#     "emergency", "ems", "fire truck", "police", "traffic jam", "road closure", "blocked", "detour",
#     "airbag", "totaled", "towed", "dui", "drunk driver", "reckless driving", "speeding", "ran red light",
#     "pedestrian struck", "cyclist hit", "motorcycle accident", "truck accident", "bus crash",
#     "multi-car", "chain reaction", "weather related", "black ice", "hydroplane", "skid",
#     "intersection", "highway", "route", "mass pike", "i-95", "i-93", "i-90", "storrow drive",
#     "injured", "hospitalized", "trauma", "life flight", "medevac", "first responders"
# ]

def connects():
    if not CLIENT_ID or not CLIENT_SECRET:
        raise ValueError("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables must be set")
    
    reddit = praw.Reddit(client_id=CLIENT_ID,
                        client_secret=CLIENT_SECRET,
                        user_agent=USER_AGENT)
    
    # Test the connection
    try:
        # This will fail if credentials are invalid
        reddit.user.me()
    except Exception:
        # For read-only access, we don't need user authentication
        # Just test that we can make a basic request
        pass
    
    return reddit

def candidate_post(post, keywords):
    text = (post.title or "") + " " + (post.selftext or "")
    text_lower = text.lower()
    return any(k in text_lower for k in keywords)

def fetch_comments(post, keywords):
    """Fetch all comments from a post, including nested ones."""
    comments = []
    try:
        # Load all comments, including those hidden behind "more comments" links
        post.comments.replace_more(limit=None)
        
        for comment in post.comments.list():
            if hasattr(comment, 'body') and comment.body != '[deleted]' and comment.body != '[removed]':
                comments.append({
                    "comment_id": comment.id,
                    "author": getattr(comment.author, "name", None) if comment.author else None,
                    "body": comment.body,
                    "created_utc": comment.created_utc,
                    "score": comment.score,
                    "parent_id": comment.parent_id,
                    "is_related": candidate_comment(comment, keywords)
                })
    except Exception as e:
        print(f"Error fetching comments: {e}")
    
    return comments

def candidate_comment(comment, keywords):
    """Check if a comment contains relevant keywords."""
    if not hasattr(comment, 'body') or not comment.body:
        return False
    text_lower = comment.body.lower()
    return any(k in text_lower for k in keywords)


def is_within_date_range(post_timestamp, year, month=None):
    """Check if a post is within the specified month/year range."""
    if not post_timestamp:
        return False

    from datetime import datetime
    import calendar

    # If year and month are specified, filter by that specific month
    if month is not None:
        # Get the start and end of the specified month
        start_of_month = datetime(year, month, 1)

        # Get the last day of the month
        last_day = calendar.monthrange(year, month)[1]
        end_of_month = datetime(year, month, last_day, 23, 59, 59)

        post_date = datetime.fromtimestamp(post_timestamp)
        return start_of_month <= post_date <= end_of_month

    # If only year is specified, filter by that entire year
    else:
        start_of_year = datetime(year, 1, 1)
        end_of_year = datetime(year, 12, 31, 23, 59, 59)

        post_date = datetime.fromtimestamp(post_timestamp)
        return start_of_year <= post_date <= end_of_year

def fetch_new(limit=1000, year=2025, month=None, subreddits=None, keywords=None):
    r = connects()
    items = []
    total_posts_checked = 0
    posts_in_date_range = 0
    
    for sub in subreddits:
        try:
            print(f"Accessing subreddit: r/{sub}")
            subreddit = r.subreddit(sub)
            
            # Test if subreddit is accessible by checking its display name
            _ = subreddit.display_name
            print(f"Successfully connected to r/{sub}")
            
            post_count = 0
            sub_posts_checked = 0
            sub_posts_in_range = 0
            
            for post in subreddit.new(limit=limit):
                sub_posts_checked += 1
                total_posts_checked += 1
                
                # Check if post is within date range
                if not is_within_date_range(post.created_utc, year, month):
                    continue
                
                sub_posts_in_range += 1
                posts_in_date_range += 1
                
                if candidate_post(post, keywords):
                    post_count += 1
                    post_date = datetime.fromtimestamp(post.created_utc).strftime("%Y-%m-%d") if post.created_utc else "Unknown"
                    print(f"Processing relevant post {post_count} ({post_date}): {post.title[:50]}...")
                    
                    # Fetch comments
                    print(f"  Fetching comments for post {post.id}...")
                    comments = fetch_comments(post, keywords)
                    print(f"  Found {len(comments)} comments ({len([c for c in comments if c['is_related']])} relevant)")
                    
                    # build record
                    uid = hashlib.sha256((post.id + (post.created_utc and str(post.created_utc))).encode()).hexdigest()
                    items.append({
                        "source": "reddit",
                        "subreddit": sub,
                        "id": post.id,
                        "unique_id": uid,
                        "title": post.title,
                        "body": post.selftext,
                        "url": post.url,
                        "author": getattr(post.author, "name", None),
                        "created_utc": post.created_utc,
                        "num_comments": post.num_comments,
                        "score": post.score,
                        "comments": comments
                    })
            date_range_desc = f"{year}-{month:02d}" if month else str(year)
            print(f"r/{sub}: {sub_posts_checked} posts checked, {sub_posts_in_range} in {date_range_desc}, {post_count} relevant")
        except Exception as e:
            print(f"Error accessing r/{sub}: {e}")
            print(f"Skipping r/{sub} and continuing with other subreddits...")
            continue
        time.sleep(1)  # polite pause between subreddits
    
    print(f"\nOVERALL STATS:")
    date_range_desc = f"{year}-{month:02d}" if month else str(year)
    print(f"Total posts checked: {total_posts_checked}")
    print(f"Posts in date range ({date_range_desc}): {posts_in_date_range}")
    print(f"Relevant posts found: {len(items)}")
    
    return items

def run_scraper(limit=1000, year=2025, month=None, subreddits=None, keywords=None):
    """
    Main function to run the Reddit scraper with specified parameters.

    Args:
        limit (int): Maximum number of posts to check per subreddit
        year (int): Year to search for posts
        month (int, optional): Specific month to search (1-12). If None, searches entire year.
        subreddits (list): List of subreddit names to search
        keywords (list): List of keywords to search for

    Returns:
        dict: Contains 'posts' and 'comments' data
    """
    import calendar

    print(f"Fetching posts with limit={limit}")
    print(f"Subreddits: {', '.join(subreddits)}")
    print(f"Keywords: {len(keywords)} keywords")

    if month:
        month_name = calendar.month_name[month]
        print(f"Date range: {month_name} {year}")
    else:
        print(f"Date range: Year {year}")

    print("=" * 60)

    # Fetch the data
    items = fetch_new(limit=limit, year=year, month=month, subreddits=subreddits, keywords=keywords)

    # Prepare posts data
    posts_data = []
    comments_data = []

    for item in items:
        # Convert timestamp to readable datetime
        created_datetime = datetime.fromtimestamp(item['created_utc']).isoformat() if item['created_utc'] else None

        post_row = {
            'source': item['source'],
            'subreddit': item['subreddit'],
            'id': item['id'],
            'unique_id': item['unique_id'],
            'title': item['title'],
            'body': item['body'],
            'url': item['url'],
            'author': item['author'],
            'created_utc': item['created_utc'],
            'created_datetime': created_datetime,
            'num_comments': item['num_comments'],
            'score': item['score']
        }
        posts_data.append(post_row)

        # Collect comments
        for comment in item.get('comments', []):
            comment_row = {
                'post_id': item['id'],
                'post_title': item['title'],
                'subreddit': item['subreddit'],
                'comment_id': comment['comment_id'],
                'author': comment['author'],
                'body': comment['body'],
                'created_utc': comment['created_utc'],
                'created_datetime': datetime.fromtimestamp(comment['created_utc']).isoformat() if comment['created_utc'] else None,
                'score': comment['score'],
                'parent_id': comment['parent_id'],
                'is_related': comment['is_related']
            }
            comments_data.append(comment_row)

    # Calculate summary stats
    total_comments = len(comments_data)
    related_comments = len([c for c in comments_data if c.get('is_related', False)])

    print("=" * 60)
    print("SUMMARY:")
    print(f"Total relevant posts found: {len(posts_data)}")
    print(f"Total comments collected: {total_comments}")
    print(f"Relevant comments: {related_comments}")

    return {
        "posts": posts_data,
        "comments": comments_data,
        "summary": {
            "total_posts": len(posts_data),
            "total_comments": total_comments,
            "related_comments": related_comments
        }
    }
