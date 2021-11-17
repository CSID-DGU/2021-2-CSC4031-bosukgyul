from django.urls import path
from .views import *

app_name = 'zooming'

urlpatterns = [
    path('ready/', ready, name="ready"),
    path('meeting/', main_view, name="meeting"),
 ]