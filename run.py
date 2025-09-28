from src.scrape_reddit import run_scraper
from src.filtering import get_filtered_posts_and_comments, generate_report
from src.bigquery_uploader import upload_report_to_bigquery
from src.prompts import (insight_post_prompt,
                         filter_post_prompt, filter_comment_prompt,
                         keywords_generator_prompt, keywords_generator_system_prompt,
                         topic_generator_prompt, topic_generator_system_prompt,
                         )
from src.openai_wrapper import get_completion
from src.utils import parse_result
import pandas as pd
from datetime import datetime
import os
from src.bigquery_uploader import load_credentials_from_file


credentials = load_credentials_from_file("sundai-club-434220-8c96234b132c.json")

subreddits = ["boston", "massachusetts", "cambridge", "MassachusettsUSA", "CambridgeMA", ]  # Using verified subreddit names

def get_keywords(agency):
    prompt = keywords_generator_prompt.format(agency=agency)
    result = get_completion(keywords_generator_system_prompt, prompt)
    keywords = parse_result(result)
    return keywords

def get_topic(agency):
    prompt = topic_generator_prompt.format(agency=agency)
    result = get_completion(topic_generator_system_prompt, prompt)
    topic = parse_result(result)
    topic = topic['topic']
    return topic

def run(agency, month, year):
    timestamp = f"{month}-{year}"
    print(os.path.exists(f"{agency.replace(' ', '_').lower()}_reddit_posts_{timestamp}.csv"))
    print(agency)
    if os.path.exists(f"report_{agency.replace(' ', '_').lower()}_{timestamp}.md"):
        print("Report already exists")
        
        report = open(f"report_{agency.replace(' ', '_').lower()}_{timestamp}.md", "r").read()
        
        upload_report_to_bigquery(
            agency=agency,
            month=month,
            year=year,
            report_content=report,
            credentials=credentials,
            project_id="sundai-club-434220",
            dataset_id="bostonreports",
            table_id="boston-reports"
        )
        
        return {
            "filtered_data": [],
            "report": report,
            "report_filename": f"report_{agency.replace(' ', '_').lower()}_{timestamp}.md"
        }
        
    else:
        print("Report does not exist")
        if not os.path.exists(f"{agency.replace(' ', '_').lower()}_reddit_posts_{timestamp}.csv") and not os.path.exists(f"{agency.replace(' ', '_').lower()}_reddit_comments_{timestamp}.csv"):
            
            print("Getting keywords...")
            
            keywords = get_keywords(agency)
            print(f"Keywords: {keywords}")
            print("Getting posts...")
            data = run_scraper(limit=1000,
                            year=year,
                            month=month,
                            subreddits=subreddits,
                            keywords=keywords)

            # Save to CSV using pandas
            timestamp = f"{month}-{year}"

            # Save posts
            posts_df = pd.DataFrame(data['posts'])
            posts_filename = f"{agency.replace(' ', '_').lower()}_reddit_posts_{timestamp}.csv"
            posts_df.to_csv(posts_filename, index=False)
            print(f"Saved {len(posts_df)} posts to {posts_filename}")

            # Save comments
            comments_df = pd.DataFrame(data['comments'])
            comments_filename = f"{agency.replace(' ', '_').lower()}_reddit_comments_{timestamp}.csv"
            comments_df.to_csv(comments_filename, index=False)
            print(f"Saved {len(comments_df)} comments to {comments_filename}")
        else:
            print("Loading existing data from CSV...")
            posts_df = pd.read_csv(f"{agency.replace(' ', '_').lower()}_reddit_posts_{timestamp}.csv")
            comments_df = pd.read_csv(f"{agency.replace(' ', '_').lower()}_reddit_comments_{timestamp}.csv")

            # Convert DataFrames back to lists of dictionaries
            posts_data = posts_df.to_dict('records')
            comments_data = comments_df.to_dict('records')

        # Use the appropriate data source
        if 'data' in locals():
            posts_data = data['posts']
            comments_data = data['comments']

        print("Getting topic...")
        topic = get_topic(agency)
        print(f"Topic: {topic}")
        print("Filtering posts and comments...")
        filtered_posts_and_comments = get_filtered_posts_and_comments(
            posts_data,
            comments_data,
            topic
        )

        print(f"Filtered results: {len(filtered_posts_and_comments)} posts with relevant comments")

        print("Generating report...")
        report = generate_report(filtered_posts_and_comments, agency, topic)

        # Save report to file
        report_filename = f"report_{agency.replace(' ', '_').lower()}_{timestamp}.md"
        with open(report_filename, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Report saved to {report_filename}")

        # Upload to BigQuery (optional - set environment variables to enable)
        try:
            upload_report_to_bigquery(
                agency=agency,
                month=month,
                year=year,
                report_content=report,
                credentials=credentials,
                project_id="sundai-club-434220",
                dataset_id="bostonreports",
                table_id="boston-reports"
            )
            print("Report uploaded to BigQuery successfully")
        except Exception as e:
            print(f"BigQuery upload failed (this is optional): {e}")
            print("To enable BigQuery upload, set GOOGLE_CLOUD_PROJECT environment variable")

        return {
            "filtered_data": filtered_posts_and_comments,
            "report": report,
            "report_filename": report_filename
        }
    
if __name__ == "__main__":
    mass_gov_agencies = [
    "Department of Public Health",
    "MassHealth",
    "Massachusetts State Police",
    "Massachusetts Bay Transportation Authority (MBTA)",
    "Department of Revenue",
    "Department of Elementary and Secondary Education",
    "Department of Environmental Protection",
    "Massachusetts Emergency Management Agency (MEMA)",
    "Department of Unemployment Assistance",
    "Department of Children and Families"
]

    for agency in mass_gov_agencies:
        print(agency)
        results = run(agency, 9, 2025)
    # print(results)
    # results = run("Registry of Motor Vehicles", 9, 2025)