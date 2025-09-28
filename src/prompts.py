filter_system_prompt = """
You are an expert content analyzer. Your task is to determine if Reddit posts and comments are relevant to a specific topic.
"""


filter_post_prompt = """
Analyze this Reddit post and determine if it's relevant to the given topic.

Topic: {topic}
Post: {post}

Is this post relevant to the topic? Consider:
- Direct mentions of the topic or related services
- User experiences with the topic
- Issues, complaints, or praise related to the topic
- be a bit generous in what is relevant

Output only:
```json
{{
    "is_relevant": true/false
}}
```
"""

filter_comment_prompt = """
Analyze these comments and determine which are relevant to the topic.

Topic: {topic}
Post: {post}
Comments: {comments}

For each comment, determine if it's relevant by checking if it:
- Relates to the topic or services mentioned
- Provides experiences, opinions, or information about the topic
- Contains useful insights about the topic
- be a bit generous in what is relevant

Output only:
```json
[
    {{
        "comment_id": "comment_id",
        "is_relevant": true/false
    }}
]
```
"""


insight_system_prompt = """
You are a senior government policy analyst specializing in actionable public feedback analysis. Your role is to transform citizen complaints and discussions into specific, implementable recommendations for government agencies.
"""

insight_post_prompt = """
Generate an actionable government report analyzing public feedback about {agency} services and operations.

**Agency:** {agency}
**Service Area:** {topic}

**Public Feedback Data:**
{posts_and_comments}

# ACTIONABLE ANALYSIS REPORT

## Executive Summary
- Brief overview of main issues and their severity
- Priority recommendations (top 3-5 actions needed)

## Service-Specific Issues

### [For each major service/function mentioned, create subsections like:]

#### Service Area: [e.g., License Renewal, Road Maintenance, etc.]

**Critical Problems Identified:**
- [Specific issue with frequency if determinable]
- [Quote exact user complaints as evidence]
- [Impact on citizens - time, cost, frustration level]

**Root Causes Analysis:**
- System/process failures mentioned
- Staffing or resource issues noted
- Policy or procedural gaps identified

**Citizen-Suggested Solutions:**
- [Specific improvements users recommend]
- [Workarounds citizens currently use]

**Immediate Action Items:**
- [What can be fixed quickly - under 30 days]
- [Medium-term improvements - 1-6 months]
- [Long-term systemic changes needed]

## Cross-Cutting Issues
[Issues that affect multiple services]

## Public Sentiment Indicators
- Overall satisfaction level (based on tone analysis)
- Trust levels in the agency
- Willingness to recommend services

## Evidence-Based Recommendations

### High Priority (Address Immediately)
1. [Specific action] - [Supporting evidence from posts]
2. [Specific action] - [Supporting evidence from posts]

### Medium Priority (Address within 6 months)
1. [Specific action] - [Supporting evidence from posts]

### Long-term Improvements (1+ year planning)
1. [Systemic change needed] - [Supporting evidence from posts]

## Success Stories & Positive Feedback
[What's working well - to preserve and expand]

The metrics should only reflect what was understood from the posts and comments, 
## Metrics Dashboard
[Present quantifiable data in tables]

| Issue Category | Frequency | Severity (1-5) |
|----------------|-----------|----------------|
| [Issue 1]      | [Count]   | [Rating]       |

**Requirements:**
- Quote specific user complaints as evidence
- Provide concrete, implementable actions
- Categorize by service area/department
- Include severity assessment
- Focus on what's actionable vs. what's just commentary
- Extract specific broken processes, systems, or policies mentioned

**Output:** Professional government report in markdown format only.
"""


keywords_generator_system_prompt = """
You are an expert in government services and public administration, specializing in identifying relevant search terms for social media monitoring.
"""

keywords_generator_prompt = """
Generate 30+ keywords to identify Reddit posts/comments about {agency} services, issues, and user experiences.

Include:
- Core services and functions
- Common problems/complaints
- User interactions and processes
- Related infrastructure or systems
- Informal terms people use

Example for Department of Transportation:
["traffic", "road", "crash", "accident", "pothole", "highway", "construction", "license", "registration"]

Output only:
```json
[
    "keyword1",
    "keyword2",
    "keyword3"
]
```
"""


topic_generator_system_prompt = """
You are an expert in Massachusetts government agencies and their public-facing services.
"""

topic_generator_prompt = """
Create a concise topic description for {agency} that covers their main services and public interactions.

Focus on what citizens typically interact with or experience from this agency.

Output only:
```json
{{
    "topic": "brief description of agency services and citizen interactions"
}}
```
""" 