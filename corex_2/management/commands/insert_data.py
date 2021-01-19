from django.core.management.base import BaseCommand, CommandError
from corex.models import *
import os
import networkx as nx

def insert_drugs():
    ruta = '/Corex/data_for_corex/drug_info2.tab'
    drug_relations = []
    first_line = True
    for line in open(ruta, 'r'):
        if first_line:
            first_line = False
            continue
        fields = line.split('\t')
        drug_id, drug_name, cmap = fields[0], fields[1], fields[2]
                
        drug_relations.append(
            Drug(
                drug_bank_id = drug_id,
                name = drug_name,
                cmap_score = float(cmap)
            )
        )
    Drug.objects.bulk_create(drug_relations)

def insert_ct():
    ruta = '/Corex/data_for_corex/clinical_trials.tsv'
    ct_relations = []
    first_line = True
    for line in open(ruta, 'r'):
        if first_line:
            first_line = False
            continue
        fields = line.strip().split('\t')

        drug_id = Drug.objects.values_list('id', flat=True).get(drug_bank_id=fields[3])
        drug_id2 = Drug.objects.filter(id=drug_id)
        ntc, ct_url, ct_title = fields[0], fields[1], fields[2]

        ct_relations.append(
            Clinical_Trials(
                ntc_number = ntc,
                url = ct_url,
                title = ct_title,
                drug = drug_id2[0]
            )
        )
    Clinical_Trials.objects.bulk_create(ct_relations)

def insert_atcs():
    ruta = '/Corex/data_for_corex/ATC.txt'
    atc_relations = []
    first_line = True
    for line in open(ruta, 'r'):
        if first_line:
            first_line = False
            continue
        fields = line.split('\t')
        letter_id, atc_category = fields[0], fields[1]

        atc_relations.append(
            ATC(
                letter = letter_id,
                category = atc_category
            )
        )
    ATC.objects.bulk_create(atc_relations)

def insert_drugs_atcs():
    ruta = '/Corex/data_for_corex/drug_info.tab'
    drug_atc_relations = []
    first_line = True
    for line in open(ruta, 'r'):
        if first_line:
            first_line = False
            continue
        fields = line.split('\t') 
        drug_id = Drug.objects.values_list('id', flat=True).get(drug_bank_id=fields[0])
        drug_id2, atcs = drug_id, fields[3]
        
        drug_atc_relations.append(
            Drug.atcs.through(
                drug_id = drug_id2,
                atc_id = atcs
            )
        )
    Drug.atcs.through.objects.bulk_create(drug_atc_relations)

def insert_protein():
    ruta = '/Corex/data_for_corex/uniprot-swissprot+taxonomy_9606.tab'
    protein_interactions = []
    first_line = True
    for line in open(ruta, 'r'):
        if first_line:
            first_line = False
            continue
        fields = line.split('\t') 
        acc, nam = fields[0], fields[3]
        protein_interactions.append(
            Protein(
                accession = acc,
                name = nam,
            )
        )
    Protein.objects.bulk_create(protein_interactions)

def update_protein():
    ruta = '/Corex/data_for_corex/precomputed-kernels/SARS-CoV-2_human-hosts.txt'
    for line in open(ruta, 'r'):
        fields = line.split('\n') 
        v_change = fields[0]
        Protein.objects.filter(accession=v_change).update(host_protein=True)

def insert_HuRI_interactions():
    ruta = '/Corex/data_for_corex/HuRI.tab'
    h_interactions = []
    first_line = True
    p_value = Protein_network.objects.filter(id=1)
    print(p_value)

    for line in open(ruta, 'r'):
        if first_line:
            first_line = False
            continue
        fields = line.strip().split('\t')
        pr1 = Protein.objects.filter(accession=fields[0])[0]
        pr2 = Protein.objects.filter(accession=fields[1])[0]

        h_interactions.append(
            Interactions(
                weight = 1,
                protein_network = p_value[0],
                p1 = pr1,
                p2 = pr2
            )
        )
    Interactions.objects.bulk_create(h_interactions)

