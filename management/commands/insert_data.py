from django.core.management.base import BaseCommand, CommandError
from corex.models import Drug, ATC, Interactions, Protein_network, Protein
import os

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
        #print (drug_id, drug_name, cmap)
        
        drug_relations.append(
            Drug(
                drug_bank_id = drug_id,
                name = drug_name,
                cmap_score = float(cmap)
            )
        )
    Drug.objects.bulk_create(drug_relations)

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
        #print (drug_id, drug_name, cmap)
        
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

class Command(BaseCommand):
    help = 'Insert data'

    def handle(self, *args, **options):
        #insert_drugs()
        #insert_atcs()
        #insert_drugs_atcs()
        #insert_protein()
        #update_protein()
        insert_HuRI_interactions()
