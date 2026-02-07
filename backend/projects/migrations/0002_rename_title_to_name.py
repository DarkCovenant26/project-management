from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='project',
            old_name='title',
            new_name='name',
        ),
        migrations.AlterModelOptions(
            name='project',
            options={'ordering': ['-created_at']},
        ),
    ]
