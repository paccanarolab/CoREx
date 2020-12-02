import pandas as pd
import numpy as np

drugbank = pd.read_pickle('/Corex/data_for_corex/drugbank.df')
drugbank.set_index('DrugBank ID', inplace=True)
drug_names = drugbank[drugbank.variable.isin(['Name'])]['value'].reset_index().rename(columns={'value':'name'})
target_table = (drugbank[(drugbank.variable == 'Group') & (drugbank.value == 'approved')]
 .join(drugbank[(drugbank.variable == 'Target')],how='inner', rsuffix='_target'))['value_target'].reset_index()
target_counts= target_table['DrugBank ID'].value_counts().reset_index().rename(columns={'index':'DrugBank ID', 'DrugBank ID':'target count'})
# we can filter some stuff using only swissprot proteins
human_sp = pd.read_csv('/Corex/data_for_corex/uniprot-swissprot+taxonomy_9606.tab', sep='\t')
approved_drugs_with_targets = (
    drugbank[(drugbank.variable == 'Target') & (drugbank.value.isin(human_sp.Entry))]
        .drop(columns=['variable']).rename(columns={'value':'target'})
    .join(drugbank[(drugbank.variable == 'Group') & (drugbank.value == 'approved')], how='inner')
        .drop(columns=['variable', 'value'])
).reset_index()

kernel = np.load('/Corex/data_for_corex/precomputed-kernels/filtered_kernels/graph_kernel_Barabasi_pStepKernel_8.npy')

kernel.shape


# In[8]:


proteins = np.array([i.strip() for i in open('/Corex/data_for_corex/precomputed-kernels/proteins_Barabasi.txt')])


# In[34]:


proteins.shape


# In[25]:


# select the drug targets
drug = 'DB00002'
targets = approved_drugs_with_targets[approved_drugs_with_targets['DrugBank ID'] == 'DB00002']['target'].values


# In[43]:


# in the database we can add the index to each protein?
index = np.where(np.isin(proteins, targets))[0]


# In[44]:


index


# In[50]:


kernel[index, :].sum()


# In[57]:


# how to calculate the influence on each of the host proteins
kernel[index, :].sum(axis=0)


# In[53]:


# mimic user selection
user_selection = np.random.choice(proteins, 10)


# In[54]:


index = np.where(np.isin(proteins, user_selection))[0]


# In[55]:


kernel[index, :].sum()


# In[59]:


#approved_drugs_with_targets.to_csv('/Corex/data_for_corex/drug_targets.tab', sep='\t', index=False)


# In[60]:


#approved_drugs_with_targets


# In[ ]:




