# Generated by Django 4.2.19 on 2025-03-31 19:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_money'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('friend_request', 'Friend Request'), ('friend_accepted', 'Friend Request Accepted'), ('league_invite', 'League Invitation'), ('info', 'Information')], max_length=50),
        ),
    ]
