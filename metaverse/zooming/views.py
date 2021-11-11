from django.shortcuts import render

def main_view(request):
    return render(request, 'zooming/main.html')

def ready(request):
    return render(request, 'zooming/ready.html')