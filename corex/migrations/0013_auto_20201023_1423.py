# -*- coding: utf-8 -*-
# Generated by Django 1.11.29 on 2020-10-23 17:23
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('corex', '0012_atc_drug'),
    ]

    operations = [
        migrations.CreateModel(
            name='Interactions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('weight', models.DecimalField(decimal_places=2, max_digits=5)),
            ],
        ),
        migrations.CreateModel(
            name='Protein',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accession', models.CharField(max_length=15)),
                ('name', models.CharField(max_length=100)),
                ('host_protein', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Protein_network',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=10)),
            ],
        ),
        migrations.AddField(
            model_name='interactions',
            name='p1',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interaction_p1', to='corex.Protein'),
        ),
        migrations.AddField(
            model_name='interactions',
            name='p2',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interaction_p2', to='corex.Protein'),
        ),
        migrations.AddField(
            model_name='interactions',
            name='protein_network',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='corex.Protein_network'),
        ),
        migrations.AddField(
            model_name='drug',
            name='targets',
            field=models.ManyToManyField(to='corex.Protein'),
        ),
    ]
