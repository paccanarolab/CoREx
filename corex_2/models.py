# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.

class ATC(models.Model):
    letter = models.CharField(max_length=1, primary_key=True)
    category = models.CharField(max_length=80)

    def  __str__ ( self ): 
        return  self.letter

class Kernel(models.Model):
    kernel_name = models.CharField(max_length=25)

class Protein(models.Model):
    accession = models.CharField(max_length=15)
    name = models.TextField(max_length=100)
    host_protein = models.BooleanField(default=False)

class Drug(models.Model):
    drug_bank_id = models.CharField(max_length=10)
    name = models.CharField(max_length=50)
    cmap_score = models.FloatField()
    atcs = models.ManyToManyField(ATC)
    targets = models.ManyToManyField(Protein)

    def  __str__ ( self ): 
        return  self.name

class Clinical_Trials(models.Model):
    ntc_number = models.CharField(max_length=15)
    url = models.URLField(max_length=100)
    title = models.TextField(max_length=100)
    drug = models.ForeignKey(Drug)

class Protein_network(models.Model):
    name = models.CharField(max_length=10)
    url = models.URLField(max_length=100)
    kernel_files = models.ManyToManyField(Kernel, through='Kernel_file_name')
    kernel_index = models.ManyToManyField(Protein, through='Kernel_Protein_index')


    def  __str__ ( self ): 
        return  self.name

class Kernel_file_name(models.Model):
    protein_network = models.ForeignKey(Protein_network)
    kernel = models.ForeignKey(Kernel)
    path = models.TextField(max_length=200)

class Kernel_Protein_index(models.Model):
    protein = models.ForeignKey(Protein)
    network = models.ForeignKey(Protein_network)
    index = models.IntegerField()

class Interactions(models.Model):
    weight = models.FloatField()
    protein_network = models.ForeignKey(Protein_network)
    p1 = models.ForeignKey(Protein, related_name='interaction_p1')
    p2 = models.ForeignKey(Protein, related_name='interaction_p2')
    
    def  __str__ ( self ): 
        return  self.protein_network