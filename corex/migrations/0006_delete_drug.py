# -*- coding: utf-8 -*-
# Generated by Django 1.11.29 on 2020-10-20 17:14
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('corex', '0005_auto_20201020_1411'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Drug',
        ),
    ]