# Generated by Django 5.2.1 on 2025-05-20 17:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_rename_created_userfollowing_created_at'),
    ]

    operations = [
        migrations.DeleteModel(
            name='UserFollowing',
        ),
    ]
