# Generated by Django 5.0.6 on 2024-07-11 09:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('review', '0003_drawing'),
    ]

    operations = [
        migrations.RenameField(
            model_name='drawing',
            old_name='image_url',
            new_name='url',
        ),
    ]
