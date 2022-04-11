from datetime import datetime, timedelta, timezone
import logging

from django.conf import settings
from django.core.management.base import BaseCommand
from main.models import Media
from main.ses import TatorSES
from main.util import notify_admins, update_queryset_archive_state

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Archives any media files marked with `to_archive`."

    def add_arguments(self, parser):
        parser.add_argument(
            "--min_age_days",
            type=int,
            default=7,
            help="Minimum age in days of media objects for archive.",
        )

    def handle(self, **options):
        min_delta = timedelta(days=options["min_age_days"])
        max_datetime = datetime.now(timezone.utc) - min_delta
        archived_qs = Media.objects.filter(
            deleted=False,
            resource_media__backed_up=True,
            archive_state="to_archive",
            archive_status_date__lte=max_datetime,
        ).exclude(meta__dtype="multi")

        if not archived_qs.exists():
            logger.info(f"No media to archive!")
            return

        # Update media ready for archiving
        target_state = {"archive_state": "archived", "restoration_requested": False}
        not_ready = update_queryset_archive_state(archived_qs, target_state)

        # Notify owners of blocked archive attempt
        ses = TatorSES() if settings.TATOR_EMAIL_ENABLED else None
        notify_admins(not_ready, ses)
