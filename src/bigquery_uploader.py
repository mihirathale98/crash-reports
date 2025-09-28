from google.cloud import bigquery
from google.oauth2 import service_account
import os


def insert_report(agency, month, year, report_content,
                 project_id=None, credentials=None, dataset_id="government_analytics", table_id="reports"):
    """
    Insert a new report into BigQuery

    Args:
        agency: Agency name
        month: Month (integer)
        year: Year (integer)
        report_content: Markdown report content
        project_id: Google Cloud project ID
        credentials: Service account credentials (optional)
        dataset_id: BigQuery dataset name
        table_id: Table name
    """
    if not project_id:
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        if not project_id:
            raise ValueError("Set GOOGLE_CLOUD_PROJECT environment variable")

    # Create client with credentials
    if credentials:
        client = bigquery.Client(project=project_id, credentials=credentials)
    else:
        # Use default credentials (environment variable, gcloud auth, etc.)
        client = bigquery.Client(project=project_id)
    table_ref = f"{project_id}.{dataset_id}.{table_id}"

    rows_to_insert = [{
        "agency": agency,
        "month": month,
        "year": year,
        "report": report_content
    }]

    errors = client.insert_rows_json(client.get_table(table_ref), rows_to_insert)

    if errors:
        raise Exception(f"Error inserting report: {errors}")
    else:
        print(f"Successfully inserted report for {agency} ({month}/{year})")


def get_reports(agency=None, month=None, year=None,
               project_id=None, credentials=None, dataset_id="government_analytics", table_id="reports"):
    """
    Get reports from BigQuery with optional filters

    Args:
        agency: Filter by agency name (optional)
        month: Filter by month (optional)
        year: Filter by year (optional)
        project_id: Google Cloud project ID
        credentials: Service account credentials (optional)
        dataset_id: BigQuery dataset name
        table_id: Table name

    Returns:
        List of report records
    """
    if not project_id:
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        if not project_id:
            raise ValueError("Set GOOGLE_CLOUD_PROJECT environment variable")

    # Create client with credentials
    if credentials:
        client = bigquery.Client(project=project_id, credentials=credentials)
    else:
        # Use default credentials (environment variable, gcloud auth, etc.)
        client = bigquery.Client(project=project_id)
    table_ref = f"{project_id}.{dataset_id}.{table_id}"

    where_clauses = []
    parameters = []

    if agency:
        where_clauses.append("agency = @agency")
        parameters.append(bigquery.ScalarQueryParameter("agency", "STRING", agency))

    if month:
        where_clauses.append("month = @month")
        parameters.append(bigquery.ScalarQueryParameter("month", "INT64", month))

    if year:
        where_clauses.append("year = @year")
        parameters.append(bigquery.ScalarQueryParameter("year", "INT64", year))

    where_clause = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

    query = f"""
    SELECT agency, month, year, report
    FROM `{table_ref}`
    {where_clause}
    ORDER BY year DESC, month DESC, agency
    """

    job_config = bigquery.QueryJobConfig(query_parameters=parameters)
    query_job = client.query(query, job_config=job_config)

    return [dict(row) for row in query_job.result()]


# Helper function to load credentials from service account file
def load_credentials_from_file(service_account_path):
    """
    Load credentials from a service account JSON file

    Args:
        service_account_path: Path to service account JSON file

    Returns:
        Service account credentials object
    """
    return service_account.Credentials.from_service_account_file(service_account_path)


# Helper function to load credentials from JSON string
def load_credentials_from_json(service_account_json):
    """
    Load credentials from a service account JSON string

    Args:
        service_account_json: Service account JSON as string

    Returns:
        Service account credentials object
    """
    import json
    service_account_info = json.loads(service_account_json)
    return service_account.Credentials.from_service_account_info(service_account_info)


# Convenience function for backward compatibility
def upload_report_to_bigquery(agency, month, year, report_content, **kwargs):
    """Upload a report to BigQuery (alias for insert_report)"""
    return insert_report(agency, month, year, report_content, **kwargs)


# Example usage with different credential methods
if __name__ == "__main__":
    # Method 1: Using environment variable (easiest)
    # export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
    # insert_report("Test Agency", 9, 2025, "# Test Report")

    # Method 2: Using service account file
    # credentials = load_credentials_from_file("/path/to/service-account.json")
    # insert_report("Test Agency", 9, 2025, "# Test Report",
    #               project_id="your-project", credentials=credentials)

    # Method 3: Using service account JSON string
    # json_string = '{"type": "service_account", "project_id": "..."}'
    # credentials = load_credentials_from_json(json_string)
    # insert_report("Test Agency", 9, 2025, "# Test Report",
    #               project_id="your-project", credentials=credentials)

    pass