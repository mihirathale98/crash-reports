import re
import json

def parse_result(result):
    matches = re.search(r'```json(.*)```', result, re.DOTALL)
    if matches:
        return json.loads(matches.group(1))
    return None


