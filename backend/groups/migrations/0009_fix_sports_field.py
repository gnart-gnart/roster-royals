from django.db import migrations, models

def convert_sports_to_json(apps, schema_editor):
    # Get the model using the apps registry to get the historical version
    League = apps.get_model('groups', 'League')
    # Use a direct SQL query that doesn't require the image field
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute('SELECT id, sports FROM groups_league')
        for row in cursor.fetchall():
            league_id, sports = row
            if isinstance(sports, list):
                # No need to update since it's already a list
                pass

class Migration(migrations.Migration):

    dependencies = [
        ('groups', '0002_alter_league_image'),
    ]

    operations = [
        migrations.RunPython(convert_sports_to_json),
        migrations.AlterField(
            model_name='league',
            name='sports',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