def insert_Cheng_interactions():
    ruta = '/Corex/data_for_corex/Cheng et al.tab'
    h_interactions = []
    first_line = True
    p_value = Protein_network.objects.filter(id=2)

    for line in open(ruta, 'r'):
        if first_line:
            first_line = False
            continue
        fields = line.strip().split('\t')
        pr1 = Protein.objects.filter(accession=fields[0])[0]
        pr2 = Protein.objects.filter(accession=fields[1])[0]

        h_interactions.append(
            Interactions(
                weight = 1,
                protein_network = p_value[0],
                p1 = pr1,
                p2 = pr2
            )
        )
    Interactions.objects.bulk_create(h_interactions)

def insert_drug_targets():
    ruta = '/Corex/data_for_corex/drug_targets.tab'
    drug_targets = []
    first_line = True
    for line in open(ruta, 'r'):
        if first_line:
            first_line = False
            continue
        fields = line.strip().split('\t')

        drugs_id = Drug.objects.values_list('id', flat=True).get(drug_bank_id=fields[0])
        targets_id = Protein.objects.values_list('id', flat=True).get(accession=fields[1])

        drug_targets.append(
            Drug.targets.through(
                drug_id = drugs_id,
                protein_id = targets_id
            )
        )
    Drug.targets.through.objects.bulk_create(drug_targets)

def insert_kernel():
    pass

def insert_kernels_files_names():
    ruta = '/Corex/data_for_corex/kernel_files.csv'
    kf_relations = []
    first_line = True
    for line in open(ruta, 'r'):
        fields = line.split(',') 
        k_id = Kernel.objects.get(id=fields[0])
        n_id = Protein_network.objects.get(id=fields[1])
        
        kf_relations.append(
            Kernel_file_name(
                protein_network = n_id,
                kernel = k_id,
                path = fields[2].strip()
            )
        )
    Kernel_file_name.objects.bulk_create(kf_relations)

def insert_protein_kernel_index(file_name, k):
    proteins = [i.strip() for i in open(file_name)]
    pk_relations = []
    for i,p in enumerate(proteins):
        p_id = Protein.objects.get(accession=p)
        k_id = Protein_network.objects.get(name=k)
        

        pk_relations.append(
            Kernel_Protein_index(
                protein = p_id,
                network = k_id,
                index = i
            )   
        )
        
        if i % 1000 == 0:
            print (i, i/len(proteins))

    Kernel_Protein_index.objects.bulk_create(pk_relations)

def update_lcc():
    #1. Iterate over networks
    pn = Protein_network.objects.all()
    for n_id in pn:
        print('Getting network', n_id)
        k = Kernel_Protein_index.objects.filter(network=n_id).all()
        k = [i.protein.id for i in k]
        print('Getting interactions')
        k = Protein.objects.filter(id__in=k, host_protein=True)
        interactions = Interactions.objects.filter(protein_network=n_id).filter(p1__in=k).filter(p2__in=k).all()
        print('Got interactions')
        #2. Create networkx
        edges = [[i.p1.id, i.p2.id] for i in interactions]
        print(edges[:10])
        G = nx.Graph(edges)
        #3. Extract lcc
        print('Extracting lcc')
        largest_cc = max(nx.connected_components(G), key=len)
        print('First node', len(largest_cc))
        #4. Update the table
        print('Updating')
        Kernel_Protein_index.objects.filter(protein__in=largest_cc).update(is_lcc=True)


class Command(BaseCommand):
    help = 'Insert data'

    def handle(self, *args, **options):
        #insert_drugs()
        #insert_atcs()
        #insert_ct()
        #insert_drugs_atcs()
        #insert_protein()
        #update_protein()
        #insert_HuRI_interactions()
        #insert_Cheng_interactions()
        #insert_drug_targets()
        #insert_kernels_files_names()
        # print('Inserting Barabasi')
        #insert_protein_kernel_index('/Corex/data_for_corex/precomputed-kernels/proteins_Barabasi.txt', 'Cheng')
        # print('Inserting HuRI')
        #insert_protein_kernel_index('/Corex/data_for_corex/precomputed-kernels/proteins_HuRI.txt', 'HuRI')
        update_lcc()