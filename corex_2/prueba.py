import os
import pandas

def insert_drugs():
    ruta = '/Corex/data_for_corex/drug_info.tab'
    #prueba = open('/Corex/data_for_corex/ayuda.txt', 'w')
    #prueba = open('/Corex/data_for_corex/ayuda.txt', 'w')

    drug_in = pandas.read_csv(ruta, sep='\t')
    drug_in.drop_duplicates(subset=['DrugBank ID', 'name', 'CMAP score'], inplace=True, keep='first')
    print drug_in
    drug_in.to_csv('/Corex/data_for_corex/drug_info2.tab', sep='\t', index=False)

    #for line in open(ruta, 'r'):
    #    fields = line.split('\t')
    #    drug_id, drug_name, cmap = fields[0], fields[1], fields[2]
        #prueba.write(fields[0])
        #prueba.write('\t')
        #prueba.write(fields[3])
        #prueba.write('\n')
    #    print (drug_id, drug_name, cmap)
        
    #print (homology_relations)



insert_drugs();