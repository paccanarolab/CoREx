# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from . import models

# Register your models here.
admin.site.register(models.Drug)
admin.site.register(models.ATC)
admin.site.register(models.Protein)
admin.site.register(models.Protein_network)
admin.site.register(models.Interactions)
admin.site.register(models.Clinical_Trials)