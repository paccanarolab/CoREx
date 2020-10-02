from django.conf.urls import url
from corex import views


urlpatterns = [
    url("hello", views.home, name="home"),
    url("home", views.hello_there, name="hello_there"),
    url("interactome", views.interactome_explorer, name="interactome_explorer"),
    url(r"hippie/(?P<net>\w+)/", views.red_HIPPIE, name="red_HIPPIE"),
    url("huri", views.HURI, name="HURI"),
    url("cheng", views.CHENG, name="CHENG"),
    
]
