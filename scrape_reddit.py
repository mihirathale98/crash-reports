# reddit_fetch.py
import os
import time
import hashlib
import csv
from datetime import datetime
from dateutil import parser as dateparser
import praw

# configure via env vars
CLIENT_ID = os.environ.get("REDDIT_CLIENT_ID")
CLIENT_SECRET = os.environ.get("REDDIT_CLIENT_SECRET")
USER_AGENT = os.environ.get("REDDIT_USER_AGENT", "boston-crash-scraper/0.1 (by u/yourname)")
SUBREDDITS = ["boston", "massachusetts", "cambridge", "bikeboston", "MassachusettsUSA", "CambridgeMA", ]  # Using verified subreddit names

CRASH_KEYWORDS = [
    "crash", "accident", "collision", "hit-and-run", "pileup", "rolled", "ambulance", "fatal", "serious injury",
    "fender bender", "rear-end", "t-bone", "head-on", "side-swipe", "rollover", "wreck", "smash", "impact",
    "emergency", "ems", "fire truck", "police", "traffic jam", "road closure", "blocked", "detour",
    "airbag", "totaled", "towed", "dui", "drunk driver", "reckless driving", "speeding", "ran red light",
    "pedestrian struck", "cyclist hit", "motorcycle accident", "truck accident", "bus crash",
    "multi-car", "chain reaction", "weather related", "black ice", "hydroplane", "skid",
    "intersection", "highway", "route", "mass pike", "i-95", "i-93", "i-90", "storrow drive",
    "injured", "hospitalized", "trauma", "life flight", "medevac", "first responders"
]

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

def candidate_post(post):
    text = (post.title or "") + " " + (post.selftext or "")
    text_lower = text.lower()
    return any(k in text_lower for k in CRASH_KEYWORDS)

def fetch_comments(post):
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
                    "is_crash_related": candidate_comment(comment)
                })
    except Exception as e:
        print(f"Error fetching comments: {e}")
    
    return comments

def candidate_comment(comment):
    """Check if a comment contains crash-related keywords."""
    if not hasattr(comment, 'body') or not comment.body:
        return False
    text_lower = comment.body.lower()
    return any(k in text_lower for k in CRASH_KEYWORDS)

def save_to_csv(items, include_comments=True):
    """Save posts and comments to CSV files."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save posts to CSV
    posts_filename = f"reddit_crash_posts_{timestamp}.csv"
    posts_fieldnames = [
        'source', 'subreddit', 'id', 'unique_id', 'title', 'body', 'url', 
        'author', 'created_utc', 'created_datetime', 'num_comments', 'score'
    ]
    
    print(f"Saving {len(items)} posts to {posts_filename}")
    with open(posts_filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=posts_fieldnames)
        writer.writeheader()
        
        for item in items:
            # Convert timestamp to readable datetime
            created_datetime = datetime.fromtimestamp(item['created_utc']).isoformat() if item['created_utc'] else None
            
            row = {
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
            writer.writerow(row)
    
    # Save comments to CSV if included
    if include_comments:
        comments_filename = f"reddit_crash_comments_{timestamp}.csv"
        comments_fieldnames = [
            'post_id', 'post_title', 'subreddit', 'comment_id', 'author', 'body', 
            'created_utc', 'created_datetime', 'score', 'parent_id', 'is_crash_related'
        ]
        
        # Collect all comments
        all_comments = []
        for item in items:
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
                    'is_crash_related': comment['is_crash_related']
                }
                all_comments.append(comment_row)
        
        print(f"Saving {len(all_comments)} comments to {comments_filename}")
        with open(comments_filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=comments_fieldnames)
            writer.writeheader()
            writer.writerows(all_comments)
        
        print(f"CSV files created: {posts_filename}, {comments_filename}")
    else:
        print(f"CSV file created: {posts_filename}")

def is_within_date_range(post_timestamp, days_back=365):
    """Check if a post is within the specified date range."""
    if not post_timestamp:
        return False
    
    # Calculate cutoff date (365 days ago from today)
    from datetime import datetime, timedelta
    today = datetime(2025, 9, 28)  # Today's date
    cutoff_date = today - timedelta(days=days_back)
    cutoff_timestamp = cutoff_date.timestamp()
    
    return post_timestamp >= cutoff_timestamp

def fetch_new(limit=1000, include_comments=True, days_back=365):
    r = connects()
    items = []
    total_posts_checked = 0
    posts_in_date_range = 0
    
    for sub in SUBREDDITS:
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
                if not is_within_date_range(post.created_utc, days_back):
                    continue
                
                sub_posts_in_range += 1
                posts_in_date_range += 1
                
                if candidate_post(post):
                    post_count += 1
                    post_date = datetime.fromtimestamp(post.created_utc).strftime("%Y-%m-%d") if post.created_utc else "Unknown"
                    print(f"Processing crash-related post {post_count} ({post_date}): {post.title[:50]}...")
                    
                    # Fetch comments if requested
                    comments = []
                    if include_comments:
                        print(f"  Fetching comments for post {post.id}...")
                        comments = fetch_comments(post)
                        print(f"  Found {len(comments)} comments ({len([c for c in comments if c['is_crash_related']])} crash-related)")
                    
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
            print(f"r/{sub}: {sub_posts_checked} posts checked, {sub_posts_in_range} in date range, {post_count} crash-related")
        except Exception as e:
            print(f"Error accessing r/{sub}: {e}")
            print(f"Skipping r/{sub} and continuing with other subreddits...")
            continue
        time.sleep(1)  # polite pause between subreddits
    
    print(f"\nOVERALL STATS:")
    print(f"Total posts checked: {total_posts_checked}")
    print(f"Posts in date range (past {days_back} days): {posts_in_date_range}")
    print(f"Crash-related posts found: {len(items)}")
    
    return items

if __name__ == "__main__":
    import sys
    
    # Check for command line arguments
    include_comments = True
    limit = 1000
    days_back = 365  # Past one year
    
    if len(sys.argv) > 1:
        if "--no-comments" in sys.argv:
            include_comments = False
        if "--limit" in sys.argv:
            try:
                limit_index = sys.argv.index("--limit") + 1
                limit = int(sys.argv[limit_index])
            except (ValueError, IndexError):
                print("Invalid limit value. Using default of 1000.")
        if "--days" in sys.argv:
            try:
                days_index = sys.argv.index("--days") + 1
                days_back = int(sys.argv[days_index])
            except (ValueError, IndexError):
                print("Invalid days value. Using default of 365.")
    
    # Calculate date range
    from datetime import datetime, timedelta
    today = datetime(2025, 9, 28)
    start_date = today - timedelta(days=days_back)
    
    print(f"Fetching posts with limit={limit}, include_comments={include_comments}")
    print(f"Date range: {start_date.strftime('%Y-%m-%d')} to {today.strftime('%Y-%m-%d')} ({days_back} days)")
    print("=" * 60)
    
    # Fetch the data
    items = fetch_new(limit=limit, include_comments=include_comments, days_back=days_back)
    
    # Save to CSV files
    if items:
        save_to_csv(items, include_comments=include_comments)
        
        # Print summary
        total_comments = sum(len(item.get('comments', [])) for item in items)
        crash_related_comments = sum(len([c for c in item.get('comments', []) if c.get('is_crash_related', False)]) for item in items)
        
        print("=" * 60)
        print("SUMMARY:")
        print(f"Total crash-related posts found: {len(items)}")
        if include_comments:
            print(f"Total comments collected: {total_comments}")
            print(f"Crash-related comments: {crash_related_comments}")
        print("Data saved to CSV files with timestamp.")
    else:
        print("No crash-related posts found.")
