# -*- coding: utf-8 -*-
# Generated by Django 1.11.29 on 2020-11-20 19:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('corex', '0018_auto_20201120_1605'),
    ]

    operations = [
        migrations.AlterField(
            model_name='kernel',
            name='kernel_name',
            field=models.CharField(max_length=20),
        ),
    ]
