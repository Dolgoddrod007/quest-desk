from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from core.models import User, UserStatsDaily


class Command(BaseCommand):
    help = "Rebuild daily user statistics for admin dashboard."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=180,
            help="How many days to recalculate (default: 180).",
        )

    def handle(self, *args, **options):
        days = max(1, options["days"])
        today = timezone.now().date()
        start_date = today - timedelta(days=days - 1)

        new_users_map = {
            row["day"]: row["count"]
            for row in (
                User.objects.filter(created_at__date__gte=start_date)
                .annotate(day=TruncDate("created_at"))
                .values("day")
                .annotate(count=Count("id"))
            )
        }

        created_or_updated = 0
        for offset in range(days):
            current_date = start_date + timedelta(days=offset)
            total_users = User.objects.filter(created_at__date__lte=current_date).count()
            masters = User.objects.filter(created_at__date__lte=current_date, role="master").count()
            players = User.objects.filter(created_at__date__lte=current_date, role="player").count()

            UserStatsDaily.objects.update_or_create(
                date=current_date,
                defaults={
                    "new_users_count": int(new_users_map.get(current_date, 0)),
                    "total_users_count": total_users,
                    "masters_count": masters,
                    "players_count": players,
                },
            )
            created_or_updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"User stats rebuilt for {created_or_updated} days ({start_date} .. {today})."
            )
        )

