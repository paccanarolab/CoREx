from django.conf.urls import url
from corex import views


urlpatterns = [
    url("hello", views.home, name="home"),
    url("home", views.hello_there, name="hello_there"),
    url("interactome", views.interactome_explorer, name="interactome_explorer"),
    url(r"hippie/(?P<net>\w+)/", views.HIPPIE, name="HIPPIE"),
    url(r"huri/(?P<net>\w+)/", views.HURI, name="HURI"),
    url(r"cheng/(?P<net>\w+)/", views.CHENG, name="CHENG"),
    
]
