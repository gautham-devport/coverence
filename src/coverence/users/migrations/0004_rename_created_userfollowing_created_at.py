# Generated by Django 5.2.1 on 2025-05-20 16:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_userfollowing'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userfollowing',
            old_name='created',
            new_name='created_at',
        ),
    ]
