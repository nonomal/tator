from textwrap import dedent

from rest_framework.schemas.openapi import AutoSchema

from ._message import message_schema
from ._errors import error_responses

boilerplate = dedent("""\
Algorithms and transcodes create argo workflows that are annotated with two
uuid1 strings, one identifying the run and the other identifying the group.
Jobs that are submitted together have the same group id, but each workflow
has a unique run id.

This endpoint allows the user to get or cancel a job using the `run_uid`
returned by either the `AlgorithmLaunch` or `Transcode` endpoints.
""")
class JobDetailSchema(AutoSchema):
    def get_operation(self, path, method):
        operation = super().get_operation(path, method)
        if method == 'GET':
            operation['operationId'] = 'GetJob'
        elif method == 'DELETE':
            operation['operationId'] = 'DeleteJob'
        operation['tags'] = ['Tator']
        return operation

    def get_description(self, path, method):
        if method == 'GET':
            short_desc = 'Get a background job.'
            long_desc = dedent("""\
            This method allows the user to get a job's status using the `run_uid` returned
            by either the `AlgorithmLaunch` or `Transcode` endpoints.
            """)
        elif method == 'DELETE':
            short_desc = 'Cancel a background job.'
            long_desc = dedent("""\
            This method allows the user to cancel a job using the `run_uid` returned
            by either the `AlgorithmLaunch` or `Transcode` endpoints.
            """)
        return f"{short_desc}\n\n{boilerplate}\n\n{long_desc}"

    def _get_path_parameters(self, path, method):
        return [{
            'name': 'run_uid',
            'in': 'path',
            'required': True,
            'description': 'A uuid1 string identifying to single Job.',
            'schema': {'type': 'string'},
        }]

    def _get_filter_parameters(self, path, method):
        return []

    def _get_request_body(self, path, method):
        return {}

    def _get_responses(self, path, method):
        responses = error_responses()
        if method == 'GET':
            responses['200'] = {
                'description': 'Successful retrieval of job.',
                'content': {'application/json': {'schema': {
                    '$ref': '#/components/schemas/Job',
                }}},
            }
        elif method == 'DELETE':
            responses['200'] = message_schema('cancellation', 'job')
        return responses
