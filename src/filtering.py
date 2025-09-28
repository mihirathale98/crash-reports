from src.openai_wrapper import get_completion
from src.prompts import filter_post_prompt, filter_comment_prompt, filter_system_prompt, insight_post_prompt, insight_system_prompt
from src.utils import parse_result
import json


def filter_posts(posts, topic):
    filtered_posts = []

    for post in posts:
        # Extract only the text content for the LLM
        post_text = f"Title: {post.get('title', '')}\nBody: {post.get('body', '')}"

        prompt = filter_post_prompt.format(topic=topic, post=post_text)
        result = get_completion(filter_system_prompt, prompt)
        parsed_result = parse_result(result)
        if parsed_result is not None:
            is_relevant = parsed_result.get('is_relevant', False)
            if is_relevant:
                filtered_posts.append(post)

    return filtered_posts


def filter_comments(post, comments, topic):
    """
    Filter comments for a specific post using OpenAI API.

    Args:
        post: The post data
        comments: List of comment data
        topic: The topic to filter against

    Returns:
        List of relevant comments
    """
    if not comments:
        return []

    # Extract only the text content for the LLM
    post_text = f"Title: {post.get('title', '')}\nBody: {post.get('body', '')}"

    # Prepare comments for the prompt - only text content
    comments_for_prompt = []
    for comment in comments:
        comments_for_prompt.append({
            "comment_id": comment.get('comment_id', ''),
            "body": comment.get('body', '')
        })

    prompt = filter_comment_prompt.format(
        topic=topic,
        post=post_text,
        comments=json.dumps(comments_for_prompt, indent=2)
    )

    result = get_completion(filter_system_prompt, prompt)
    parsed_result = parse_result(result)

    if parsed_result is not None:
        # Create a mapping of comment_id to relevance
        relevance_map = {}
        for item in parsed_result:
            relevance_map[item.get('comment_id', '')] = item.get('is_relevant', False)

        # Filter comments based on relevance
        filtered_comments = []
        for comment in comments:
            comment_id = comment.get('comment_id', '')
            if relevance_map.get(comment_id, False):
                filtered_comments.append(comment)

        return filtered_comments

    return []


def get_filtered_posts_and_comments(posts, comments_data, topic):
    """
    Filter posts and their associated comments, returning tuples of (post, relevant_comments).

    Args:
        posts: List of post data
        comments_data: List of all comment data
        topic: The topic to filter against

    Returns:
        List of tuples: (post, list_of_relevant_comments)
    """
    # First filter posts
    filtered_posts = filter_posts(posts, topic)
    print(f"Filtered {len(posts)} posts to {len(filtered_posts)} posts")

    # Create a mapping of post_id to comments
    comments_by_post = {}
    for comment in comments_data:
        post_id = comment.get('post_id', '')
        if post_id not in comments_by_post:
            comments_by_post[post_id] = []
        comments_by_post[post_id].append(comment)

    # Filter comments for each filtered post
    result = []
    for post in filtered_posts:
        post_id = post.get('id', '')
        post_comments = comments_by_post.get(post_id, [])

        # Filter comments for this post
        filtered_comments = filter_comments(post, post_comments, topic)

        # Add the tuple to result
        result.append((post, filtered_comments))

    return result


def generate_report(filtered_posts_and_comments, agency, topic):
    """
    Generate a markdown report from filtered posts and comments.

    Args:
        filtered_posts_and_comments: List of tuples (post, list_of_relevant_comments)
        agency: The agency name
        topic: The topic description

    Returns:
        str: Markdown report
    """
    # Format posts and comments as text for the LLM
    posts_and_comments_text = []

    for post, comments in filtered_posts_and_comments:
        # Format post
        post_text = f"**POST:**\nTitle: {post.get('title', '')}\nBody: {post.get('body', '')}\n"

        # Format comments
        if comments:
            comments_text = "\n**COMMENTS:**\n"
            for comment in comments:
                comments_text += f"- {comment.get('body', '')}\n"
            post_text += comments_text

        post_text += "\n" + "="*50 + "\n"
        posts_and_comments_text.append(post_text)

    # Combine all posts and comments
    combined_text = "\n".join(posts_and_comments_text)

    # Generate report using LLM
    prompt = insight_post_prompt.format(
        agency=agency,
        topic=topic,
        posts_and_comments=combined_text
    )

    report = get_completion(insight_system_prompt, prompt)
    return report


