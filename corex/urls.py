from django.conf.urls import url
from corex import views


urlpatterns = [
    url("^$", views.hello_there, name="home"),
    url("hello", views.home, name="home"),
    url("interactome", views.interactome_explorer, name="interactome_explorer"),
    url("functional", views.functional, name="functional"),
    url(r"functional/(?P<drug>w+)", views.functional_detail, name="functional_detail"),
    url(r"hippie/(?P<net>\w+)/", views.HIPPIE, name="HIPPIE"),
    url(r"huri/(?P<net>\w+)/", views.HURI, name="HURI"),
    url(r"cheng/(?P<net>\w+)/", views.CHENG, name="CHENG"),
    url("test", views.test, name="test"),
    url(r"drugs/(?P<net>\d+)/(?P<kernel>\d+)/", views.get_drugs, name="drugs"),
    url(r"drug/(?P<net>\d+)/(?P<kernel>\d+)/(?P<drug>\d+)/", views.get_drugs_scores, name="drug")
]
