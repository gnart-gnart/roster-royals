# Generated by Django 4.2.19 on 2025-04-04 00:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('groups', '0010_update_default_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='league',
            name='image',
            field=models.ImageField(blank=True, default='league_images/default_image_updated.png', upload_to='league_images/'),
        ),
    ]
