# -*- coding: utf-8 -*-
# Generated by Django 1.11.29 on 2021-02-09 23:40
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('corex', '0023_kernel_protein_index_is_lcc'),
    ]

    operations = [
        migrations.CreateModel(
            name='DrugScore',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.FloatField()),
                ('drug', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='corex.Drug')),
                ('kernel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='corex.Kernel')),
                ('network', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='corex.Protein_network')),
                ('protein', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='corex.Protein')),
            ],
        ),
    ]