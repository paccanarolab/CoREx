# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

# Create your views here.

import re
from django.http import HttpResponse

def home(request):
    return HttpResponse("Hello, Django!")

def hello_there(request):
    return render(request, template_name='index.html')

def interactome_explorer(request):
    return render(request, template_name='ppi-preamble.html')

def red_HIPPIE(request, net='HIPPIE'):
    return render(request, template_name='viz.html', context={'net':net})

def HURI(request):
    return render(request, template_name='viz.html')

def CHENG(request):
    return render(request, template_name='viz.html')