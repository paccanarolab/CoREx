# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from corex.models import *
from .forms import UploadFileForm
from files_handler import handle_uploaded_file, handle_text_area
from django.http import HttpResponse
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.db.models import Max
import json
from django.db.models import *


# Create your views here.

import re
from django.http import HttpResponse
import numpy as np

def home(request):
    return render(request, template_name='index.html')

def hello_there(request):
    # return redirect('https://paccanarolab.org/static_content/covid/')
    return render(request, template_name='index.html')

def functional(request):
    return render(request, template_name='functional/index.html')

def functional_detail(request, drug):
    context = {}
    context['information_url'] = static('functional/data/clusterviz-S2F-{drug}.json'.format(drug=drug))
    context['drug'] = drug
    context['net'] = 'S2F'
    return render(request, template_name='functional/viz.html', context=context)

def HIPPIE(request, net='HIPPIE'):
    return render(request, template_name='viz.html', context={'net':net})

def HURI(request, net='HURI'):
    return render(request, template_name='viz.html', context={'net':net})

def CHENG(request, net='CHENG'):
    return render(request, template_name='viz.html', context={'net':net})

def interactome_explorer(request):
    "get the networks"
    network = Protein_network.objects.all()
    "get the kernels"
    kernel = Kernel.objects.all()
    form = UploadFileForm()
    return render(request, template_name='prueba.html', context={'networks':network, 'kernels': kernel, 'form': form})

def get_network(network, proteins):
    net = {}
    net['directed'] = False
    net['multigraph'] = False
    net['graph'] = {}
    k = Kernel_Protein_index.objects.filter(network=network, is_lcc=True).all()
    proteins = list(set(proteins) & set([i.protein.accession for i in k]))
    proteins_query = Protein.objects.filter(accession__in=proteins)
    interactions = Interactions.objects.filter(protein_network=network)
    interactions = interactions.filter(p1__in=proteins_query)
    interactions = interactions.filter(p2__in=proteins_query).all()
    net['nodes'] = list({'id': p, 'betweeness': 0} for p in proteins)
    net['links'] = list({'w': i.weight, 'source': i.p1.accession, 'target': i.p2.accession} for i in interactions)

    return json.dumps(net)

def test(request):
    context = {}
    network=request.POST.get("network", None)
    kernel=request.POST.get("kernel", None)

    if request.method == "POST" and 'file' in request.FILES:
        my_uploaded_file = request.FILES['file']
        prots_in_file, prots_query = handle_uploaded_file(my_uploaded_file)
        #return HttpResponse(status=201)
    else:
        print("not uploaded file")
        proteins = request.POST.get("prot", None)
        if proteins:
            prots_in_file, prots_query = handle_text_area(proteins)
            print(prots_in_file, prots_query)
            if prots_in_file == 0 and prots_query == 0:
                return HttpResponse(status=404)
        else:
            return HttpResponse(status=404)


    # if request.FILES['file']:
    #     handle_uploaded_file(request.FILES['file'])
    
    #v = request.FILES['file'].read()
    #print(v)
    k_id = Kernel.objects.values_list('id', flat=True).get(kernel_name=kernel)
    n_id = Protein_network.objects.values_list('id', flat=True).get(name=network)
    kernel_filename = Kernel_file_name.objects.filter(kernel=k_id, protein_network=n_id).first()
    
    kernel_indices = Kernel_Protein_index.objects.filter(network=n_id).filter(protein__in=prots_query).all()
    kernel_indices = np.array([i.index for i in kernel_indices])
    # print(kernel_indices)
    max_index = Kernel_Protein_index.objects.filter(network=n_id).aggregate(Max('index'))
    max_index = max_index['index__max']
    # print (max_index)

    # target_vector = np.zeros(max_index)
    # target_vector[kernel_indices] = 1
    host_protein_names = np.array([i.strip() for i in open(kernel_filename.host_protein_indices_path.strip())])
    # print(host_protein_names, host_protein_names.shape)
    kernel = np.load(kernel_filename.path.strip())
    kernel_target = kernel[kernel_indices,:]
    # print(kernel_target.shape)
    kernel_target_sum = kernel_target.sum(axis=0)
    # print(kernel_target_sum, kernel_target_sum.shape)

    result_json = list({'protein': p, 'score': s} for p, s in zip(host_protein_names, kernel_target_sum))
    result_json = json.dumps(result_json)

    data = {}
    data['k_id'] = k_id
    data['network'] = get_network(n_id, host_protein_names)
    data['scores'] = result_json
    data['n_id'] = n_id

    # print(k_id, n_id)
    

    return render(request, template_name='viz.html', context=data)

def get_drugs(request, net, kernel):
    # print(net, kernel)
    mimetype = 'application/json'
    k = Kernel.objects.filter(id=int(kernel)).first()
    n = Protein_network.objects.filter(id=int(net)).first()
    drug_sqs = DrugScore.objects.filter(kernel=k, network=n)
    scoresbydrug = drug_sqs.values('drug').annotate(score_sum=Sum('score'))
    scoresbydrug = {i['drug']:i['score_sum'] for i in scoresbydrug}
    max_score = drug_sqs.values('drug').aggregate(Max('score'))
    data = {}
    drug_qs = Drug.objects.filter(id__in=[x['drug'] for x in drug_sqs.values('drug').distinct()])
    # print(drug_qs)
    data['drugs'] = [{'id': d.id, 'name': d.drug_bank_id + ' - ' + d.name, 'score': scoresbydrug[d.id]} for d in drug_qs]
    data['max'] = max_score['score__max']
    data = json.dumps(data)
    return HttpResponse(data, mimetype)

def get_drugs_scores(request, net, kernel, drug):
    print(net, kernel)
    mimetype = 'application/json'
    k = Kernel.objects.filter(id=int(kernel)).first()
    n = Protein_network.objects.filter(id=int(net)).first()
    d = Drug.objects.filter(id=int(drug)).first()
    drug_sqs = DrugScore.objects.filter(kernel=k, network=n, drug=d)
    data = [{'protein': dr.protein.accession, 'score': dr.score} for dr in drug_sqs]
    data = json.dumps(data)
    return HttpResponse(data, mimetype)
