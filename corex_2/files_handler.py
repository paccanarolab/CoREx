import os
import tempfile
from corex.models import Protein
from django.http import HttpResponse

def handle_uploaded_file(uploaded_file):
    lista = []
    lista2 = []
    tmp = tempfile.TemporaryFile()
    for chunk in uploaded_file.chunks():
        tmp.write(chunk)
    tmp.seek(0)

    for line in tmp:
        fields = line.strip().split('\n')
        lista.append(fields[0])
        # data = Protein.objects.filter(accession=fields[0]).exists()
        # if data == False:
        #     lista2.append(fields[0])
    print(lista)
    # print ("Not in the list:", lista2)

    data2 = Protein.objects.filter(accession__in=lista)

    if not data2:
        print('aqui')
        return HttpResponse(status=404)

    tmp.close()
    # lista2 = [e.accession for e in data2]
    return lista, data2
    # for e in data2:
    #     print(e.id)

    #print(lista)
    # ruta = '/Corex/corex/files/protein.txt'
    # with open(ruta, 'wb+') as destination:
    #     for chunk in uploaded_file.chunks():
    #         destination.write(chunk)

    # for line in open(ruta, 'r'):
    #     fields = line.split('\n')
    #     print(fields[0])
    #     data = Protein.objects.filter(accession=fields[0]).exists()
    #     if data == False:
    #         print ("Not in the list:", fields[0])
    #         break
    # return data

def handle_text_area(text_area):
    # ruta = '/Corex/corex/files/protein.txt'
    # with open(ruta, 'wb+') as destination:
    #     for chunk in text_area:
    #         destination.write(chunk)
    
    # for line in open(ruta, 'r'):
    #     fields = line.split('\n')
    #     print(fields[0])
    #     data = Protein.objects.filter(accession=fields[0]).exists()
    #     if data == False:
    #         print ("Not in the list:", fields[0])
    #         continue
    # return data
    lista = []
    lista2 = []
    tmp = tempfile.TemporaryFile()
    for chunk in text_area:
        tmp.write(chunk)
    tmp.seek(0)

    for line in tmp:
        fields = line.strip().split('\n')
        lista.append(fields[0])
    #     data = Protein.objects.filter(accession=fields[0]).exists()
    #     if data == False:
    #         lista2.append(fields[0])
    print(lista)
    # print ("Not in the list:", lista2)

    data2 = Protein.objects.filter(accession__in=lista)
    if not data2:
        print('aqu2i')
        return 0, 0

    # for e in data2:
    #     print(e.id)

    tmp.close()
    
    return lista, data2