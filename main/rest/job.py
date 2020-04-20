import traceback

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404

from ..models import Algorithm
from ..kube import TatorTranscode
from ..kube import TatorAlgorithm
from ..schema import JobDetailSchema
from ..schema import parse

from ._permissions import ProjectTransferPermission

class JobDetailAPI(APIView):
    """ Cancel a background job.

        Algorithms and transcodes create argo workflows that are annotated with two
        uuid1 strings, one identifying the run and the other identifying the group.
        Jobs that are submitted together have the same group id, but each workflow
        has a unique run id.

        This endpoint allows the user to cancel a job using the `run_uid` returned
        by either the `AlgorithmLaunch` or `Transcode` endpoints.
    """
    schema = JobDetailSchema()
    permission_classes = [ProjectTransferPermission]

    def delete(self, request, format=None, **kwargs):
        response=Response({})

        try:
            # Try finding the job via the kube api.
            # Find the job and delete it.
            params = parse(request)
            run_uid = params['run_uid']
            transcode_cancelled = TatorTranscode().cancel_jobs(f'uid={run_uid}')
            if not transcode_cancelled:
                for alg in Algorithm.objects.all():
                    algorithm_cancelled = TatorAlgorithm(alg).cancel_jobs(f'uid={run_uid}')
                    if algorithm_cancelled:
                        break
            if not (transcode_cancelled or algorithm_cancelled):
                raise Http404

            response = Response({'message': f"Job with run UID {run_uid} deleted!"})

        except ObjectDoesNotExist as dne:
            response=Response({'message' : str(dne)},
                              status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            response=Response({'message' : str(e),
                               'details': traceback.format_exc()}, status=status.HTTP_400_BAD_REQUEST)
        finally:
            return response;

