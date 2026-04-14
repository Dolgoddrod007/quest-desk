from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_user_role'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserStatsDaily',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(unique=True)),
                ('new_users_count', models.IntegerField(default=0)),
                ('total_users_count', models.IntegerField(default=0)),
                ('masters_count', models.IntegerField(default=0)),
                ('players_count', models.IntegerField(default=0)),
                ('calculated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'user_stats_daily',
                'ordering': ['-date'],
            },
        ),
    ]

