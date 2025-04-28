from django.db import migrations, models

class Migration(migrations.Migration):

   dependencies = [
       ('groups', '0015_update_circuit_status'),
   ]

    operations = [
        migrations.AlterField(
            model_name='circuit',
            name='status',
            field=models.CharField(
                choices=[
                    ('active', 'Active'),
                    ('calculating', 'Calculating Results'),
                    ('completed', 'Completed'),
                ],
                default='active',
                max_length=20
            ),
        ),
    ] 