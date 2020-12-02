# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from corex.models import *

# Create your views here.

import re
from django.http import HttpResponse
import numpy as np

def home(request):
    return HttpResponse("Hello, Django!")

def hello_there(request):
    return render(request, template_name='index.html')

def interactome_explorer(request):
    x = np.load(r'/Corex/data_for_corex/precomputed-kernels/filtered_kernels/graph_kernel_Barabasi_diffusionKernel.npy')
    return render(request, template_name='ppi-preamble.html', context={'shape': x.shape})

def HIPPIE(request, net='HIPPIE'):
    return render(request, template_name='viz.html', context={'net':net})

def HURI(request, net='HURI'):
    return render(request, template_name='viz.html', context={'net':net})

def CHENG(request, net='CHENG'):
    return render(request, template_name='viz.html', context={'net':net})

def prueba(request):
    "get the networks"
    network = Protein_network.objects.all()
    "get the kernels"
    kernel = Kernel.objects.all()
    return render(request, template_name='prueba.html', context={'networks':network, 'kernels': kernel})

def test(request):
    network=request.POST.get("network", None)
    kernel=request.POST.get("kernel", None)
    #filter del network y del kernel.
    return render(request, template_name='index.html', context={'network':network, 'kernel': kernel})

