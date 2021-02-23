from django.conf.urls import url
from corex import views


urlpatterns = [
    url("hello", views.home, name="home"),
    url("home", views.hello_there, name="hello_there"),
    url("interactome", views.interactome_explorer, name="interactome_explorer"),
    url(r"hippie/(?P<net>\w+)/", views.HIPPIE, name="HIPPIE"),
    url(r"huri/(?P<net>\w+)/", views.HURI, name="HURI"),
    url(r"cheng/(?P<net>\w+)/", views.CHENG, name="CHENG"),
    url("prueba", views.prueba, name="prueba"),
    url("test", views.test, name="test"),
    url(r"drugs/(?P<net>\d+)/(?P<kernel>\d+)/", views.get_drugs, name="drugs"),
    url(r"drug/(?P<net>\d+)/(?P<kernel>\d+)/(?P<drug>\d+)/", views.get_drugs_scores, name="drug")
]
