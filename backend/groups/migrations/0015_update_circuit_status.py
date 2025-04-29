from django.db import migrations

def convert_upcoming_to_active(apps, schema_editor):
    # We get the model from the versioned app registry;
    # if we directly imported it, it would be the wrong version
    Circuit = apps.get_model("groups", "Circuit")
    for circuit in Circuit.objects.filter(status='upcoming'):
        circuit.status = 'active'
        circuit.save()

class Migration(migrations.Migration):

    dependencies = [
        ('groups', '0014_merge_20250415_0529'),  # Update to the latest migration
    ]

    operations = [
        migrations.RunPython(convert_upcoming_to_active),
    ] 