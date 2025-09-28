from google.cloud import bigquery
import os
from datetime import datetime


def insert_report(agency, month, year, report_content,
                 project_id=None, dataset_id="government_analytics", table_id="reports"):
    """
    Insert a new report into BigQuery

    Args:
        agency: Agency name
        month: Month (integer)
        year: Year (integer)
        report_content: Markdown report content
        project_id: Google Cloud project ID
        dataset_id: BigQuery dataset name
        table_id: Table name
    """
    if not project_id:
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        if not project_id:
            raise ValueError("Set GOOGLE_CLOUD_PROJECT environment variable")

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
               project_id=None, dataset_id="government_analytics", table_id="reports"):
    """
    Get reports from BigQuery with optional filters

    Args:
        agency: Filter by agency name (optional)
        month: Filter by month (optional)
        year: Filter by year (optional)
        project_id: Google Cloud project ID
        dataset_id: BigQuery dataset name
        table_id: Table name

    Returns:
        List of report records
    """
    if not project_id:
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        if not project_id:
            raise ValueError("Set GOOGLE_CLOUD_PROJECT environment variable")

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


# Convenience function for backward compatibility
def upload_report_to_bigquery(agency, month, year, report_content, **kwargs):
    """Upload a report to BigQuery (alias for insert_report)"""
    return insert_report(agency, month, year, report_content, **kwargs)