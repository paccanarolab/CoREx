# -*- coding: utf-8 -*-
# Generated by Django 1.11.29 on 2020-10-21 17:56
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('corex', '0010_auto_20201021_1446'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='drug',
            name='atcs',
        ),
        migrations.DeleteModel(
            name='ATC',
        ),
        migrations.DeleteModel(
            name='Drug',
        ),
    ]
