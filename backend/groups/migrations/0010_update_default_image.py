from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('groups', '0009_fix_sports_field'),
    ]

    operations = [
        migrations.AlterField(
            model_name='league',
            name='image',
            field=models.ImageField(blank=True, default='league_images/default_league.png', upload_to='league_images/'),
        ),
    ] 