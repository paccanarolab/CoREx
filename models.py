# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.

class ATC(models.Model):
    letter = models.CharField(max_length=1, primary_key=True)
    category = models.CharField(max_length=80)

    def  __str__ ( self ): 
        return  self.letter

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

class Protein_network(models.Model):
    name = models.CharField(max_length=10)
    #url = 
    #Relacionar con kernel_file_name

    def  __str__ ( self ): 
        return  self.name

class Interactions(models.Model):
    weight = models.FloatField()
    protein_network = models.ForeignKey(Protein_network)
    p1 = models.ForeignKey(Protein, related_name='interaction_p1')
    p2 = models.ForeignKey(Protein, related_name='interaction_p2')
    
    def  __str__ ( self ): 
        return  self.protein_network

#class Kernel(models.Model):
    #kernel_name = 
    #Relacionar con kernel_file_name

#class Kernel_file_name(models.Model):