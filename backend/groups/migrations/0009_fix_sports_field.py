from django.db import migrations, models

def convert_sports_to_json(apps, schema_editor):
    League = apps.get_model('groups', 'League')
    for league in League.objects.all():
        if isinstance(league.sports, list):
            league.sports = league.sports
            league.save()

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